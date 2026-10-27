import React from 'react';
import { btnCls, btnGhost } from '../../shared/ui/styles.js';
import { money } from '../../shared/lib/utils.js';

const orderStatuses = {
  new: { label: 'Новый', next: 'preparing', action: 'Начать приготовление' },
  preparing: { label: 'Готовится', next: 'ready', action: 'Отметить готовым' },
  ready: { label: 'Готов к выдаче', next: 'done', action: 'Отметить выданным' },
  done: { label: 'Выдан · оплата получена', next: 'new', action: 'Вернуть в новые' },
  cancelled: { label: 'Отменён', next: 'new', action: 'Восстановить заказ' }
};

export function OrderCard({ o, onToggle, readOnly = false }) {
  const status = orderStatuses[o.status] || orderStatuses.new;
  const cancelled = o.status === 'cancelled';
  return (
    <div className="space-y-2 rounded-2xl bg-white p-4 shadow">
      <div className="flex justify-between gap-3">
        <b>Заказ {o.code}</b>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${o.status === 'done' ? 'bg-[var(--accent)] text-white' : cancelled ? 'bg-red-100 text-red-700' : 'bg-[var(--field2)] text-[var(--soft)]'}`}>
          {status.label}
        </span>
      </div>
      <ul className="space-y-1 text-sm">
        {o.items.map((item, index) => (
          <li key={index} className="flex justify-between">
            <span>{item.name} × {item.qty}</span>
            <b>{money(Math.round(item.price * item.qty * 100) / 100, item.currency)}</b>
          </li>
        ))}
      </ul>
      <div className="flex justify-between gap-3 text-sm text-[var(--soft)]">
        <span className="truncate">
          {new Date(o.t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          {' · '}{o.buyerContact}
        </span>
        <b className="shrink-0 text-black">{o.total}</b>
      </div>
      <p className="text-xs font-semibold text-[var(--soft)]">
        Оплата: наличными на кассе{o.paymentStatus === 'paid' || (o.status === 'done' && !o.paymentStatus) ? ' · получена' : ' · ожидается'}
      </p>
      {!readOnly && onToggle && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onToggle(o.id, status.next)} className={cancelled || o.status === 'done' ? btnGhost : btnCls}>
            {status.action}
          </button>
          {!cancelled && o.status !== 'done' && (
            <button type="button" onClick={() => onToggle(o.id, 'cancelled')} className={btnGhost}>
              Отменить заказ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
