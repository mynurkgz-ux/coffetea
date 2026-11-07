import React from 'react';

// Белая плашка «пока ничего нет».
export function EmptyState({ children, className = '' }) {
  return <div className={`rounded-3xl bg-white px-6 py-12 text-center text-sm text-[var(--soft)] ${className}`}>{children}</div>;
}
