export function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
// 6-значный код подтверждения (как бы приходит на почту/в мессенджер).
// В демо-режиме мы его просто показываем на экране, а не отправляем по-настоящему.
// 6-символьный код заведения (для покупателей, администратора, кассира) —
// буквы и цифры, без похожих друг на друга символов (0/O, 1/I и т.п. не используются).
export function genCode(){const A='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';let s='';for(let i=0;i<6;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
export function genStaffCode(){
  const bytes=new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('').toUpperCase();
}
export function rolePath(role){
  if(role==='owner') return '/owner';
  if(role==='admin') return '/admin';
  if(role==='cashier') return '/admin/orders';
  if(role==='buyer') return '/account';
  return '/';
}
export function usernameForAccount(role,userId,isGlobalAdmin=false){
  if(isGlobalAdmin)return 'admin';
  if(!['admin','buyer'].includes(role))return '';
  let hash=14695981039346656037n;
  for(const character of String(userId||'')){
    hash^=BigInt(character.charCodeAt(0));
    hash=BigInt.asUintN(64,hash*1099511628211n);
  }
  const suffix=hash.toString(10);
  return `${role==='buyer'?'userb':'admin'}${suffix}`;
}
export function authEmailForLogin(login){
  const value=String(login||'').trim().toLowerCase();
  if(value.includes('@'))return value;
  if(!/^(admin|userb[0-9]{4,}|admin[0-9]{4,})$/.test(value)){
    throw new Error('Введите Gmail или логин CoffeTea.');
  }
  return `${value}@users.coffetea.app`;
}
export function usernameFromAuthEmail(email){
  const match=String(email||'').toLowerCase().match(/^((?:admin|userb[0-9]{4,}|admin[0-9]{4,}))@users\.coffetea\.app$/);
  return match?.[1]||'';
}
// Красиво отформатировать цену: 1234.5 -> "1 234,5 сом".
export function money(n,c){return Number(n).toLocaleString('ru-RU',{maximumFractionDigits:2})+'\u00A0'+c;}
// Цена товара с учётом скидки, округлённая до копеек.
export function finalPrice(p){return Math.round(p.price*(100-(p.discount||0)))/100;}
export function uniqueMenuProducts(products){
  const seen=new Set();
  return products.filter(product=>{
    const key=JSON.stringify([
      String(product.name||'').trim().toLocaleLowerCase(),
      String(product.info||'').trim(),
      Number(product.price),
      Number(product.discount||0),
      product.currency||'сом',
      product.img||''
    ]);
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}
// Привести код заведения к единому виду перед сравнением:
// убрать пробелы и перевести в верхний регистр ("k7f3 qz" -> "K7F3QZ").
export function normCode(v){return String(v||'').replace(/\s+/g,'').toUpperCase();}
// Сжать загруженную картинку перед сохранением (фото товара, обои, QR-код).
// Изображения остаются data URL, поэтому их нужно уменьшать до записи
// в документ Firestore.
// Возвращает Promise с уменьшенной картинкой в виде data:-ссылки.
export function shrink(file,max){
  max=max||760;
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onerror=()=>rej(new Error('read'));
    fr.onload=()=>{
      const im=new Image();
      im.onerror=()=>rej(new Error('img'));
      im.onload=()=>{
        const k=Math.min(1,max/Math.max(im.width,im.height));
        const c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(im.width*k)); c.height=Math.max(1,Math.round(im.height*k));
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        res(c.toDataURL('image/jpeg',.82));
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}
