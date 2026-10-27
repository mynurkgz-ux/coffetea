import React, { useEffect, useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export function SiteBannerCarousel({ banners = [] }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = event => setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || banners.length < 2) return;
    if (reducedMotion) swiper.autoplay.stop();
    else swiper.autoplay.start();
  }, [banners.length, reducedMotion]);
  if (!banners.length) return null;

  return (
    <section aria-label="Акции и новости кафе" className="site-banner-carousel relative h-[100svh] bg-[var(--accent)]">
      <Swiper
        modules={[Autoplay]}
        className="h-full"
        onSwiper={swiper => { swiperRef.current = swiper; }}
        onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
        loop={banners.length > 1}
        autoplay={banners.length > 1 && !reducedMotion ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        speed={700}
        aria-label="Баннеры кафе"
      >
        {banners.map(banner => (
          <SwiperSlide key={banner.id}>
            <article className="relative isolate flex h-full items-center overflow-hidden bg-[#40251b] text-white">
              <img src={banner.img} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
              <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
                <div className="max-w-2xl">
                  <p className="text-xs font-extrabold uppercase tracking-[.2em] text-white/75">CoffeTea · новости и предложения</p>
                  <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{banner.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:text-base">{banner.text}</p>
                  <a href="/catalog" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[var(--accent)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--field)]">
                    {banner.buttonText || 'Открыть меню'}
                  </a>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2" aria-label="Выбор баннера">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => swiperRef.current?.slideToLoop(index)}
              aria-label={`Баннер ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/60 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
