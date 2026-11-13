const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const img=(e,a,b)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><circle cx='200' cy='205' r='128' fill='#fff' opacity='.38'/><ellipse cx='200' cy='350' rx='105' ry='13' fill='#000' opacity='.16'/><text x='200' y='262' font-size='180' text-anchor='middle'>${e}</text></svg>`);
const ims=(e,a,b,c)=>[img(e,a,b),img(e,b,c),img(e,c,a)];
const CL=['S','M','L','XL'],ONE=['One size'];
let S={products:[],users:[],orders:[],tickets:[],cart:(()=>{try{return JSON.parse(localStorage.getItem('thread_cart'))||[]}catch(e){return[]}})(),uid:0,me:null};
const save=()=>{try{localStorage.setItem('thread_cart',JSON.stringify(S.cart))}catch(e){}};
async function api(p,m,b){const r=await fetch('/api'+p,{method:m||'GET',headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined,credentials:'same-origin'});const j=await r.json().catch(()=>({}));if(!r.ok){toast(j.error||'Something went wrong');throw new Error(j.error)}return j}
async function load(){const j=await api('/bootstrap');Object.assign(S,j);S.uid=j.me?j.me.id:0;S.products.forEach(p=>{if(!p.im||!p.im.length)p.im=ims(p.e,p.cols[0],p.cols[1],p.cols[2])})}
const T={v:'shop',cat:'All',q:'',pid:0,pi:0,sz:'',qty:1,tid:0,tab:'p',rc:0,lg:0,gs:0};
const RN={guest:'Guest',customer:'Customer',support:'Support',admin:'Admin'};
const U=()=>S.me||{n:'?'};
const role=()=>S.uid?U().r:'guest',staff=()=>role()=='support'||role()=='admin';
const PERM={guest:['shop','cart'],customer:['shop','cart','orders','tickets'],support:['shop','orders','tickets'],admin:['shop','cart','orders','tickets','admin']};
const NAMES={shop:'Shop',cart:'Cart',orders:'Orders',tickets:'Tickets',admin:'Admin panel'};
