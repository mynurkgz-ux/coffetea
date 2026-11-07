import React from 'react';

// Плитка с цифрой для панелей управления.
export function StatCard({ label, value, icon, variant = 'owner' }) {
  if (variant === 'admin') {
    return (
      <article className="rounded-3xl bg-white p-5 shadow-lg">
        <p className="text-sm font-semibold text-[var(--soft)]">{label}</p>
        <p className="mt-2 text-3xl font-black">{value}</p>
      </article>
    );
  }
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-[var(--soft)]">
        <span className="text-sm font-semibold">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
    </div>
  );
}
