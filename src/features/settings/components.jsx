import React, { useEffect, useState } from 'react';
import { Field, Modal } from '../../shared/ui/index.jsx';
import { btnCls, btnGhost, inputCls } from '../../shared/ui/styles.js';
import { THEMES } from '../../shared/config.js';
import { genCode, genStaffCode, shrink } from '../../shared/lib/utils.js';

export function ThemeModal({theme,setTheme,onClose,title='Изменить тему'}){
  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map(t=>(
          <button key={t.key} onClick={()=>setTheme(t.key)} className={"rounded-2xl border-2 p-2 text-xs font-bold "+(theme===t.key?'border-black':'border-[var(--border)]')}>
            <span className="block h-10 rounded-xl mb-2" style={{background:`linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})`}}/>
            {t.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}

const PUBLIC_ANIMATIONS=[
  {key:'float',name:'Плавающий',description:'Пузыри мягко перемещаются по экрану.'},
  {key:'soda',name:'Газировка',description:'Пузыри поднимаются вверх, как в газировке.'},
  {key:'pulse',name:'Пульс',description:'Пузыри плавно увеличиваются и уменьшаются.'},
  {key:'stars',name:'Звёздный хлопок',description:'Пузыри лопаются и вспыхивают маленькими звёздами.'},
  {key:'snow',name:'Снегопад',description:'Мягкие снежинки медленно падают сверху.'},
  {key:'none',name:'Без анимации',description:'На главной странице нет движущихся частиц.'}
];

export function PublicHomeSettingsModal({theme,animation='soda',onSave,onClose}){
  const [selectedTheme,setSelectedTheme]=useState(theme);
  const [selectedAnimation,setSelectedAnimation]=useState(animation);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  async function save(){
    setSaving(true);
    setError('');
    try{
      const saved=await onSave(selectedTheme,selectedAnimation);
      if(saved)onClose();
      else setError('Не удалось сохранить настройки. Проверьте доступ к Firestore и попробуйте снова.');
    }catch(cause){
      setError(cause.message||'Не удалось сохранить настройки. Попробуйте снова.');
    }finally{
      setSaving(false);
    }
  }

  return (
    <Modal title="Настройки главной страницы" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--soft)]">Каталог главной страницы включает товары всех кафе.</p>
        <div>
          <p className="mb-2 text-sm font-bold">Цветовая тема главной</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(item=>(
              <button key={item.key} type="button" onClick={()=>setSelectedTheme(item.key)} aria-pressed={selectedTheme===item.key} className={"rounded-2xl border-2 p-2 text-xs font-bold "+(selectedTheme===item.key?'border-black':'border-[var(--border)]')}>
                <span className="mb-2 block h-10 rounded-xl" style={{background:`linear-gradient(135deg, ${item.bgFrom}, ${item.bgTo})`}}/>
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">Фоновая анимация главной</p>
          <div className="space-y-2">
            {PUBLIC_ANIMATIONS.map(item=>(
              <button key={item.key} type="button" onClick={()=>setSelectedAnimation(item.key)} aria-pressed={selectedAnimation===item.key} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${selectedAnimation===item.key?'border-[var(--accent)] bg-[var(--field)]':'border-[var(--border)] hover:bg-[var(--field)]'}`}>
                <span className={`animation-preview animation-preview-${item.key}`} aria-hidden="true">
                  {item.key==='stars'?'✦':item.key==='snow'?'❄':<><i/><i/><i/></>}
                </span>
                <span>
                  <span className="block text-sm font-bold">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-[var(--soft)]">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold leading-5 text-red-700">{error}</p>}
        <button type="button" onClick={save} disabled={saving} className={btnCls+" mt-2 disabled:cursor-wait disabled:opacity-60"}>
          {saving?'Сохраняем…':'Выбрать'}
        </button>
      </div>
    </Modal>
  );
}
// Окно загрузки своих обоев (фон меню вместо пузырей). Доступно только
// владельцу. update(...) — это функция из App, которая меняет общую базу
// db и сохраняет изменения в Firestore.
export function WallpaperModal({owner,update,onClose,toast}){
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    shrink(f,1400).then(d=>{update(db=>{db.users.find(u=>u.id===owner.id).wallpaper=d;});toast('Обои сохранены');}).catch(()=>toast('Не удалось открыть файл'));
  }
  function clear(){update(db=>{delete db.users.find(u=>u.id===owner.id).wallpaper;});toast('Обои убраны');}
  return (
    <Modal title="Обои" onClose={onClose}>
      <div className="space-y-3">
        <div className="aspect-video rounded-xl bg-[var(--field)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
          {owner.wallpaper?<img src={owner.wallpaper} className="w-full h-full object-cover"/>:<span className="text-[var(--soft2)] text-sm">Обои не добавлены</span>}
        </div>
        <p className="text-sm text-[var(--soft)]">Загрузите картинку — она станет фоном меню у вас и у покупателей вместо обычного цвета.</p>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" id="wf"/>
        <label htmlFor="wf" className={btnCls+" inline-flex items-center justify-center cursor-pointer"}>{owner.wallpaper?'Заменить обои':'Загрузить обои'}</label>
        {owner.wallpaper&&<button onClick={clear} className="w-full h-11 rounded-full border-2 border-red-200 text-red-600 font-bold">Убрать</button>}
      </div>
    </Modal>
  );
}
// Окно загрузки фоновой музыки. Файл проверяем на тип (должен быть
// аудио) и размер (до 4 МБ). Саму музыку
// не запускаем — только сохраняем; играть она начнёт, когда кто-то сам
// нажмёт на значок ноты (см. MusicBtn и App.toggleMusic).
export function MusicModal({owner,update,onClose,toast}){
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    if(!/^audio\//.test(f.type)){toast('Выберите аудиофайл, например MP3');return;}
    if(f.size>4*1024*1024){toast('Файл слишком большой. До 4 МБ.');return;}
    const fr=new FileReader();
    fr.onerror=()=>toast('Не удалось открыть файл');
    fr.onload=()=>{update(db=>{const u=db.users.find(u=>u.id===owner.id);u.music=fr.result;u.musicName=f.name;});toast('Музыка сохранена');};
    fr.readAsDataURL(f);
  }
  function clear(){update(db=>{const u=db.users.find(u=>u.id===owner.id);delete u.music;delete u.musicName;});toast('Музыка убрана');}
  return (
    <Modal title="Фоновая музыка" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-[var(--soft)]">{owner.music?'Играет в вашем меню, но начнётся только когда кто-то сам нажмёт на значок ноты вверху экрана.':'Пока музыки нет — в меню будет тихо, пока вы её не добавите.'}</p>
        {owner.music&&<div className="rounded-xl bg-[var(--field)] p-3 text-sm font-bold">{owner.musicName||'Аудиофайл'}</div>}
        <input type="file" accept="audio/*" onChange={onFile} className="hidden" id="mf"/>
        <label htmlFor="mf" className={btnCls+" inline-flex items-center justify-center cursor-pointer"}>{owner.music?'Заменить файл':'Загрузить файл'}</label>
        {owner.music&&<button onClick={clear} className="w-full h-11 rounded-full border-2 border-red-200 text-red-600 font-bold">Убрать</button>}
      </div>
    </Modal>
  );
}
// Окно "Настройки" — общее для владельца, администратора, кассира
// и покупателя, но наполнение разное:
//  - isOwner: можно переименовать заведение и увидеть/обновить коды
//    (для покупателей и для администратора с кассиром)
//  - "Добавить" (обои, музыка) — тоже только у владельца
//  - "Изменить тему" — видят все, тема общая на устройство
// sub хранит, какое под-окно сейчас открыто ('theme'/'wallpaper'/'music'),
// null — открыто только само окно настроек.
export function SettingsModal({isOwner,owner,me,update,onClose,onLogout,toast,theme,setTheme,publicTheme,savePublicSiteAppearance,publicAnimation='soda'}){
  const [sub,setSub]=useState(null);
  function saveBiz(e){
    e.preventDefault();
    const n=e.target.biz.value.trim(); if(!n) return;
    update(d=>{d.users.find(u=>u.id===owner.id).business=n.slice(0,60);});
    toast('Сохранено');
  }
  function regen(field){update(d=>{d.users.find(u=>u.id===owner.id)[field]=field==='joinCode'?genCode():genStaffCode();});}
  return (
    <Modal title="Настройки" onClose={onClose}>
      <div className="space-y-5">
        {isOwner&&<form onSubmit={saveBiz} className="space-y-2">
          <Field label="Название заведения"><input name="biz" defaultValue={owner.business} className={inputCls}/></Field>
          <button className={btnGhost}>Сохранить</button>
        </form>}
        {isOwner&&<div className="space-y-2">
          <p className="font-bold text-sm">Код для покупателей</p>
          <div className="flex gap-2 items-center">
            <output className="flex-1 h-11 rounded-xl bg-[var(--field)] border-2 border-[var(--border)] flex items-center justify-center font-bold tracking-widest">{owner.joinCode}</output>
            <button onClick={()=>regen('joinCode')} className="h-11 px-3 rounded-xl border-2 border-[var(--border)] text-sm font-bold">Новый</button>
          </div>
          <p className="font-bold text-sm mt-3">Одноразовый код администратора</p>
          <div className="flex gap-2 items-center">
            <output className="flex-1 h-11 rounded-xl bg-[var(--field)] border-2 border-[var(--border)] flex items-center justify-center font-bold tracking-widest">{owner.adminCode||'Не создан'}</output>
            <button onClick={()=>regen('adminCode')} className="h-11 px-3 rounded-xl border-2 border-[var(--border)] text-sm font-bold">Создать</button>
          </div>
          <p className="font-bold text-sm mt-3">Одноразовый код кассира</p>
          <div className="flex gap-2 items-center">
            <output className="flex-1 h-11 rounded-xl bg-[var(--field)] border-2 border-[var(--border)] flex items-center justify-center font-bold tracking-widest">{owner.staffCode}</output>
            <button onClick={()=>regen('staffCode')} className="h-11 px-3 rounded-xl border-2 border-[var(--border)] text-sm font-bold">Создать</button>
          </div>
          <p className="text-xs text-[var(--soft)]">Каждый код можно использовать один раз. Создавайте новый код для каждого сотрудника нужной роли.</p>
        </div>}
        <div className="space-y-2">
          <p className="font-bold text-sm">Оформление</p>
          <button onClick={()=>setSub('theme')} className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-[var(--border)] text-left">
            <span className="w-8 h-8 rounded-full shrink-0" style={{background:`linear-gradient(135deg, var(--bgFrom), var(--bgTo))`}}/>
            <span className="flex-1 font-bold text-sm">Изменить тему</span>
          </button>
          {me.siteAdmin&&<button onClick={()=>setSub('publicTheme')} className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-[var(--border)] text-left">
            <span className="w-8 h-8 rounded-full shrink-0" style={{background:`linear-gradient(135deg, var(--bgFrom), var(--bgTo))`}}/>
            <span className="flex-1">
              <b className="block text-sm">Главная сайта</b>
              <span className="text-xs text-[var(--soft)]">Цвет и анимация главной страницы</span>
            </span>
          </button>}
        </div>
        {isOwner&&<div className="space-y-2">
          <p className="font-bold text-sm">Добавить</p>
          <button onClick={()=>setSub('wallpaper')} className="w-full p-3 rounded-xl border-2 border-[var(--border)] text-left font-bold text-sm">Обои{owner.wallpaper?' · добавлены':''}</button>
          <button onClick={()=>setSub('music')} className="w-full p-3 rounded-xl border-2 border-[var(--border)] text-left font-bold text-sm">Фоновая музыка{owner.music?' · добавлена':''}</button>
        </div>}
        <div>
          <p className="text-sm text-[var(--soft)] mb-2">{isOwner?'Владелец':me.role==='admin'?'Администратор':'Сотрудник'} · {me.contact}</p>
          <button onClick={onLogout} className={btnGhost}>Выйти</button>
        </div>
        {sub==='theme'&&<ThemeModal theme={theme} setTheme={setTheme} onClose={()=>setSub(null)}/>}
        {sub==='publicTheme'&&me.siteAdmin&&<PublicHomeSettingsModal theme={publicTheme} animation={publicAnimation} onSave={savePublicSiteAppearance} onClose={()=>setSub(null)}/>}
        {sub==='wallpaper'&&isOwner&&<WallpaperModal owner={owner} update={update} onClose={()=>setSub(null)} toast={toast}/>}
        {sub==='music'&&isOwner&&<MusicModal owner={owner} update={update} onClose={()=>setSub(null)} toast={toast}/>}
      </div>
    </Modal>
  );
}
// Окно загрузки QR-кода для оплаты (например, из банковского приложения).
// Покупатель увидит этот QR на экране оплаты после нажатия «Купить».
export function QrModal({owner,update,onClose,toast}){
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    shrink(f,700).then(d=>{update(db=>{db.users.find(u=>u.id===owner.id).qr=d;});toast('QR-код сохранён');}).catch(()=>toast('Не удалось открыть файл'));
  }
  return (
    <Modal title="QR-код для оплаты" onClose={onClose}>
      <div className="space-y-3">
        <div className="aspect-square rounded-xl bg-[var(--field)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
          {owner.qr?<img src={owner.qr} className="w-full h-full object-contain"/>:<span className="text-[var(--soft2)] text-sm">QR не добавлен</span>}
        </div>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" id="qrf"/>
        <label htmlFor="qrf" className={btnCls+" inline-flex items-center justify-center cursor-pointer"}>{owner.qr?'Заменить QR-код':'Загрузить QR-код'}</label>
      </div>
    </Modal>
  );
}

// Кнопка-нота в шапке: включает/выключает фоновую музыку заведения.
// Если у заведения нет музыки (musicCtl.active===false) — кнопки вообще
// нет (возвращаем null, React ничего не рисует). Когда музыка играет,
// кнопка подсвечивается белым фоном с цветом акцента — чтобы было видно,
// что она сейчас включена.
export function MusicBtn({musicCtl}){
  if(!musicCtl||!musicCtl.active) return null;
  return <button onClick={musicCtl.toggle} className={"h-10 px-3 rounded-full font-bold text-sm "+(musicCtl.playing?'bg-white text-[var(--accent)]':'bg-white/20 text-white')}>♪</button>;
}

// ===== Экран владельца и администратора =====
// Это один и тот же компонент для обеих ролей: разница только в правах,
// которые определяются один раз через isOwner.
