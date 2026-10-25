export function seed(){
  const ownerId='u_demo';
  return {
    session:null,
    users:[{id:ownerId,role:'owner',contact:'owner@coffetea.app',business:'Кофейня «Утро»',joinCode:'DEMO01',staffCode:'STAFF1',qr:''}],
    products:[
      {id:'p1',ownerId,name:'Самса',info:'С говядиной',price:30,currency:'сом',discount:0,img:'',t:1},
      {id:'p2',ownerId,name:'Латте',info:'Молочный кофе',price:180,currency:'сом',discount:20,img:'',t:2}
    ],
    orders:[],
    carts:{}
  };
}
// Загрузить базу при открытии страницы: достаём сохранённое из localStorage,
// а если там пусто или данные повреждены — начинаем с demo-данных (seed()).
export function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){const d=JSON.parse(raw); if(d&&Array.isArray(d.users)) return Object.assign(seed(),d);}
  }catch(e){}
  return seed();
}

// Готовые наборы Tailwind-классов для часто повторяющихся элементов формы —
// чтобы не копировать одну и ту же длинную строку классов в каждом месте.
