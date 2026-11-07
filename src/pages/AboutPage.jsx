import React from 'react';
import { THEMES } from '../shared/config.js';
import { PublicPageShell } from './PublicLayout.jsx';
import { useLanguage } from '../shared/ui/index.jsx';

export function AboutPage({theme='orange',me}){
  const {t}=useLanguage();
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
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/80">{t('aboutCoffetea')}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{t('aboutTitle')}</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold">{t('coffeeMoments')}</h2>
          <p className="mt-4 text-base leading-7 text-[#67736a]">
            {t('aboutText')}
          </p>
          <p className="mt-4 text-base leading-7 text-[#67736a]">
            {t('aboutCatalog')}
          </p>
        </div>
      </section>
    </PublicPageShell>
  );
}
