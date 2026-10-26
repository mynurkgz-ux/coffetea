import React, { useEffect, useRef, useState } from 'react';
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { Field, Modal } from '../../shared/ui/index.jsx';
import { btnCls, inputCls } from '../../shared/ui/styles.js';
import { genCode, genStaffCode, normCode, uid } from '../../shared/lib/utils.js';
import { auth } from '../../shared/data/firebase.js';
import { findVenueByCode, getUserProfile } from '../../shared/data/firestoreStore.js';

const EMAIL_LINK_KEY='coffetea_email_link_email';
const EMAIL_FLOW_KEY='coffetea_email_link_flow';

export function Welcome({db,toast,finish}){
  const [a,setA]=useState(null);
  const [intro,setIntro]=useState('visible');
  const handlingLink=useRef(false);
  useEffect(()=>{
    const leaveTimer=window.setTimeout(()=>setIntro('leaving'),2200);
    const finishTimer=window.setTimeout(()=>setIntro('hidden'),2800);
    return ()=>{
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  },[]);
  function startRegister(){setA({mode:'register',step:'role',role:null,contact:'',err:''});}
  function startLogin(){setA({mode:'login',step:'contact',role:null,contact:'',err:''});}
  function pickRole(role){setA(s=>({...s,role,step:s.firebaseUid?(role==='owner'?'business':'link'):'contact'}));}

  async function completeEmailLink(email){
    if(!auth){setA(s=>({...s,loading:false,err:'Firebase не настроен. Проверьте файл .env.local.'}));return;}
    setA(s=>({...s,contact:email,step:'completeLink',loading:true,err:''}));
    try{
      const credential=await signInWithEmailLink(auth,email,window.location.href);
      let flow=null;
      try{flow=JSON.parse(localStorage.getItem(EMAIL_FLOW_KEY)||'null');}catch(error){flow=null;}
      localStorage.removeItem(EMAIL_LINK_KEY);
      localStorage.removeItem(EMAIL_FLOW_KEY);
      window.history.replaceState({},document.title,window.location.pathname);

      const existing=await getUserProfile(credential.user.uid);
      if(existing){await finish(existing);setA(null);return;}

      const savedFlow=flow?.email===email&&flow.expiresAt>Date.now()?flow:null;
      if(savedFlow?.mode==='login'){
        setA({mode:'register',role:null,contact:email,firebaseUid:credential.user.uid,step:'role',err:'Аккаунт Coffetea не найден. Выберите роль для регистрации.',loading:false});
        return;
      }
      setA({
        mode:'register',
        role:savedFlow?.role||null,
        contact:email,
        firebaseUid:credential.user.uid,
        step:savedFlow?.role?(savedFlow.role==='owner'?'business':'link'):'role',
        err:savedFlow?'' :'Email подтверждён. Выберите роль, чтобы завершить создание профиля на этом устройстве.',
        loading:false
      });
    }catch(error){
      setA(s=>({...s,loading:false,err:error.code==='auth/expired-action-code'||error.code==='auth/invalid-action-code'
        ?'Ссылка недействительна или уже использована. Запросите новую.'
        :error.message||'Не удалось подтвердить email. Попробуйте запросить новую ссылку.'}));
    }
  }

  useEffect(()=>{
    if(!auth||!isSignInWithEmailLink(auth,window.location.href)||handlingLink.current)return;
    handlingLink.current=true;
    let email='';
    try{email=localStorage.getItem(EMAIL_LINK_KEY)||'';}catch(error){email='';}
    if(email){
      void completeEmailLink(email);
    }else{
      setA({mode:'login',step:'completeLink',contact:'',loading:false,err:''});
    }
  },[]);

  async function sendEmailLink(email,mode,role){
    if(!auth)throw new Error('Firebase не настроен. Проверьте файл .env.local.');
    const flow={email,mode,role,expiresAt:Date.now()+60*60*1000};
    localStorage.setItem(EMAIL_LINK_KEY,email);
    localStorage.setItem(EMAIL_FLOW_KEY,JSON.stringify(flow));
    try{
      await sendSignInLinkToEmail(auth,email,{
        url:`${window.location.origin}/login`,
        handleCodeInApp:true
      });
    }catch(error){
      localStorage.removeItem(EMAIL_LINK_KEY);
      localStorage.removeItem(EMAIL_FLOW_KEY);
      throw error;
    }
  }

  async function submitContact(e){
    e.preventDefault();
    const raw=e.target.contact.value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw)){setA(s=>({...s,err:'Введите почту вида name@mail.com'}));return;}
    setA(s=>({...s,contact:raw,loading:true,err:''}));
    try{
      await sendEmailLink(raw,a.mode,a.role);
      setA(s=>({...s,loading:false,step:'sent',err:''}));
    }catch(error){
      setA(s=>({...s,loading:false,err:error.message||'Не удалось отправить письмо. Проверьте настройки Firebase.'}));
    }
  }
  async function submitLinkEmail(e){
    e.preventDefault();
    const email=e.target.contact.value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){setA(s=>({...s,err:'Введите почту, на которую пришла ссылка'}));return;}
    await completeEmailLink(email);
  }
  async function submitBusiness(e){
    e.preventDefault();
    const n=e.target.biz.value.trim();
    if(!n){setA(s=>({...s,err:'Введите название заведения'}));return;}
    try{
      await finish({id:a.firebaseUid||uid(),role:'owner',contact:a.contact,business:n.slice(0,60),joinCode:genCode(),adminCode:genStaffCode(),staffCode:genStaffCode(),qr:''});
      setA(null);
    }catch(error){setA(s=>({...s,err:error.message||'Не удалось создать профиль.'}));}
  }
  async function submitLink(e){
    e.preventDefault();
    const code=normCode(e.target.link.value);
    setA(s=>({...s,loading:true,err:''}));
    try{
      const owner=await findVenueByCode(code,a.role);
      if(!owner)throw new Error('Код не найден или уже использован. Уточните у владельца.');
      await finish({id:a.firebaseUid||uid(),role:a.role,contact:a.contact,ownerId:owner.id,inviteCode:code});
      setA(null);
    }catch(error){setA(s=>({...s,loading:false,err:error.message||'Не удалось подключиться к заведению.'}));}
  }
  const demo=db.users.find(u=>u.id==='u_demo');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-6 text-white relative z-[1]">
      {intro!=='hidden'&&<div className={`welcome-splash ${intro==='leaving'?'welcome-splash-leaving':''}`} role="status" aria-label="Добро пожаловать в Coffetea">
        <div className="welcome-bubbles" aria-hidden="true">
          <span className="welcome-bubble welcome-bubble-1"/>
          <span className="welcome-bubble welcome-bubble-2"/>
          <span className="welcome-bubble welcome-bubble-3"/>
          <span className="welcome-bubble welcome-bubble-4"/>
          <span className="welcome-bubble welcome-bubble-5"/>
          <span className="welcome-bubble welcome-bubble-6"/>
          <span className="welcome-bubble welcome-bubble-7"/>
          <span className="welcome-bubble welcome-bubble-8"/>
        </div>
        <div className="welcome-splash-content">
          <span className="welcome-splash-logo">C</span>
          <p className="welcome-splash-brand">Coffetea</p>
          <h1>Добро пожаловать</h1>
          <p className="welcome-splash-caption">Вход для сотрудников</p>
        </div>
        <button type="button" className="welcome-splash-skip" onClick={()=>setIntro('hidden')}>Пропустить</button>
      </div>}
      <p className="absolute top-6 font-extrabold text-lg">Coffetea</p>
      <button onClick={startRegister} className="w-36 h-36 rounded-full bg-white text-[var(--accent)] text-6xl font-light shadow-xl active:scale-95 transition">+</button>
      <h1 className="font-extrabold text-xl max-w-xs">Нажмите +, чтобы начать</h1>
      <button onClick={startLogin} className="underline font-bold">У меня уже есть аккаунт</button>
      {demo&&<p className="text-white/80 text-xs mt-6">Демо-код для покупателя: {demo.joinCode}</p>}

      {a&&(
        <Modal title={
          a.step==='role'?'Кто вы?':
          a.step==='contact'?(a.mode==='login'?'Вход':'Регистрация'):
          a.step==='sent'?'Проверьте почту':
          a.step==='completeLink'?'Подтвердите email':
          a.step==='business'?'Название заведения':
          (a.role==='buyer'?'Код заведения':'Код сотрудника')
        } onClose={()=>setA(null)}>
          {a.step==='role'&&(
            <div className="space-y-3 text-left">
              {[['owner','Владелец','Создаёт своё заведение и меню'],
                ['admin','Администратор','Товары и цены по коду от владельца'],
                ['cashier','Кассир','Подтверждает оплату заказов по коду'],
                ['buyer','Покупатель','Входит в меню заведения по коду']].map(([k,t,d])=>(
                <button key={k} onClick={()=>pickRole(k)} className="w-full text-left p-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--field)]">
                  <b className="block">{t}</b><span className="text-xs text-[var(--soft)]">{d}</span>
                </button>
              ))}
              <button type="button" onClick={startLogin} className="underline font-bold text-sm text-[var(--soft)]">У меня уже есть аккаунт</button>
            </div>
          )}
          {a.step==='contact'&&(
            <form onSubmit={submitContact} className="space-y-1">
              <Field label="Email"><input name="contact" type="email" autoFocus className={inputCls} placeholder="name@mail.com" defaultValue={a.contact}/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls} disabled={a.loading}>{a.loading?'Отправляем…':'Получить ссылку'}</button>
            </form>
          )}
          {a.step==='sent'&&(
            <div className="space-y-3">
              <div className="bg-[var(--field)] border-2 border-dashed border-[var(--border)] rounded-xl p-3 text-sm">Ссылка для входа отправлена на <b>{a.contact}</b>. Откройте письмо и нажмите ссылку на этом устройстве.</div>
              {a.err&&<p className="text-red-600 text-sm font-bold">{a.err}</p>}
              <button type="button" className={btnCls} disabled={a.loading} onClick={async()=>{
                setA(s=>({...s,loading:true,err:''}));
                try{await sendEmailLink(a.contact,a.mode,a.role);setA(s=>({...s,loading:false}));}
                catch(error){setA(s=>({...s,loading:false,err:error.message||'Не удалось отправить письмо.'}));}
              }}>{a.loading?'Отправляем…':'Отправить ссылку ещё раз'}</button>
            </div>
          )}
          {a.step==='completeLink'&&(
            <form onSubmit={submitLinkEmail} className="space-y-3">
              {!a.loading&&<Field label="Email, на который пришла ссылка"><input name="contact" type="email" autoFocus className={inputCls} placeholder="name@mail.com" defaultValue={a.contact}/></Field>}
              {a.loading&&<p className="text-sm text-[var(--soft)]">Подтверждаем адрес электронной почты…</p>}
              {a.err&&<p className="text-red-600 text-sm font-bold">{a.err}</p>}
              {!a.loading&&<button className={btnCls}>Продолжить</button>}
            </form>
          )}
          {a.step==='business'&&(
            <form onSubmit={submitBusiness} className="space-y-1">
              <Field label="Название заведения"><input name="biz" autoFocus className={inputCls} placeholder="Например, TheCafe"/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls}>Создать</button>
            </form>
          )}
          {a.step==='link'&&(
            <form onSubmit={submitLink} className="space-y-1">
              <Field label="Код от владельца"><input name="link" autoFocus className={inputCls+" uppercase"} placeholder="Например, K7F3QZ"/></Field>
              <p className="text-xs text-[var(--soft)] mb-2">{a.role==='buyer'?'Этот код владелец показывает покупателям, например на QR у кассы.':'Этот код владелец выдаёт лично сотруднику, в настройках.'}</p>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls}>Войти в заведение</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

// ===== Товар: карточка в списке и форма добавления/редактирования =====

// Плитка товара в сетке меню (видит и владелец/администратор, и покупатель
// на экране редактирования — сама покупка с количеством рисуется отдельно
// внутри BuyerView, чтобы добавить туда кнопки +/-).
