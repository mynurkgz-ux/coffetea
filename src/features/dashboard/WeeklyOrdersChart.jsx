import React from 'react';

// Столбики «заказы за последние 7 дней».
export function WeeklyOrdersChart({ orders }) {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return {
      date,
      label: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      count: orders.filter(o => o.t >= date.getTime() && o.t < next.getTime()).length
    };
  });
  const max = Math.max(1, ...days.map(day => day.count));
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="font-extrabold text-lg">Заказы за неделю</h3><p className="text-sm text-[var(--soft)]">Количество заказов по дням</p></div>
        <span className="text-2xl" aria-hidden="true">↗</span>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 items-end h-36">
        {days.map(day => (
          <div key={day.date.toISOString()} className="flex h-full flex-col items-center justify-end gap-2">
            <span className="text-xs font-bold text-[var(--soft)]">{day.count || ''}</span>
            <div className="w-full max-w-8 rounded-t-lg bg-[var(--accent)] transition-all" style={{ height: Math.max(8, day.count / max * 80) + '%' }} />
            <span className="text-[10px] capitalize text-[var(--soft)]">{day.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
