import React, { useState } from 'react';
import { Field, Modal } from '../../shared/ui/index.jsx';
import { btnCls, btnGhost, inputCls } from '../../shared/ui/styles.js';
import { CURR } from '../../shared/config.js';
import { finalPrice, money, shrink } from '../../shared/lib/utils.js';

export function ProductCard({p,onClick}){
  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl overflow-hidden shadow">
      <div className="aspect-[4/3] bg-[var(--field2)] relative">
        {p.img?<img src={p.img} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-[var(--soft2)]">{(p.name[0]||'?').toUpperCase()}</div>}
        {p.discount>0&&<span className="absolute top-2 left-2 bg-black text-amber-300 text-xs font-bold px-2 py-1 rounded-full">-{p.discount}%</span>}
      </div>
      <div className="p-3">
        <p className="font-bold truncate">{p.name}</p>
        {p.info&&<p className="text-xs text-[var(--soft)] truncate">{p.info}</p>}
        <p className="mt-1 font-bold">
          {p.discount>0?<>{money(finalPrice(p),p.currency)} <s className="text-[var(--soft2)] font-normal ml-1">{money(p.price,p.currency)}</s></>:money(p.price,p.currency)}
        </p>
      </div>
    </button>
  );
}
// Форма товара — одна и та же и для "Новый товар", и для "Изменить товар"
// (если передан product — значит редактируем существующий).
// img — фото храним в своём отдельном состоянии, а не только внутри формы,
// потому что оно меняется асинхронно (пока картинка сжимается в shrink()).
export function ProductForm({product,onSave,onDelete,onClose}){
  const [img,setImg]=useState(product?product.img:'');
  const [armDel,setArmDel]=useState(false);
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    shrink(f,700).then(setImg).catch(()=>alert('Не удалось открыть файл'));
  }
  function submit(e){
    e.preventDefault();
    const f=e.target;
    const name=f.name.value.trim(); const price=parseFloat(f.price.value.replace(',','.'));
    if(!name||!(price>0)) return;
    onSave({name,info:f.info.value.trim(),price,currency:f.currency.value,discount:Math.min(90,Math.max(0,parseInt(f.discount.value||'0',10)||0)),img});
  }
  return (
    <Modal title={product?'Изменить товар':'Новый товар'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="aspect-[4/3] rounded-xl bg-[var(--field)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
          {img?<img src={img} className="w-full h-full object-cover"/>:<span className="text-[var(--soft2)] text-sm">Фото товара</span>}
        </div>
        <input type="file" accept="image/*" onChange={onFile} className="hidden" id="pimg"/>
        <label htmlFor="pimg" className={btnGhost+" inline-flex items-center justify-center cursor-pointer"}>{img?'Заменить фото':'Выбрать фото'}</label>
        <Field label="Название"><input name="name" defaultValue={product?product.name:''} className={inputCls}/></Field>
        <Field label="Кратко"><input name="info" defaultValue={product?product.info:''} className={inputCls}/></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Цена"><input name="price" defaultValue={product?product.price:''} inputMode="decimal" className={inputCls}/></Field>
          <Field label="Валюта"><select name="currency" defaultValue={product?product.currency:'сом'} className={inputCls}>{CURR.map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <Field label="Скидка, %"><input name="discount" defaultValue={product?product.discount||0:0} inputMode="numeric" className={inputCls}/></Field>
        <button className={btnCls}>Сохранить</button>
        {product&&<button type="button" onClick={()=>{if(!armDel){setArmDel(true);return;}onDelete();}} className="w-full h-11 rounded-full border-2 border-red-200 text-red-600 font-bold">{armDel?'Точно удалить?':'Удалить'}</button>}
      </form>
    </Modal>
  );
}
// ===== Карточка заказа (видят владелец, администратор и кассир) =====
// Показывает состав заказа, сумму, когда и кем он оформлен, и кнопку
// подтвердить/отменить подтверждение оплаты.
