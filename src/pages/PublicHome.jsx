import React from 'react';
import { Link } from 'react-router-dom';
import { THEMES } from '../shared/config.js';

const benefits=[
  {icon:'☕',title:'Любимые вкусы',text:'Кофе, чай и напитки, к которым хочется возвращаться.'},
  {icon:'🥐',title:'Что-нибудь к чаю',text:'Подберите к напитку свежую выпечку или десерт.'},
  {icon:'♡',title:'Уютная пауза',text:'Загляните на минутку или останьтесь подольше.'}
];

export function PublicHome({theme='orange'}){
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
    <main style={themeStyle} className="min-h-screen overflow-hidden bg-[#faf7f0] text-[#25352d]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#home" className="flex items-center gap-2.5 font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--soft)] text-lg text-white">C</span>
          <span className="text-xl">Coffetea</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#5d6b61] md:flex">
          <a className="transition hover:text-[var(--accent)]" href="#about">О нас</a>
          <a className="transition hover:text-[var(--accent)]" href="#menu">Меню</a>
          <a className="transition hover:text-[var(--accent)]" href="#visit">Как нас найти</a>
        </nav>
        <Link to="/login" className="rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold transition hover:bg-[var(--soft)] hover:text-white">
          Для сотрудников
        </Link>
        <nav aria-label="Основная навигация" className="flex w-full justify-between border-t border-[var(--border)] pt-3 text-xs font-bold text-[#5d6b61] md:hidden">
          <a className="transition hover:text-[var(--accent)]" href="#about">О нас</a>
          <a className="transition hover:text-[var(--accent)]" href="#menu">Меню</a>
          <a className="transition hover:text-[var(--accent)]" href="#visit">Как нас найти</a>
        </nav>
      </header>

      <section id="home" className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-8 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:pb-28 md:pt-14">
        <div className="relative z-[1]">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e9eee7] px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--soft)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]"/> Кофе · чай · хорошее настроение
          </p>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.045em] sm:text-6xl lg:text-7xl">
            Маленькая пауза.<br/><span className="text-[var(--accent)]">Большое удовольствие.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#67736a] sm:text-lg">
            Загляните за любимым кофе, согревающим чаем и чем-нибудь вкусным к ним. В Coffetea всегда найдётся повод выдохнуть и насладиться моментом.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="rounded-full bg-[var(--soft)] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-90">
              Что у нас есть <span aria-hidden="true">↓</span>
            </a>
            <a href="#visit" className="rounded-full border border-[var(--border)] px-6 py-3.5 text-sm font-extrabold transition hover:bg-white">
              Как нас найти
            </a>
          </div>
          <p className="mt-8 text-xs font-semibold text-[#7e897f]">Будем рады видеть вас в Coffetea</p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#e6c18e]/40 blur-2xl"/>
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#a8b99e]/45 blur-2xl"/>
          <div className="relative aspect-[4/4.2] overflow-hidden rounded-[2.5rem] bg-[#d8c2a1] shadow-2xl shadow-[#25352d]/15">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_35%,#f4e2c5_0%,#d4b995_48%,#8a6b51_100%)]"/>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#25352d]/65 to-transparent"/>
            <div className="absolute left-[18%] top-[15%] h-[56%] w-[64%] rounded-[48%] bg-[#f2dfc4] shadow-[inset_-18px_-22px_30px_rgba(85,55,32,.18),0_25px_40px_rgba(61,43,27,.2)]"/>
            <div className="absolute left-[25%] top-[22%] h-[43%] w-[50%] rounded-[50%] bg-[#6b4029] shadow-[inset_0_8px_14px_rgba(255,230,184,.35)]">
              <div className="absolute left-[27%] top-[28%] h-[42%] w-[42%] rounded-full border-[7px] border-[#e8c99c] opacity-90"/>
              <div className="absolute left-[43%] top-[17%] h-[62%] w-[13%] rotate-45 rounded-full bg-[#f3dfbd]"/>
            </div>
            <div className="absolute left-[13%] top-[31%] h-[23%] w-[21%] rounded-full border-[14px] border-[#f2dfc4] shadow-[8px_8px_15px_rgba(61,43,27,.15)]"/>
            <div className="absolute bottom-7 left-7 right-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/75">Ваше место для паузы</p>
              <p className="mt-2 text-2xl font-black">Сделано с теплом</p>
            </div>
            <div className="absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-white text-2xl shadow-lg">☕</div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">О Coffetea</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Место, где день становится чуточку лучше</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#67736a]">
            Мы создали Coffetea для простых радостей: встретиться с близкими, передохнуть между делами или взять любимый напиток с собой. Выбирайте то, что нравится именно вам.
          </p>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">Для любого настроения</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Что вам сегодня по вкусу?</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#67736a]">Актуальное меню и цены можно открыть по QR-коду в заведении.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {benefits.map(item=>(
            <article key={item.title} className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--field)] text-2xl" aria-hidden="true">{item.icon}</span>
              <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#67736a]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="visit" className="px-5 pb-16 sm:px-8 md:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] bg-[var(--soft)] px-7 py-9 text-white sm:px-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/75">До встречи</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Загляните в Coffetea</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Найдите нас по QR-коду или спросите у сотрудников — они подскажут, как открыть меню.</p>
          </div>
          <a href="#home" className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#25352d] transition hover:bg-[var(--field)]">
            Наверх ↑
          </a>
        </div>
      </section>

      <footer className="border-t border-[#e6e9e2] bg-[#faf7f0] px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs font-semibold text-[#7e897f] sm:flex-row">
          <span>© {new Date().getFullYear()} Coffetea</span>
          <span>Кофе, чай и тёплые встречи</span>
        </div>
      </footer>
    </main>
  );
}
