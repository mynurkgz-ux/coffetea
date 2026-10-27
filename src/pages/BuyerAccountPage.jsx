import React from 'react';
import { Link } from 'react-router-dom';
import { OrderCard } from '../features/orders/OrderCard.jsx';
import { THEMES } from '../shared/config.js';
import { PublicPageShell } from './PublicLayout.jsx';

export function BuyerAccountPage({ theme = 'orange', me, orders = [], onLogout }) {
  const palette = THEMES.find(item => item.key === theme) || THEMES[0];
  const themeStyle = {
    '--accent': palette.accent,
    '--field': palette.field,
    '--field2': palette.field2,
    '--border': palette.border,
    '--soft': palette.soft,
    '--soft2': palette.soft2,
    '--bgFrom': palette.bgFrom,
    '--bgTo': palette.bgTo
  };
  const activeOrders = orders.filter(order => !['done', 'cancelled'].includes(order.status)).length;

  return (
    <PublicPageShell themeStyle={themeStyle} me={me} onLogout={onLogout}>
      <section className="bg-gradient-to-br from-[var(--bgFrom)] to-[var(--bgTo)] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/80">Личный кабинет</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Здравствуйте, {me?.fullName?.split(/\s+/)[0] || 'гость'}!</h1>
          <p className="mt-3 text-sm text-white/85">Ваш профиль, заказы и их статусы — в одном месте.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[.75fr_1.25fr]">
        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--accent)]">Мой профиль</p>
          <div className="mt-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--field)] text-2xl font-black text-[var(--accent)]">
            {(me?.fullName || me?.contact || 'П')[0].toLocaleUpperCase()}
          </div>
          <h2 className="mt-4 text-xl font-extrabold">{me?.fullName || 'Покупатель CoffeTea'}</h2>
          <p className="mt-1 break-all text-sm text-[#67736a]">{me?.contact}</p>
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--field)] p-4">
            <p className="text-xs font-bold text-[var(--soft)]">Ваш логин для входа</p>
            <p className="mt-1 break-all text-lg font-black text-[var(--accent)]">{me?.username || me?.contact || '—'}</p>
          </div>
          {me?.createdAt && (
            <p className="mt-4 text-xs font-semibold text-[#8a968e]">
              С нами с {new Date(me.createdAt).toLocaleDateString('ru-RU')}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--field)] p-4">
              <p className="text-xs font-semibold text-[var(--soft)]">Всего заказов</p>
              <p className="mt-1 text-2xl font-black">{orders.length}</p>
            </div>
            <div className="rounded-2xl bg-[var(--field)] p-4">
              <p className="text-xs font-semibold text-[var(--soft)]">В процессе</p>
              <p className="mt-1 text-2xl font-black">{activeOrders}</p>
            </div>
          </div>
          <Link to="/catalog" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 font-extrabold text-white transition hover:opacity-90">
            Перейти в каталог
          </Link>
          <button type="button" onClick={onLogout} className="mt-3 w-full rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold text-[#76665d] transition hover:bg-[var(--field)]">
            Выйти из аккаунта
          </button>
        </aside>

        <div>
          <div className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">История покупок</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Мои заказы</h2>
          </div>
          {orders.length ? (
            <div className="grid gap-4">{orders.map(order => <OrderCard key={order.id} o={order} readOnly />)}</div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--field)] px-6 py-12 text-center">
              <p className="text-lg font-extrabold">Заказов пока нет</p>
              <p className="mt-2 text-sm text-[var(--soft)]">Оформите первый заказ — здесь появится его статус.</p>
              <Link to="/catalog" className="mt-5 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-white">Открыть каталог</Link>
            </div>
          )}
        </div>
      </section>
    </PublicPageShell>
  );
}
