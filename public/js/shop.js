/* ---------- shop ---------- */
function zoomMove(e,el){const r=el.getBoundingClientRect();el.style.backgroundImage='url("'+el.querySelector('img').src+'")';el.style.backgroundPosition=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%'}
function zoomOff(el){el.style.backgroundImage='none'}
function hero(){const a=S.products.slice(0,3);return `<section class="hero2"><div><span class="kk">New season collection</span><h1>Quiet elegance.<br>Details that last.</h1><p>Carefully chosen clothing and accessories in comfortable fabrics and cuts that outlast trends.</p><div class="row"><button class="btn" onclick="document.getElementById('cat').scrollIntoView({behavior:'smooth'})">Shop now</button><button class="btn g" onclick="T.cat='Accessories';draw()">Accessories</button></div></div><div class="hc">${a.map((p,i)=>`<img class="h${i}" src="${p.im[i%3]||p.im[0]}" alt="${esc(p.n)}" onclick="go('product',${p.id})">`).join('')}</div></section>`}
function shop(){
 const cats=['All','Clothing','Accessories'];
 const l=S.products.filter(p=>(T.cat=='All'||p.c==T.cat)&&p.n.toLowerCase().includes(T.q.toLowerCase()));
 return `${hero()}
 <div id="cat" class="row filt">${cats.map(c=>`<button class="chip ${T.cat==c?'on':''}" onclick="T.cat='${c}';draw()">${c}</button>`).join('')}<input placeholder="Search products" value="${esc(T.q)}" oninput="T.q=this.value;draw();const i=$('main input');i.focus();i.setSelectionRange(99,99)"></div>
 <div class="grid">${l.map(p=>`<article class="pc" onclick="go('product',${p.id})"><div class="pim"><img src="${p.im[0]}" alt="${esc(p.n)}"><img class="b" src="${p.im[1]||p.im[0]}" alt="">${p.st<1?'<span class="bd o">Sold out</span>':p.st<10?'<span class="bd">Last pieces</span>':''}<span class="qv">View details</span></div><div class="pi"><div class="pn">${esc(p.n)}</div><div class="pp">$${p.p}</div></div><div class="mu ps">${p.c}${p.s.length>1?' – '+p.s.join(' / '):''}</div></article>`).join('')||'<p class="mu">No products match your search.</p>'}</div>`}
function product(){
 const p=S.products.find(x=>x.id==T.pid);if(!p)return'<h1 style="margin-top:30px">Product not found</h1><a class="btn" href="index.html">Back to shop</a>';
 return `<p><button class="btn g sm" onclick="go('shop')">Back to shop</button></p><div class="two">
 <div class="gal"><div class="ths">${p.im.map((s,i)=>`<img class="th ${i==T.pi?'on':''}" src="${s}" onclick="T.pi=${i};draw()" alt="Image ${i+1}">`).join('')}</div><div class="zm" onmousemove="zoomMove(event,this)" onmouseleave="zoomOff(this)"><img class="main-img" src="${p.im[T.pi]}" alt="${esc(p.n)}"><span class="zh">Hover to zoom</span></div></div>
 <div><h1 style="font-size:38px">${esc(p.n)}</h1><div class="pr" style="font-size:24px">$${p.p}</div><p class="mu">${esc(p.d)}</p>
 <h2>Size</h2><div class="row">${p.s.map(z=>`<button class="sz ${T.sz==z?'on':''}" onclick="T.sz='${z}';draw()">${z}</button>`).join('')}</div>
 <h2 style="margin-top:18px">Quantity</h2><div class="row"><button class="btn g sm" onclick="T.qty=Math.max(1,T.qty-1);draw()">−</button><b>${T.qty}</b><button class="btn g sm" onclick="T.qty=Math.min(${p.st},T.qty+1);draw()">+</button><span class="mu">${p.st} in stock</span></div>
 <p><button class="btn" ${p.st<1||role()=='support'?'disabled':''} onclick="add(${p.id})">${role()=='support'?'Support accounts cannot purchase':'Add to cart'}</button></p>
 <ul class="tr"><li>Free shipping over $100</li><li>Free returns within 14 days</li><li>Direct support ticket after purchase</li></ul></div></div>`}
function add(id){const p=S.products.find(x=>x.id==id);if(!T.sz){if(p.s.length==1)T.sz=p.s[0];else{toast('Choose a size first');return}}
 const e=S.cart.find(c=>c.pid==id&&c.sz==T.sz);if(e)e.q+=T.qty;else S.cart.push({pid:id,n:p.n,sz:T.sz,q:T.qty,price:p.p,im:p.im[0]});save();toast('Added to cart');draw()}
/* ---------- cart / checkout ---------- */
function cart(){
 if(!S.cart.length)return`<h1 style="margin-top:30px">Your cart is empty</h1><p class="mu">Add products from the shop to continue.</p><button class="btn" onclick="go('shop')">Browse products</button>`;
 return `<h1 style="margin-top:30px">Cart</h1><div class="two"><div class="card pad">${S.cart.map((c,i)=>`<div class="row" style="margin-bottom:12px"><img src="${c.im}" width="56" height="56" style="border-radius:8px;object-fit:cover" alt=""><div class="sp"><div>${esc(c.n)}</div><div class="mu">${c.sz} × ${c.q}</div></div><b>$${c.price*c.q}</b><button class="btn d sm" onclick="S.cart.splice(${i},1);save();draw()">Remove</button></div>`).join('')}<hr style="border:0;border-top:1px solid var(--ln)"><div class="row"><b class="sp">Total</b><b>$${total(S.cart)}</b></div></div>
 <div class="card pad"><h2>Delivery and payment</h2><div style="display:grid;gap:8px"><input id="ca" placeholder="Full name" value="${S.uid?esc(U().n):''}"><input id="cb" placeholder="Full address"><input id="cp" placeholder="Phone number"><select id="cm"><option>Cash on delivery</option><option>Card (demo)</option></select><button class="btn" onclick="checkout()">Place order</button></div></div></div>`}
async function checkout(){
 if(!S.uid){location.href='login.html?next=cart.html';return}
 const a=$('#ca').value.trim(),b=$('#cb').value.trim(),ph=$('#cp').value.trim();
 if(!a||!b||!ph){toast('Please fill in name, address and phone');return}
 const j=await api('/orders','POST',{items:S.cart.map(c=>({pid:c.pid,sz:c.sz,q:c.q})),name:a,addr:b,ph,pay:$('#cm').value});
 S.cart=[];save();location.href='tickets.html?t='+j.tid+'&r='+j.id}
function receipt(){
 document.querySelectorAll('.rm').forEach(x=>x.remove());
 const o=S.orders.find(x=>x.id==T.rc);if(!o)return;
 const m=document.createElement('div');m.className='modal rm';m.onclick=e=>{if(e.target==m){T.rc=0;m.remove()}};
 m.innerHTML=`<div class="rc"><h2 style="text-align:center">Receipt – Thread</h2><p>Order no: <b>${o.id}</b><br>Date: ${new Date(o.date).toLocaleString('en-US')}<br>Customer: ${esc(o.name)} – ${esc(o.ph)}<br>Address: ${esc(o.addr)}<br>Payment: ${o.pay}</p><table><tr><th>Product</th><th>Size</th><th>Qty</th><th>Price</th></tr>${o.items.map(i=>`<tr><td>${esc(i.n)}</td><td>${i.sz}</td><td>${i.q}</td><td>$${i.price*i.q}</td></tr>`).join('')}</table><h2 style="margin-top:12px">Total: $${o.total}</h2><div class="row noprint"><button class="btn" onclick="print()">Print / Save PDF</button><button class="btn g" onclick="T.rc=0;this.closest('.modal').remove()">Close</button></div></div>`;
 document.body.appendChild(m)}
