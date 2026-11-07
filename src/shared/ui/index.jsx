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
    footerMade:'Сделано с теплом · Кофе и чай на каждый день',
    discountOffer:'Скидка',offerDay:'Предложение дня',
    clickMenu:'Нажмите, чтобы открыть меню',toTop:'Наверх',reviews:'Отзывы',map:'Карта',
    mapDemo:'Демонстрационная точка — центр Бишкека. Замените её на адрес кафе перед публикацией.',
    orderInfo:'Соберите заказ в каталоге и заберите его в кафе. Оплата — наличными при получении.',
    goCatalog:'Перейти в каталог',footerLinks:'Ссылки в подвале',mapTitle:'Демонстрационная карта центра Бишкека',
    reviewTitle:'Отзывы о CoffeTea',reviewOpinion:'Ваше мнение важно',reviewLeave:'Оставить отзыв',
    reviewCount:'отзыв(ов)',noReviews:'Пока нет опубликованных отзывов. Вы можете оставить первый.',
    reviewCheck:'Отзыв появится на сайте после проверки администратором.',yourRating:'Ваша оценка',
    rating:'Оценка от 1 до 5',yourName:'Ваше имя',yourReview:'Отзыв',sending:'Отправляем…',sendReview:'Отправить отзыв',
    loginReview:'Войти, чтобы оставить отзыв',reviewSent:'Спасибо! Отзыв отправлен администратору на проверку.',
    reviewError:'Не удалось отправить отзыв.',menuLoading:'Загружаем меню…',
    menuSoon:'Скоро здесь появится меню',menuSoonText:'Загляните позже за кофе, чаем и десертами.',
    previousProducts:'Предыдущие товары',nextProducts:'Следующие товары',productCarousel:'Карусель товаров',
    bannerSection:'Акции и новости кафе',bannerCarousel:'Баннеры кафе',bannerNews:'CoffeTea · новости и предложения',
    bannerPicker:'Выбор баннера',banner:'Баннер',discountProduct:'Товар со скидкой',clickOpenMenu:'Нажмите, чтобы открыть меню',
    productsNotAdded:'Товары пока не добавлены',catalogLater:'Загляните позже — каталог появится здесь.',
    purchases:'Покупки',ordersStatus:'Здесь появятся ваши заказы и их статус.',
    cartTitle:'Корзина',pieces:'шт.',total:'Итого',continueCheckout:'Продолжить оформление',checkout:'Оформить заказ',
    authCartTitle:'Войдите, чтобы оформить заказ',
    authCartText:'Товары останутся в корзине. Войдите или зарегистрируйтесь, чтобы оформить заказ. Оплата наличными на кассе.',
    confirmOrder:'Подтвердите заказ',confirmText:'Создадим один заказ. Оплата — наличными на кассе при получении.',
    orderCount:'товара',processing:'Оформляем…',orderSent:'Заказ отправлен',
    receiptText:'Покажите код сотруднику кафе. Оплата — наличными при получении заказа.',done:'Готово',
    noCategory:'Без категории',cashInfo:'Соберите заказ и оплатите наличными на кассе.',
    searchProducts:'Поиск товаров',categoryFilter:'Фильтр товаров по категории',
    filterHint:'Измените параметры фильтрации или сбросьте их.',
    removeProduct:'Убрать',addProduct:'Добавить',decreaseProduct:'Уменьшить',increaseProduct:'Увеличить',
    reviewCountLabel:'отзыв(ов)',ratingLabel:'Оценка',ratingOutOf:'из 5',
    homeLink:'CoffeTea — главная',discountProductAria:'Товар со скидкой',
    percentOff:'процентов',openCatalog:'Открыть каталог'
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
    footerMade:'Жылуулук менен жасалды · Ар күнү кофе жана чай',
    discountOffer:'Арзандатуу',offerDay:'Күндүн сунушу',clickMenu:'Менюну ачуу үчүн басыңыз',
    toTop:'Жогору',reviews:'Пикирлер',map:'Карта',
    mapDemo:'Демонстрациялык чекит — Бишкектин борбору. Жарыялоодон мурун кафе дарегине алмаштырыңыз.',
    orderInfo:'Каталогдон заказды чогултуңуз жана кафеде алып кетиңиз. Төлөө — заказды алганда накталай.',
    goCatalog:'Каталогго өтүү',footerLinks:'Төмөнкү бөлүмдүн шилтемелери',mapTitle:'Бишкектин борборунун демонстрациялык картасы',
    reviewTitle:'CoffeTea жөнүндө пикирлер',reviewOpinion:'Сиздин пикириңиз маанилүү',reviewLeave:'Пикир калтыруу',
    reviewCount:'пикир',noReviews:'Азырынча жарыяланган пикир жок. Биринчи болуп калтырсаңыз болот.',
    reviewCheck:'Пикир администратор текшергенден кийин сайтта көрүнөт.',yourRating:'Сиздин бааңыз',
    rating:'1ден 5ке чейинки баа',yourName:'Сиздин атыңыз',yourReview:'Пикир',sending:'Жөнөтүлүүдө…',sendReview:'Пикирди жөнөтүү',
    loginReview:'Пикир калтыруу үчүн кирүү',reviewSent:'Рахмат! Пикир администраторго текшерүүгө жөнөтүлдү.',
    reviewError:'Пикир жөнөтүлбөй калды.',menuLoading:'Меню жүктөлүүдө…',
    menuSoon:'Жакында бул жерде меню болот',menuSoonText:'Кийин кофе, чай жана десерттер үчүн кайрылып келиңиз.',
    previousProducts:'Мурунку товарлар',nextProducts:'Кийинки товарлар',productCarousel:'Товарлар карусели',
    bannerSection:'Кафе акциялары жана жаңылыктары',bannerCarousel:'Кафе баннерлери',bannerNews:'CoffeTea · жаңылыктар жана сунуштар',
    bannerPicker:'Баннер тандоо',banner:'Баннер',discountProduct:'Жеңилдик менен товар',clickOpenMenu:'Менюну ачуу үчүн басыңыз',
    productsNotAdded:'Товарлар азырынча кошулган жок',catalogLater:'Кийин кайрылып көрүңүз — каталог бул жерде пайда болот.',
    purchases:'Сатып алуулар',ordersStatus:'Бул жерде заказдарыңыз жана абалдары пайда болот.',
    cartTitle:'Корзина',pieces:'дана',total:'Жалпы сумма',continueCheckout:'Тапшырууну улантуу',checkout:'Заказ берүү',
    authCartTitle:'Заказ берүү үчүн кириңиз',
    authCartText:'Товарлар корзинада калат. Заказ берүү үчүн кириңиз же катталыңыз. Төлөө заказ алууда накталай.',
    confirmOrder:'Заказды ырастоо',confirmText:'Бир заказ түзөбүз. Төлөө — заказды алууда накталай.',
    orderCount:'товар',processing:'Оформделүүдө…',orderSent:'Заказ жөнөтүлдү',
    receiptText:'Кодду кафе кызматкерине көрсөтүңүз. Төлөө — заказды алганда накталай.',done:'Даяр',
    noCategory:'Категориясыз',cashInfo:'Заказды чогултуңуз жана касада накталай төлөңүз.',
    searchProducts:'Товарларды издөө',categoryFilter:'Категориялар боюнча товарларды фильтрлоо',
    filterHint:'Фильтрация параметрлерин өзгөртүңүз же фильтрлерди тазалаңыз.',
    removeProduct:'Алуу',addProduct:'Кошуу',decreaseProduct:'Азайтуу',increaseProduct:'Көбөйтүү',
    reviewCountLabel:'пикир',ratingLabel:'Баа',ratingOutOf:'5тен',
    homeLink:'CoffeTea — башкы бет',
    discountProductAria:'Жеңилдик менен товар',percentOff:'процент',openCatalog:'Каталогду ачуу'
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
    footerMade:'Made with warmth · Coffee and tea for every day',
    discountOffer:'Discount',offerDay:'Offer of the day',clickMenu:'Click to open the menu',
    toTop:'Back to top',reviews:'Reviews',map:'Map',
    mapDemo:'Demonstration location — central Bishkek. Replace it with the cafe address before publishing.',
    orderInfo:'Build your order in the catalog and pick it up at the cafe. Pay by cash upon pickup.',
    goCatalog:'Go to catalog',footerLinks:'Footer links',mapTitle:'Demonstration map of central Bishkek',
    reviewTitle:'CoffeTea reviews',reviewOpinion:'Your opinion matters',reviewLeave:'Leave a review',
    reviewCount:'reviews',noReviews:'There are no published reviews yet. Be the first to leave one.',
    reviewCheck:'Your review will appear after administrator approval.',yourRating:'Your rating',
    rating:'Rating from 1 to 5',yourName:'Your name',yourReview:'Review',sending:'Sending…',sendReview:'Submit review',
    loginReview:'Log in to leave a review',reviewSent:'Thank you! Your review was sent to the administrator for approval.',
    reviewError:'Could not submit your review.',menuLoading:'Loading menu…',
    menuSoon:'The menu will appear here soon',menuSoonText:'Check back later for coffee, tea, and desserts.',
    previousProducts:'Previous products',nextProducts:'Next products',productCarousel:'Product carousel',
    bannerSection:'Cafe promotions and news',bannerCarousel:'Cafe banners',bannerNews:'CoffeTea · news and offers',
    bannerPicker:'Choose a banner',banner:'Banner',discountProduct:'Discounted product',clickOpenMenu:'Click to open the menu',
    productsNotAdded:'No products have been added yet',catalogLater:'Check back later—the catalog will appear here.',
    purchases:'Purchases',ordersStatus:'Your orders and their statuses will appear here.',
    cartTitle:'Cart',pieces:'pcs',total:'Total',continueCheckout:'Continue checkout',checkout:'Place order',
    authCartTitle:'Log in to place an order',
    authCartText:'Items will stay in your cart. Log in or sign up to place an order. Payment is cash on pickup.',
    confirmOrder:'Confirm order',confirmText:'We will create one order. Payment is cash at pickup.',
    orderCount:'items',processing:'Processing…',orderSent:'Order sent',
    receiptText:'Show the code to a cafe employee. Payment is cash upon pickup.',done:'Done',
    noCategory:'No category',cashInfo:'Build your order and pay by cash at the register.',
    searchProducts:'Search products',categoryFilter:'Filter products by category',
    filterHint:'Change the filter options or reset them.',
    removeProduct:'Remove',addProduct:'Add',decreaseProduct:'Decrease',increaseProduct:'Increase',
    reviewCountLabel:'reviews',ratingLabel:'Rating',ratingOutOf:'out of 5',
    homeLink:'CoffeTea — home',
    discountProductAria:'Discounted product',percentOff:'percent off',openCatalog:'Open catalog'
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
