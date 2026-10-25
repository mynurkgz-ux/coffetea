import React, { useState } from 'react';
import { OrderCard } from '../features/orders/OrderCard.jsx';
import { SettingsModal } from '../features/settings/components.jsx';

export function CashierView({db,update,me,theme,setTheme}){
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
