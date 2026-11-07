import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderCard } from '../features/orders/OrderCard.jsx';
import { SiteBannerForm } from '../features/site/SiteBannerForm.jsx';
import { ProductCard, ProductForm } from '../features/products/components.jsx';
import { PublicHomeSettingsModal } from '../features/settings/components.jsx';
import { BannerCard } from '../features/site/BannerCard.jsx';
import { ReviewModerationCard } from '../features/site/ReviewModerationCard.jsx';
import { StatCard } from '../features/dashboard/StatCard.jsx';
import { EmptyState } from '../shared/ui/EmptyState.jsx';
import { ErrorAlert } from '../shared/ui/ErrorAlert.jsx';

const navigation=[
  {id:'home',label:'Главная',icon:'⌂'},
  {id:'banners',label:'Баннеры',icon:'▧'},
  {id:'products',label:'Товары',icon:'▣'},
  {id:'settings',label:'Настройки',icon:'⚙'},
  {id:'rating',label:'Отзывы',icon:'★'},
  {id:'orders',label:'Заказы',icon:'▤'}
];

export function GlobalAdminView({me,update,publicTheme,savePublicSiteAppearance,publicAnimation,publicProducts,publicOrders,publicOrdersLoading,setPublicOrderStatus,saveSiteProduct,deleteSiteProduct,siteBanners=[],siteBannersLoadError='',saveSiteBanner,deleteSiteBanner,siteReviews=[],moderateSiteReview}){
  const [section,setSection]=useState('home');
  const [showSettings,setShowSettings]=useState(false);
  const [productModal,setProductModal]=useState(null);
  const [productError,setProductError]=useState('');
  const [bannerModal,setBannerModal]=useState(null);
  const [bannerError,setBannerError]=useState('');
  const [reviewError,setReviewError]=useState('');
  const [orderError,setOrderError]=useState('');
  const siteProducts=publicProducts.filter(product=>product.isSiteProduct);
  const pendingReviews=siteReviews.filter(review=>review.status==='pending');
  const pendingOrders=publicOrders.filter(order=>!['done','cancelled'].includes(order.status));

  async function saveProduct(product){
    try{
      await saveSiteProduct(productModal?.id||null,product);
      setProductModal(null);
      setProductError('');
    }catch(error){
      console.error('Failed to save site product:',error);
      setProductError(error.message||'Не удалось сохранить товар.');
    }
  }

  async function removeProduct(){
    try{
      await deleteSiteProduct(productModal.id);
      setProductModal(null);
      setProductError('');
    }catch(error){
      console.error('Failed to delete site product:',error);
      setProductError(error.message||'Не удалось удалить товар.');
    }
  }

  async function saveBanner(banner){
    try{
      await saveSiteBanner(bannerModal?.id||null,banner);
      setBannerModal(null);
      setBannerError('');
    }catch(error){
      console.error('Failed to save site banner:',error);
      setBannerError(error.message||'Не удалось сохранить баннер.');
      throw error;
    }
  }

  async function removeBanner(){
    try{
      await deleteSiteBanner(bannerModal.id);
      setBannerModal(null);
      setBannerError('');
    }catch(error){
      console.error('Failed to delete site banner:',error);
      setBannerError(error.message||'Не удалось удалить баннер.');
      throw error;
    }
  }

  async function setReviewStatus(reviewId,status){
    try{
      await moderateSiteReview(reviewId,status);
      setReviewError('');
    }catch(error){
      console.error('Failed to moderate site review:',error);
      setReviewError(error.message||'Не удалось обновить отзыв.');
    }
  }

  async function changeOrderStatus(order,status){
    try{
      await setPublicOrderStatus(order.venueId||null,order.id,status);
      setOrderError('');
    }catch(error){
      console.error('Failed to update order status:',error);
      setOrderError(error.message||'Не удалось изменить статус заказа.');
    }
  }

  function logout(){
    update(data=>{data.session=null;});
  }

  return (
    <main className="min-h-screen text-[#30251f]">
      <div className="flex min-h-screen">
        <aside className="flex w-20 shrink-0 flex-col border-r border-white/20 bg-white/95 px-2 py-5 shadow-xl sm:w-64 sm:px-4">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 px-2 font-black sm:justify-start">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-lg text-white">C</span>
            <span className="hidden text-lg sm:block">CoffeTea</span>
          </Link>
          <nav aria-label="Панель сайта" className="space-y-2">
            {navigation.map(item=>(
              <button key={item.id} type="button" onClick={()=>{
                setSection(item.id);
                if(item.id==='settings')setShowSettings(true);
              }} aria-label={item.label} title={item.label} aria-current={section===item.id?'page':undefined} className={`flex w-full items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition sm:justify-start ${section===item.id?'bg-[var(--accent)] text-white shadow':'text-[#76665d] hover:bg-[var(--field)] hover:text-[var(--accent)]'}`}>
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
                {(item.id==='orders'&&pendingOrders.length>0||item.id==='rating'&&pendingReviews.length>0)&&<span className="hidden rounded-full bg-red-500 px-2 py-0.5 text-xs text-white sm:block">{item.id==='orders'?pendingOrders.length:pendingReviews.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <p className="hidden truncate px-3 text-xs font-semibold text-[var(--soft)] sm:block">{me.contact}</p>
            <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[#76665d] transition hover:bg-[var(--field)] sm:justify-start">
              <span className="text-lg" aria-hidden="true">↪</span><span className="hidden sm:block">Выйти</span>
            </button>
          </div>
        </aside>
        <section className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/75">Панель администратора сайта</p>
              <h1 className="text-2xl font-black text-white">{navigation.find(item=>item.id===section)?.label}</h1>
            </div>
            <Link to="/" className="rounded-full border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-[var(--accent)]">
              Открыть сайт
            </Link>
          </header>
          {section==='home'&&(
            <div className="space-y-5">
              <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
                <p className="text-sm font-semibold text-[var(--soft)]">{me.contact}</p>
                {me.username&&<p className="mt-1 text-xs font-bold text-[var(--accent)]">Логин администратора: {me.username}</p>}
                <h2 className="mt-2 text-xl font-extrabold">Добро пожаловать!</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--soft)]">Управляйте единым меню и заказами кафе.</p>
                <button type="button" onClick={()=>{setSection('settings');setShowSettings(true);}} className="mt-5 rounded-full bg-[var(--accent)] px-6 py-3 font-extrabold text-white shadow transition hover:opacity-90">
                  Настроить сайт
                </button>
              </section>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {label:'Товары в меню',value:publicProducts.length},
                  {label:'Всего заказов',value:publicOrders.length},
                  {label:'Новые заказы',value:pendingOrders.length},
                  {label:'Отзывы на проверке',value:pendingReviews.length}
                ].map(card=><StatCard key={card.label} variant="admin" {...card}/>)}
              </div>
            </div>
          )}
          {section==='banners'&&(
            <div className="space-y-4">
              <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-lg">
                <div>
                  <p className="text-sm font-semibold text-[var(--soft)]">Автоматическая карусель на главной странице</p>
                  <h2 className="mt-1 text-xl font-extrabold">Баннеры <span className="text-[var(--soft)]">({siteBanners.length})</span></h2>
                </div>
                <button type="button" onClick={()=>{setBannerError('');setBannerModal({});}} className="rounded-full bg-[var(--accent)] px-5 py-3 font-bold text-white shadow">+ Добавить баннер</button>
              </section>
              {siteBannersLoadError&&<p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">Не удалось загрузить список баннеров из Firestore: {siteBannersLoadError} Проверьте и опубликуйте актуальные правила Firestore для проекта.</p>}
              <ErrorAlert message={bannerError}/>
              {siteBanners.length
                ?<div className="grid gap-4 md:grid-cols-2">{siteBanners.map(banner=>(
                  <BannerCard key={banner.id} banner={banner} onClick={()=>{setBannerError('');setBannerModal(banner);}}/>
                ))}</div>
                :<EmptyState>Баннеров пока нет. Добавьте первый, чтобы он появился на сайте.</EmptyState>}
            </div>
          )}
          {section==='settings'&&(
            <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
              <h2 className="text-xl font-extrabold">Настройки сайта</h2>
              <p className="mt-2 text-sm text-[var(--soft)]">Цветовая тема применяется к главной странице сайта.</p>
              <button type="button" onClick={()=>setShowSettings(true)} className="mt-5 rounded-full bg-[var(--accent)] px-6 py-3 font-extrabold text-white shadow transition hover:opacity-90">
                Изменить цветовую тему
              </button>
            </section>
          )}
          {section==='products'&&(
            <div className="space-y-4">
              <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-lg">
                <div>
                  <p className="text-sm font-semibold text-[var(--soft)]">Единое меню кафе</p>
                  <h2 className="mt-1 text-xl font-extrabold">Товары <span className="text-[var(--soft)]">({siteProducts.length})</span></h2>
                </div>
                <button type="button" onClick={()=>{setProductError('');setProductModal({});}} className="rounded-full bg-[var(--accent)] px-5 py-3 font-bold text-white shadow">+ Добавить товар</button>
              </section>
              <ErrorAlert message={productError}/>
              {siteProducts.length
                ?<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{siteProducts.map(product=><div key={product.id}><ProductCard p={product} onClick={()=>{setProductError('');setProductModal(product);}}/></div>)}</div>
                :<EmptyState>Товаров сайта пока нет. Нажмите «Добавить товар».</EmptyState>}
            </div>
          )}
          {section==='rating'&&(
            <div className="space-y-4">
              <section className="rounded-3xl bg-white p-5 shadow-lg">
                <p className="text-sm font-semibold text-[var(--soft)]">Отзывы публикуются только после проверки</p>
                <h2 className="mt-1 text-xl font-extrabold">Отзывы <span className="text-[var(--soft)]">({siteReviews.length})</span></h2>
                <p className="mt-2 text-sm text-[var(--soft)]">На проверке: {pendingReviews.length} · Опубликовано: {siteReviews.filter(review=>review.status==='approved').length}</p>
              </section>
              <ErrorAlert message={reviewError}/>
              {siteReviews.length
                ?<div className="space-y-3">{siteReviews.map(review=>(
                  <ReviewModerationCard key={review.id} review={review} onModerate={setReviewStatus}/>
                ))}</div>
                :<EmptyState>Пока нет отзывов.</EmptyState>}
            </div>
          )}
          {section==='orders'&&(
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-5 shadow-lg">
                <p className="text-sm font-semibold text-[var(--soft)]">Единое окно заказов кафе</p>
                <h2 className="mt-1 text-xl font-extrabold">Заказы <span className="text-[var(--soft)]">({publicOrders.length})</span></h2>
              </div>
              <ErrorAlert message={orderError}/>
              {publicOrdersLoading
                ?<p className="py-12 text-center font-semibold text-white">Загружаем заказы…</p>
                :publicOrders.length
                    ?publicOrders.map(order=><OrderCard key={order.id} o={order} onToggle={(_,status)=>changeOrderStatus(order,status)}/>)
                    :<EmptyState>Заказов пока нет.</EmptyState>}
            </div>
          )}
        </section>
      </div>
      {showSettings&&<PublicHomeSettingsModal
        theme={publicTheme}
        animation={publicAnimation}
        onSave={savePublicSiteAppearance}
        onClose={()=>setShowSettings(false)}
      />}
      {productModal&&<ProductForm
        product={productModal.id?productModal:undefined}
        onSave={saveProduct}
        onDelete={productModal.id?removeProduct:undefined}
        onClose={()=>setProductModal(null)}
      />}
      {bannerModal&&<SiteBannerForm
        banner={bannerModal.id?bannerModal:undefined}
        onSave={saveBanner}
        onDelete={bannerModal.id?removeBanner:undefined}
        onClose={()=>setBannerModal(null)}
      />}
    </main>
  );
}
