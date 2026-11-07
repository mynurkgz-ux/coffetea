import React from 'react';

const STATUS = {
  approved: ['Опубликован', 'bg-emerald-100 text-emerald-800'],
  rejected: ['Отклонён', 'bg-red-100 text-red-700'],
  pending: ['На проверке', 'bg-amber-100 text-amber-800']
};

// Отзыв в админке: звёзды, автор, статус и кнопки модерации.
export function ReviewModerationCard({ review, onModerate }) {
  const [label, cls] = STATUS[review.status] || STATUS.pending;
  // Защита от некорректной оценки: '★'.repeat(-1) роняет страницу.
  const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0)));
  return (
    <article className="rounded-3xl bg-white p-5 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg tracking-widest text-[var(--accent)]">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--soft)]">{review.authorName} · {new Date(review.t).toLocaleDateString('ru-RU')}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{label}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{review.text}</p>
      {review.status === 'pending' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onModerate(review.id, 'approved')} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">Опубликовать</button>
          <button type="button" onClick={() => onModerate(review.id, 'rejected')} className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-bold text-red-700">Отклонить</button>
        </div>
      )}
    </article>
  );
}
