import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CashierView } from '../pages/CashierView.jsx';
import { OwnerView } from '../pages/OwnerView.jsx';
import { GlobalAdminView } from '../pages/GlobalAdminView.jsx';
import { CatalogPage } from '../pages/CatalogPage.jsx';
import { BuyerAccountPage } from '../pages/BuyerAccountPage.jsx';
import { AboutPage } from '../pages/AboutPage.jsx';
import { ContactsPage } from '../pages/ContactsPage.jsx';
import { PublicHome } from '../pages/PublicHome.jsx';
import { Welcome } from '../features/auth/Welcome.jsx';
import { applyTheme } from '../shared/config.js';
import { auth } from '../shared/data/firebase.js';
import { createLinkedProfile, createOwnerProfile, deleteSiteBanner, deleteSiteProduct, emptyDatabase, getUserProfile, moderateSiteReview, persistChanges, savePublicHomeAppearance, saveSiteBanner, saveSiteProduct, submitSiteReview, subscribeAccount, subscribeBuyerSiteOrders, subscribePublicHome, subscribePublicOrders, subscribePublicProducts, subscribeSiteBanners, subscribeSiteReviews, updatePublicOrderStatus } from '../shared/data/firestoreStore.js';
import { rolePath } from '../shared/lib/utils.js';
import { Bubbles, Toast } from '../shared/ui/index.jsx';

export function App(){
  const navigate=useNavigate();
  const location=useLocation();
  const [db,setDb]=useState(emptyDatabase);
  const dbRef=useRef(db);
  const [authUser,setAuthUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [dataLoading,setDataLoading]=useState(false);
  const [accountVersion,setAccountVersion]=useState(0);
  const [publicTheme,setPublicTheme]=useState('orange');
  const [publicAnimation,setPublicAnimation]=useState('soda');
  const [publicProducts,setPublicProducts]=useState([]);
  const [publicProductsLoading,setPublicProductsLoading]=useState(true);
  const [publicOrders,setPublicOrders]=useState([]);
  const [publicOrdersLoading,setPublicOrdersLoading]=useState(true);
  const [buyerSiteOrders,setBuyerSiteOrders]=useState([]);
  const [siteBanners,setSiteBanners]=useState([]);
  const [siteBannersLoadError,setSiteBannersLoadError]=useState('');
  const [siteReviews,setSiteReviews]=useState([]);
  const me=db.users.find(u=>u.id===db.session)||null;
  const isSiteAdmin=Boolean(me?.isGlobalAdmin||me?.siteAdmin);
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
  useEffect(()=>subscribePublicHome(settings=>{
    setPublicTheme(settings.theme);
    setPublicAnimation(settings.animation);
  },error=>{
    console.error('Failed to load public site settings from Firestore:',error);
  }),[]);
  useEffect(()=>{
    return subscribePublicProducts(products=>{
      setPublicProducts(products);
      setPublicProductsLoading(false);
    },error=>{
      console.error('Failed to load public products:',error);
      toast(error.message||'Не удалось загрузить товары.');
      setPublicProductsLoading(false);
    });
  },[]);
  useEffect(()=>{
    return subscribeSiteBanners(banners=>{
      setSiteBanners(banners);
      setSiteBannersLoadError('');
    },error=>{
      console.error('Failed to load site banners:',error);
      setSiteBannersLoadError(error.message||'Не удалось загрузить баннеры.');
      toast(error.message||'Не удалось загрузить баннеры.');
    },isSiteAdmin);
  },[isSiteAdmin]);
  useEffect(()=>{
    return subscribeSiteReviews(setSiteReviews,error=>{
      console.error('Failed to load site reviews:',error);
      toast(error.message||'Не удалось загрузить отзывы.');
    },isSiteAdmin);
  },[isSiteAdmin]);
  useEffect(()=>{
    if(me?.role!=='buyer'){
      setBuyerSiteOrders([]);
      return undefined;
    }
    return subscribeBuyerSiteOrders(me.id,orders=>{
      setBuyerSiteOrders(orders);
    },error=>{
      console.error('Failed to load buyer catalog orders:',error);
      toast(error.message||'Не удалось загрузить историю заказов.');
    });
  },[me?.id,me?.role]);
  useEffect(()=>{
    if(!me?.isGlobalAdmin&&!me?.siteAdmin){
      setPublicOrders([]);
      setPublicOrdersLoading(false);
      return undefined;
    }
    setPublicOrders([]);
    setPublicOrdersLoading(true);
    return subscribePublicOrders(orders=>{
      setPublicOrders(orders);
      setPublicOrdersLoading(false);
    },error=>{
      console.error('Failed to load site admin orders:',error);
      toast(error.message||'Не удалось загрузить заказы.');
      setPublicOrdersLoading(false);
    });
  },[me?.isGlobalAdmin,me?.siteAdmin]);

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
      const nextPath=new URLSearchParams(window.location.search).get('next');
      navigate(profile.isGlobalAdmin||profile.siteAdmin
        ?'/admin'
        :profile.role==='buyer'&&['/catalog','/'].includes(nextPath)?nextPath:rolePath(profile.role),{replace:true});
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
  async function savePublicSiteAppearance(theme,animation){
    try{
      await savePublicHomeAppearance(theme,animation);
      toast('Настройки главной страницы сохранены');
      return true;
    }catch(error){
      console.error('Failed to save public site appearance:',error);
      const message=error.code==='permission-denied'
        ?'Firebase отклонил изменение. Опубликуйте актуальные правила Firestore и попробуйте ещё раз.'
        :error.message||'Не удалось сохранить настройки главной страницы.';
      toast(message);
      throw new Error(message);
    }
  }
  async function setPublicOrderStatus(venueId,orderId,status){
    try{
      await updatePublicOrderStatus(venueId,orderId,status);
    }catch(error){
      console.error('Failed to update public venue order:',error);
      toast(error.message||'Не удалось обновить заказ.');
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

  const homePath=me?(isSiteAdmin?'/admin':rolePath(me.role)):'/';
  const ownerView=<OwnerView db={db} update={update} me={me} toast={toast} theme={theme} setTheme={setTheme} publicTheme={publicTheme} savePublicSiteAppearance={savePublicSiteAppearance} publicAnimation={publicAnimation} musicCtl={musicCtl}/>;

  // ---- Общий фон ----
  // Если у заведения есть свои обои — показываем картинку (с лёгким
  // затемнением поверх для читаемости текста). Если обоев нет —
  // показываем градиент текущей темы и поверх него анимированные пузыри.
  const hasWallpaper=!!(sceneOwner&&sceneOwner.wallpaper);
  if(authLoading||(dataLoading&&!['/login','/register'].includes(location.pathname))){
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
          <Route path="/" element={<PublicHome theme={publicTheme} animation={publicAnimation} products={publicProducts} menuLoading={publicProductsLoading} banners={siteBanners.filter(banner=>banner.active)} reviews={siteReviews.filter(review=>review.status==='approved')} me={me} onSubmitReview={review=>submitSiteReview(review,me)}/>}/>
          <Route path="/catalog" element={<CatalogPage theme={publicTheme} products={publicProducts} loading={publicProductsLoading} me={me} buyerOrders={buyerSiteOrders}/>}/>
          <Route path="/about" element={<AboutPage theme={publicTheme} me={me}/>}/>
          <Route path="/contacts" element={<ContactsPage theme={publicTheme} me={me}/>}/>
          <Route path="/account" element={me?.role==='buyer'
            ?<BuyerAccountPage theme={publicTheme} me={me} orders={[...buyerSiteOrders,...db.orders]} onLogout={()=>update(data=>{data.session=null;})}/>
            :<Navigate to={me?homePath:'/login?next=%2Faccount'} replace/>}/>
          <Route path="/login" element={me?<Navigate to={homePath} replace/>:<Welcome db={db} toast={toast} finish={finish} initialMode="login"/>} />
          <Route path="/register" element={me?<Navigate to={homePath} replace/>:<Welcome db={db} toast={toast} finish={finish} initialMode="register"/>} />
          <Route path="/owner/*" element={me?.role==='owner'?ownerView:<Navigate to={homePath} replace/>} />
          <Route path="/admin/*" element={isSiteAdmin
            ?<GlobalAdminView me={me} update={update} publicTheme={publicTheme} savePublicSiteAppearance={savePublicSiteAppearance} publicAnimation={publicAnimation} publicProducts={publicProducts} publicOrders={publicOrders} publicOrdersLoading={publicOrdersLoading} setPublicOrderStatus={setPublicOrderStatus} saveSiteProduct={saveSiteProduct} deleteSiteProduct={deleteSiteProduct} siteBanners={siteBanners} siteBannersLoadError={siteBannersLoadError} saveSiteBanner={saveSiteBanner} deleteSiteBanner={deleteSiteBanner} siteReviews={siteReviews} moderateSiteReview={moderateSiteReview}/>
            :me?.role==='admin'||me?.role==='cashier'?ownerView:<Navigate to={homePath} replace/>} />
          <Route path="/cashier" element={me?.role==='cashier'?<CashierView db={db} update={update} me={me} theme={theme} setTheme={setTheme} publicTheme={publicTheme} savePublicSiteAppearance={savePublicSiteAppearance}/>:<Navigate to={homePath} replace/>} />
          <Route path="/buyer" element={<Navigate to="/account" replace/>} />
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
