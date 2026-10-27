import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { THEMES } from '../config.js';
import { db } from './firebase.js';
import { finalPrice, usernameFromAuthEmail } from '../lib/utils.js';

export function emptyDatabase(){
  return {session:null,users:[],products:[],orders:[],carts:{}};
}

export function subscribePublicHome(onSettings,onError){
  return onSnapshot(doc(db,'siteSettings','publicHome'),snapshot=>{
    const settings=snapshot.data()||{};
    onSettings({
      theme:THEMES.some(item=>item.key===settings.theme)?settings.theme:'orange',
      animation:['float','soda','pulse','stars','snow','none'].includes(settings.animation)?settings.animation:'soda'
    });
  },onError);
}

export async function savePublicHomeAppearance(theme,animation){
  if(!THEMES.some(item=>item.key===theme))throw new Error('Выберите тему из списка.');
  if(!['float','soda','pulse','stars','snow','none'].includes(animation))throw new Error('Выберите анимацию из списка.');
  await setDoc(doc(db,'siteSettings','publicHome'),{theme,animation},{merge:true});
}

export function subscribePublicProducts(onProducts,onError){
  return onSnapshot(collection(db,'siteProducts'),snapshot=>{
    const products=snapshot.docs.map(item=>({
      id:item.id,
      ...item.data(),
      isSiteProduct:true
    })).sort((a,b)=>(b.t||0)-(a.t||0));
    onProducts(products);
  },onError);
}

export async function saveSiteProduct(productId,product){
  const productRef=productId
    ?doc(db,'siteProducts',productId)
    :doc(collection(db,'siteProducts'));
  await setDoc(productRef,{
    ...product,
    isSiteProduct:true,
    t:product.t||Date.now()
  });
}

export async function deleteSiteProduct(productId){
  await deleteDoc(doc(db,'siteProducts',productId));
}

export function subscribeSiteBanners(onBanners,onError,includeInactive=false){
  const bannersRef=collection(db,'siteBanners');
  const bannersQuery=includeInactive
    ?bannersRef
    :query(bannersRef,where('active','==',true));
  return onSnapshot(bannersQuery,snapshot=>{
    onBanners(snapshot.docs.map(item=>({id:item.id,...item.data()}))
      .sort((a,b)=>(a.order||0)-(b.order||0)||(b.t||0)-(a.t||0)));
  },onError);
}

export async function saveSiteBanner(bannerId,banner){
  const title=String(banner.title||'').trim();
  const text=String(banner.text||'').trim();
  if(!title||!text||!banner.img)throw new Error('Добавьте заголовок, описание и изображение баннера.');
  const ref=bannerId
    ?doc(db,'siteBanners',bannerId)
    :doc(collection(db,'siteBanners'));
  await setDoc(ref,{
    title,
    text,
    img:banner.img,
    buttonText:String(banner.buttonText||'Открыть меню').trim(),
    active:Boolean(banner.active),
    order:Math.max(0,Number(banner.order)||0),
    t:banner.t||Date.now()
  });
}

export async function deleteSiteBanner(bannerId){
  await deleteDoc(doc(db,'siteBanners',bannerId));
}

export function subscribeSiteReviews(onReviews,onError,includePending=false){
  const reviewsRef=collection(db,'siteReviews');
  const reviewsQuery=includePending
    ?reviewsRef
    :query(reviewsRef,where('status','==','approved'));
  return onSnapshot(reviewsQuery,snapshot=>{
    onReviews(snapshot.docs.map(item=>({id:item.id,...item.data()}))
      .sort((a,b)=>(b.t||0)-(a.t||0)));
  },onError);
}

export async function submitSiteReview(review,buyer){
  if(!buyer?.id||buyer.role!=='buyer')throw new Error('Войдите как покупатель, чтобы оставить отзыв.');
  const authorName=String(review.authorName||'').trim();
  const text=String(review.text||'').trim();
  if(authorName.length<2||authorName.length>40)throw new Error('Имя должно содержать от 2 до 40 символов.');
  if(text.length<5||text.length>500)throw new Error('Отзыв должен содержать от 5 до 500 символов.');
  if(!Number.isInteger(review.rating)||review.rating<1||review.rating>5)throw new Error('Выберите оценку от 1 до 5.');
  const reviewRef=doc(collection(db,'siteReviews'));
  await setDoc(reviewRef,{
    authorName,
    text,
    rating:review.rating,
    buyerId:buyer.id,
    status:'pending',
    t:Date.now()
  });
}

export async function moderateSiteReview(reviewId,status){
  if(!['approved','rejected'].includes(status))throw new Error('Недопустимый статус отзыва.');
  await updateDoc(doc(db,'siteReviews',reviewId),{status});
}

export function subscribePublicOrders(onOrders,onError){
  let venueOrders=[];
  let siteOrders=[];
  const emit=()=>onOrders([...venueOrders,...siteOrders].sort((a,b)=>(b.t||0)-(a.t||0)));
  const stopVenueOrders=subscribeAllVenueItems('orders',orders=>{
    venueOrders=orders;
    emit();
  },onError);
  const stopSiteOrders=onSnapshot(collection(db,'siteOrders'),snapshot=>{
    siteOrders=snapshot.docs.map(item=>({
      id:item.id,
      ...item.data(),
      isSiteOrder:true
    }));
    emit();
  },onError);
  return ()=>{
    stopVenueOrders();
    stopSiteOrders();
  };
}

export function subscribeBuyerSiteOrders(buyerId,onOrders,onError){
  const ordersQuery=query(
    collection(db,'siteOrders'),
    where('buyerId','==',buyerId)
  );
  return onSnapshot(ordersQuery,snapshot=>{
    onOrders(snapshot.docs.map(item=>({
      id:item.id,
      ...item.data(),
      isSiteOrder:true
    })).sort((a,b)=>(b.t||0)-(a.t||0)));
  },onError);
}

function subscribeAllVenueItems(subcollection,onItems,onError){
  const listeners=new Map();
  const venueItems=new Map();
  const venueNames=new Map();
  let venueIds=new Set();
  function emit(){
    onItems(Array.from(venueItems.values()).flat().sort((a,b)=>(b.t||0)-(a.t||0)));
  }
  const stopVenues=onSnapshot(collection(db,'venues'),snapshot=>{
    const nextIds=new Set(snapshot.docs.map(venue=>venue.id));
    for(const [venueId,stop] of listeners){
      if(!nextIds.has(venueId)){
        stop();
        listeners.delete(venueId);
        venueItems.delete(venueId);
        venueNames.delete(venueId);
      }
    }
    venueIds=nextIds;
    for(const venue of snapshot.docs){
      const venueName=venue.data().business||'Заведение без названия';
      venueNames.set(venue.id,venueName);
      if(venueItems.has(venue.id)){
        venueItems.set(venue.id,venueItems.get(venue.id).map(item=>({...item,venueName})));
      }
      if(listeners.has(venue.id))continue;
      const stop=onSnapshot(collection(db,'venues',venue.id,subcollection),items=>{
        if(!venueIds.has(venue.id))return;
        venueItems.set(venue.id,items.docs.map(item=>({
          id:item.id,
          ...item.data(),
          venueId:venue.id,
          venueName:venueNames.get(venue.id)
        })));
        emit();
      },onError);
      listeners.set(venue.id,stop);
    }
    emit();
  },onError);
  return ()=>{
    stopVenues();
    listeners.forEach(stop=>stop());
    listeners.clear();
    venueItems.clear();
    venueNames.clear();
  };
}

export async function updatePublicOrderStatus(venueId,orderId,status){
  if(!['new','preparing','ready','done','cancelled'].includes(status)){
    throw new Error('Недопустимый статус заказа.');
  }
  await updateDoc(
    venueId
      ?doc(db,'venues',venueId,'orders',orderId)
      :doc(db,'siteOrders',orderId),
    venueId
      ?{status}
      :{status,paymentStatus:status==='done'?'paid':'pending'}
  );
}

export async function createCatalogOrder(cartItems,buyer){
  if(!buyer?.id||!buyer?.contact)throw new Error('Войдите как покупатель, чтобы оформить заказ.');
  if(!cartItems.length)throw new Error('Корзина пуста.');
  for(const {product,quantity} of cartItems){
    if(!product?.id||!Number.isInteger(quantity)||quantity<1||quantity>99){
      throw new Error('В корзине есть некорректный товар или количество.');
    }
  }

  const orderRef=doc(collection(db,'siteOrders'));
  const items=cartItems.map(({product,quantity})=>({
    name:product.name,
    qty:quantity,
    price:finalPrice(product),
    currency:product.currency||'сом'
  }));
  const totalsByCurrency=items.reduce((totals,item)=>{
    totals[item.currency]=(totals[item.currency]||0)+item.price*item.qty;
    return totals;
  },{});
  const order={
    code:orderRef.id.slice(-4).toUpperCase(),
    buyerId:buyer.id,
    buyerContact:buyer.contact,
    items,
    total:Object.entries(totalsByCurrency)
      .map(([currency,total])=>`${total.toLocaleString('ru-RU',{maximumFractionDigits:2})}\u00a0${currency}`)
      .join(' · '),
    paymentMethod:'cash',
    paymentStatus:'pending',
    t:Date.now(),
    status:'new'
  };
  await setDoc(orderRef,order);
  return {...order,id:orderRef.id,isSiteOrder:true};
}

export async function getUserProfile(userId){
  const [snapshot,adminSnapshot]=await Promise.all([
    getDoc(doc(db,'profiles',userId)),
    getDoc(doc(db,'admin',userId))
  ]);
  const isGlobalAdmin=adminSnapshot.exists()&&adminSnapshot.data().role==='admin';
  if(snapshot.exists()){
    const profile={id:snapshot.id,...snapshot.data()};
    return isGlobalAdmin
      ?{...profile,role:'admin',isGlobalAdmin:true,siteAdmin:true}
      :profile;
  }
  if(isGlobalAdmin){
    return {
      id:adminSnapshot.id,
      role:'admin',
      isGlobalAdmin:true,
      siteAdmin:true
    };
  }
  return null;
}

export async function findVenueByCode(code,role){
  const collectionName=role==='buyer'?'publicJoinCodes':'staffInvites';
  const snapshot=await getDoc(doc(db,collectionName,code));
  if(!snapshot.exists())return null;
  if(role!=='buyer'&&(snapshot.data().claimedBy||snapshot.data().role!==role))return null;
  const ownerId=snapshot.data().ownerId;
  const venue=await getDoc(doc(db,'venues',ownerId));
  return venue.exists()?{id:ownerId,...venue.data()}:null;
}

export async function createOwnerProfile(user){
  const ownerId=user.id;
  const profileRef=doc(db,'profiles',ownerId);
  const venueRef=doc(db,'venues',ownerId);
  const joinCodeRef=doc(db,'publicJoinCodes',user.joinCode);
  const adminInviteRef=doc(db,'staffInvites',user.adminCode);
  const cashierInviteRef=doc(db,'staffInvites',user.staffCode);

  await runTransaction(db,async(transaction)=>{
    const existing=await transaction.get(profileRef);
    const [joinCode,adminInvite,cashierInvite]=await Promise.all([
      transaction.get(joinCodeRef),
      transaction.get(adminInviteRef),
      transaction.get(cashierInviteRef)
    ]);
    if(existing.exists())throw new Error('Для этого email уже создан профиль Coffetea.');
    if(joinCode.exists()||adminInvite.exists()||cashierInvite.exists())throw new Error('Не удалось создать уникальные коды. Повторите попытку.');
    transaction.set(profileRef,{
      role:'owner',
      ownerId,
      contact:user.contact,
      adminCode:user.adminCode,
      staffCode:user.staffCode
    });
    transaction.set(venueRef,venueData(user));
    transaction.set(joinCodeRef,{ownerId});
    transaction.set(adminInviteRef,{ownerId,role:'admin',claimedBy:null});
    transaction.set(cashierInviteRef,{ownerId,role:'cashier',claimedBy:null});
  });
}

export async function createLinkedProfile(user,code){
  const profileRef=doc(db,'profiles',user.id);
  const codeCollection=user.role==='buyer'?'publicJoinCodes':'staffInvites';
  const codeRef=doc(db,codeCollection,code);
  await runTransaction(db,async(transaction)=>{
    const [profile,invitation]=await Promise.all([
      transaction.get(profileRef),
      transaction.get(codeRef)
    ]);
    if(profile.exists())throw new Error('Для этого email уже создан профиль Coffetea.');
    if(!invitation.exists())throw new Error('Код не найден. Уточните его у владельца.');
    const invitationData=invitation.data();
    if(user.role!=='buyer'&&invitationData.claimedBy)throw new Error('Код сотрудника уже использован. Попросите владельца создать новый.');
    if(user.role!=='buyer'&&invitationData.role!==user.role)throw new Error('Этот код выдан для другой роли. Уточните у владельца.');

    transaction.set(profileRef,{
      role:user.role,
      ownerId:invitationData.ownerId,
      contact:user.contact,
      ...(user.role==='buyer'?{joinCode:code}:{inviteCode:code})
    });
    if(user.role!=='buyer'){
      transaction.update(codeRef,{claimedBy:user.id,claimedAt:Date.now()});
    }
  });
}

export async function createBuyerProfile(user){
  const profileRef=doc(db,'profiles',user.id);
  const fullName=String(user.fullName||'').trim();
  const contact=String(user.contact||'').trim().toLowerCase();
  const createdAt=Date.now();
  const username=String(user.username||'').trim();
  if(fullName.length<2||fullName.length>100)throw new Error('ФИО должно содержать от 2 до 100 символов.');
  if(!contact)throw new Error('Укажите адрес электронной почты.');
  if(username&&!/^userb[0-9]{4,}$/.test(username))throw new Error('Недопустимый логин CoffeTea.');
  await setDoc(profileRef,{
    role:'buyer',
    contact,
    fullName,
    ...(username?{username}:{}),
    createdAt
  });
  return {id:user.id,role:'buyer',contact,fullName,...(username?{username}:{}),createdAt};
}

export async function saveProfileUsername(userId,username){
  if(!/^(userb[0-9]{4,}|admin[0-9]{4,})$/.test(username))throw new Error('Недопустимый логин CoffeTea.');
  await updateDoc(doc(db,'profiles',userId),{username});
}

export function subscribeAccount(user,onData,onError){
  let profile;
  let venue;
  let products=[];
  let orders=[];
  let cart={};
  const loaded=new Set();
  const stops=[];
  let closed=false;

  function emit(){
    if(closed||!profile||!loaded.has('venue')||!loaded.has('products')||!loaded.has('orders')||!loaded.has('cart'))return;
    const ownerId=profile.role==='owner'?user.uid:profile.ownerId;
    const owner={
      id:ownerId,
      role:'owner',
      ...(venue||{})
    };
    if(profile.role==='owner'){
      Object.assign(owner,profile);
    }
    const users=profile.role==='owner'
      ?[owner]
      :[owner,{
        id:user.uid,
        ...profile,
        ...(profile.role==='buyer'?{
          fullName:profile.fullName||user.displayName||'',
          ...(profile.username||usernameFromAuthEmail(user.email)
            ?{username:profile.username||usernameFromAuthEmail(user.email)}
            :{})
        }:profile.role==='admin'?{
          ...(profile.username||usernameFromAuthEmail(user.email)
            ?{username:profile.username||usernameFromAuthEmail(user.email)}
            :{})
        }:{})
      }];
    onData({
      session:user.uid,
      users,
      products,
      orders,
      carts:profile.role==='buyer'?{[user.uid]:cart}:{}
    });
  }

  async function start(){
    try{
      profile=await getUserProfile(user.uid);
      if(closed)return;
      if(!profile){
        onData(emptyDatabase());
        return;
      }
      if(profile.isGlobalAdmin){
        const username=user.email?.toLowerCase()==='admin@users.coffetea.app'?'admin':'';
        onData({...emptyDatabase(),session:user.uid,users:[{
          ...profile,
          ...(username?{username}:{}),
          contact:user.email||''
        }]});
        return;
      }
      if(profile.role==='buyer'&&!profile.ownerId){
        onData({
          ...emptyDatabase(),
          session:user.uid,
          users:[{
            id:user.uid,
            ...profile,
            fullName:profile.fullName||user.displayName||'',
            ...(profile.username||usernameFromAuthEmail(user.email)
              ?{username:profile.username||usernameFromAuthEmail(user.email)}
              :{})
          }]
        });
        return;
      }
      const ownerId=profile.role==='owner'?user.uid:profile.ownerId;
      stops.push(onSnapshot(doc(db,'profiles',user.uid),snapshot=>{
        if(snapshot.exists()){
          profile={id:snapshot.id,...snapshot.data()};
          emit();
        }
      },onError));
      stops.push(onSnapshot(doc(db,'venues',ownerId),snapshot=>{
        venue=snapshot.exists()?snapshot.data():null;
        loaded.add('venue');
        emit();
      },onError));
      stops.push(onSnapshot(collection(db,'venues',ownerId,'products'),snapshot=>{
        products=snapshot.docs.map(item=>({id:item.id,...item.data()}));
        loaded.add('products');
        emit();
      },onError));
      const ordersRef=collection(db,'venues',ownerId,'orders');
      const ordersQuery=profile.role==='buyer'
        ?query(ordersRef,where('buyerId','==',user.uid))
        :ordersRef;
      stops.push(onSnapshot(ordersQuery,snapshot=>{
        orders=snapshot.docs.map(item=>({id:item.id,...item.data()}));
        loaded.add('orders');
        emit();
      },onError));
      if(profile.role==='buyer'){
        stops.push(onSnapshot(doc(db,'venues',ownerId,'carts',user.uid),snapshot=>{
          cart=snapshot.exists()?snapshot.data().items||{}:{};
          loaded.add('cart');
          emit();
        },onError));
      }else{
        loaded.add('cart');
        emit();
      }
    }catch(error){
      onError(error);
    }
  }
  void start();

  return ()=>{
    closed=true;
    stops.forEach(stop=>stop());
  };
}

export async function persistChanges(previous,next,userId){
  const profile=next.users.find(user=>user.id===userId);
  if(!profile)return;
  const ownerId=profile.role==='owner'?userId:profile.ownerId;
  const batch=writeBatch(db);
  let writes=0;
  const addDiff=(before,after,path)=>{
    const beforeById=new Map(before.map(item=>[item.id,item]));
    const afterById=new Map(after.map(item=>[item.id,item]));
    for(const [id,item] of afterById){
      if(JSON.stringify(beforeById.get(id))!==JSON.stringify(item)){
        const {id:documentId,...data}=item;
        assertDocumentSize(data,item.name||'документ');
        batch.set(doc(db,...path,documentId),data);
        writes++;
      }
    }
    for(const id of beforeById.keys()){
      if(!afterById.has(id)){
        batch.delete(doc(db,...path,id));
        writes++;
      }
    }
  };

  addDiff(
    previous.products.filter(item=>item.ownerId===ownerId),
    next.products.filter(item=>item.ownerId===ownerId),
    ['venues',ownerId,'products']
  );
  addDiff(
    previous.orders.filter(item=>item.ownerId===ownerId),
    next.orders.filter(item=>item.ownerId===ownerId),
    ['venues',ownerId,'orders']
  );

  const previousOwner=previous.users.find(user=>user.id===ownerId);
  const nextOwner=next.users.find(user=>user.id===ownerId);
  if(profile.role==='owner'&&nextOwner&&JSON.stringify(previousOwner)!==JSON.stringify(nextOwner)){
    const before=previousOwner||{};
    const changes={...nextOwner};
    delete changes.id;
    delete changes.role;
    delete changes.contact;
    delete changes.staffCode;
    assertDocumentSize(changes,'настройки заведения');
    batch.set(doc(db,'venues',ownerId),changes);
    writes++;
    if(nextOwner.staffCode!==before.staffCode||nextOwner.adminCode!==before.adminCode){
      batch.set(doc(db,'profiles',ownerId),{
        role:'owner',
        ownerId,
        contact:nextOwner.contact,
        ...(nextOwner.adminCode?{adminCode:nextOwner.adminCode}:{}),
        ...(nextOwner.staffCode?{staffCode:nextOwner.staffCode}:{})
      },{merge:true});
      if(before.staffCode!==nextOwner.staffCode){
        if(before.staffCode)batch.delete(doc(db,'staffInvites',before.staffCode));
        if(nextOwner.staffCode)batch.set(doc(db,'staffInvites',nextOwner.staffCode),{ownerId,role:'cashier',claimedBy:null});
        writes+=2;
      }
      if(before.adminCode!==nextOwner.adminCode){
        if(before.adminCode)batch.delete(doc(db,'staffInvites',before.adminCode));
        if(nextOwner.adminCode)batch.set(doc(db,'staffInvites',nextOwner.adminCode),{ownerId,role:'admin',claimedBy:null});
        writes+=2;
      }
    }
    if(nextOwner.joinCode!==before.joinCode){
      if(before.joinCode)batch.delete(doc(db,'publicJoinCodes',before.joinCode));
      if(nextOwner.joinCode)batch.set(doc(db,'publicJoinCodes',nextOwner.joinCode),{ownerId});
      writes+=2;
    }
  }

  const beforeCart=previous.carts[userId]||{};
  const afterCart=next.carts[userId]||{};
  if(JSON.stringify(beforeCart)!==JSON.stringify(afterCart)){
    assertDocumentSize({items:afterCart},'корзина');
    batch.set(doc(db,'venues',ownerId,'carts',userId),{items:afterCart});
    writes++;
  }
  if(writes)await batch.commit();
}

function assertDocumentSize(data,label){
  const bytes=new TextEncoder().encode(JSON.stringify(data)).length;
  if(bytes>900*1024){
    throw new Error(`Документ «${label}» превышает безопасный размер Firestore. Уменьшите изображение или файл; медиафайлы нужно хранить в Firebase Storage.`);
  }
}

function venueData(user){
  const {id,role,contact,ownerId,staffCode,adminCode,...data}=user;
  return data;
}
