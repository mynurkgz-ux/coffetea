import React, { useEffect, useRef, useState } from 'react';
import { createUserWithEmailAndPassword, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signOut, updateEmail, updateProfile } from 'firebase/auth';
import { Field, Modal } from '../../shared/ui/index.jsx';
import { btnCls, inputCls } from '../../shared/ui/styles.js';
import { auth } from '../../shared/data/firebase.js';
import { createBuyerProfile, getUserProfile, saveProfileUsername } from '../../shared/data/firestoreStore.js';
import { authEmailForLogin, usernameForAccount, usernameFromAuthEmail } from '../../shared/lib/utils.js';

const EMAIL_LINK_KEY='coffetea_email_link_email';
const EMAIL_FLOW_KEY='coffetea_email_link_flow';

export function Welcome({db,toast,finish,initialMode='register'}){
  const [a,setA]=useState(()=>({mode:initialMode,step:'contact',contact:'',err:''}));
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
  function startRegister(){setA({mode:'register',step:'contact',contact:'',err:''});}
  function startLogin(){setA({mode:'login',step:'contact',contact:'',err:''});}

  async function ensureUsernameLogin(user,profile){
    if(!['admin','buyer'].includes(profile.role))return profile;
    const username=profile.isGlobalAdmin
      ?'admin'
      :profile.username||usernameFromAuthEmail(user.email)||usernameForAccount(profile.role,user.uid);
    const authEmail=authEmailForLogin(username);
    if(user.email?.toLowerCase()!==authEmail){
      try{
        await updateEmail(user,authEmail);
      }catch(error){
        console.error('Failed to update the Firebase sign-in email:',error);
        toast('Вход выполнен, но не удалось включить вход по логину. Пока входите по Gmail.');
      }
    }
    if(!profile.isGlobalAdmin&&profile.username!==username){
      try{
        await saveProfileUsername(user.uid,username);
      }catch(error){
        console.error('Failed to save the generated CoffeTea username:',error);
        toast('Логин активен, но не удалось сохранить его в профиле. Проверьте правила Firestore.');
      }
    }
    return {...profile,username};
  }

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
      if(savedFlow?.mode==='register'){
        await signOut(auth);
        setA({mode:'register',step:'registered',contact:email,err:''});
        return;
      }else{
        await signOut(auth);
        setA({mode:'login',step:'contact',contact:email,err:'Профиль Coffetea не найден. Зарегистрируйтесь или войдите с адресом существующего аккаунта.'});
        return;
      }
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

  async function sendEmailLink(email,mode){
    if(!auth)throw new Error('Firebase не настроен. Проверьте файл .env.local.');
    const flow={email,mode,expiresAt:Date.now()+60*60*1000};
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
    const isEmail=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
    if(a.mode==='register'&&!isEmail){setA(s=>({...s,err:'Введите почту вида name@mail.com'}));return;}
    if(a.mode==='login'&&!isEmail&&!/^(admin|userb[0-9]{4,}|admin[0-9]{4,})$/.test(raw)){
      setA(s=>({...s,err:'Введите логин Coffetea или почту Gmail.'}));
      return;
    }
    if(a.mode==='register'){
      const name=e.target.fullName.value.trim();
      const password=e.target.password.value;
      if(!name){setA(s=>({...s,err:'Введите ФИО'}));return;}
      if(password.length<6){setA(s=>({...s,err:'Пароль должен содержать не менее 6 символов'}));return;}
      setA(s=>({...s,contact:raw,loading:true,err:''}));
      try{
        if(!auth)throw new Error('Firebase не настроен. Проверьте файл .env.local.');
        const credential=await createUserWithEmailAndPassword(auth,raw,password);
        await updateProfile(credential.user,{displayName:name});
        const username=usernameForAccount('buyer',credential.user.uid);
        const profile=await createBuyerProfile({
          id:credential.user.uid,
          contact:raw,
          fullName:name
        });
        await updateEmail(credential.user,authEmailForLogin(username));
        try{
          await saveProfileUsername(credential.user.uid,username);
        }catch(error){
          console.error('Failed to save the generated CoffeTea username:',error);
          toast('Логин активен, но не удалось сохранить его в профиле. Проверьте правила Firestore.');
        }
        await finish(profile);
        setA(null);
      }catch(error){
        if(auth?.currentUser){
          await signOut(auth).catch(signOutError=>{
            console.error('Failed to sign out after incomplete registration:',signOutError);
          });
        }
        const message=error.code==='auth/email-already-in-use'
          ?'Аккаунт с этой почтой уже существует. Войдите в него.'
          :error.code==='auth/weak-password'
            ?'Пароль должен содержать не менее 6 символов.'
            :error.message||'Не удалось создать аккаунт.';
        setA(s=>({...s,loading:false,err:message}));
      }
      return;
    }
    const password=e.target.password.value;
    if(!password){setA(s=>({...s,err:'Введите пароль'}));return;}
    setA(s=>({...s,contact:raw,loading:true,err:''}));
    let signedInUserId='';
    try{
      if(!auth)throw new Error('Firebase не настроен. Проверьте файл .env.local.');
      const credential=await signInWithEmailAndPassword(auth,isEmail?raw:authEmailForLogin(raw),password);
      signedInUserId=credential.user.uid;
      const existing=await getUserProfile(credential.user.uid);
      if(existing){
        await finish(await ensureUsernameLogin(credential.user,existing));
        setA(null);
      }else{
        setA({
          mode:'login',
          step:'missingProfile',
          contact:credential.user.email||raw,
          fullName:credential.user.displayName||'',
          loading:false,
          err:''
        });
      }
    }catch(error){
      if(signedInUserId&&auth?.currentUser?.uid===signedInUserId){
        await signOut(auth).catch(signOutError=>{
          console.error('Failed to sign out after incomplete login:',signOutError);
        });
      }
      const message=error.code==='auth/invalid-credential'||error.code==='auth/wrong-password'||error.code==='auth/user-not-found'
        ?'Неверный логин/Gmail или пароль.'
        :error.message||'Не удалось войти в аккаунт.';
      setA(s=>({...s,loading:false,err:message}));
    }
  }
  async function completeBuyerProfile(e){
    e.preventDefault();
    const fullName=e.target.fullName.value.trim();
    if(fullName.length<2||fullName.length>100){
      setA(s=>({...s,err:'ФИО должно содержать от 2 до 100 символов.'}));
      return;
    }
    const user=auth?.currentUser;
    const contact=user?.email?.toLowerCase()||'';
    if(!user||!contact||contact.endsWith('@users.coffetea.app')){
      setA(s=>({...s,err:'Не удалось подтвердить адрес аккаунта. Выйдите и войдите снова по Gmail.'}));
      return;
    }
    setA(s=>({...s,loading:true,err:''}));
    try{
      const existing=await getUserProfile(user.uid);
      if(existing){
        await finish(existing);
        setA(null);
        return;
      }
      const profile=await createBuyerProfile({id:user.uid,contact,fullName});
      const username=usernameForAccount('buyer',user.uid);
      try{
        await updateEmail(user,authEmailForLogin(username));
        profile.username=username;
        try{
          await saveProfileUsername(user.uid,username);
        }catch(error){
          console.error('Failed to save the generated CoffeTea username:',error);
          toast('Профиль создан, но не удалось сохранить логин. Проверьте правила Firestore.');
        }
      }catch(error){
        console.error('Failed to activate the generated CoffeTea username:',error);
        toast('Профиль создан. Пока входите по Gmail; не удалось активировать логин Coffetea.');
      }
      await finish(profile);
      setA(null);
    }catch(error){
      console.error('Failed to restore the missing buyer profile:',error);
      const message=error.code==='permission-denied'
        ?'Firebase не разрешил создать профиль. Опубликуйте актуальные правила Firestore и повторите попытку.'
        :error.message||'Не удалось создать профиль Coffetea.';
      setA(s=>({...s,loading:false,err:message}));
    }
  }
  async function sendLoginLink(e){
    const email=e.currentTarget.form.elements.contact.value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){setA(s=>({...s,err:'Введите почту вида name@mail.com'}));return;}
    setA(s=>({...s,contact:email,loading:true,err:''}));
    try{
      await sendEmailLink(email,'login');
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
          <p className="welcome-splash-caption">Вход или регистрация</p>
        </div>
        <button type="button" className="welcome-splash-skip" onClick={()=>setIntro('hidden')}>Пропустить</button>
      </div>}
      <p className="absolute top-6 font-extrabold text-lg">Coffetea</p>
      <h1 className="font-extrabold text-xl max-w-xs">Вход или регистрация</h1>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={startLogin} className="rounded-full bg-white px-6 py-3 font-bold text-[var(--accent)] shadow-xl">Войти</button>
        <button type="button" onClick={startRegister} className="rounded-full border border-white/70 px-6 py-3 font-bold text-white">Зарегистрироваться</button>
      </div>
      {demo&&<p className="text-white/80 text-xs mt-6">Демо-код для покупателя: {demo.joinCode}</p>}

      {a&&(
        <Modal title={
          a.step==='contact'?(a.mode==='login'?'Вход':'Регистрация'):
          a.step==='sent'?'Проверьте почту':
          a.step==='completeLink'?'Подтвердите email':
          a.step==='missingProfile'?'Завершите регистрацию':
          'Регистрация завершена'
        } onClose={()=>setA(null)}>
          {a.step==='contact'&&(
            <form onSubmit={submitContact} className="space-y-1">
              {a.mode==='register'&&<Field label="ФИО"><input name="fullName" autoFocus autoComplete="name" className={inputCls} placeholder="Иванов Иван Иванович"/></Field>}
              <Field label={a.mode==='register'?'Gmail':'Логин или Gmail'}><input name="contact" type={a.mode==='register'?'email':'text'} required autoFocus={a.mode==='login'} autoComplete={a.mode==='register'?'email':'username'} className={inputCls} placeholder={a.mode==='register'?'name@gmail.com':'userb… или admin'} defaultValue={a.contact}/></Field>
              <Field label="Пароль"><input name="password" type="password" required autoComplete={a.mode==='register'?'new-password':'current-password'} minLength={a.mode==='register'?6:undefined} className={inputCls} placeholder={a.mode==='register'?'Не менее 6 символов':'Ваш пароль'}/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold mb-2">{a.err}</p>}
              <button className={btnCls} disabled={a.loading}>{a.loading?'Подождите…':a.mode==='register'?'Зарегистрироваться':'Войти'}</button>
              {a.mode==='login'&&<button type="button" onClick={sendLoginLink} className="w-full pt-2 text-sm font-bold underline text-[var(--soft)]" disabled={a.loading}>Войти по ссылке из Gmail</button>}
              <button type="button" onClick={a.mode==='login'?startRegister:startLogin} className="w-full pt-2 text-sm font-bold underline text-[var(--soft)]">
                {a.mode==='login'?'Зарегистрироваться':'Уже есть аккаунт? Войти'}
              </button>
            </form>
          )}
          {a.step==='sent'&&(
            <div className="space-y-3">
              <div className="bg-[var(--field)] border-2 border-dashed border-[var(--border)] rounded-xl p-3 text-sm">Ссылка для входа отправлена на <b>{a.contact}</b>. Откройте письмо и нажмите ссылку на этом устройстве.</div>
              {a.err&&<p className="text-red-600 text-sm font-bold">{a.err}</p>}
              <button type="button" className={btnCls} disabled={a.loading} onClick={async()=>{
                setA(s=>({...s,loading:true,err:''}));
                try{await sendEmailLink(a.contact,a.mode);setA(s=>({...s,loading:false}));}
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
          {a.step==='missingProfile'&&(
            <form onSubmit={completeBuyerProfile} className="space-y-3">
              <p className="text-sm text-[var(--soft)]">Аккаунт найден, но профиль Coffetea не был сохранён. Укажите ФИО, чтобы создать профиль покупателя для этого аккаунта.</p>
              <Field label="ФИО"><input name="fullName" autoFocus autoComplete="name" required minLength={2} maxLength={100} className={inputCls} placeholder="Иванов Иван Иванович" defaultValue={a.fullName}/></Field>
              {a.err&&<p className="text-red-600 text-sm font-bold">{a.err}</p>}
              <button className={btnCls} disabled={a.loading}>{a.loading?'Подождите…':'Создать профиль и войти'}</button>
            </form>
          )}
          {a.step==='registered'&&(
            <div className="space-y-4">
              <p className="text-sm text-[var(--soft)]">Аккаунт Firebase создан для <b>{a.contact}</b>. Для доступа к Coffetea нужен профиль, созданный администратором.</p>
              <button type="button" className={btnCls} onClick={startLogin}>Перейти ко входу</button>
            </div>
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
