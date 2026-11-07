import React from 'react';

// Карточка баннера в админке сайта (нажатие открывает редактирование).
export function BannerCard({ banner, onClick }) {
  return (
    <button type="button" onClick={onClick} className="overflow-hidden rounded-3xl bg-white text-left shadow-lg transition hover:-translate-y-1">
      <div className="relative aspect-[16/7] bg-[var(--field)]">
        {banner.img && <img src={banner.img} alt="" className="h-full w-full object-cover" />}
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${banner.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{banner.active ? 'Опубликован' : 'Скрыт'}</span>
      </div>
      <div className="p-4">
        <h3 className="font-extrabold">{banner.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--soft)]">{banner.text}</p>
        <p className="mt-3 text-xs font-bold text-[var(--accent)]">Порядок показа: {banner.order || 0} · Нажмите для редактирования</p>
      </div>
    </button>
  );
}
