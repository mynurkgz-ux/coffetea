import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { THEMES } from '../shared/config.js';
import { finalPrice, money, uniqueMenuProducts } from '../shared/lib/utils.js';
import { ProductCarousel } from '../features/products/ProductCarousel.jsx';
import { SiteBannerCarousel } from '../features/site/SiteBannerCarousel.jsx';
import { PublicParticles } from '../features/site/PublicParticles.jsx';
import { SiteReviews } from '../features/site/SiteReviews.jsx';
import { PublicFooter, PublicHeader } from './PublicLayout.jsx';
import { useLanguage } from '../shared/ui/index.jsx';

export function PublicHome({theme='orange',animation='soda',products=[],menuLoading=false,banners=[],reviews=[],me,onSubmitReview}){
  const {t}=useLanguage();
  const [intro,setIntro]=useState('visible');
  const [featuredIndex,setFeaturedIndex]=useState(0);
  const [reducePromotionMotion,setReducePromotionMotion]=useState(
    ()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const discountedProducts=useMemo(
    ()=>uniqueMenuProducts(products).filter(product=>Number(product.discount)>0),
    [products]
  );
  const palette=THEMES.find(item=>item.key===theme)||THEMES[0];
  useEffect(()=>{
    const leaveTimer=window.setTimeout(()=>setIntro('leaving'),2200);
    const finishTimer=window.setTimeout(()=>setIntro('hidden'),2800);
    return ()=>{
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  },[]);
  useEffect(()=>{
    const mediaQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference=event=>setReducePromotionMotion(event.matches);
    mediaQuery.addEventListener('change',updateMotionPreference);
    return ()=>mediaQuery.removeEventListener('change',updateMotionPreference);
  },[]);
  useEffect(()=>{
    setFeaturedIndex(0);
    if(discountedProducts.length<2||reducePromotionMotion)return undefined;
    const timer=window.setInterval(()=>{
      setFeaturedIndex(index=>(index+1)%discountedProducts.length);
    },2000);
    return ()=>window.clearInterval(timer);
  },[discountedProducts,reducePromotionMotion]);
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
    <main style={themeStyle} className="min-h-screen overflow-hidden bg-white text-[#30251f]">
      {intro!=='hidden'&&<div className={`welcome-splash ${intro==='leaving'?'welcome-splash-leaving':''}`} role="status" aria-label={t('tagline')}>
        <div className="welcome-bubbles" aria-hidden="true">
          <span className="welcome-bubble welcome-bubble-1"/>
          <span className="welcome-bubble welcome-bubble-2"/>
          <span className="welcome-bubble welcome-bubble-3"/>
          <span className="welcome-bubble welcome-bubble-4"/>
          <span className="welcome-bubble welcome-bubble-5"/>
          <span className="welcome-bubble welcome-bubble-6"/>
          <span className="welcome-bubble welcome-bubble-7"/>
          <span className="welcome-bubble welcome-bubble-8"/>
        </div>
        <div className="welcome-splash-content">
          <span className="welcome-splash-logo">C</span>
          <p className="welcome-splash-brand">{t('yourCafe')}</p>
          <h1>CoffeTea</h1>
          <p className="welcome-splash-caption">{t('coffeeMoments')}</p>
        </div>
        <button type="button" className="welcome-splash-skip" onClick={()=>setIntro('hidden')}>{t('skip')}</button>
      </div>}
      <PublicHeader me={me}/>
      <SiteBannerCarousel banners={banners}/>

      <section id="home" className={`relative isolate overflow-hidden bg-gradient-to-br from-[var(--bgFrom)] to-[var(--bgTo)] text-white hero-animation-${animation}`}>
        <div className="hero-bubbles" aria-hidden="true">
          <span className="hero-bubble hero-bubble-1"/>
          <span className="hero-bubble hero-bubble-2"/>
          <span className="hero-bubble hero-bubble-3"/>
          <span className="hero-bubble hero-bubble-4"/>
          <span className="hero-bubble hero-bubble-5"/>
          <span className="hero-bubble hero-bubble-6"/>
          <span className="hero-bubble hero-bubble-7"/>
          <span className="hero-bubble hero-bubble-8"/>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl"/>
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-8 h-36 w-36 rounded-full border-[22px] border-white/10"/>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-5rem] right-[36%] h-52 w-52 rounded-full bg-white/10"/>
        <div className={`relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 md:py-24 ${discountedProducts.length?'md:grid-cols-[minmax(0,1fr)_minmax(18rem,.8fr)]':''}`}>
          <div className="relative z-[1] max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-white">
              <span className="h-2 w-2 rounded-full bg-white"/> {t('coffeeTeaDesserts')}
            </p>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              CoffeTea<br/><span className="text-orange-50">{t('cozyMoment')}</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/90 sm:text-lg">
              {t('heroText')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#menu" className="rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[var(--soft)] shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50">
                {t('openMenu')} <span aria-hidden="true">↓</span>
              </a>
              <a href="#visit" className="rounded-full border border-white/50 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/15">
                {t('howToFind')}
              </a>
            </div>
            <p className="mt-8 text-xs font-semibold text-white/80">{t('goodMood')}</p>
          </div>
          {discountedProducts.length>0&&(()=>{
            const product=discountedProducts[featuredIndex%discountedProducts.length];
            return (
              <Link
                key={`${product.venueId||'site'}-${product.id}`}
                to="/catalog"
                aria-label={`${t('discountProductAria')}: ${product.name}, ${product.discount} ${t('percentOff')}. ${t('openCatalog')}.`}
                className={`featured-product-card group relative z-[1] mx-auto block w-full max-w-sm ${discountedProducts.length>1&&!reducePromotionMotion?'featured-product-card-cycling':''}`}
              >
                <div aria-hidden="true" className="featured-product-glow"/>
                <div className="relative overflow-hidden rounded-[2rem] border border-white/35 bg-white/15 p-3 shadow-2xl shadow-black/20 backdrop-blur-md transition duration-500 group-hover:-translate-y-1 group-hover:bg-white/20">
                  <div className="featured-product-image relative h-64 overflow-hidden rounded-[1.5rem] bg-white/10">
                    {product.img
                      ?<img src={product.img} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                      :<div className="grid h-full place-items-center text-7xl font-black text-white/70" aria-hidden="true">{(product.name||'?')[0].toUpperCase()}</div>}
                    <span className="featured-product-discount absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--accent)] shadow-lg">
                      {t('discountOffer')} −{product.discount}%
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-3 px-2 pb-2 pt-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-white/70">{t('offerDay')}</p>
                      <h2 className="mt-1 truncate text-xl font-black text-white">{product.name}</h2>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-white">{money(finalPrice(product),product.currency)}</p>
                      <s className="text-xs font-semibold text-white/65">{money(product.price,product.currency)}</s>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs font-bold tracking-wide text-white/75">{t('clickMenu')}</p>
              </Link>
            );
          })()}
        </div>
      </section>

      <section id="menu" className="relative isolate overflow-hidden">
        <PublicParticles animation={animation}/>
        <div className="relative z-[1] mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">{t('menuCafe')}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t('menuQuestion')}</h2>
          </div>
          <Link to="/catalog" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-extrabold transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white">
            {t('allCatalog')}
          </Link>
        </div>
        <ProductCarousel products={uniqueMenuProducts(products)} loading={menuLoading} limit={8}/>
        </div>
      </section>

      <section id="about" className="relative isolate overflow-hidden bg-white px-5 py-16 sm:px-8 md:py-20">
        <PublicParticles animation={animation}/>
        <div className="relative z-[1] mx-auto grid max-w-7xl gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">{t('aboutCoffetea')}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t('aboutTitle')}</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#67736a]">
            {t('aboutText')}
          </p>
        </div>
      </section>

      <SiteReviews reviews={reviews} me={me} onSubmit={onSubmitReview} animation={animation}/>

      <section id="visit" className="relative isolate overflow-hidden bg-white px-5 pb-16 sm:px-8 md:pb-20">
        <PublicParticles animation={animation}/>
        <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] bg-gradient-to-br from-[var(--bgFrom)] to-[var(--bgTo)] px-7 py-9 text-white shadow-xl shadow-[var(--accent)]/15 sm:px-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/75">{t('meet')}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">{t('discover')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{t('qrText')}</p>
          </div>
          <a href="#home" className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#25352d] transition hover:bg-[var(--field)]">
            {t('toTop')} ↑
          </a>
        </div>
      </section>

      <PublicFooter/>
    </main>
  );
}
