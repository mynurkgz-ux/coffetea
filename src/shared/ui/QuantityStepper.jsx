import React from 'react';

// Кнопки «− количество +» для карточки товара.
export function QuantityStepper({ quantity, onDecrease, onIncrease, decreaseLabel, increaseLabel, size = 'h-10 w-10', className = '' }) {
  return (
    <div className={`flex items-center justify-between rounded-full bg-[var(--field)] p-1 ${className}`}>
      <button type="button" onClick={onDecrease} disabled={!quantity} aria-label={decreaseLabel} className={`${size} rounded-full bg-white font-bold disabled:opacity-40`}>−</button>
      <span className="font-bold">{quantity}</span>
      <button type="button" onClick={onIncrease} aria-label={increaseLabel} className={`${size} rounded-full bg-[var(--accent)] font-bold text-white`}>+</button>
    </div>
  );
}
