import React, { useState } from 'react';
import { MusicBtn, SettingsModal } from '../features/settings/components.jsx';
import { finalPrice, money, uid } from '../shared/lib/utils.js';
import { btnCls } from '../shared/ui/styles.js';
import { Modal } from '../shared/ui/index.jsx';

export function BuyerView({db,update,me,theme,setTheme,publicTheme,setPublicSiteTheme,musicCtl}){
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
    const order={id,code:id.slice(-4).toUpperCase(),ownerId:owner.id,buyerId:me.id,buyerContact:me.contact,items:snap,total:money(Math.round(total*100)/100,cur),t:Date.now(),status:'new'};
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
      {modal==='settings'&&<SettingsModal isOwner={false} owner={owner} me={me} update={update} onClose={()=>setModal(null)} onLogout={logout} toast={()=>{}} theme={theme} setTheme={setTheme} publicTheme={publicTheme} setPublicSiteTheme={setPublicSiteTheme}/>}
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
