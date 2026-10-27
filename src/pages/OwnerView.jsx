import React, { useState } from 'react';
import { Navigate, NavLink, useLocation } from 'react-router-dom';
import { OrderCard } from '../features/orders/OrderCard.jsx';
import { ProductCard, ProductForm } from '../features/products/components.jsx';
import { MusicBtn, QrModal, SettingsModal } from '../features/settings/components.jsx';
import { uid } from '../shared/lib/utils.js';
import { btnCls, btnGhost, inputCls } from '../shared/ui/styles.js';

export function OwnerView({db,update,me,toast,theme,setTheme,publicTheme,savePublicSiteAppearance,publicAnimation,musicCtl}){
  // isOwner===true только у роли 'owner'. У администратора (role==='admin')
  // isOwner===false, и дальше по коду это используется, чтобы спрятать
  // кнопку QR и разделы кодов/обоев/музыки в настройках — у администратора
  // их просто нет.
  const isOwner=me.role==='owner';
  const isCashier=me.role==='cashier';
  // У владельца id заведения — это его собственный id (me.id).
  // У администратора своего заведения нет: он привязан к чужому через
  // me.ownerId (это id владельца, который был сохранён при входе по коду).
  const ownerId=isOwner?me.id:me.ownerId;
  const owner=db.users.find(u=>u.id===ownerId);

  const location=useLocation();
  const basePath=isOwner?'/owner':'/admin';
  const section=location.pathname.slice(basePath.length).split('/')[1]||'dashboard';
  // Какое окно (модалка) сейчас открыто: 'add' (новый товар), {edit:id}
  // (редактирование товара), 'settings', 'qr' или null (ничего не открыто).
  const [modal,setModal]=useState(null);
  const [productSearch,setProductSearch]=useState('');
  const [orderSearch,setOrderSearch]=useState('');
  const [orderFilter,setOrderFilter]=useState('all');

  // Товары и заказы именно ЭТОГО заведения (ownerId), остальных не видно.
  const list=db.products.filter(p=>p.ownerId===ownerId).sort((a,b)=>b.t-a.t);
  const orders=db.orders.filter(o=>o.ownerId===ownerId).sort((a,b)=>b.t-a.t);
  const pendingOrders=orders.filter(o=>!['done','cancelled'].includes(o.status));
  const filteredProducts=list.filter(p=>p.name.toLowerCase().includes(productSearch.trim().toLowerCase()));
  const filteredOrders=orders.filter(o=>{
    const matchesFilter=orderFilter==='all'
      ||(orderFilter==='active'&&!['done','cancelled'].includes(o.status))
      ||o.status===orderFilter;
    const query=orderSearch.trim().toLowerCase();
    return matchesFilter&&(!query||String(o.code).toLowerCase().includes(query)||String(o.buyerContact||'').toLowerCase().includes(query));
  });
  const uniqueBuyers=new Set(orders.map(o=>o.buyerContact).filter(Boolean)).size;
  const weekStart=new Date();
  weekStart.setHours(0,0,0,0);
  weekStart.setDate(weekStart.getDate()-6);
  const weekDays=Array.from({length:7},(_,index)=>{
    const date=new Date(weekStart);
    date.setDate(date.getDate()+index);
    const nextDate=new Date(date);
    nextDate.setDate(nextDate.getDate()+1);
    return {
      date,
      label:date.toLocaleDateString('ru-RU',{weekday:'short'}),
      count:orders.filter(o=>o.t>=date.getTime()&&o.t<nextDate.getTime()).length
    };
  });
  const maxDailyOrders=Math.max(1,...weekDays.map(day=>day.count));
  const recentOrders=orders.slice(0,5);

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

  if(isCashier&&section!=='orders')return <Navigate to="/admin/orders" replace/>;

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
        <span className="hidden sm:inline text-xs font-bold bg-white/20 px-3 py-2 rounded-full">
          {isOwner?'Владелец':isCashier?'Кассир':'Администратор'}
          {!isOwner&&!isCashier&&me?.username?` · ${me.username}`:''}
        </span>

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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
        <nav aria-label="Разделы панели управления" className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 lg:sticky lg:top-20 lg:self-start">
          {(isCashier?[
            {path:basePath+'/orders',label:'Заказы',icon:'▤',count:pendingOrders.length}
          ]:[
            {path:basePath,label:'Обзор',icon:'⌂',end:true},
            {path:basePath+'/products',label:'Товары',icon:'▦'},
            {path:basePath+'/orders',label:'Заказы',icon:'▤',count:pendingOrders.length}
          ]).map(item=>(
            <NavLink key={item.path} to={item.path} end={item.end} className={({isActive})=>'flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 font-bold transition '+(isActive?'bg-white text-[var(--accent)] shadow':'bg-white/20 text-white hover:bg-white/30')}>
              <span aria-hidden="true" className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.count>0&&<span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{item.count}</span>}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0">
          {section==='dashboard'&&(
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 text-white">
                <div><p className="text-sm text-white/80">Панель управления</p><h2 className="text-2xl font-extrabold">Добро пожаловать!</h2></div>
                <p className="text-sm text-white/80">{new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</p>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  {label:'Всего заказов',value:orders.length,icon:'▤'},
                  {label:'Новые заказы',value:pendingOrders.length,icon:'◷'},
                  {label:'Товаров в меню',value:list.length,icon:'▦'},
                  {label:'Покупателей',value:uniqueBuyers,icon:'♙'}
                ].map(card=>(
                  <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-[var(--soft)]"><span className="text-sm font-semibold">{card.label}</span><span className="text-xl">{card.icon}</span></div>
                    <p className="mt-3 text-3xl font-extrabold">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid xl:grid-cols-[1.2fr_1fr] gap-4">
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3"><div><h3 className="font-extrabold text-lg">Заказы за неделю</h3><p className="text-sm text-[var(--soft)]">Количество заказов по дням</p></div><span className="text-2xl" aria-hidden="true">↗</span></div>
                  <div className="mt-6 grid grid-cols-7 gap-2 items-end h-36">
                    {weekDays.map(day=><div key={day.date.toISOString()} className="flex h-full flex-col items-center justify-end gap-2">
                      <span className="text-xs font-bold text-[var(--soft)]">{day.count||''}</span>
                      <div className="w-full max-w-8 rounded-t-lg bg-[var(--accent)] transition-all" style={{height:Math.max(8,day.count/maxDailyOrders*80)+'%'}}/>
                      <span className="text-[10px] capitalize text-[var(--soft)]">{day.label}</span>
                    </div>)}
                  </div>
                </section>
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-extrabold text-lg">Последние заказы</h3><p className="text-sm text-[var(--soft)]">Недавняя активность</p></div><NavLink to={basePath+'/orders'} className="text-sm font-bold text-[var(--accent)]">Все →</NavLink></div>
                  <div className="space-y-3">
                    {recentOrders.length?recentOrders.map(order=><OrderCard key={order.id} o={order} onToggle={setOrderStatus}/>):<p className="py-8 text-center text-sm text-[var(--soft)]">Заказов пока нет</p>}
                  </div>
                </section>
              </div>
            </div>
          )}
          {section==='products'&&(
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3 text-white">
                <div><p className="text-sm text-white/80">Управление меню</p><h2 className="text-2xl font-extrabold">Товары <span className="text-lg text-white/70">({list.length})</span></h2></div>
                <button onClick={()=>setModal('add')} className="rounded-full bg-white px-5 py-3 font-bold text-[var(--accent)] shadow">+ Добавить товар</button>
              </div>
              <input value={productSearch} onChange={e=>setProductSearch(e.target.value)} className={inputCls+' bg-white'} placeholder="Поиск товара по названию" aria-label="Поиск товара по названию"/>
              {filteredProducts.length?(
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(p=><ProductCard key={p.id} p={p} onClick={()=>setModal({edit:p.id})}/>)}
                </div>
              ):(
                <div className="rounded-2xl bg-white/95 px-6 py-16 text-center">
                  <p className="text-3xl" aria-hidden="true">☕</p>
                  <p className="mt-3 font-extrabold">{list.length?'Ничего не найдено':'Меню пока пустое'}</p>
                  <p className="mt-1 text-sm text-[var(--soft)]">{list.length?'Попробуйте изменить запрос.':'Добавьте первый товар, чтобы начать.'}</p>
                </div>
              )}
            </div>
          )}
          {section==='orders'&&(
            <div className="space-y-4">
              <div className="text-white"><p className="text-sm text-white/80">Продажи заведения</p><h2 className="text-2xl font-extrabold">Заказы <span className="text-lg text-white/70">({orders.length})</span></h2></div>
              <input value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} className={inputCls+' bg-white'} placeholder="Поиск по коду или email покупателя" aria-label="Поиск заказов"/>
              <div className="flex gap-2">
                {[['all','Все'],['active','Активные'],['new','Новые'],['preparing','Готовятся'],['ready','Готовы'],['done','Выданы'],['cancelled','Отменены']].map(([key,label])=><button key={key} onClick={()=>setOrderFilter(key)} className={'rounded-full px-4 py-2 text-sm font-bold '+(orderFilter===key?'bg-white text-[var(--accent)]':'bg-white/20 text-white')}>{label}</button>)}
              </div>
              <div className="space-y-3">
                {filteredOrders.length?filteredOrders.map(order=><OrderCard key={order.id} o={order} onToggle={setOrderStatus}/>):<div className="rounded-2xl bg-white/95 py-14 text-center text-[var(--soft)]">Заказы не найдены</div>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Все модальные окна этого экрана. React рисует только то окно,
          условие которого сейчас истинно (остальные — ничего, null). */}
      {modal==='add'&&<ProductForm onSave={d=>saveProduct(d,null)} onClose={()=>setModal(null)}/>}
      {editing&&<ProductForm product={editing} onSave={d=>saveProduct(d,modal.edit)} onDelete={()=>delProduct(modal.edit)} onClose={()=>setModal(null)}/>}
      {modal==='settings'&&<SettingsModal isOwner={isOwner} owner={owner} me={me} update={update} onClose={()=>setModal(null)} onLogout={logout} toast={toast} theme={theme} setTheme={setTheme} publicTheme={publicTheme} savePublicSiteAppearance={savePublicSiteAppearance} publicAnimation={publicAnimation}/>}
      {modal==='qr'&&isOwner&&<QrModal owner={owner} update={update} onClose={()=>setModal(null)} toast={toast}/>}
    </div>
  );
}

// ===== Экран покупателя =====
// В отличие от OwnerView, тут нет выбора заведения — покупатель при
// регистрации уже привязался к одному конкретному владельцу (me.ownerId),
// и экран всегда показывает именно его меню.
