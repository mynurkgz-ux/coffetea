import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MENU_CATEGORIES, THEMES } from '../shared/config.js';
import { createCatalogOrder, notifyTelegramOrder } from '../shared/data/firestoreStore.js';
import { OrderCard } from '../features/orders/OrderCard.jsx';
import { CatalogProductCard } from '../features/catalog/CatalogProductCard.jsx';
import { CategoryFilter } from '../features/catalog/CategoryFilter.jsx';
import { FloatingCartButton } from '../features/catalog/FloatingCartButton.jsx';
import { finalPrice, money, uniqueMenuProducts } from '../shared/lib/utils.js';
import { Modal, useLanguage } from '../shared/ui/index.jsx';
import { btnCls, inputCls } from '../shared/ui/styles.js';
import { PublicPageShell } from './PublicLayout.jsx';

export function CatalogPage({ theme = 'orange', products = [], loading = false, me, buyerOrders = [] }) {
  const {language,t}=useLanguage();
  const menuProducts = useMemo(() => uniqueMenuProducts(products), [products]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(sessionStorage.getItem('coffetea_catalog_cart') || '{}');
      return savedCart && typeof savedCart === 'object' && !Array.isArray(savedCart) ? savedCart : {};
    } catch (cause) {
      console.error('Failed to restore catalog cart:', cause);
      return {};
    }
  });
  const [modal, setModal] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
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
  const cartItems = useMemo(() => Object.entries(cart).map(([key, quantity]) => ({
    key,
    quantity,
    product: menuProducts.find(product => product.id === key)
  })).filter(item => item.product), [cart, menuProducts]);
  const categories = useMemo(() => [...new Set([
    ...MENU_CATEGORIES,
    ...menuProducts.map(product => String(product.category || '').trim() || 'Без категории')
  ])], [menuProducts]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru');
    return menuProducts.filter(product => {
      const category = String(product.category || '').trim() || 'Без категории';
      const matchesSearch = !query
        || `${product.name || ''} ${product.info || ''} ${category}`.toLocaleLowerCase('ru').includes(query);
      return matchesSearch
        && (!selectedCategory || category === selectedCategory)
        && (!discountedOnly || Number(product.discount) > 0);
    });
  }, [discountedOnly, menuProducts, search, selectedCategory]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalsByCurrency = cartItems.reduce((totals, item) => {
    const currency = item.product.currency || 'сом';
    totals[currency] = (totals[currency] || 0) + finalPrice(item.product) * item.quantity;
    return totals;
  }, {});
  const totalLabel = Object.entries(totalsByCurrency)
    .map(([currency, total]) => money(total, currency))
    .join(' · ');

  React.useEffect(() => {
    try {
      sessionStorage.setItem('coffetea_catalog_cart', JSON.stringify(cart));
    } catch (cause) {
      console.error('Failed to save catalog cart:', cause);
    }
  }, [cart]);

  function changeQuantity(product, delta) {
    setCart(current => {
      const next = { ...current };
      const quantity = (next[product.id] || 0) + delta;
      if (quantity <= 0) delete next[product.id];
      else next[product.id] = Math.min(quantity, 99);
      return next;
    });
  }

  async function submitOrder() {
    setWorking(true);
    setError('');
    try {
      const order = await createCatalogOrder(cartItems, me);
      notifyTelegramOrder(order);
      setCart({});
      setModal({ receipt: order });
    } catch (cause) {
      console.error('Failed to create catalog order:', cause);
      setError(cause.message || 'Не удалось оформить заказ.');
    } finally {
      setWorking(false);
    }
  }

  function proceedToCheckout() {
    setError('');
    setModal('cart');
  }

  function continueCheckout() {
    setError('');
    if (me?.role === 'buyer') setModal('confirm');
    else setModal('auth');
  }

  return (
    <PublicPageShell themeStyle={themeStyle} me={me}>
      <section className="bg-gradient-to-br from-[var(--bgFrom)] to-[var(--bgTo)] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/80">{t('coffeeTeaDesserts')}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t('menuCafe')}</h1>
          <p className="mt-3 text-sm text-white/85">{t('cashInfo')}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {loading ? (
          <p className="py-12 text-center text-sm font-semibold text-[#67736a]">{t('loading')}</p>
        ) : menuProducts.length ? (
          <>
            <div className="mb-6 grid gap-3 rounded-3xl border border-[var(--border)] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={t('search')}
                aria-label={t('searchProducts')}
                className={inputCls}
              />
              <a href="/#reviews" className={`${btnCls} flex items-center justify-center gap-2 whitespace-nowrap`}>
                <span aria-hidden="true">★</span>
                {t('reviewLeave')}
              </a>
            </div>
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              discountedOnly={discountedOnly}
              onDiscountedChange={setDiscountedOnly}
            />
            {filteredProducts.length ? (
              <p className="mb-4 text-sm font-semibold text-[#67736a]">{t('found')} {filteredProducts.length}</p>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--field)] px-6 py-12 text-center">
                <p className="text-lg font-extrabold">{t('notFound')}</p>
                <p className="mt-2 text-sm text-[#67736a]">{t('filterHint')}</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSelectedCategory(''); setDiscountedOnly(false); }}
                  className="mt-4 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-white"
                >
                  {t('reset')}
                </button>
              </div>
            )}
            {filteredProducts.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <CatalogProductCard key={product.id} product={product} quantity={cart[product.id] || 0} onChange={changeQuantity} />
            ))}
            </div>}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--field)] px-6 py-12 text-center">
            <p className="text-lg font-extrabold">{t('productsNotAdded')}</p>
            <p className="mt-2 text-sm text-[#67736a]">{t('catalogLater')}</p>
          </div>
        )}
      </section>
      {me?.role === 'buyer' && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">{t('purchases')}</p>
            <h2 className="mt-2 text-2xl font-black">{t('myOrders')}</h2>
          </div>
          {buyerOrders.length
            ? <div className="grid gap-4 lg:grid-cols-2">{buyerOrders.map(order => <OrderCard key={order.id} o={order} readOnly />)}</div>
            : <p className="rounded-2xl bg-[var(--field)] p-5 text-sm text-[var(--soft)]">{t('ordersStatus')}</p>}
        </section>
      )}
      <FloatingCartButton count={cartCount} total={totalLabel} onClick={proceedToCheckout} />
      {modal === 'cart' && (
        <Modal title={t('cartTitle')} onClose={() => setModal(null)}>
          <div className="space-y-5">
            <section className="space-y-3">
              {cartItems.map(item => (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <b className="block truncate">{item.product.name}</b>
                    <span className="text-[var(--soft)]">{money(finalPrice(item.product), item.product.currency)} · {item.quantity} {t('pieces')}</span>
                  </div>
                  <button type="button" onClick={() => changeQuantity(item.product, -1)} aria-label={`${t('decreaseProduct')} ${item.product.name}`} className="h-8 w-8 rounded-full bg-[var(--field)] font-bold">−</button>
                  <button type="button" onClick={() => changeQuantity(item.product, 1)} aria-label={`${t('increaseProduct')} ${item.product.name}`} className="h-8 w-8 rounded-full bg-[var(--accent)] font-bold text-white">+</button>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 text-sm font-bold"><span>{t('total')}</span><span>{totalLabel}</span></div>
            </section>
            <button type="button" disabled={working} onClick={continueCheckout} className={btnCls}>
              {me?.role === 'buyer' ? t('continueCheckout') : t('checkout')}
            </button>
          </div>
        </Modal>
      )}
      {modal === 'auth' && (
        <Modal title={t('authCartTitle')} onClose={() => setModal('cart')}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--soft)]">{t('authCartText')}</p>
            <Link to="/login?next=%2Fcatalog" className={`${btnCls} block text-center`}>{t('login')}</Link>
            <Link to="/register?next=%2Fcatalog" className="block rounded-full border border-[var(--border)] px-5 py-3 text-center text-sm font-extrabold transition hover:bg-[var(--field)]">{t('register')}</Link>
          </div>
        </Modal>
      )}
      {modal === 'confirm' && (
        <Modal title={t('confirmOrder')} onClose={() => setModal('cart')}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--soft)]">{t('confirmText')}</p>
            <div className="flex justify-between gap-3 rounded-xl bg-[var(--field)] p-3 text-sm">
              <span>{cartCount} {language==='ENG'?'items':language==='KG'?'товар':'товара'}</span><b>{totalLabel}</b>
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <button type="button" disabled={working} onClick={submitOrder} className={btnCls}>{working ? t('processing') : t('checkout')}</button>
          </div>
        </Modal>
      )}
      {modal?.receipt && (
        <Modal title={t('orderSent')} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--soft)]">{t('receiptText')}</p>
            <div className="rounded-2xl bg-[var(--field)] p-4 text-center">
              <p className="text-2xl font-black tracking-widest">{modal.receipt.code}</p>
              <p className="mt-1 text-sm text-[var(--soft)]">{modal.receipt.total}</p>
            </div>
            <button type="button" onClick={() => setModal(null)} className={btnCls}>{t('done')}</button>
          </div>
        </Modal>
      )}
    </PublicPageShell>
  );
}
