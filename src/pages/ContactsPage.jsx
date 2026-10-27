import React from 'react';
import { Link } from 'react-router-dom';
import { THEMES } from '../shared/config.js';
import { PublicPageShell } from './PublicLayout.jsx';

export function ContactsPage({theme='orange',me}){
  const palette=THEMES.find(item=>item.key===theme)||THEMES[0];
  const themeStyle={
    '--accent':palette.accent,
    '--field':palette.field,
    '--field2':palette.field2,
    '--border':palette.border,
    '--soft':palette.soft,
    '--soft2':palette.soft2,
    '--bgFrom':palette.bgFrom,
    '--bgTo':palette.bgTo
  };

  return (
    <PublicPageShell themeStyle={themeStyle} me={me}>
      <section className="bg-gradient-to-br from-[var(--bgFrom)] to-[var(--bgTo)] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/80">До встречи</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Как нас найти</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">Загляните в Coffetea за кофе, чаем и чем-нибудь вкусным.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--field)] p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Меню кафе</h2>
          <p className="mt-3 text-sm leading-6 text-[#67736a]">
            Откройте QR-код меню в кафе или спросите у сотрудников — они подскажут, как посмотреть меню и сделать заказ.
          </p>
          <Link to="/catalog" className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
            Посмотреть каталог
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
