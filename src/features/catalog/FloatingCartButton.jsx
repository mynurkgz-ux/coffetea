import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useLanguage } from '../../shared/ui/index.jsx';

// Плавающая кнопка корзины в правом нижнем углу.
export function FloatingCartButton({ count, total, onClick }) {
  const { t } = useLanguage();
  if (!count) return null;
  return (
    <button type="button" onClick={onClick} className="fixed bottom-5 right-5 z-20 flex h-14 items-center gap-3 rounded-full bg-black px-5 font-bold text-white shadow-xl sm:bottom-7 sm:right-8">
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-amber-300 text-black">
        <FiShoppingCart aria-hidden="true" size={17} />
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-xs font-extrabold text-white">{count}</span>
      </span>
      {t('cartTitle')}
      <b>{total}</b>
    </button>
  );
}
