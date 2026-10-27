// Валюты, которые можно выбрать в форме товара.
export const CURR=['сом','₽','$','€'];

export const MENU_CATEGORIES=[
  'Напитки',
  'Кофе и чай',
  'Торты и десерты',
  'Шашлыки',
  'Мясо',
  'Закуски',
  'Салаты',
  'Завтраки',
  'Гарниры',
  'Уникальное',
  'Другое'
];

// Набор тем оформления. Каждая тема — это просто набор цветов.
// Цвета не "зашиты" в классы Tailwind напрямую — вместо этого в разметке
// используются CSS-переменные вроде bg-[var(--accent)], а applyTheme() ниже
// подставляет в эти переменные конкретные значения текущей темы.
export const THEMES=[
  {key:'orange',name:'Апельсин',accent:'#f97316',field:'#fff7ed',field2:'#ffedd5',border:'#fed7aa',soft:'#c2410c',soft2:'#fb923c',bgFrom:'#fb923c',bgTo:'#ea580c'},
  {key:'gray',name:'Светло-серая',accent:'#52525b',field:'#f4f4f5',field2:'#e4e4e7',border:'#d4d4d8',soft:'#52525b',soft2:'#a1a1aa',bgFrom:'#a1a1aa',bgTo:'#52525b'},
  {key:'mint',name:'Мята',accent:'#10b981',field:'#ecfdf5',field2:'#d1fae5',border:'#a7f3d0',soft:'#047857',soft2:'#34d399',bgFrom:'#34d399',bgTo:'#059669'},
  {key:'berry',name:'Малина',accent:'#ec4899',field:'#fdf2f8',field2:'#fce7f3',border:'#fbcfe8',soft:'#be185d',soft2:'#f472b6',bgFrom:'#f472b6',bgTo:'#db2777'},
  {key:'ocean',name:'Океан',accent:'#0ea5e9',field:'#f0f9ff',field2:'#e0f2fe',border:'#bae6fd',soft:'#0369a1',soft2:'#38bdf8',bgFrom:'#38bdf8',bgTo:'#0284c7'},
  {key:'violet',name:'Лаванда',accent:'#8b5cf6',field:'#f5f3ff',field2:'#ede9fe',border:'#ddd6fe',soft:'#6d28d9',soft2:'#a78bfa',bgFrom:'#a78bfa',bgTo:'#7c3aed'},
  {key:'lemon',name:'Лимон',accent:'#f59e0b',field:'#fffbeb',field2:'#fef3c7',border:'#fde68a',soft:'#b45309',soft2:'#fbbf24',bgFrom:'#fbbf24',bgTo:'#d97706'},
  {key:'newyear',name:'Новогодняя',accent:'#dc2626',field:'#eef2ff',field2:'#e0e7ff',border:'#c7d2fe',soft:'#3730a3',soft2:'#f87171',bgFrom:'#1e3a8a',bgTo:'#0c1445'}
];
// Применить тему: находит тему по ключу и прописывает её цвета
// в CSS-переменные на <html> (document.documentElement). После этого
// все элементы, использующие var(--accent) и так далее, перекрашиваются
// сами — без перерисовки React-компонентов.
export function applyTheme(key){
  const t=THEMES.find(x=>x.key===key)||THEMES[0];
  const r=document.documentElement.style;
  r.setProperty('--accent',t.accent); r.setProperty('--field',t.field); r.setProperty('--field2',t.field2);
  r.setProperty('--border',t.border); r.setProperty('--soft',t.soft); r.setProperty('--soft2',t.soft2);
  r.setProperty('--bgFrom',t.bgFrom); r.setProperty('--bgTo',t.bgTo);
}

// ===== Мелкие функции-помощники (используются во многих местах) =====

// Случайный идентификатор для новых пользователей, товаров и заказов.
