import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { finalPrice, money } from '../../shared/lib/utils.js';

export function ProductCarousel({ products = [], loading = false, limit }) {
  const swiperRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const visibleProducts = limit ? products.slice(0, limit) : products;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = event => setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || visibleProducts.length < 2) return;
    if (reducedMotion) swiper.autoplay.stop();
    else swiper.autoplay.start();
  }, [reducedMotion, visibleProducts.length]);

  if (loading) return <p className="py-12 text-center text-sm font-semibold text-[#67736a]">Загружаем меню…</p>;
  if (!visibleProducts.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--field)] px-6 py-12 text-center">
        <p className="text-lg font-extrabold">Скоро здесь появится меню</p>
        <p className="mt-2 text-sm text-[#67736a]">Загляните позже за кофе, чаем и десертами.</p>
      </div>
    );
  }

  const canLoop = visibleProducts.length > 1;

  return (
    <div
      className="relative"
      onFocusCapture={() => swiperRef.current?.autoplay.stop()}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget) && !reducedMotion && canLoop) {
          swiperRef.current?.autoplay.start();
        }
      }}
    >
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Предыдущие товары"
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] transition hover:bg-[var(--accent)] hover:text-white"
        >
          <FiChevronLeft aria-hidden="true" size={20} />
        </button>
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Следующие товары"
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] transition hover:bg-[var(--accent)] hover:text-white"
        >
          <FiChevronRight aria-hidden="true" size={20} />
        </button>
      </div>
      <Swiper
        modules={[Autoplay]}
        onSwiper={swiper => { swiperRef.current = swiper; }}
        slidesPerView="auto"
        spaceBetween={20}
        speed={4000}
        loop={canLoop}
        autoplay={canLoop && !reducedMotion
          ? { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }
          : false}
        role="region"
        aria-label="Карусель товаров"
        className="product-carousel-swiper !px-1 !pb-5"
      >
        {visibleProducts.map(product => (
          <SwiperSlide
            key={`${product.venueId || 'site'}-${product.id}`}
            className="!h-auto !w-[min(82vw,19rem)]"
          >
            <article className="group h-full overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--field)]">
                {product.img
                  ? <img src={product.img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  : <div className="grid h-full w-full place-items-center text-5xl font-black text-[var(--soft2)]" aria-hidden="true">{(product.name || '?')[0].toUpperCase()}</div>}
                {product.discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-extrabold text-white">-{product.discount}%</span>}
              </div>
              <div className="flex min-h-40 flex-col p-4">
                {product.venueName && <p className="mb-1 truncate text-xs font-bold text-[var(--soft)]">{product.venueName}</p>}
                <h2 className="truncate text-lg font-extrabold">{product.name}</h2>
                {product.info && <p className="mt-1 min-h-10 text-sm leading-5 text-[#67736a]">{product.info}</p>}
                <p className="mt-auto pt-3 text-base font-black text-[var(--accent)]">
                  {product.discount > 0
                    ? <>{money(finalPrice(product), product.currency)} <s className="ml-1 text-sm font-normal text-[#929b94]">{money(product.price, product.currency)}</s></>
                    : money(product.price, product.currency)}
                </p>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
