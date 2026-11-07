import React from 'react';
import { useLanguage } from '../../shared/ui/index.jsx';

const CATEGORY_TRANSLATIONS = {
  'Напитки': { KG: 'Суусундуктар', ENG: 'Drinks' },
  'Кофе и чай': { KG: 'Кофе жана чай', ENG: 'Coffee and tea' },
  'Торты и десерты': { KG: 'Торттор жана десерттер', ENG: 'Cakes and desserts' },
  'Шашлыки': { KG: 'Шашлык', ENG: 'Grilled meat' },
  'Мясо': { KG: 'Эт', ENG: 'Meat' },
  'Закуски': { KG: 'Тамактануулар', ENG: 'Appetizers' },
  'Салаты': { KG: 'Салаттар', ENG: 'Salads' },
  'Завтраки': { KG: 'Эртеңки тамак', ENG: 'Breakfast' },
  'Гарниры': { KG: 'Гарнирлер', ENG: 'Side dishes' },
  'Уникальное': { KG: 'Өзгөчө', ENG: 'Unique' },
  'Другое': { KG: 'Башка', ENG: 'Other' },
  'Без категории': { KG: 'Категориясыз', ENG: 'No category' }
};

const chipCls = active => `rounded-full border px-4 py-2 text-sm font-bold transition ${active
  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
  : 'border-[var(--border)] bg-white text-[#67736a] hover:border-[var(--accent)]'}`;

// Кнопки-категории и галочка «Со скидкой» над каталогом.
export function CategoryFilter({ categories, selected, onSelect, discountedOnly, onDiscountedChange }) {
  const { language, t } = useLanguage();
  const translate = category => CATEGORY_TRANSLATIONS[category]?.[language] || category;
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={t('categoryFilter')}>
      <button type="button" onClick={() => onSelect('')} aria-pressed={!selected} className={chipCls(!selected)}>{t('all')}</button>
      {categories.map(category => (
        <button key={category} type="button" onClick={() => onSelect(category)} aria-pressed={selected === category} className={chipCls(selected === category)}>
          {translate(category)}
        </button>
      ))}
      <label className="flex min-h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold">
        <input type="checkbox" checked={discountedOnly} onChange={event => onDiscountedChange(event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
        {t('discount')}
      </label>
    </div>
  );
}
