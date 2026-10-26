import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { THEMES } from '../config.js';
import { db } from './firebase.js';

export function emptyDatabase(){
  return {session:null,users:[],products:[],orders:[],carts:{}};
}

export function subscribePublicHome(onTheme,onError){
  return onSnapshot(doc(db,'siteSettings','publicHome'),snapshot=>{
    const theme=snapshot.data()?.theme;
    onTheme(THEMES.some(item=>item.key===theme)?theme:'orange');
  },onError);
}

export async function savePublicHomeTheme(theme){
  if(!THEMES.some(item=>item.key===theme))throw new Error('Выберите тему из списка.');
  await setDoc(doc(db,'siteSettings','publicHome'),{theme},{merge:true});
}

export async function getUserProfile(userId){
  const snapshot=await getDoc(doc(db,'profiles',userId));
  return snapshot.exists()?{id:snapshot.id,...snapshot.data()}:null;
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
    const users=profile.role==='owner'?[owner]:[owner,{id:user.uid,...profile}];
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
