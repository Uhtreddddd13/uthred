const express=require('express'),fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const PORT=process.env.PORT||3000,GID=process.env.GOOGLE_CLIENT_ID||'';
const DB=path.join(__dirname,'data','db.json'),UP=path.join(__dirname,'public','uploads');
fs.mkdirSync(path.dirname(DB),{recursive:true});fs.mkdirSync(UP,{recursive:true});
const CL=['S','M','L','XL'],ONE=['One size'],ST=['New','Processing','Shipped','Delivered','Cancelled'],ROLES=['customer','support','admin'];
const P=(id,n,c,p,st,d,e,a,b,x)=>({id,n,c,p,s:c=='Clothing'?CL:ONE,st,d,e,cols:[a,b,x],im:[]});
let db;
function save(){const t=DB+'.tmp';fs.writeFileSync(t,JSON.stringify(db));fs.renameSync(t,DB)}
if(fs.existsSync(DB))db=JSON.parse(fs.readFileSync(DB,'utf8'));else{
 const pw=process.env.ADMIN_PASSWORD||crypto.randomBytes(6).toString('hex'),em=(process.env.ADMIN_EMAIL||'admin@thread.local').toLowerCase();
 db={secret:crypto.randomBytes(32).toString('hex'),seq:{u:2,p:9,o:1,t:1},users:[{id:1,n:'Admin',e:em,h:bcrypt.hashSync(pw,10),r:'admin'}],orders:[],tickets:[],products:[
 P(1,'Linen Shirt','Clothing',39,25,'A light linen shirt with a relaxed cut, made for warm days.','👕','#cfd8ff','#9fb0ff','#e7ebff'),
 P(2,'Denim Jacket','Clothing',79,12,'Dark-wash denim jacket with a soft inner lining.','🧥','#7d8fb8','#3c4d78','#b8c4e0'),
 P(3,'Summer Dress','Clothing',65,9,'A long, flowing dress with an elasticated waist.','👗','#ffd6e0','#ff9fb8','#ffe9ef'),
 P(4,'Wide-Leg Trousers','Clothing',55,18,'Relaxed cotton trousers with side pockets.','👖','#b6e3d4','#6cc4a8','#dff5ee'),
 P(5,'Leather Watch','Accessories',120,7,'Leather-strap watch, splash resistant.','⌚','#ffe8b0','#ffc94d','#fff3d6'),
 P(6,'Shoulder Bag','Accessories',89,10,'Vegan leather bag with an adjustable strap.','👜','#e0c9ff','#b58cff','#f1e6ff'),
 P(7,'Sunglasses','Accessories',45,30,'Polarised lenses with UV400 protection.','🕶️','#c8e6ff','#7bbcf5','#e6f3ff'),
 P(8,'Baseball Cap','Accessories',19,40,'Cotton cap with an adjustable back strap.','🧢','#ffd0c2','#ff8f70','#ffe8e0')]};
 save();console.log('\nFIRST RUN - admin login:',em,'/',pw,'\n');}
const str=(v,n)=>String(v==null?'':v).trim().slice(0,n),pub=u=>({id:u.id,n:u.n,e:u.e,r:u.r});
const sign=u=>u+'.'+crypto.createHmac('sha256',db.secret).update(String(u)).digest('hex');
const okc=c=>{const [u]=c.split('.'),a=Buffer.from(c),b=Buffer.from(sign(u));return a.length==b.length&&crypto.timingSafeEqual(a,b)};
const ck=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')).filter(a=>a[0]));
const app=express();app.set('trust proxy',1);app.use(express.json({limit:'15mb'}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');const c=ck(req).sid;if(c&&okc(c))req.me=db.users.find(x=>x.id==c.split('.')[0]);next()});
const allow=(...r)=>(req,res,next)=>req.me&&r.includes(req.me.r)?next():res.status(req.me?403:401).json({error:req.me?'You do not have permission':'Please sign in'});
const hits={};const limit=(req,res,next)=>{const n=Date.now();hits[req.ip]=(hits[req.ip]||[]).filter(t=>n-t<60000);if(hits[req.ip].length>=10)return res.status(429).json({error:'Too many attempts, try again in a minute'});hits[req.ip].push(n);next()};
const session=(req,res,u)=>{res.setHeader('Set-Cookie','sid='+sign(u.id)+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000'+(req.secure?'; Secure':''));res.json({ok:1})};
function saveImgs(a){return (Array.isArray(a)?a:[]).slice(0,6).map(s=>{const m=/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(s||'');if(!m)return null;const f=crypto.randomBytes(8).toString('hex')+'.'+(m[1]=='jpeg'?'jpg':m[1]);fs.writeFileSync(path.join(UP,f),Buffer.from(m[2],'base64'));return '/uploads/'+f}).filter(Boolean)}
app.get('/api/config',(q,r)=>r.json({googleClientId:GID}));
app.get('/api/bootstrap',(req,res)=>{const m=req.me,st=m&&m.r!='customer';
 res.json({me:m?pub(m):null,products:db.products,users:st?db.users.map(u=>m.r=='admin'?pub(u):{id:u.id,n:u.n,r:u.r}):[],orders:m?db.orders.filter(o=>st||o.uid==m.id):[],tickets:m?db.tickets.filter(t=>st||t.uid==m.id):[]})});
app.post('/api/auth/register',limit,(req,res)=>{const n=str(req.body.n,60),e=str(req.body.e,120).toLowerCase(),p=String(req.body.p||'');
 if(!n||!/^\S+@\S+\.\S+$/.test(e)||p.length<8)return res.status(400).json({error:'Enter a name, a valid email and a password of 8+ characters'});
 if(db.users.some(u=>u.e==e))return res.status(400).json({error:'This email is already registered'});
 const u={id:db.seq.u++,n,e,h:bcrypt.hashSync(p,10),r:'customer'};db.users.push(u);save();session(req,res,u)});
app.post('/api/auth/login',limit,(req,res)=>{const u=db.users.find(x=>x.e==str(req.body.e,120).toLowerCase());
 if(!u||!u.h||!bcrypt.compareSync(String(req.body.p||''),u.h))return res.status(400).json({error:'Wrong email or password'});session(req,res,u)});
app.post('/api/auth/google',limit,async(req,res)=>{if(!GID)return res.status(400).json({error:'Google sign-in is not configured'});
 try{const {OAuth2Client}=require('google-auth-library');const t=await new OAuth2Client(GID).verifyIdToken({idToken:String(req.body.credential||''),audience:GID}),g=t.getPayload();
 if(!g.email_verified)throw 0;const e=g.email.toLowerCase();let u=db.users.find(x=>x.e==e);
 if(!u){u={id:db.seq.u++,n:str(g.name||e,60),e,r:'customer'};db.users.push(u);save()}session(req,res,u)}catch(x){res.status(400).json({error:'Google sign-in failed'})}});
app.post('/api/auth/logout',(req,res)=>{res.setHeader('Set-Cookie','sid=; HttpOnly; Path=/; Max-Age=0');res.json({ok:1})});
app.post('/api/orders',allow('customer','admin'),(req,res)=>{const b=req.body,items=[],use={},name=str(b.name,80),addr=str(b.addr,200),ph=str(b.ph,30);
 if(!name||!addr||!ph||!Array.isArray(b.items)||!b.items.length)return res.status(400).json({error:'Please complete all fields'});
 for(const i of b.items){const p=db.products.find(x=>x.id==i.pid),q=Math.floor(+i.q);
  if(!p||!p.s.includes(i.sz)||!(q>0))return res.status(400).json({error:'Invalid item in your cart'});
  use[p.id]=(use[p.id]||0)+q;if(use[p.id]>p.st)return res.status(400).json({error:'Not enough stock: '+p.n});items.push({n:p.n,sz:i.sz,q,price:p.p})}
 for(const id in use)db.products.find(x=>x.id==id).st-=use[id];
 const o={id:db.seq.o++,uid:req.me.id,name,addr,ph,pay:b.pay=='Card (demo)'?'Card (demo)':'Cash on delivery',items,total:items.reduce((a,i)=>a+i.price*i.q,0),st:'New',date:new Date().toISOString()};
 const t={id:db.seq.t++,oid:o.id,uid:req.me.id,sub:'Order #'+o.id,st:'Open',msgs:[{r:'sys',t:'This ticket was created automatically after your purchase. Write here if you need help with your order.',d:Date.now()}]};
 o.tid=t.id;db.orders.push(o);db.tickets.push(t);save();res.json({id:o.id,tid:t.id})});
app.patch('/api/orders/:id',allow('support','admin'),(req,res)=>{const o=db.orders.find(x=>x.id==req.params.id);if(!o||!ST.includes(req.body.st))return res.status(400).json({error:'Invalid request'});
 o.st=req.body.st;const t=db.tickets.find(x=>x.id==o.tid);if(t)t.msgs.push({r:'sys',t:'Order status updated to: '+o.st,d:Date.now()});save();res.json({ok:1})});
app.post('/api/tickets/:id/messages',allow('customer','support','admin'),(req,res)=>{const t=db.tickets.find(x=>x.id==req.params.id),m=req.me,x=str(req.body.t,1000);
 if(!t||!x||(m.r=='customer'&&t.uid!=m.id)||t.st!='Open')return res.status(400).json({error:'Cannot post to this ticket'});
 t.msgs.push({r:m.r,n:m.n,t:x,d:Date.now()});save();res.json({ok:1})});
app.patch('/api/tickets/:id',allow('support','admin'),(req,res)=>{const t=db.tickets.find(x=>x.id==req.params.id);if(!t||!['Open','Closed'].includes(req.body.st))return res.status(400).json({error:'Invalid request'});t.st=req.body.st;save();res.json({ok:1})});
app.post('/api/products',allow('admin'),(req,res)=>{const b=req.body,n=str(b.n,80),p=+b.p;if(!n||!(p>0))return res.status(400).json({error:'Name and price are required'});
 const c=b.c=='Accessories'?'Accessories':'Clothing',k=['#d6e4ff','#ffd6e0','#d6f5e3','#ffe8b0','#e0c9ff'].sort(()=>Math.random()-.5);
 db.products.push({id:db.seq.p++,n,c,p,s:c=='Clothing'?CL:ONE,st:Math.max(0,Math.floor(+b.st||0)),d:str(b.d,500)||'New product',e:str(b.e,8)||'🛍️',cols:k.slice(0,3),im:saveImgs(b.images)});save();res.json({ok:1})});
app.patch('/api/products/:id',allow('admin'),(req,res)=>{const p=db.products.find(x=>x.id==req.params.id),b=req.body;if(!p)return res.status(404).json({error:'Not found'});
 if(b.p>0)p.p=+b.p;if(b.st>=0&&b.st!==undefined)p.st=Math.floor(+b.st);if(b.images){const a=saveImgs(b.images);if(a.length)p.im=a}save();res.json({ok:1})});
app.delete('/api/products/:id',allow('admin'),(req,res)=>{db.products=db.products.filter(x=>x.id!=req.params.id);save();res.json({ok:1})});
app.patch('/api/users/:id',allow('admin'),(req,res)=>{const u=db.users.find(x=>x.id==req.params.id);if(!u||u.id==req.me.id||!ROLES.includes(req.body.r))return res.status(400).json({error:'Invalid request'});u.r=req.body.r;save();res.json({ok:1})});
app.use(express.static(path.join(__dirname,'public'),{extensions:['html']}));
app.use((req,res)=>res.status(404).sendFile(path.join(__dirname,'public','404.html')));
app.use((e,req,res,next)=>res.status(400).json({error:'Bad request'}));
app.listen(PORT,()=>console.log('Thread shop running on http://localhost:'+PORT));
