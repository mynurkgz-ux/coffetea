import React, { useEffect, useRef, useState } from 'react';
import { FiGlobe } from 'react-icons/fi';

const translations={
  RU:{
    about:'О нас',catalog:'Каталог',contacts:'Контакты',login:'Войти',register:'Регистрация',account:'Мой кабинет',
    tagline:'кофе · чай · уют',mainNav:'Основная навигация',home:'Главная',menu:'Меню',orders:'Заказы',
    openMenu:'Открыть меню',howToFind:'Как нас найти',cozyMoment:'твой момент уюта.',
    heroText:'Любимый кофе, согревающий чай и что-нибудь вкусное. Сделай паузу и наслаждайся моментом.',
    skip:'Пропустить',coffeeTeaDesserts:'КОФЕ · ЧАЙ · ДЕСЕРТЫ',yourCafe:'ТВОЯ КОФЕЙНЯ',
    coffeeMoments:'Кофе · чай · моменты уюта',goodMood:'Налей себе немного хорошего настроения ☕',
    menuCafe:'Меню кафе',menuQuestion:'Что вам сегодня по вкусу?',allCatalog:'Весь каталог',
    aboutCoffetea:'О Coffetea',aboutTitle:'Место, где день становится чуточку лучше',
    aboutText:'Мы создали Coffetea для простых радостей: встретиться с близкими, передохнуть между делами или взять любимый напиток с собой. Выбирайте то, что нравится именно вам.',
    aboutCatalog:'В каталоге собраны товары кафе — напитки, чай и десерты. Загляните в каталог и выберите то, что вам сегодня по вкусу.',
    meet:'До встречи',findUs:'Как нас найти',contactText:'Загляните в Coffetea за кофе, чаем и чем-нибудь вкусным.',
    qrText:'Откройте QR-код меню в кафе или спросите у сотрудников — они подскажут, как посмотреть меню и сделать заказ.',
    viewCatalog:'Посмотреть каталог',openMap:'Открыть',navigation:'Навигация',cart:'Корзина',
    discover:'Загляните в Coffetea',search:'Поиск по названию или описанию',all:'Все',discount:'Со скидкой',
    found:'Найдено товаров:',notFound:'Товары не найдены',reset:'Сбросить фильтры',loading:'Загружаем товары…',
    myOrders:'Мои заказы',footerText:'Кофе, чай и тёплые встречи. Выберите любимое в меню CoffeTea.',
    footerMade:'Сделано с теплом · Кофе и чай на каждый день'
  },
  KG:{
    about:'Биз жөнүндө',catalog:'Каталог',contacts:'Байланыштар',login:'Кирүү',register:'Катталуу',account:'Менин кабинетим',
    tagline:'кофе · чай · жайлуулук',mainNav:'Негизги навигация',home:'Башкы бет',menu:'Меню',orders:'Заказдар',
    openMenu:'Менюну ачуу',howToFind:'Кайдан табуу керек',cozyMoment:'жайлуулук моменти.',
    heroText:'Сүйүктүү кофе, жылуулаткан чай жана даамдуу нерсе. Убакыттан тыныгуу алып, жагымдуулукка ырык бериңиз.',
    skip:'Өткөрүп жиберүү',coffeeTeaDesserts:'КОФЕ · ЧАЙ · ДЕСЕРТТЕР',yourCafe:'СИЗДИН КОФЕЙНА',
    coffeeMoments:'Кофе · чай · жайлуулук моменттери',goodMood:'Жакшы маанайга бир аз куйуңуз ☕',
    menuCafe:'Кафе менюсу',menuQuestion:'Бүгүн эмнеден сүйөсүз?',allCatalog:'Каталогдун баары',
    aboutCoffetea:'Coffetea жөнүндө',aboutTitle:'Күнүңүздү бир аз жакшы кылган жер',
    aboutText:'Биз Coffeteaны жөнөкөй ырахаттар үчүн түздүк: жакындарыңыз менен жолугуу, иштердин ортосунда эс алуу же сүйүктүү суусундугуңузду алып кетүү. Сизге жагган нерсени тандаңыз.',
    aboutCatalog:'Каталогдо кафе өнүмдөрү: суусундуктар, чай жана десерттер топтолгон. Каталогду ачып, бүгүн кандай нерсе жагса, ошону тандаңыз.',
    meet:'Жолугушканга чейин',findUs:'Кайдан табуу керек',contactText:'Coffeteaга кофе, чай жана даамдуу нерсе ичип келишиңиз.',
    qrText:'Кафедеги меню QR-кодун ачыңыз же кызматкерлерден сураңыз — алар менюну көрүп, заказ берүүнү түшүндүрүшөт.',
    viewCatalog:'Каталогду көрүү',openMap:'Ачуу',navigation:'Навигация',cart:'Корзина',
    discover:'Coffeteaга келиңиз',search:'Аты же сыпаттамасы боюнча издөө',all:'Баары',discount:'Жеңилдик менен',
    found:'Табылган товарлар:',notFound:'Товарлар табылган жок',reset:'Фильтрлерди тазалоо',loading:'Товарлар жүктөлүүдө…',
    myOrders:'Менин заказдарым',footerText:'Кофе, чай жана жылуу жолугушуу. CoffeTea менюсунан сүйүктүү нерсеңизди тандаңыз.',
    footerMade:'Жылуулук менен жасалды · Ар күнү кофе жана чай'
  },
  ENG:{
    about:'About us',catalog:'Catalog',contacts:'Contacts',login:'Log in',register:'Sign up',account:'My account',
    tagline:'coffee · tea · comfort',mainNav:'Main navigation',home:'Home',menu:'Menu',orders:'Orders',
    openMenu:'Open menu',howToFind:'How to find us',cozyMoment:'your cozy moment.',
    heroText:'Favorite coffee, warming tea, and something delicious. Take a break and enjoy the moment.',
    skip:'Skip',coffeeTeaDesserts:'COFFEE · TEA · DESSERTS',yourCafe:'YOUR CAFE',
    coffeeMoments:'Coffee · tea · cozy moments',goodMood:'Pour yourself a little good mood ☕',
    menuCafe:'Cafe menu',menuQuestion:'What sounds good today?',allCatalog:'View all catalog',
    aboutCoffetea:'About Coffetea',aboutTitle:'A place that makes your day a little better',
    aboutText:'We created Coffetea for simple pleasures: meeting loved ones, taking a break between errands, or grabbing your favorite drink to go. Choose what you like.',
    aboutCatalog:'The catalog features cafe drinks, tea, and desserts. Browse it and choose whatever tastes good today.',
    meet:'See you soon',findUs:'How to find us',contactText:'Drop by Coffetea for coffee, tea, and something tasty.',
    qrText:'Open the cafe menu QR code or ask our staff—they will help you view the menu and place an order.',
    viewCatalog:'View catalog',openMap:'Open',navigation:'Navigation',cart:'Cart',
    discover:'Visit Coffetea',search:'Search by name or description',all:'All',discount:'Discounted',
    found:'Products found:',notFound:'No products found',reset:'Reset filters',loading:'Loading products…',
    myOrders:'My orders',footerText:'Coffee, tea, and warm meetings. Choose your favorite from the CoffeTea menu.',
    footerMade:'Made with warmth · Coffee and tea for every day'
  }
};

export function useLanguage(){
  const [language,setLanguage]=useState(()=>localStorage.getItem('coffetea-language')||'RU');
  useEffect(()=>{
    function update(event){
      const next=event.detail?.language||localStorage.getItem('coffetea-language')||'RU';
      setLanguage(next);
    }
    function updateStorage(event){
      if(event.key==='coffetea-language') setLanguage(event.newValue||'RU');
    }
    window.addEventListener('coffetea-language-change',update);
    window.addEventListener('storage',updateStorage);
    return ()=>{
      window.removeEventListener('coffetea-language-change',update);
      window.removeEventListener('storage',updateStorage);
    };
  },[]);
  const t=(key)=>translations[language]?.[key]||translations.RU[key]||key;
  return {language,t};
}

export function LanguageSwitcher(){
  const [open,setOpen]=useState(false);
  const {language}=useLanguage();
  const rootRef=useRef(null);
  const languages=[
    {code:'KG',label:'Кыргызча'},
    {code:'RU',label:'Русский'},
    {code:'ENG',label:'English'}
  ];

  useEffect(()=>{
    const savedLanguage=localStorage.getItem('coffetea-language')||'RU';
    document.documentElement.lang=savedLanguage==='ENG'?'en':savedLanguage==='KG'?'ky':'ru';
  },[]);

  useEffect(()=>{
    function closeOnOutsideClick(event){
      if(rootRef.current&&!rootRef.current.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event){
      if(event.key==='Escape') setOpen(false);
    }
    document.addEventListener('pointerdown',closeOnOutsideClick);
    document.addEventListener('keydown',closeOnEscape);
    return ()=>{
      document.removeEventListener('pointerdown',closeOnOutsideClick);
      document.removeEventListener('keydown',closeOnEscape);
    };
  },[]);

  function chooseLanguage(code){
    localStorage.setItem('coffetea-language',code);
    document.documentElement.lang=code==='ENG'?'en':code==='KG'?'ky':'ru';
    window.dispatchEvent(new CustomEvent('coffetea-language-change',{detail:{language:code}}));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative z-[50]">
      {open&&(
        <div className="absolute right-0 top-[calc(100%+10px)] w-36 rounded-2xl border border-black/10 bg-white p-1.5 shadow-2xl shadow-black/20">
          {languages.map(item=>(
            <button
              key={item.code}
              type="button"
              onClick={()=>chooseLanguage(item.code)}
              aria-pressed={language===item.code}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-extrabold transition ${
                language===item.code
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[#30251f] hover:bg-[var(--field)]'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-75">{item.code}</span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={()=>setOpen(value=>!value)}
        aria-label="Выбрать язык"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--accent)] shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white sm:h-11 sm:w-11"
      >
        <FiGlobe aria-hidden="true" size={25}/>
      </button>
    </div>
  );
}

export function Field({label,children}){
  return <label className="block mb-3"><span className="block text-sm font-bold mb-1">{label}</span>{children}</label>;
}
// Modal — всплывающее окно поверх экрана: тёмная подложка + белая
// карточка с заголовком, крестиком и содержимым ({children}).
// Снизу на телефоне, по центру на широких экранах (см. классы sm:items-center).
// Закрывается тремя способами: кнопка-крестик, клик по тёмной подложке
// (но не по самой карточке — проверка e.target===e.currentTarget),
// и клавиша Esc (эффект ниже вешает слушатель на document).
export function Modal({title,onClose,children}){
  useEffect(()=>{
    function onKey(e){if(e.key==='Escape')onClose();}
    document.addEventListener('keydown',onKey);
    return ()=>document.removeEventListener('keydown',onKey);
  },[onClose]);
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="w-full sm:w-[420px] max-h-[90vh] overflow-y-auto bg-white text-black rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4 gap-3">
          <h2 className="font-extrabold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Закрыть" className="w-9 h-9 shrink-0 rounded-full bg-[var(--field)] text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
// Toast — короткое всплывающее сообщение внизу экрана ("Товар добавлен"
// и т.п.). App хранит текст текущего сообщения и через пару секунд
// сам его убирает (см. функцию toast() внутри App).
export function Toast({msg}){
  if(!msg) return null;
  return <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white font-bold px-4 py-3 rounded-full z-40 text-sm max-w-[90%] text-center">{msg}</div>;
}

// Bubbles — те самые фоновые пузыри. Рисуются один раз при первом
// показе (useMemo с пустым списком зависимостей [] — пересчёта не будет)
// с помощью маленького самодельного генератора случайных чисел (чтобы
// пузыри не "прыгали" при каждой перерисовке компонента).
// У каждого пузыря: размер, положение, цвет (подобран из цветов текущей
// темы — var(--accent)/var(--bgFrom)/var(--bgTo)) и своя длительность
// анимации. Сама анимация (@keyframes drift) описана в style.css.
// pointer-events-none — чтобы пузыри не мешали нажимать на кнопки под ними.
export function Bubbles(){
  const bubbles=React.useMemo(()=>{
    let s=11; const r=()=>((s=s*16807%2147483647)/2147483647);
    const vars=[
      ['var(--accent)','var(--bgTo)'],
      ['var(--bgFrom)','var(--accent)'],
      ['rgba(255,255,255,.65)','var(--bgFrom)']
    ];
    return Array.from({length:16},(_,i)=>{
      const size=Math.round(26+Math.pow(r(),2.2)*220);
      const [c1,c2]=vars[i%3];
      return {
        id:i,size,
        left:(r()*108-4).toFixed(1)+'%', top:(r()*108-4).toFixed(1)+'%',
        dx:(r()*60-30).toFixed(0)+'px', dy:(r()*80-40).toFixed(0)+'px',
        dur:(16+r()*18).toFixed(1)+'s', delay:'-'+(r()*20).toFixed(1)+'s',
        bg:`radial-gradient(circle at 32% 28%, rgba(255,255,255,.75) 0 6%, transparent 7%), radial-gradient(circle at 36% 34%, ${c1}, ${c2} 72%)`
      };
    });
  },[]);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {bubbles.map(b=>(
        <span key={b.id} className="bubble" style={{width:b.size,height:b.size,left:b.left,top:b.top,background:b.bg,
          '--dx':b.dx,'--dy':b.dy,animationDuration:b.dur,animationDelay:b.delay}}/>
      ))}
    </div>
  );
}
// ===== Экран приветствия, регистрации и входа =====
// Welcome показывается, когда никто не вошёл в аккаунт (db.session пуст).
// Сам процесс регистрации/входа — это пошаговая форма: вся её временная
// информация (на каком мы шаге, что ввёл человек, текст ошибки) живёт
// в одном состоянии `a` (от "auth"). a===null — окно регистрации закрыто.
// Шаги (a.step): 'role' -> 'contact' -> 'code' -> дальше по роли:
//   владелец -> 'business' (ввести название заведения)
//   остальные -> 'link' (ввести код, который дал владелец)
