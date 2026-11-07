import React from 'react';
import { finalPrice, money } from '../../shared/lib/utils.js';
import { useLanguage } from '../../shared/ui/index.jsx';
import { QuantityStepper } from '../../shared/ui/QuantityStepper.jsx';

// Карточка товара в публичном каталоге.
export function CatalogProductCard({ product, quantity, onChange }) {
  const { t } = useLanguage();
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
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
        <QuantityStepper
          className="mt-4"
          quantity={quantity}
          onDecrease={() => onChange(product, -1)}
          onIncrease={() => onChange(product, 1)}
          decreaseLabel={`${t('removeProduct')} ${product.name}`}
          increaseLabel={`${t('addProduct')} ${product.name}`}
        />
      </div>
    </article>
  );
}
