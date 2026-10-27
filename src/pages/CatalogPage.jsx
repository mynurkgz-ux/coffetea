import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { MENU_CATEGORIES, THEMES } from '../shared/config.js';
import { createCatalogOrder } from '../shared/data/firestoreStore.js';
import { OrderCard } from '../features/orders/OrderCard.jsx';
import { finalPrice, money, uniqueMenuProducts } from '../shared/lib/utils.js';
import { Modal } from '../shared/ui/index.jsx';
import { btnCls, inputCls } from '../shared/ui/styles.js';
import { PublicPageShell } from './PublicLayout.jsx';

export function CatalogPage({ theme = 'orange', products = [], loading = false, me, buyerOrders = [] }) {
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
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/80">Кофе · чай · десерты</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Меню кафе</h1>
          <p className="mt-3 text-sm text-white/85">Соберите заказ и оплатите наличными на кассе.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {loading ? (
          <p className="py-12 text-center text-sm font-semibold text-[#67736a]">Загружаем товары…</p>
        ) : menuProducts.length ? (
          <>
            <div className="mb-6 grid gap-3 rounded-3xl border border-[var(--border)] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)_auto] sm:items-center sm:p-5">
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Поиск по названию или описанию"
                aria-label="Поиск товаров"
                className={inputCls}
              />
            </div>
            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Фильтр товаров по категории">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                aria-pressed={!selectedCategory}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${!selectedCategory?'border-[var(--accent)] bg-[var(--accent)] text-white':'border-[var(--border)] bg-white text-[#67736a] hover:border-[var(--accent)]'}`}
              >
                Все
              </button>
              {categories.map(category=>(
                <button
                  key={category}
                  type="button"
                  onClick={()=>setSelectedCategory(category)}
                  aria-pressed={selectedCategory===category}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selectedCategory===category?'border-[var(--accent)] bg-[var(--accent)] text-white':'border-[var(--border)] bg-white text-[#67736a] hover:border-[var(--accent)]'}`}
                >
                  {category}
                </button>
              ))}
              <label className="flex min-h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={discountedOnly}
                  onChange={event => setDiscountedOnly(event.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Со скидкой
              </label>
            </div>
            {filteredProducts.length ? (
              <p className="mb-4 text-sm font-semibold text-[#67736a]">Найдено товаров: {filteredProducts.length}</p>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--field)] px-6 py-12 text-center">
                <p className="text-lg font-extrabold">Товары не найдены</p>
                <p className="mt-2 text-sm text-[#67736a]">Измените параметры фильтрации или сбросьте их.</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSelectedCategory(''); setDiscountedOnly(false); }}
                  className="mt-4 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-white"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
            {filteredProducts.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map(product => {
              const quantity = cart[product.id] || 0;
              return (
                <article key={product.id} className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--field)]">
                    {product.img
                      ? <img src={product.img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      : <div className="grid h-full w-full place-items-center text-5xl font-black text-[var(--soft2)]" aria-hidden="true">{(product.name || '?')[0].toUpperCase()}</div>}
                    {product.discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-extrabold text-white">-{product.discount}%</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="truncate text-lg font-extrabold">{product.name}</h2>
                    {product.info && <p className="mt-1 min-h-10 text-sm leading-5 text-[#67736a]">{product.info}</p>}
                    <p className="mt-3 text-base font-black text-[var(--accent)]">
                      {product.discount > 0
                        ? <>{money(finalPrice(product), product.currency)} <s className="ml-1 text-sm font-normal text-[#929b94]">{money(product.price, product.currency)}</s></>
                        : money(product.price, product.currency)}
                    </p>
                    <div className="mt-4 flex items-center justify-between rounded-full bg-[var(--field)] p-1">
                          <button type="button" onClick={() => changeQuantity(product, -1)} disabled={!quantity} aria-label={`Убрать ${product.name}`} className="h-10 w-10 rounded-full bg-white font-bold disabled:opacity-40">−</button>
                          <span className="font-bold">{quantity}</span>
                          <button type="button" onClick={() => changeQuantity(product, 1)} aria-label={`Добавить ${product.name}`} className="h-10 w-10 rounded-full bg-[var(--accent)] font-bold text-white">+</button>
                    </div>
                  </div>
                </article>
              );
            })}
            </div>}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--field)] px-6 py-12 text-center">
            <p className="text-lg font-extrabold">Товары пока не добавлены</p>
            <p className="mt-2 text-sm text-[#67736a]">Загляните позже — каталог появится здесь.</p>
          </div>
        )}
      </section>
      {me?.role === 'buyer' && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">Покупки</p>
            <h2 className="mt-2 text-2xl font-black">Мои заказы</h2>
          </div>
          {buyerOrders.length
            ? <div className="grid gap-4 lg:grid-cols-2">{buyerOrders.map(order => <OrderCard key={order.id} o={order} readOnly />)}</div>
            : <p className="rounded-2xl bg-[var(--field)] p-5 text-sm text-[var(--soft)]">Здесь появятся ваши заказы и их статус.</p>}
        </section>
      )}
      {cartCount > 0 && (
        <button type="button" onClick={proceedToCheckout} className="fixed bottom-5 right-5 z-20 flex h-14 items-center gap-3 rounded-full bg-black px-5 font-bold text-white shadow-xl sm:bottom-7 sm:right-8">
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-amber-300 text-black">
            <FiShoppingCart aria-hidden="true" size={17} />
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-xs font-extrabold text-white">{cartCount}</span>
          </span>
          Корзина
          <b>{totalLabel}</b>
        </button>
      )}
      {modal === 'cart' && (
        <Modal title="Корзина" onClose={() => setModal(null)}>
          <div className="space-y-5">
            <section className="space-y-3">
              {cartItems.map(item => (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <b className="block truncate">{item.product.name}</b>
                    <span className="text-[var(--soft)]">{money(finalPrice(item.product), item.product.currency)} · {item.quantity} шт.</span>
                  </div>
                  <button type="button" onClick={() => changeQuantity(item.product, -1)} aria-label={`Уменьшить ${item.product.name}`} className="h-8 w-8 rounded-full bg-[var(--field)] font-bold">−</button>
                  <button type="button" onClick={() => changeQuantity(item.product, 1)} aria-label={`Увеличить ${item.product.name}`} className="h-8 w-8 rounded-full bg-[var(--accent)] font-bold text-white">+</button>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 text-sm font-bold"><span>Итого</span><span>{totalLabel}</span></div>
            </section>
            <button type="button" disabled={working} onClick={continueCheckout} className={btnCls}>
              {me?.role === 'buyer' ? 'Продолжить оформление' : 'Оформить заказ'}
            </button>
          </div>
        </Modal>
      )}
      {modal === 'auth' && (
        <Modal title="Войдите, чтобы оформить заказ" onClose={() => setModal('cart')}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--soft)]">Товары останутся в корзине. Войдите или зарегистрируйтесь, чтобы оформить заказ. Оплата наличными на кассе.</p>
            <Link to="/login?next=%2Fcatalog" className={`${btnCls} block text-center`}>Войти</Link>
            <Link to="/register?next=%2Fcatalog" className="block rounded-full border border-[var(--border)] px-5 py-3 text-center text-sm font-extrabold transition hover:bg-[var(--field)]">Зарегистрироваться</Link>
          </div>
        </Modal>
      )}
      {modal === 'confirm' && (
        <Modal title="Подтвердите заказ" onClose={() => setModal('cart')}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--soft)]">Создадим один заказ. Оплата — наличными на кассе при получении.</p>
            <div className="flex justify-between gap-3 rounded-xl bg-[var(--field)] p-3 text-sm">
              <span>{cartCount} товара</span><b>{totalLabel}</b>
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <button type="button" disabled={working} onClick={submitOrder} className={btnCls}>{working ? 'Оформляем…' : 'Оформить заказ'}</button>
          </div>
        </Modal>
      )}
      {modal?.receipt && (
        <Modal title="Заказ отправлен" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--soft)]">Покажите код сотруднику кафе. Оплата — наличными при получении заказа.</p>
            <div className="rounded-2xl bg-[var(--field)] p-4 text-center">
              <p className="text-2xl font-black tracking-widest">{modal.receipt.code}</p>
              <p className="mt-1 text-sm text-[var(--soft)]">{modal.receipt.total}</p>
            </div>
            <button type="button" onClick={() => setModal(null)} className={btnCls}>Готово</button>
          </div>
        </Modal>
      )}
    </PublicPageShell>
  );
}
