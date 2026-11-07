import React from 'react';

// Красное сообщение об ошибке. Ничего не рисует, если текста нет.
export function ErrorAlert({ message, className = '' }) {
  if (!message) return null;
  return <p role="alert" className={`rounded-2xl bg-red-100 p-4 text-sm font-semibold text-red-700 ${className}`}>{message}</p>;
}
