import React from 'react';

const ORDER_FILTERS = [['all', 'Все'], ['active', 'Активные'], ['new', 'Новые'], ['preparing', 'Готовятся'], ['ready', 'Готовы'], ['done', 'Выданы'], ['cancelled', 'Отменены']];

// Проверить, подходит ли заказ под выбранный фильтр.
export function matchesOrderFilter(order, filter) {
  return filter === 'all'
    || (filter === 'active' && !['done', 'cancelled'].includes(order.status))
    || order.status === filter;
}

// Кнопки фильтра по статусу заказа. На телефоне прокручиваются по горизонтали.
export function OrderStatusFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {ORDER_FILTERS.map(([key, label]) => (
        <button key={key} type="button" onClick={() => onChange(key)} aria-pressed={value === key} className={'shrink-0 rounded-full px-4 py-2 text-sm font-bold ' + (value === key ? 'bg-white text-[var(--accent)]' : 'bg-white/20 text-white')}>{label}</button>
      ))}
    </div>
  );
}
