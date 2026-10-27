import React from 'react';
import { THEMES } from '../shared/config.js';
import { PublicPageShell } from './PublicLayout.jsx';

export function AboutPage({theme='orange',me}){
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
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/80">О Coffetea</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Место, где день становится чуточку лучше</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold">Кофе · чай · моменты уюта</h2>
          <p className="mt-4 text-base leading-7 text-[#67736a]">
            Мы создали Coffetea для простых радостей: встретиться с близкими, передохнуть между делами или взять любимый напиток с собой. Выбирайте то, что нравится именно вам.
          </p>
          <p className="mt-4 text-base leading-7 text-[#67736a]">
            В каталоге собраны товары кафе — напитки, чай и десерты. Загляните в каталог и выберите то, что вам сегодня по вкусу.
          </p>
        </div>
      </section>
    </PublicPageShell>
  );
}
