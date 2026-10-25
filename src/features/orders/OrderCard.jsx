import React from 'react';
import { btnCls, btnGhost } from '../../shared/ui/styles.js';
import { money } from '../../shared/lib/utils.js';

export function OrderCard({o,onToggle}){
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
