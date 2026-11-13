function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2300)}
const PAGES={shop:'index.html',product:'product.html',cart:'cart.html',orders:'orders.html',tickets:'tickets.html',admin:'admin.html',login:'login.html'};
function go(v,x){if(!PERM[role()].includes(v)&&!['product','login'].includes(v)){toast('You do not have permission');return}location.href=PAGES[v]+(v=='product'?'?id='+x:'')}
const cartN=()=>S.cart.reduce((a,b)=>a+b.q,0);
const total=l=>l.reduce((a,b)=>a+b.price*(b.q||b.qty),0);
function draw(){
 $('#who').innerHTML=S.uid?`<span class="av">${esc(U().n[0])}</span><span>${esc(U().n)}</span><span class="tag">${RN[role()]}</span><button class="btn g sm" onclick="logout()">Sign out</button>`:`<a class="btn sm" href="login.html">Sign in</a>`;
 const nv=PERM[role()].filter(v=>v!='cart');
 $('#nav').innerHTML=nv.map(v=>`<a class="${T.v==v?'on':''}" href="${PAGES[v]}">${v=='orders'&&!staff()?'My orders':NAMES[v]}</a>`).join('')+(PERM[role()].includes('cart')?`<a class="${T.v=='cart'?'on':''}" href="cart.html">Cart (${cartN()})</a>`:'');
 $('#app').innerHTML=(!PERM[role()].includes(T.v)&&!['product','login'].includes(T.v))?`<h1 style="margin-top:30px">Please sign in</h1><p class="mu">You need an account with access to view this page.</p><a class="btn" href="login.html?next=${PAGES[T.v]}">Sign in</a>`:({shop,product,cart,orders,tickets,admin,login:loginPage})[T.v]();
 if(T.rc)receipt();
 
 const c=$('.chat');if(c)c.scrollTop=c.scrollHeight;
}
