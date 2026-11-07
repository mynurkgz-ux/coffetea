import React, { useEffect, useRef, useState } from 'react';
import { FiGlobe } from 'react-icons/fi';

export function LanguageSwitcher(){
  const [open,setOpen]=useState(false);
  const [language,setLanguage]=useState(()=>localStorage.getItem('coffetea-language')||'RU');
  const rootRef=useRef(null);
  const languages=[
    {code:'KG',label:'Кыргызча'},
    {code:'RU',label:'Русский'},
    {code:'ENG',label:'English'}
  ];

  useEffect(()=>{
    const savedLanguage=localStorage.getItem('coffetea-language')||'RU';
    document.documentElement.lang=savedLanguage==='ENG'?'en':savedLanguage==='KG'?'ky':'ru';
  },[]);

  useEffect(()=>{
    function closeOnOutsideClick(event){
      if(rootRef.current&&!rootRef.current.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event){
      if(event.key==='Escape') setOpen(false);
    }
    document.addEventListener('pointerdown',closeOnOutsideClick);
    document.addEventListener('keydown',closeOnEscape);
    return ()=>{
      document.removeEventListener('pointerdown',closeOnOutsideClick);
      document.removeEventListener('keydown',closeOnEscape);
    };
  },[]);

  function chooseLanguage(code){
    setLanguage(code);
    localStorage.setItem('coffetea-language',code);
    document.documentElement.lang=code==='ENG'?'en':code==='KG'?'ky':'ru';
    window.dispatchEvent(new CustomEvent('coffetea-language-change',{detail:{language:code}}));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="fixed right-4 top-1/2 z-[50] -translate-y-1/2 sm:right-6">
      {open&&(
        <div className="absolute right-[58px] top-1/2 w-36 -translate-y-1/2 rounded-2xl border border-black/10 bg-white p-1.5 shadow-2xl shadow-black/20">
          {languages.map(item=>(
            <button
              key={item.code}
              type="button"
              onClick={()=>chooseLanguage(item.code)}
              aria-pressed={language===item.code}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-extrabold transition ${
                language===item.code
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[#30251f] hover:bg-[var(--field)]'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-75">{item.code}</span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={()=>setOpen(value=>!value)}
        aria-label="Выбрать язык"
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/30 ring-4 ring-white/80 transition hover:scale-105 active:scale-95"
      >
        <FiGlobe aria-hidden="true" size={25}/>
      </button>
    </div>
  );
}

export function Field({label,children}){
  return <label className="block mb-3"><span className="block text-sm font-bold mb-1">{label}</span>{children}</label>;
}
// Modal — всплывающее окно поверх экрана: тёмная подложка + белая
// карточка с заголовком, крестиком и содержимым ({children}).
// Снизу на телефоне, по центру на широких экранах (см. классы sm:items-center).
// Закрывается тремя способами: кнопка-крестик, клик по тёмной подложке
// (но не по самой карточке — проверка e.target===e.currentTarget),
// и клавиша Esc (эффект ниже вешает слушатель на document).
export function Modal({title,onClose,children}){
  useEffect(()=>{
    function onKey(e){if(e.key==='Escape')onClose();}
    document.addEventListener('keydown',onKey);
    return ()=>document.removeEventListener('keydown',onKey);
  },[onClose]);
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="w-full sm:w-[420px] max-h-[90vh] overflow-y-auto bg-white text-black rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4 gap-3">
          <h2 className="font-extrabold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Закрыть" className="w-9 h-9 shrink-0 rounded-full bg-[var(--field)] text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
// Toast — короткое всплывающее сообщение внизу экрана ("Товар добавлен"
// и т.п.). App хранит текст текущего сообщения и через пару секунд
// сам его убирает (см. функцию toast() внутри App).
export function Toast({msg}){
  if(!msg) return null;
  return <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white font-bold px-4 py-3 rounded-full z-40 text-sm max-w-[90%] text-center">{msg}</div>;
}

// Bubbles — те самые фоновые пузыри. Рисуются один раз при первом
// показе (useMemo с пустым списком зависимостей [] — пересчёта не будет)
// с помощью маленького самодельного генератора случайных чисел (чтобы
// пузыри не "прыгали" при каждой перерисовке компонента).
// У каждого пузыря: размер, положение, цвет (подобран из цветов текущей
// темы — var(--accent)/var(--bgFrom)/var(--bgTo)) и своя длительность
// анимации. Сама анимация (@keyframes drift) описана в style.css.
// pointer-events-none — чтобы пузыри не мешали нажимать на кнопки под ними.
export function Bubbles(){
  const bubbles=React.useMemo(()=>{
    let s=11; const r=()=>((s=s*16807%2147483647)/2147483647);
    const vars=[
      ['var(--accent)','var(--bgTo)'],
      ['var(--bgFrom)','var(--accent)'],
      ['rgba(255,255,255,.65)','var(--bgFrom)']
    ];
    return Array.from({length:16},(_,i)=>{
      const size=Math.round(26+Math.pow(r(),2.2)*220);
      const [c1,c2]=vars[i%3];
      return {
        id:i,size,
        left:(r()*108-4).toFixed(1)+'%', top:(r()*108-4).toFixed(1)+'%',
        dx:(r()*60-30).toFixed(0)+'px', dy:(r()*80-40).toFixed(0)+'px',
        dur:(16+r()*18).toFixed(1)+'s', delay:'-'+(r()*20).toFixed(1)+'s',
        bg:`radial-gradient(circle at 32% 28%, rgba(255,255,255,.75) 0 6%, transparent 7%), radial-gradient(circle at 36% 34%, ${c1}, ${c2} 72%)`
      };
    });
  },[]);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {bubbles.map(b=>(
        <span key={b.id} className="bubble" style={{width:b.size,height:b.size,left:b.left,top:b.top,background:b.bg,
          '--dx':b.dx,'--dy':b.dy,animationDuration:b.dur,animationDelay:b.delay}}/>
      ))}
    </div>
  );
}
// ===== Экран приветствия, регистрации и входа =====
// Welcome показывается, когда никто не вошёл в аккаунт (db.session пуст).
// Сам процесс регистрации/входа — это пошаговая форма: вся её временная
// информация (на каком мы шаге, что ввёл человек, текст ошибки) живёт
// в одном состоянии `a` (от "auth"). a===null — окно регистрации закрыто.
// Шаги (a.step): 'role' -> 'contact' -> 'code' -> дальше по роли:
//   владелец -> 'business' (ввести название заведения)
//   остальные -> 'link' (ввести код, который дал владелец)
