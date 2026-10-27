import React from 'react';
import { Link } from 'react-router-dom';
import { FiCoffee } from 'react-icons/fi';

export function PublicHeader({me}){
  return (
    <header className="relative z-10 border-b border-[var(--border)] bg-white px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Link to="/" aria-label="CoffeTea — главная" className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25 transition-transform group-hover:-rotate-6 group-hover:scale-105">
            <FiCoffee aria-hidden="true" size={23} strokeWidth={2.3}/>
          </span>
          <span className="flex flex-col">
            <span className="text-xl font-black leading-none tracking-tight text-[#30251f]">Coffe<span className="text-[var(--accent)]">Tea</span></span>
            <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[.2em] text-[#8a796f]">кофе · чай · уют</span>
          </span>
        </Link>
        <nav aria-label="Основная навигация" className="order-3 flex w-full items-center justify-between border-t border-[var(--border)] pt-3 text-xs font-bold text-[#76665d] sm:order-none sm:w-auto sm:gap-5 sm:border-0 sm:pt-0 sm:text-sm">
          <Link className="transition hover:text-[var(--accent)]" to="/about">О нас</Link>
          <Link className="transition hover:text-[var(--accent)]" to="/catalog">Каталог</Link>
          <Link className="transition hover:text-[var(--accent)]" to="/contacts">Контакты</Link>
        </nav>
        {me?.role === 'buyer' ? (
          <Link to="/account" className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 sm:text-sm">
            Мой кабинет
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/login" className="rounded-full border border-[var(--border)] px-3 py-2.5 text-xs font-bold transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white sm:px-4 sm:text-sm">
              Войти
            </Link>
            <Link to="/register" className="rounded-full bg-[var(--accent)] px-3 py-2.5 text-xs font-bold text-white transition hover:opacity-90 sm:px-4 sm:text-sm">
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicFooter(){
  return (
    <footer className="border-t border-white/10 bg-[#241914] px-5 py-12 text-white sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_.7fr_1fr_1.2fr]">
        <div>
          <Link to="/" aria-label="CoffeTea — главная" className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-white">
              <FiCoffee aria-hidden="true" size={23}/>
            </span>
            <span className="text-xl font-black tracking-tight">Coffe<span className="text-[var(--field2)]">Tea</span></span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">Кофе, чай и тёплые встречи. Выберите любимое в меню CoffeTea.</p>
          <Link to="/catalog" className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#30251f] transition hover:bg-[var(--field)]">
            Открыть меню
          </Link>
        </div>
        <nav aria-label="Ссылки в подвале" className="flex flex-col items-start gap-3 text-sm font-semibold text-white/75">
          <h2 className="mb-1 text-xs font-extrabold uppercase tracking-[.16em] text-white/45">Навигация</h2>
          <Link className="transition hover:text-white" to="/">Главная</Link>
          <Link className="transition hover:text-white" to="/catalog">Каталог</Link>
          <Link className="transition hover:text-white" to="/about">О нас</Link>
          <Link className="transition hover:text-white" to="/contacts">Контакты</Link>
          <a className="transition hover:text-white" href="/#reviews">Отзывы</a>
        </nav>
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-white/45">Заказы</h2>
          <p className="mt-4 text-sm leading-6 text-white/75">Соберите заказ в каталоге и заберите его в кафе. Оплата — наличными при получении.</p>
          <Link to="/catalog" className="mt-4 inline-flex text-sm font-extrabold text-[var(--field2)] transition hover:text-white">
            Перейти в каталог <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-white/45">Карта</h2>
            <a
              href="https://www.openstreetmap.org/?mlat=42.8762&mlon=74.6036#map=16/42.8762/74.6036"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[var(--field2)] hover:text-white"
            >
              Открыть
            </a>
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <iframe
              title="Демонстрационная карта центра Бишкека"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.58%2C42.86%2C74.63%2C42.89&layer=mapnik&marker=42.8762%2C74.6036"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-44 w-full border-0"
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-white/45">Демонстрационная точка — центр Бишкека. Замените её на адрес кафе перед публикацией.</p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CoffeTea</p>
        <p>Сделано с теплом · Кофе и чай на каждый день</p>
      </div>
    </footer>
  );
}

export function PublicPageShell({themeStyle,children,me,onLogout}){
  return (
    <main style={themeStyle} className="min-h-screen bg-white text-[#30251f]">
      <PublicHeader me={me} onLogout={onLogout}/>
      {children}
      <PublicFooter/>
    </main>
  );
}
