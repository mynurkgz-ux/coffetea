/*
 * app.js — вся логика и разметка приложения Coffetea (React).
 *
 * Файл состоит из React-компонентов. Каждый компонент — это функция,
 * которая возвращает разметку (JSX, похожий на HTML прямо внутри JS).
 * Когда меняются данные (состояние, "state"), React сам перерисовывает
 * нужный кусок экрана — вручную ничего руками в DOM не дёргаем.
 *
 * Порядок в файле (сверху вниз):
 *  1. Настройки и справочники: KEY, CURR, THEMES, applyTheme
 *  2. Маленькие функции-помощники: uid, genOtp, genCode, money, finalPrice, shrink
 *  3. "База данных" в localStorage: seed, load
 *  4. Общие кусочки интерфейса: Field, Modal, Toast, Bubbles (пузыри на фоне)
 *  5. Экран приветствия и регистрации: Welcome
 *  6. Карточка товара и форма товара: ProductCard, ProductForm
 *  7. Карточка заказа: OrderCard
 *  8. Настройки: ThemeModal, WallpaperModal, MusicModal, SettingsModal, QrModal
 *  9. Экраны по ролям: OwnerView (владелец/администратор), BuyerView (покупатель), CashierView (кассир)
 * 10. App — корневой компонент: хранит все данные, решает какой экран показать
 */

// React хуки, которыми пользуемся по всему файлу (useState — хранить данные
// компонента, useEffect — делать что-то при изменении данных, useRef — держать
// ссылку на DOM-элемент или значение, которое не должно вызывать перерисовку).
const {useState,useEffect,useRef}=React;

// Ключ, под которым вся "база данных" приложения хранится в localStorage
// браузера. Это демо-режим: данные видны только на этом устройстве.
const KEY='coffetea_react_v1';

// Валюты, которые можно выбрать в форме товара.
const CURR=['сом','₽','$','€'];

// Набор тем оформления. Каждая тема — это просто набор цветов.
// Цвета не "зашиты" в классы Tailwind напрямую — вместо этого в разметке
// используются CSS-переменные вроде bg-[var(--accent)], а applyTheme() ниже
// подставляет в эти переменные конкретные значения текущей темы.
const THEMES=[
  {key:'orange',name:'Апельсин',accent:'#f97316',field:'#fff7ed',field2:'#ffedd5',border:'#fed7aa',soft:'#c2410c',soft2:'#fb923c',bgFrom:'#fb923c',bgTo:'#ea580c'},
  {key:'gray',name:'Светло-серая',accent:'#52525b',field:'#f4f4f5',field2:'#e4e4e7',border:'#d4d4d8',soft:'#52525b',soft2:'#a1a1aa',bgFrom:'#a1a1aa',bgTo:'#52525b'},
  {key:'mint',name:'Мята',accent:'#10b981',field:'#ecfdf5',field2:'#d1fae5',border:'#a7f3d0',soft:'#047857',soft2:'#34d399',bgFrom:'#34d399',bgTo:'#059669'},
  {key:'berry',name:'Малина',accent:'#ec4899',field:'#fdf2f8',field2:'#fce7f3',border:'#fbcfe8',soft:'#be185d',soft2:'#f472b6',bgFrom:'#f472b6',bgTo:'#db2777'},
  {key:'ocean',name:'Океан',accent:'#0ea5e9',field:'#f0f9ff',field2:'#e0f2fe',border:'#bae6fd',soft:'#0369a1',soft2:'#38bdf8',bgFrom:'#38bdf8',bgTo:'#0284c7'},
  {key:'violet',name:'Лаванда',accent:'#8b5cf6',field:'#f5f3ff',field2:'#ede9fe',border:'#ddd6fe',soft:'#6d28d9',soft2:'#a78bfa',bgFrom:'#a78bfa',bgTo:'#7c3aed'},
  {key:'lemon',name:'Лимон',accent:'#f59e0b',field:'#fffbeb',field2:'#fef3c7',border:'#fde68a',soft:'#b45309',soft2:'#fbbf24',bgFrom:'#fbbf24',bgTo:'#d97706'},
  {key:'newyear',name:'Новогодняя',accent:'#dc2626',field:'#eef2ff',field2:'#e0e7ff',border:'#c7d2fe',soft:'#3730a3',soft2:'#f87171',bgFrom:'#1e3a8a',bgTo:'#0c1445'}
];
// Применить тему: находит тему по ключу и прописывает её цвета
// в CSS-переменные на <html> (document.documentElement). После этого
// все элементы, использующие var(--accent) и так далее, перекрашиваются
// сами — без перерисовки React-компонентов.
function applyTheme(key){
  const t=THEMES.find(x=>x.key===key)||THEMES[0];
  const r=document.documentElement.style;
  r.setProperty('--accent',t.accent); r.setProperty('--field',t.field); r.setProperty('--field2',t.field2);
  r.setProperty('--border',t.border); r.setProperty('--soft',t.soft); r.setProperty('--soft2',t.soft2);
  r.setProperty('--bgFrom',t.bgFrom); r.setProperty('--bgTo',t.bgTo);
}

// ===== Мелкие функции-помощники (используются во многих местах) =====

// Случайный идентификатор для новых пользователей, товаров и заказов.
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
// 6-значный код подтверждения (как бы приходит на почту/в мессенджер).
// В демо-режиме мы его просто показываем на экране, а не отправляем по-настоящему.
function genOtp(){return String(Math.floor(100000+Math.random()*900000));}
// 6-символьный код заведения (для покупателей, администратора, кассира) —
// буквы и цифры, без похожих друг на друга символов (0/O, 1/I и т.п. не используются).
function genCode(){const A='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';let s='';for(let i=0;i<6;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
// Красиво отформатировать цену: 1234.5 -> "1 234,5 сом".
function money(n,c){return Number(n).toLocaleString('ru-RU',{maximumFractionDigits:2})+'\u00A0'+c;}
// Цена товара с учётом скидки, округлённая до копеек.
function finalPrice(p){return Math.round(p.price*(100-(p.discount||0)))/100;}
// Привести код заведения к единому виду перед сравнением:
// убрать пробелы и перевести в верхний регистр ("k7f3 qz" -> "K7F3QZ").
function normCode(v){return String(v||'').replace(/\s+/g,'').toUpperCase();}
// Сжать загруженную картинку перед сохранением (фото товара, обои, QR-код).
// Файлы хранятся прямо внутри базы (как длинная строка base64), поэтому
// важно не пустить туда картинку в оригинальном размере на 10 МБ —
// иначе localStorage браузера быстро переполнится.
// Возвращает Promise с уменьшенной картинкой в виде data:-ссылки.
function shrink(file,max){
  max=max||760;
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onerror=()=>rej(new Error('read'));
    fr.onload=()=>{
      const im=new Image();
      im.onerror=()=>rej(new Error('img'));
      im.onload=()=>{
        const k=Math.min(1,max/Math.max(im.width,im.height));
        const c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(im.width*k)); c.height=Math.max(1,Math.round(im.height*k));
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        res(c.toDataURL('image/jpeg',.82));
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}

// ===== "База данных" приложения =====
// Полноценного сервера у демо-версии нет: все заведения, товары, заказы
// и то, кто сейчас вошёл в аккаунт, хранятся в одном объекте `db`
// и сохраняются в localStorage браузера (см. App ниже). Это значит,
// что владелец и покупатель видят общие данные, только если открывают
// приложение в одном и том же браузере на одном устройстве.

// Исходные данные "из коробки": одно демонстрационное заведение с двумя
// товарами, чтобы сразу было что посмотреть и с чем потестировать покупку.
function seed(){
  const ownerId='u_demo';
  return {
    session:null,
    users:[{id:ownerId,role:'owner',contact:'owner@coffetea.app',business:'Кофейня «Утро»',joinCode:'DEMO01',staffCode:'STAFF1',qr:''}],
    products:[
      {id:'p1',ownerId,name:'Самса',info:'С говядиной',price:30,currency:'сом',discount:0,img:'',t:1},
      {id:'p2',ownerId,name:'Латте',info:'Молочный кофе',price:180,currency:'сом',discount:20,img:'',t:2}
    ],
    orders:[],
    carts:{}
  };
}
// Загрузить базу при открытии страницы: достаём сохранённое из localStorage,
// а если там пусто или данные повреждены — начинаем с demo-данных (seed()).
function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){const d=JSON.parse(raw); if(d&&Array.isArray(d.users)) return Object.assign(seed(),d);}
  }catch(e){}
  return seed();
}

// Готовые наборы Tailwind-классов для часто повторяющихся элементов формы —
// чтобы не копировать одну и ту же длинную строку классов в каждом месте.
const inputCls="w-full h-12 rounded-xl border-2 border-[var(--border)] bg-[var(--field)] px-3 font-medium outline-none focus:border-[var(--soft2)]";
const btnCls="w-full h-12 rounded-full bg-[var(--accent)] text-white font-bold";
const btnGhost="w-full h-11 rounded-full border-2 border-[var(--border)] font-bold text-[var(--soft)] bg-white";

// ===== Общие кусочки интерфейса, из которых собраны остальные экраны =====

// Field — подпись над полем ввода. {children} — это само поле (input,
// select и т.п.), которое передают внутрь при использовании: <Field label="Email"><input .../></Field>
function Field({label,children}){
  return <label className="block mb-3"><span className="block text-sm font-bold mb-1">{label}</span>{children}</label>;
}
// Modal — всплывающее окно поверх экрана: тёмная подложка + белая
// карточка с заголовком, крестиком и содержимым ({children}).
// Снизу на телефоне, по центру на широких экранах (см. классы sm:items-center).
// Закрывается тремя способами: кнопка-крестик, клик по тёмной подложке
// (но не по самой карточке — проверка e.target===e.currentTarget),
// и клавиша Esc (эффект ниже вешает слушатель на document).
function Modal({title,onClose,children}){
  useEffect(()=>{
    function onKey(e){if(e.key==='Escape')onClose();}
    document.addEventListener('keydown',onKey);
    return ()=>document.removeEventListener('keydown',onKey);
  },[onClose]);
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="w-full sm:w-[420px] max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6">
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
function Toast({msg}){
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
function Bubbles(){
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
function Welcome({db,toast,finish}){
  const [a,setA]=useState(null);
  function startRegister(){setA({mode:'register',step:'role',role:null,contact:'',code:'',existing:null,err:''});}
  function startLogin(){setA({mode:'login',step:'contact',role:null,contact:'',code:'',existing:null,err:''});}
  function pickRole(role){setA(s=>({...s,role,step:'contact'}));}
  function submitContact(e){
    e.preventDefault();
    const raw=e.target.contact.value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw)){setA(s=>({...s,err:'Введите почту вида name@mail.com'}));return;}
    const existing=db.users.find(u=>u.contact===raw);
    if(a.mode==='login'&&!existing){setA(s=>({...s,err:'Аккаунт не найден'}));return;}
    if(a.mode==='register'&&existing){setA(s=>({...s,err:'Этот email уже зарегистрирован'}));return;}
    setA(s=>({...s,contact:raw,code:genOtp(),existing,step:'code',err:''}));
  }
  function submitCode(e){
    e.preventDefault();
    const v=e.target.code.value.replace(/\D/g,'');
    if(v!==a.code){setA(s=>({...s,err:'Код не подошёл'}));return;}
    if(a.existing){finish(a.existing);setA(null);return;}
    if(a.role==='owner'){setA(s=>({...s,step:'business',err:''}));return;}
    setA(s=>({...s,step:'link',err:''}));
  }
  function submitBusiness(e){
    e.preventDefault();
    const n=e.target.biz.value.trim();
    if(!n){setA(s=>({...s,err:'Введите название заведения'}));return;}
    finish({id:uid(),role:'owner',contact:a.contact,business:n.slice(0,60),joinCode:genCode(),staffCode:genCode(),qr:''});
    setA(null);
  }
  function submitLink(e){
    e.preventDefault();
    const code=normCode(e.target.link.value);
    const owner=db.users.find(u=>u.role==='owner'&&(a.role==='buyer'?u.joinCode===code:u.staffCode===code));
    if(!owner){setA(s=>({...s,err:'Код не найден. Уточните у владельца.'}));return;}
    finish({id:uid(),role:a.role,contact:a.contact,ownerId:owner.id});
    setA(null);
  }
  const demo=db.users.find(u=>u.id==='u_demo');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-6 text-white relative z-[1]">
      <p className="absolute top-6 font-extrabold text-lg">Coffetea</p>
      <button onClick={startRegister} className="w-36 h-36 rounded-full bg-white text-[var(--accent)] text-6xl font-light shadow-xl active:scale-95 transition">+</button>
      <h1 className="font-extrabold text-xl max-w-xs">Нажмите +, чтобы начать</h1>
      <button onClick={startLogin} className="underline font-bold">У меня уже есть аккаунт</button>
      {demo&&<p className="text-white/80 text-xs mt-6">Демо-код для покупателя: {demo.joinCode}</p>}

      {a&&(
        <Modal title={
          a.step==='role'?'Кто вы?':
          a.step==='contact'?(a.mode==='login'?'Вход':'Регистрация'):
          a.step==='code'?'Введите код':
          a.step==='business'?'Название заведения':
          (a.role==='buyer'?'Код заведения':'Код сотрудника')
        } onClose={()=>setA(null)}>
          {a.step==='role'&&(
            <div className="space-y-3 text-left">
              {[['owner','Владелец','Создаёт своё заведение и меню'],
                ['admin','Администратор','Товары и цены по коду от владельца'],
                ['cashier','Кассир','Подтверждает оплату заказов по коду'],
                ['buyer','Покупатель','Входит в меню заведения по коду']].map(([k,t,d])=>(
                <button key={k} onClick={()=>pickRole(k)} className="w-full text-left p-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--field)]">
                  <b className="block">{t}</b><span className="text-xs text-[var(--soft)]">{d}</span>
                </button>
              ))}
              <button type="button" onClick={startLogin} className="underline font-bold text-sm text-[var(--soft)]">У меня уже есть аккаунт</button>
            </div>
          )}
          {a.step==='contact'&&(
            <form onSubmit={submitContact} className="space-y-1">
              <Field label="Email"><input name="contact" type="email" autoFocus className={inputCls} placeholder="name@mail.com" defaultValue={a.contact}/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls}>Получить код</button>
            </form>
          )}
          {a.step==='code'&&(
            <form onSubmit={submitCode} className="space-y-3">
              <div className="bg-[var(--field)] border-2 border-dashed border-[var(--border)] rounded-xl p-3 text-sm">Демо-режим. Ваш код: <b className="text-lg tracking-widest">{a.code}</b></div>
              <Field label="Код из письма"><input name="code" inputMode="numeric" maxLength="6" autoFocus className={inputCls+" text-center tracking-widest text-xl"} placeholder="000000"/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold">{a.err}</p>}
              <button className={btnCls}>Подтвердить</button>
            </form>
          )}
          {a.step==='business'&&(
            <form onSubmit={submitBusiness} className="space-y-1">
              <Field label="Название заведения"><input name="biz" autoFocus className={inputCls} placeholder="Например, TheCafe"/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls}>Создать</button>
            </form>
          )}
          {a.step==='link'&&(
            <form onSubmit={submitLink} className="space-y-1">
              <Field label="Код от владельца"><input name="link" autoFocus className={inputCls+" uppercase"} placeholder="Например, K7F3QZ"/></Field>
              <p className="text-xs text-[var(--soft)] mb-2">{a.role==='buyer'?'Этот код владелец показывает покупателям, например на QR у кассы.':'Этот код владелец выдаёт лично сотруднику, в настройках.'}</p>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls}>Войти в заведение</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

// ===== Товар: карточка в списке и форма добавления/редактирования =====

// Плитка товара в сетке меню (видит и владелец/администратор, и покупатель
// на экране редактирования — сама покупка с количеством рисуется отдельно
// внутри BuyerView, чтобы добавить туда кнопки +/-).
function ProductCard({p,onClick}){
  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl overflow-hidden shadow">
      <div className="aspect-[4/3] bg-[var(--field2)] relative">
        {p.img?<img src={p.img} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-[var(--soft2)]">{(p.name[0]||'?').toUpperCase()}</div>}
        {p.discount>0&&<span className="absolute top-2 left-2 bg-black text-amber-300 text-xs font-bold px-2 py-1 rounded-full">-{p.discount}%</span>}
      </div>
      <div className="p-3">
        <p className="font-bold truncate">{p.name}</p>
        {p.info&&<p className="text-xs text-[var(--soft)] truncate">{p.info}</p>}
        <p className="mt-1 font-bold">
          {p.discount>0?<>{money(finalPrice(p),p.currency)} <s className="text-[var(--soft2)] font-normal ml-1">{money(p.price,p.currency)}</s></>:money(p.price,p.currency)}
        </p>
      </div>
    </button>
  );
}
// Форма товара — одна и та же и для "Новый товар", и для "Изменить товар"
// (если передан product — значит редактируем существующий).
// img — фото храним в своём отдельном состоянии, а не только внутри формы,
// потому что оно меняется асинхронно (пока картинка сжимается в shrink()).
function ProductForm({product,onSave,onDelete,onClose}){
  const [img,setImg]=useState(product?product.img:'');
  const [armDel,setArmDel]=useState(false);
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    shrink(f,700).then(setImg).catch(()=>alert('Не удалось открыть файл'));
  }
  function submit(e){
    e.preventDefault();
    const f=e.target;
    const name=f.name.value.trim(); const price=parseFloat(f.price.value.replace(',','.'));
    if(!name||!(price>0)) return;
    onSave({name,info:f.info.value.trim(),price,currency:f.currency.value,discount:Math.min(90,Math.max(0,parseInt(f.discount.value||'0',10)||0)),img});
  }
  return (
    <Modal title={product?'Изменить товар':'Новый товар'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="aspect-[4/3] rounded-xl bg-[var(--field)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
          {img?<img src={img} className="w-full h-full object-cover"/>:<span className="text-[var(--soft2)] text-sm">Фото товара</span>}
        </div>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" id="pimg"/>
        <label htmlFor="pimg" className={btnGhost+" inline-flex items-center justify-center cursor-pointer"}>{img?'Заменить фото':'Выбрать фото'}</label>
        <Field label="Название"><input name="name" defaultValue={product?product.name:''} className={inputCls}/></Field>
        <Field label="Кратко"><input name="info" defaultValue={product?product.info:''} className={inputCls}/></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Цена"><input name="price" defaultValue={product?product.price:''} inputMode="decimal" className={inputCls}/></Field>
          <Field label="Валюта"><select name="currency" defaultValue={product?product.currency:'сом'} className={inputCls}>{CURR.map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <Field label="Скидка, %"><input name="discount" defaultValue={product?product.discount||0:0} inputMode="numeric" className={inputCls}/></Field>
        <button className={btnCls}>Сохранить</button>
        {product&&<button type="button" onClick={()=>{if(!armDel){setArmDel(true);return;}onDelete();}} className="w-full h-11 rounded-full border-2 border-red-200 text-red-600 font-bold">{armDel?'Точно удалить?':'Удалить'}</button>}
      </form>
    </Modal>
  );
}
// ===== Карточка заказа (видят владелец, администратор и кассир) =====
// Показывает состав заказа, сумму, когда и кем он оформлен, и кнопку
// подтвердить/отменить подтверждение оплаты.
function OrderCard({o,onToggle}){
  const done=o.status==='done';
  return (
    <div className="bg-white rounded-2xl p-4 space-y-2 shadow">
      <div className="flex justify-between gap-3"><b>Заказ {o.code}</b><span className={"text-xs font-bold px-2 py-1 rounded-full shrink-0 "+(done?'bg-[var(--accent)] text-white':'bg-[var(--field2)] text-[var(--soft)]')}>{done?'Оплата подтверждена':'Новый'}</span></div>
      <ul className="text-sm space-y-1">{o.items.map((it,i)=><li key={i} className="flex justify-between"><span>{it.name} × {it.qty}</span><b>{money(Math.round(it.price*it.qty*100)/100,it.currency)}</b></li>)}</ul>
      <div className="flex justify-between text-sm text-[var(--soft)] gap-3"><span className="truncate">{new Date(o.t).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · {o.buyerContact}</span><b className="text-black shrink-0">{o.total}</b></div>
      <button onClick={()=>onToggle(o.id,done?'new':'done')} className={done?btnGhost:btnCls}>{done?'Отменить подтверждение':'Подтвердить оплату'}</button>
    </div>
  );
}
// ===== Настройки: смена темы, обои, фоновая музыка =====

// Окно выбора темы: просто сетка кнопок-образцов, клик сразу применяет тему
// (ThemeModal сам ничего не хранит — вся работа в App.setTheme).
function ThemeModal({theme,setTheme,onClose}){
  return (
    <Modal title="Изменить тему" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map(t=>(
          <button key={t.key} onClick={()=>setTheme(t.key)} className={"rounded-2xl border-2 p-2 text-xs font-bold "+(theme===t.key?'border-black':'border-[var(--border)]')}>
            <span className="block h-10 rounded-xl mb-2" style={{background:`linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})`}}/>
            {t.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}
// Окно загрузки своих обоев (фон меню вместо пузырей). Доступно только
// владельцу. update(...) — это функция из App, которая меняет общую базу
// db и сама пересохраняет её в localStorage (см. App ниже).
function WallpaperModal({owner,update,onClose,toast}){
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    shrink(f,1400).then(d=>{update(db=>{db.users.find(u=>u.id===owner.id).wallpaper=d;});toast('Обои сохранены');}).catch(()=>toast('Не удалось открыть файл'));
  }
  function clear(){update(db=>{delete db.users.find(u=>u.id===owner.id).wallpaper;});toast('Обои убраны');}
  return (
    <Modal title="Обои" onClose={onClose}>
      <div className="space-y-3">
        <div className="aspect-video rounded-xl bg-[var(--field)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
          {owner.wallpaper?<img src={owner.wallpaper} className="w-full h-full object-cover"/>:<span className="text-[var(--soft2)] text-sm">Обои не добавлены</span>}
        </div>
        <p className="text-sm text-[var(--soft)]">Загрузите картинку — она станет фоном меню у вас и у покупателей вместо обычного цвета.</p>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" id="wf"/>
        <label htmlFor="wf" className={btnCls+" inline-flex items-center justify-center cursor-pointer"}>{owner.wallpaper?'Заменить обои':'Загрузить обои'}</label>
        {owner.wallpaper&&<button onClick={clear} className="w-full h-11 rounded-full border-2 border-red-200 text-red-600 font-bold">Убрать</button>}
      </div>
    </Modal>
  );
}
// Окно загрузки фоновой музыки. Файл проверяем на тип (должен быть
// аудио) и размер (до 4 МБ — localStorage не резиновый). Саму музыку
// не запускаем — только сохраняем; играть она начнёт, когда кто-то сам
// нажмёт на значок ноты (см. MusicBtn и App.toggleMusic).
function MusicModal({owner,update,onClose,toast}){
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    if(!/^audio\//.test(f.type)){toast('Выберите аудиофайл, например MP3');return;}
    if(f.size>4*1024*1024){toast('Файл слишком большой. До 4 МБ.');return;}
    const fr=new FileReader();
    fr.onerror=()=>toast('Не удалось открыть файл');
    fr.onload=()=>{update(db=>{const u=db.users.find(u=>u.id===owner.id);u.music=fr.result;u.musicName=f.name;});toast('Музыка сохранена');};
    fr.readAsDataURL(f);
  }
  function clear(){update(db=>{const u=db.users.find(u=>u.id===owner.id);delete u.music;delete u.musicName;});toast('Музыка убрана');}
  return (
    <Modal title="Фоновая музыка" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-[var(--soft)]">{owner.music?'Играет в вашем меню, но начнётся только когда кто-то сам нажмёт на значок ноты вверху экрана.':'Пока музыки нет — в меню будет тихо, пока вы её не добавите.'}</p>
        {owner.music&&<div className="rounded-xl bg-[var(--field)] p-3 text-sm font-bold">{owner.musicName||'Аудиофайл'}</div>}
        <input type="file" accept="audio/*" onChange={onFile} className="hidden" id="mf"/>
        <label htmlFor="mf" className={btnCls+" inline-flex items-center justify-center cursor-pointer"}>{owner.music?'Заменить файл':'Загрузить файл'}</label>
        {owner.music&&<button onClick={clear} className="w-full h-11 rounded-full border-2 border-red-200 text-red-600 font-bold">Убрать</button>}
      </div>
    </Modal>
  );
}
// Окно "Настройки" — общее для владельца, администратора, кассира
// и покупателя, но наполнение разное:
//  - isOwner: можно переименовать заведение и увидеть/обновить коды
//    (для покупателей и для администратора с кассиром)
//  - "Добавить" (обои, музыка) — тоже только у владельца
//  - "Изменить тему" — видят все, тема общая на устройство
// sub хранит, какое под-окно сейчас открыто ('theme'/'wallpaper'/'music'),
// null — открыто только само окно настроек.
function SettingsModal({isOwner,owner,me,update,onClose,onLogout,toast,theme,setTheme}){
  const [sub,setSub]=useState(null);
  function saveBiz(e){
    e.preventDefault();
    const n=e.target.biz.value.trim(); if(!n) return;
    update(d=>{d.users.find(u=>u.id===owner.id).business=n.slice(0,60);});
    toast('Сохранено');
  }
  function regen(field){update(d=>{d.users.find(u=>u.id===owner.id)[field]=genCode();});}
  return (
    <Modal title="Настройки" onClose={onClose}>
      <div className="space-y-5">
        {isOwner&&<form onSubmit={saveBiz} className="space-y-2">
          <Field label="Название заведения"><input name="biz" defaultValue={owner.business} className={inputCls}/></Field>
          <button className={btnGhost}>Сохранить</button>
        </form>}
        {isOwner&&<div className="space-y-2">
          <p className="font-bold text-sm">Код для покупателей</p>
          <div className="flex gap-2 items-center">
            <output className="flex-1 h-11 rounded-xl bg-[var(--field)] border-2 border-[var(--border)] flex items-center justify-center font-bold tracking-widest">{owner.joinCode}</output>
            <button onClick={()=>regen('joinCode')} className="h-11 px-3 rounded-xl border-2 border-[var(--border)] text-sm font-bold">Новый</button>
          </div>
          <p className="font-bold text-sm mt-3">Код для администратора и кассира</p>
          <div className="flex gap-2 items-center">
            <output className="flex-1 h-11 rounded-xl bg-[var(--field)] border-2 border-[var(--border)] flex items-center justify-center font-bold tracking-widest">{owner.staffCode}</output>
            <button onClick={()=>regen('staffCode')} className="h-11 px-3 rounded-xl border-2 border-[var(--border)] text-sm font-bold">Новый</button>
          </div>
        </div>}
        <div className="space-y-2">
          <p className="font-bold text-sm">Оформление</p>
          <button onClick={()=>setSub('theme')} className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-[var(--border)] text-left">
            <span className="w-8 h-8 rounded-full shrink-0" style={{background:`linear-gradient(135deg, var(--bgFrom), var(--bgTo))`}}/>
            <span className="flex-1 font-bold text-sm">Изменить тему</span>
          </button>
        </div>
        {isOwner&&<div className="space-y-2">
          <p className="font-bold text-sm">Добавить</p>
          <button onClick={()=>setSub('wallpaper')} className="w-full p-3 rounded-xl border-2 border-[var(--border)] text-left font-bold text-sm">Обои{owner.wallpaper?' · добавлены':''}</button>
          <button onClick={()=>setSub('music')} className="w-full p-3 rounded-xl border-2 border-[var(--border)] text-left font-bold text-sm">Фоновая музыка{owner.music?' · добавлена':''}</button>
        </div>}
        <div>
          <p className="text-sm text-[var(--soft)] mb-2">{isOwner?'Владелец':me.role==='admin'?'Администратор':'Сотрудник'} · {me.contact}</p>
          <button onClick={onLogout} className={btnGhost}>Выйти</button>
        </div>
        {sub==='theme'&&<ThemeModal theme={theme} setTheme={setTheme} onClose={()=>setSub(null)}/>}
        {sub==='wallpaper'&&isOwner&&<WallpaperModal owner={owner} update={update} onClose={()=>setSub(null)} toast={toast}/>}
        {sub==='music'&&isOwner&&<MusicModal owner={owner} update={update} onClose={()=>setSub(null)} toast={toast}/>}
      </div>
    </Modal>
  );
}
// Окно загрузки QR-кода для оплаты (например, из банковского приложения).
// Покупатель увидит этот QR на экране оплаты после нажатия «Купить».
function QrModal({owner,update,onClose,toast}){
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    shrink(f,700).then(d=>{update(db=>{db.users.find(u=>u.id===owner.id).qr=d;});toast('QR-код сохранён');}).catch(()=>toast('Не удалось открыть файл'));
  }
  return (
    <Modal title="QR-код для оплаты" onClose={onClose}>
      <div className="space-y-3">
        <div className="aspect-square rounded-xl bg-[var(--field)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
          {owner.qr?<img src={owner.qr} className="w-full h-full object-contain"/>:<span className="text-[var(--soft2)] text-sm">QR не добавлен</span>}
        </div>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" id="qrf"/>
        <label htmlFor="qrf" className={btnCls+" inline-flex items-center justify-center cursor-pointer"}>{owner.qr?'Заменить QR-код':'Загрузить QR-код'}</label>
      </div>
    </Modal>
  );
}

// Кнопка-нота в шапке: включает/выключает фоновую музыку заведения.
// Если у заведения нет музыки (musicCtl.active===false) — кнопки вообще
// нет (возвращаем null, React ничего не рисует). Когда музыка играет,
// кнопка подсвечивается белым фоном с цветом акцента — чтобы было видно,
// что она сейчас включена.
function MusicBtn({musicCtl}){
  if(!musicCtl||!musicCtl.active) return null;
  return <button onClick={musicCtl.toggle} className={"h-10 px-3 rounded-full font-bold text-sm "+(musicCtl.playing?'bg-white text-[var(--accent)]':'bg-white/20 text-white')}>♪</button>;
}

// ===== Экран владельца и администратора =====
// Это один и тот же компонент для обеих ролей: разница только в правах,
// которые определяются один раз через isOwner.
function OwnerView({db,update,me,toast,theme,setTheme,musicCtl}){
  // isOwner===true только у роли 'owner'. У администратора (role==='admin')
  // isOwner===false, и дальше по коду это используется, чтобы спрятать
  // кнопку QR и разделы кодов/обоев/музыки в настройках — у администратора
  // их просто нет.
  const isOwner=me.role==='owner';
  // У владельца id заведения — это его собственный id (me.id).
  // У администратора своего заведения нет: он привязан к чужому через
  // me.ownerId (это id владельца, который был сохранён при входе по коду).
  const ownerId=isOwner?me.id:me.ownerId;
  const owner=db.users.find(u=>u.id===ownerId);

  // Какая вкладка открыта сейчас: список товаров или список заказов.
  const [tab,setTab]=useState('products');
  // Какое окно (модалка) сейчас открыто: 'add' (новый товар), {edit:id}
  // (редактирование товара), 'settings', 'qr' или null (ничего не открыто).
  const [modal,setModal]=useState(null);

  // Товары и заказы именно ЭТОГО заведения (ownerId), остальных не видно.
  const list=db.products.filter(p=>p.ownerId===ownerId).sort((a,b)=>b.t-a.t);
  const orders=db.orders.filter(o=>o.ownerId===ownerId).sort((a,b)=>b.t-a.t);

  // Сохранить товар: если передан editId — обновляем существующий товар,
  // иначе добавляем новый с новым id и меткой времени (t — для сортировки
  // "сначала новые").
  function saveProduct(data,editId){
    update(d=>{
      if(editId){Object.assign(d.products.find(x=>x.id===editId),data);}
      else d.products.push({id:uid(),ownerId,t:Date.now(),...data});
    });
    setModal(null); toast(editId?'Товар изменён':'Товар добавлен');
  }
  function delProduct(id){update(d=>{d.products=d.products.filter(p=>p.id!==id);});setModal(null);toast('Товар удалён');}
  function setOrderStatus(id,status){update(d=>{const o=d.orders.find(x=>x.id===id); if(o)o.status=status;});}
  function logout(){update(d=>{d.session=null;});}
  // Товар, который сейчас редактируют (если modal — это объект вида {edit:id}).
  const editing=modal&&modal.edit?list.find(p=>p.id===modal.edit):null;

  return (
    <div className="pb-10">
      {/* ===== ШАПКА (header) ===== 
          sticky top-0 — прилипает к верху экрана при прокрутке.
          z-10 — рисуется поверх плиток товаров и фоновых пузырей (у тех z-0),
          но ПОД всплывающими окнами (у Modal z-30), поэтому настройки
          корректно перекрывают шапку, когда открыты. */}
      <header className="sticky top-0 bg-[var(--accent)] text-white px-4 py-3 flex items-center gap-2 z-10">
        {/* Название заведения. flex-1 — занимает всё свободное место,
            поэтому кнопки справа всегда прижаты к правому краю.
            truncate — если название длинное, обрежется многоточием,
            а не сломает шапку на две строки. */}
        <h1 className="flex-1 font-extrabold text-lg truncate">{owner?owner.business:''}</h1>

        {/* Кнопка-нота: появляется, только если у заведения есть музыка
            (сама проверка — внутри MusicBtn). musicCtl пришёл из App. */}
        <MusicBtn musicCtl={musicCtl}/>

        {/* Кнопка QR — только у владельца (isOwner). Администратор её
            не видит: управлять оплатой заведения может только сам владелец. */}
        {isOwner&&<button onClick={()=>setModal('qr')} className="h-10 px-3 rounded-full bg-white/20 font-bold text-sm">QR</button>}

        {/* Кнопка настроек (шестерёнка) — есть всегда, у владельца
            и у администратора. Внутри настроек уже решается, что именно
            показать (см. SettingsModal: isOwner прячет часть разделов). */}
        <button onClick={()=>setModal('settings')} className="h-10 w-10 rounded-full bg-white/20 font-bold">⚙</button>
      </header>
      {/* Переключатель вкладок "Товары" / "Заказы". Активная вкладка
          перекрашена в цвет темы, неактивная — просто белая кнопка-пилюля. */}
      <div className="flex gap-2 p-3 max-w-3xl mx-auto">
        <button onClick={()=>setTab('products')} className={"flex-1 h-10 rounded-full font-bold "+(tab==='products'?'bg-[var(--accent)] text-white':'bg-white text-[var(--soft)] border-2 border-[var(--border)]')}>Товары</button>
        <button onClick={()=>setTab('orders')} className={"flex-1 h-10 rounded-full font-bold "+(tab==='orders'?'bg-[var(--accent)] text-white':'bg-white text-[var(--soft)] border-2 border-[var(--border)]')}>Заказы ({orders.length})</button>
      </div>
      {tab==='products'?(
        list.length?(
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-5xl mx-auto">
            {list.map(p=><ProductCard key={p.id} p={p} onClick={()=>setModal({edit:p.id})}/>)}
          </div>
        ):(
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-6">
            <p className="font-extrabold text-lg text-white">Меню пока пустое</p>
            <p className="text-white/80 text-sm">Нажмите «+», чтобы добавить первый товар</p>
          </div>
        )
      ):(
        <div className="p-4 max-w-xl mx-auto space-y-3">
          {orders.length?orders.map(o=><OrderCard key={o.id} o={o} onToggle={setOrderStatus}/>):<p className="text-center text-white/80 py-20">Заказов пока нет</p>}
        </div>
      )}
      {/* Круглая кнопка "+" внизу экрана — открывает форму нового товара.
          Видна только на вкладке "Товары". */}
      {tab==='products'&&<button onClick={()=>setModal('add')} className="fixed left-1/2 -translate-x-1/2 bottom-6 w-16 h-16 rounded-full bg-white text-[var(--accent)] text-3xl shadow-xl active:scale-95 transition">+</button>}

      {/* Все модальные окна этого экрана. React рисует только то окно,
          условие которого сейчас истинно (остальные — ничего, null). */}
      {modal==='add'&&<ProductForm onSave={d=>saveProduct(d,null)} onClose={()=>setModal(null)}/>}
      {editing&&<ProductForm product={editing} onSave={d=>saveProduct(d,modal.edit)} onDelete={()=>delProduct(modal.edit)} onClose={()=>setModal(null)}/>}
      {modal==='settings'&&<SettingsModal isOwner={isOwner} owner={owner} me={me} update={update} onClose={()=>setModal(null)} onLogout={logout} toast={toast} theme={theme} setTheme={setTheme}/>}
      {modal==='qr'&&isOwner&&<QrModal owner={owner} update={update} onClose={()=>setModal(null)} toast={toast}/>}
    </div>
  );
}

// ===== Экран покупателя =====
// В отличие от OwnerView, тут нет выбора заведения — покупатель при
// регистрации уже привязался к одному конкретному владельцу (me.ownerId),
// и экран всегда показывает именно его меню.
function BuyerView({db,update,me,theme,setTheme,musicCtl}){
  const owner=db.users.find(u=>u.id===me.ownerId);
  const list=db.products.filter(p=>p.ownerId===me.ownerId).sort((a,b)=>b.t-a.t);
  // Корзина этого покупателя: объект вида {идТовара: количество}.
  const cart=db.carts[me.id]||{};
  // Какое окно открыто: 'cart' (корзина), 'confirm' (подтверждение),
  // 'pay' (экран оплаты), 'settings' или {receipt: order} (чек после покупки).
  const [modal,setModal]=useState(null);
  // Изменить количество товара в корзине на delta (+1 или -1).
  // Если количество падает до 0 или ниже — товар убирается из корзины совсем.
  function qty(id,delta){
    update(d=>{
      const c=d.carts[me.id]||(d.carts[me.id]={});
      const n=(c[id]||0)+delta;
      if(n<=0) delete c[id]; else c[id]=Math.min(n,99);
    });
  }
  const items=Object.keys(cart).map(id=>({p:db.products.find(x=>x.id===id),q:cart[id]})).filter(x=>x.p);
  const total=items.reduce((s,{p,q})=>s+finalPrice(p)*q,0);
  const cur=items[0]?items[0].p.currency:'сом';
  // Оформить покупку по кнопке «Я оплатил»: сохраняем "снимок" корзины
  // в заказ (цены и названия на момент покупки — чтобы заказ не менялся
  // задним числом, если товар потом изменят или удалят), код заказа — это
  // последние 4 символа id в верхнем регистре (чтобы было легко сверить
  // на глаз с кассиром), очищаем корзину и показываем окно-чек.
  function pay(){
    const snap=items.map(({p,q})=>({name:p.name,qty:q,price:finalPrice(p),currency:p.currency}));
    const id=uid();
    const order={id,code:id.slice(-4).toUpperCase(),ownerId:owner.id,buyerContact:me.contact,items:snap,total:money(Math.round(total*100)/100,cur),t:Date.now(),status:'new'};
    update(d=>{d.orders.push(order);d.carts[me.id]={};});
    setModal({receipt:order});
  }
  function logout(){update(d=>{d.session=null;});}
  return (
    <div className="pb-28">
      {/* Шапка покупателя — такая же по структуре, как у владельца,
          но без кнопки QR (её грузит только владелец) и всегда с кнопкой
          настроек справа, через которую тоже доступен выход из аккаунта. */}
      <header className="sticky top-0 bg-[var(--accent)] text-white px-4 py-3 flex items-center gap-2 z-10">
        <h1 className="flex-1 font-extrabold text-lg truncate">{owner?owner.business:'Заведение не найдено'}</h1>
        <MusicBtn musicCtl={musicCtl}/>
        <button onClick={()=>setModal('settings')} className="h-10 w-10 rounded-full bg-white/20 font-bold">⚙</button>
      </header>
      {list.length?(
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-5xl mx-auto">
          {list.map(p=>{
            const q=cart[p.id]||0;
            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow">
                <div className="aspect-[4/3] bg-[var(--field2)] relative">
                  {p.img?<img src={p.img} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-[var(--soft2)]">{(p.name[0]||'?').toUpperCase()}</div>}
                  {p.discount>0&&<span className="absolute top-2 left-2 bg-black text-amber-300 text-xs font-bold px-2 py-1 rounded-full">-{p.discount}%</span>}
                </div>
                <div className="p-3">
                  <p className="font-bold truncate">{p.name}</p>
                  <p className="font-bold text-sm">{p.discount>0?<>{money(finalPrice(p),p.currency)} <s className="text-[var(--soft2)] font-normal ml-1">{money(p.price,p.currency)}</s></>:money(p.price,p.currency)}</p>
                  <div className="mt-2 flex items-center justify-between bg-[var(--field)] rounded-full p-1">
                    <button onClick={()=>qty(p.id,-1)} disabled={!q} className="w-9 h-9 rounded-full bg-white disabled:opacity-40 font-bold">−</button>
                    <span className="font-bold">{q}</span>
                    <button onClick={()=>qty(p.id,1)} className="w-9 h-9 rounded-full bg-[var(--accent)] text-white font-bold">+</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ):<p className="text-center text-white/80 py-24">Меню пока пустое</p>}

      {items.length>0&&<button onClick={()=>setModal('cart')} className="fixed left-1/2 -translate-x-1/2 bottom-6 h-14 px-5 rounded-full bg-black text-white font-bold flex items-center gap-3 shadow-xl">
        <span className="w-8 h-8 rounded-full bg-amber-300 text-black flex items-center justify-center text-sm">{items.reduce((s,x)=>s+x.q,0)}</span>
        Мой заказ <b>{money(Math.round(total*100)/100,cur)}</b>
      </button>}

      {modal==='cart'&&(
        <Modal title="Мой заказ" onClose={()=>setModal(null)}>
          <div className="space-y-3">
            {items.map(({p,q})=>(
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0"><b className="truncate block">{p.name}</b><p className="text-sm text-[var(--soft)]">{q} × {money(finalPrice(p),p.currency)}</p></div>
                <button onClick={()=>qty(p.id,-1)} className="w-8 h-8 rounded-full bg-[var(--field)] font-bold">−</button>
                <span className="font-bold w-5 text-center">{q}</span>
                <button onClick={()=>qty(p.id,1)} className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold">+</button>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t font-bold"><span>Итого</span><span>{money(Math.round(total*100)/100,cur)}</span></div>
            <button onClick={()=>setModal('confirm')} className={btnCls}>Купить</button>
          </div>
        </Modal>
      )}
      {modal==='confirm'&&(
        <Modal title="Подтвердите покупку" onClose={()=>setModal('cart')}>
          <div className="space-y-3">
            <p>Вы точно хотите купить эти товары?</p>
            <ul className="text-sm space-y-1">{items.map(({p,q})=><li key={p.id} className="flex justify-between"><span>{p.name} × {q}</span><b>{money(Math.round(finalPrice(p)*q*100)/100,p.currency)}</b></li>)}</ul>
            <div className="flex justify-between font-bold pt-2 border-t"><span>Итого</span><span>{money(Math.round(total*100)/100,cur)}</span></div>
            <button onClick={()=>setModal('pay')} className={btnCls}>Да, купить</button>
          </div>
        </Modal>
      )}
      {modal==='pay'&&(
        <Modal title="Оплата" onClose={()=>setModal('confirm')}>
          <div className="space-y-3 text-center">
            <p className="font-bold">К оплате: {money(Math.round(total*100)/100,cur)}</p>
            {owner&&owner.qr?<img src={owner.qr} className="w-56 h-56 object-contain mx-auto rounded-xl border"/>:<p className="text-sm text-[var(--soft)]">Заведение ещё не добавило QR-код. Оплатите на кассе.</p>}
            <button onClick={pay} className={btnCls}>Я оплатил</button>
          </div>
        </Modal>
      )}
      {modal==='settings'&&<SettingsModal isOwner={false} owner={owner} me={me} update={update} onClose={()=>setModal(null)} onLogout={logout} toast={()=>{}} theme={theme} setTheme={setTheme}/>}
      {modal&&modal.receipt&&(
        <Modal title="Спасибо за покупку!" onClose={()=>setModal(null)}>
          <div className="space-y-3 text-center">
            <p>Покажите этот код кассиру, если он попросит подтвердить оплату.</p>
            <div className="text-3xl font-extrabold tracking-widest bg-[var(--field)] rounded-xl py-4">{modal.receipt.code}</div>
            <p className="text-sm text-[var(--soft)]">Сумма: {modal.receipt.total}</p>
            <button onClick={()=>setModal(null)} className={btnCls}>Готово</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== Экран кассира =====
// Самый простой из всех: кассир не управляет товарами и не видит меню —
// только список заказов своего заведения с кнопкой подтверждения оплаты.
function CashierView({db,update,me,theme,setTheme}){
  const owner=db.users.find(u=>u.id===me.ownerId);
  const orders=db.orders.filter(o=>o.ownerId===me.ownerId).sort((a,b)=>b.t-a.t);
  function toggle(id,status){update(d=>{const o=d.orders.find(x=>x.id===id); if(o)o.status=status;});}
  function logout(){update(d=>{d.session=null;});}
  const [modal,setModal]=useState(null);
  return (
    <div>
      {/* Шапка кассира — только название заведения и кнопка настроек
          (там же и выход). Ни QR, ни музыки — это не его зона ответственности. */}
      <header className="sticky top-0 bg-[var(--accent)] text-white px-4 py-3 flex items-center gap-2 z-10">
        <h1 className="flex-1 font-extrabold text-lg truncate">{owner?owner.business:'Заведение не найдено'}</h1>
        <button onClick={()=>setModal('settings')} className="h-10 w-10 rounded-full bg-white/20 font-bold">⚙</button>
      </header>
      <div className="p-4 max-w-xl mx-auto space-y-3">
        {orders.length?orders.map(o=><OrderCard key={o.id} o={o} onToggle={toggle}/>):<p className="text-center text-white/80 py-20">Заказов пока нет</p>}
      </div>
      {modal==='settings'&&<SettingsModal isOwner={false} owner={owner||{}} me={me} update={update} onClose={()=>setModal(null)} onLogout={logout} toast={()=>{}} theme={theme} setTheme={setTheme}/>}
    </div>
  );
}

// ===== App — корневой компонент =====
// Держит всю базу данных (db) и решает, какой из экранов сейчас показать.
// Всё остальное (OwnerView, BuyerView, CashierView, Welcome) только
// ПОЛУЧАЕТ данные и функцию update — сами они ничего не сохраняют напрямую.
function App(){
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

  // ---- Какой экран показать ----
  // Это и есть вся "маршрутизация" приложения: без библиотек роутинга,
  // просто if/else по тому, вошёл ли человек и в какой он роли.
  let content;
  if(!me) content=<Welcome db={db} toast={toast} finish={finish}/>;
  else if(me.role==='owner'||me.role==='admin') content=<OwnerView db={db} update={update} me={me} toast={toast} theme={theme} setTheme={setTheme} musicCtl={musicCtl}/>;
  else if(me.role==='cashier') content=<CashierView db={db} update={update} me={me} theme={theme} setTheme={setTheme}/>;
  else content=<BuyerView db={db} update={update} me={me} theme={theme} setTheme={setTheme} musicCtl={musicCtl}/>;

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
      <div className="relative z-[1]">{content}</div>
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
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);