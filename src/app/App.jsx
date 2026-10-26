import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { BuyerView } from '../pages/BuyerView.jsx';
import { CashierView } from '../pages/CashierView.jsx';
import { OwnerView } from '../pages/OwnerView.jsx';
import { PublicHome } from '../pages/PublicHome.jsx';
import { Welcome } from '../features/auth/Welcome.jsx';
import { applyTheme } from '../shared/config.js';
import { auth } from '../shared/data/firebase.js';
import { createLinkedProfile, createOwnerProfile, emptyDatabase, getUserProfile, persistChanges, savePublicHomeTheme, subscribeAccount, subscribePublicHome } from '../shared/data/firestoreStore.js';
import { rolePath } from '../shared/lib/utils.js';
import { Bubbles, Toast } from '../shared/ui/index.jsx';

export function App(){
  const navigate=useNavigate();
  const [db,setDb]=useState(emptyDatabase);
  const dbRef=useRef(db);
  const [authUser,setAuthUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [dataLoading,setDataLoading]=useState(false);
  const [accountVersion,setAccountVersion]=useState(0);
  const [publicTheme,setPublicTheme]=useState('orange');
  useEffect(()=>onAuthStateChanged(auth,user=>{
    setAuthUser(user);
    setAuthLoading(false);
  }),[]);
  useEffect(()=>{
    if(!authUser){
      dbRef.current=emptyDatabase();
      setDb(dbRef.current);
      setDataLoading(false);
      return undefined;
    }
    setDataLoading(true);
    return subscribeAccount(authUser,data=>{
      dbRef.current=data;
      setDb(data);
      setDataLoading(false);
    },error=>{
      console.error('Failed to load Coffetea data from Firestore:',error);
      toast(error.message||'Не удалось загрузить данные из облака.');
      setDataLoading(false);
    });
  },[authUser,accountVersion]);
  useEffect(()=>subscribePublicHome(setPublicTheme,error=>{
    console.error('Failed to load public site theme from Firestore:',error);
  }),[]);

  const me=db.users.find(u=>u.id===db.session)||null;

  // Всплывающее сообщение снизу экрана (Toast) и функция его показа:
  // выставляем текст и через 2.6 секунды сами его убираем.
  const [msg,setMsg]=useState('');
  const tref=useRef();
  function toast(m){setMsg(m);clearTimeout(tref.current);tref.current=setTimeout(()=>setMsg(''),2600);}
  async function finish(user){
    try{
      const existing=await getUserProfile(user.id);
      let profile=existing;
      if(!existing){
        if(user.role==='owner')await createOwnerProfile(user);
        else await createLinkedProfile(user,user.inviteCode);
        profile=await getUserProfile(user.id);
      }
      if(!profile)throw new Error('Профиль не появился в базе. Попробуйте ещё раз.');
      setDataLoading(true);
      setAccountVersion(version=>version+1);
      toast(profile.role==='owner'&&!existing?'Заведение создано. Добавьте первый товар.':'Добро пожаловать!');
      navigate(rolePath(profile.role),{replace:true});
    }catch(error){
      console.error('Failed to save Coffetea profile:',error);
      toast(error.message||'Не удалось сохранить профиль в облаке.');
      throw error;
    }
  }
  function update(fn){
    const previous=dbRef.current;
    const next=structuredClone(previous);
    fn(next);
    dbRef.current=next;
    setDb(next);
    if(previous.session&&next.session===null){
      void signOut(auth).catch(error=>{
        console.error('Failed to sign out from Firebase:',error);
        toast('Не удалось выйти из аккаунта.');
      });
      return;
    }
    if(previous.session&&next.session){
      void persistChanges(previous,next,previous.session).catch(error=>{
        console.error('Failed to save Coffetea data to Firestore:',error);
        toast(error.message||'Не удалось сохранить изменения в облаке.');
      });
    }
  }

  // ---- Тема оформления ----
  // Хранится отдельно от db (в своём ключе localStorage), потому что это
  // настройка устройства/браузера, а не самого заведения.
  const [theme,setThemeState]=useState(()=>{try{return localStorage.getItem('coffetea_theme')||'orange';}catch(e){return 'orange';}});
  // При смене темы — подставляем её цвета в CSS-переменные (applyTheme)
  // и запоминаем выбор, чтобы он сохранился при следующем открытии.
  useEffect(()=>{applyTheme(theme);try{localStorage.setItem('coffetea_theme',theme);}catch(e){}},[theme]);
  function setTheme(k){setThemeState(k);}
  async function setPublicSiteTheme(key){
    try{
      await savePublicHomeTheme(key);
      toast('Тема главной страницы обновлена');
    }catch(error){
      console.error('Failed to save public site theme:',error);
      toast(error.message||'Не удалось сохранить тему сайта.');
    }
  }

  // ---- Обои и музыка текущего заведения ----
  // "Чьё" заведение сейчас на экране (sceneOwner), чтобы понять, чьи обои
  // и музыку показывать: у владельца — его собственное, у администратора
  // и покупателя — заведение, к которому они привязаны (me.ownerId).
  // У кассира сцены нет (null) — кассир меню не просматривает.
  const sceneOwnerId=!me?null:(me.role==='owner'?me.id:(me.role==='admin'||me.role==='buyer')?me.ownerId:null);
  const sceneOwner=sceneOwnerId?db.users.find(u=>u.id===sceneOwnerId):null;

  // audioRef — прямая ссылка на HTML-тег <audio> внизу функции.
  // Он не пересоздаётся при перерисовках, поэтому музыка не прерывается
  // сама по себе, пока остаёшься в меню одного и того же заведения.
  const audioRef=useRef(null);
  const [playing,setPlaying]=useState(false);
  // Когда меняется заведение в фокусе (или у него появляется/пропадает
  // музыка) — подставляем новый файл в <audio> (но НЕ запускаем
  // воспроизведение автоматически: браузеры всё равно не дадут играть
  // звук без явного действия человека, да и мы сами не хотим звук
  // без спроса — см. требование «музыки не будет, пока не нажмут»).
  useEffect(()=>{
    const a=audioRef.current; if(!a) return;
    if(sceneOwner&&sceneOwner.music){ if(a.getAttribute('data-src')!==sceneOwner.music){a.pause();a.src=sceneOwner.music;a.setAttribute('data-src',sceneOwner.music);setPlaying(false);} }
    else { a.pause(); a.removeAttribute('src'); a.removeAttribute('data-src'); setPlaying(false); }
  },[sceneOwner&&sceneOwner.music]);
  // Включить/выключить музыку по нажатию на значок ноты в шапке.
  function toggleMusic(){
    const a=audioRef.current; if(!a) return;
    if(a.paused){a.play().then(()=>setPlaying(true)).catch(()=>toast('Не удалось включить музыку'));}
    else{a.pause();setPlaying(false);}
  }
  // Пакуем всё, что нужно кнопке-ноте, в один объект и передаём его вниз
  // в OwnerView/BuyerView (которые отдают его дальше в MusicBtn).
  const musicCtl={active:!!(sceneOwner&&sceneOwner.music),playing,toggle:toggleMusic};

  const homePath=me?rolePath(me.role):'/';
  const ownerView=<OwnerView db={db} update={update} me={me} toast={toast} theme={theme} setTheme={setTheme} publicTheme={publicTheme} setPublicSiteTheme={setPublicSiteTheme} musicCtl={musicCtl}/>;

  // ---- Общий фон ----
  // Если у заведения есть свои обои — показываем картинку (с лёгким
  // затемнением поверх для читаемости текста). Если обоев нет —
  // показываем градиент текущей темы и поверх него анимированные пузыри.
  const hasWallpaper=!!(sceneOwner&&sceneOwner.wallpaper);
  if(authLoading||dataLoading){
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--bgFrom)] to-[var(--bgTo)] text-white font-bold">Загружаем Coffetea…</div>;
  }
  return (
    <div className={"min-h-screen "+(hasWallpaper?'':'bg-gradient-to-b from-[var(--bgFrom)] to-[var(--bgTo)]')}>
      {hasWallpaper&&<div className="fixed inset-0 z-0 bg-cover bg-center" style={{backgroundImage:`url(${sceneOwner.wallpaper})`}}><div className="absolute inset-0 bg-black/40"/></div>}
      {!hasWallpaper&&<Bubbles/>}
      {/* Сам экран (content) рисуется поверх фона — z-[1] выше, чем z-0
          у пузырей/обоев, но ниже z-30 у всплывающих окон. */}
      <div className="relative z-[1]">
        <Routes>
          <Route path="/" element={<PublicHome theme={publicTheme}/>}/>
          <Route path="/login" element={me?<Navigate to={homePath} replace/>:<Welcome db={db} toast={toast} finish={finish}/>} />
          <Route path="/owner/*" element={me?.role==='owner'?ownerView:<Navigate to={homePath} replace/>} />
          <Route path="/admin/*" element={me?.role==='admin'?ownerView:<Navigate to={homePath} replace/>} />
          <Route path="/cashier" element={me?.role==='cashier'?<CashierView db={db} update={update} me={me} theme={theme} setTheme={setTheme} publicTheme={publicTheme} setPublicSiteTheme={setPublicSiteTheme}/>:<Navigate to={homePath} replace/>} />
          <Route path="/buyer" element={me?.role==='buyer'?<BuyerView db={db} update={update} me={me} theme={theme} setTheme={setTheme} publicTheme={publicTheme} setPublicSiteTheme={setPublicSiteTheme} musicCtl={musicCtl}/>:<Navigate to={homePath} replace/>} />
          <Route path="*" element={<Navigate to={homePath} replace/>} />
        </Routes>
      </div>
      <Toast msg={msg}/>
      {/* Один-единственный на всё приложение тег <audio>. Он не внутри
          OwnerView/BuyerView специально — если бы он пересоздавался при
          каждой перерисовке экрана, музыка бы постоянно перезапускалась. */}
      <audio ref={audioRef} loop/>
    </div>
  );
}

// Точка входа: находим <div id="root"> в index.html и просим React
// отрисовать туда весь App.
