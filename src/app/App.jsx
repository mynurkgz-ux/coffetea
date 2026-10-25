import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { BuyerView } from '../pages/BuyerView.jsx';
import { CashierView } from '../pages/CashierView.jsx';
import { OwnerView } from '../pages/OwnerView.jsx';
import { Welcome } from '../features/auth/Welcome.jsx';
import { KEY, applyTheme } from '../shared/config.js';
import { load } from '../shared/data/localStore.js';
import { rolePath } from '../shared/lib/utils.js';
import { Bubbles, Toast } from '../shared/ui/index.jsx';

export function App(){
  const navigate=useNavigate();
  // db — вся база: пользователи, товары, заказы, корзины, кто сейчас
  // вошёл (db.session). load() при первом запуске достаёт её из localStorage
  // (или создаёт demo-данные, если там пусто).
  const [db,setDb]=useState(load);
  // При любом изменении db — пересохраняем её в localStorage целиком.
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}},[db]);
  // update — единственный способ поменять базу для всех остальных
  // компонентов. structuredClone делает полную копию db, функция fn
  // меняет эту копию как ей удобно (например, d.products.push(...)),
  // а setDb сохраняет копию как новое состояние — React это и замечает,
  // и перерисовывает экран.
  function update(fn){setDb(d=>{const n=structuredClone(d);fn(n);return n;});}
  // Текущий вошедший пользователь (или null, если никто не вошёл).
  const me=db.users.find(u=>u.id===db.session)||null;

  // Всплывающее сообщение снизу экрана (Toast) и функция его показа:
  // выставляем текст и через 2.6 секунды сами его убираем.
  const [msg,setMsg]=useState('');
  const tref=useRef();
  function toast(m){setMsg(m);clearTimeout(tref.current);tref.current=setTimeout(()=>setMsg(''),2600);}
  // Завершение регистрации/входа (вызывается из Welcome): добавляем
  // нового пользователя в базу, если его там ещё нет, и делаем его
  // текущим (d.session=user.id).
  function finish(user){
    update(d=>{if(!d.users.some(u=>u.id===user.id))d.users.push(user);d.session=user.id;});
    toast(user.role==='owner'?'Заведение создано. Добавьте первый товар.':'Добро пожаловать!');
    navigate(rolePath(user.role),{replace:true});
  }

  // ---- Тема оформления ----
  // Хранится отдельно от db (в своём ключе localStorage), потому что это
  // настройка устройства/браузера, а не самого заведения.
  const [theme,setThemeState]=useState(()=>{try{return localStorage.getItem('coffetea_theme')||'orange';}catch(e){return 'orange';}});
  // При смене темы — подставляем её цвета в CSS-переменные (applyTheme)
  // и запоминаем выбор, чтобы он сохранился при следующем открытии.
  useEffect(()=>{applyTheme(theme);try{localStorage.setItem('coffetea_theme',theme);}catch(e){}},[theme]);
  function setTheme(k){setThemeState(k);}

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
  const ownerView=<OwnerView db={db} update={update} me={me} toast={toast} theme={theme} setTheme={setTheme} musicCtl={musicCtl}/>;

  // ---- Общий фон ----
  // Если у заведения есть свои обои — показываем картинку (с лёгким
  // затемнением поверх для читаемости текста). Если обоев нет —
  // показываем градиент текущей темы и поверх него анимированные пузыри.
  const hasWallpaper=!!(sceneOwner&&sceneOwner.wallpaper);
  return (
    <div className={"min-h-screen "+(hasWallpaper?'':'bg-gradient-to-b from-[var(--bgFrom)] to-[var(--bgTo)]')}>
      {hasWallpaper&&<div className="fixed inset-0 z-0 bg-cover bg-center" style={{backgroundImage:`url(${sceneOwner.wallpaper})`}}><div className="absolute inset-0 bg-black/40"/></div>}
      {!hasWallpaper&&<Bubbles/>}
      {/* Сам экран (content) рисуется поверх фона — z-[1] выше, чем z-0
          у пузырей/обоев, но ниже z-30 у всплывающих окон. */}
      <div className="relative z-[1]">
        <Routes>
          <Route path="/" element={me?<Navigate to={homePath} replace/>:<Welcome db={db} toast={toast} finish={finish}/>} />
          <Route path="/owner/*" element={me?.role==='owner'?ownerView:<Navigate to={homePath} replace/>} />
          <Route path="/admin/*" element={me?.role==='admin'?ownerView:<Navigate to={homePath} replace/>} />
          <Route path="/cashier" element={me?.role==='cashier'?<CashierView db={db} update={update} me={me} theme={theme} setTheme={setTheme}/>:<Navigate to={homePath} replace/>} />
          <Route path="/buyer" element={me?.role==='buyer'?<BuyerView db={db} update={update} me={me} theme={theme} setTheme={setTheme} musicCtl={musicCtl}/>:<Navigate to={homePath} replace/>} />
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
