/* ---------- orders ---------- */
const ST=['New','Processing','Shipped','Delivered','Cancelled'];
function orders(){
 const l=S.orders.filter(o=>staff()||o.uid==S.uid).slice().reverse();
 return `<h1 style="margin-top:30px">${staff()?'All orders':'My orders'}</h1>`+(l.length?`<div class="card" style="overflow:auto"><table><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr>${l.map(o=>`<tr><td>${o.id}</td><td>${esc(o.name)}</td><td>$${o.total}</td><td>${staff()?`<select style="width:auto" onchange="setSt(${o.id},this.value)">${ST.map(s=>`<option ${s==o.st?'selected':''}>${s}</option>`).join('')}</select>`:`<span class="tag">${o.st}</span>`}</td><td class="row"><button class="btn g sm" onclick="T.rc=${o.id};draw()">Receipt</button><button class="btn g sm" onclick="location.href='tickets.html?t=${o.tid}'">Ticket</button></td></tr>`).join('')}</table></div>`:'<p class="mu">No orders yet. Start shopping.</p>')}
async function setSt(id,v){await api('/orders/'+id,'PATCH',{st:v});await load();draw();toast('Status updated')}
/* ---------- tickets ---------- */
function tickets(){
 const l=S.tickets.filter(t=>staff()||t.uid==S.uid).slice().reverse();
 const t=l.find(x=>x.id==T.tid)||l[0];if(t)T.tid=t.id;
 if(!l.length)return`<h1 style="margin-top:30px">Tickets</h1><p class="mu">A support ticket is created for every order you place, so you can chat with our team.</p>`;
 const nm=id=>(S.users.find(u=>u.id==id)||{n:'?'}).n;
 return `<h1 style="margin-top:30px">Tickets</h1><div class="two" style="grid-template-columns:260px 1fr;gap:20px"><div class="card">${l.map(x=>`<div class="tk ${x.id==t.id?'on':''}" onclick="T.tid=${x.id};draw()"><b>${esc(x.sub)}</b><div class="row"><span class="mu sp">${esc(nm(x.uid))}</span><span class="tag ${x.st=='Open'?'ok':''}">${x.st}</span></div></div>`).join('')}</div>
 <div class="card"><div class="row pad" style="border-bottom:1px solid var(--ln)"><b class="sp">${esc(t.sub)}</b><button class="btn g sm" onclick="T.rc=${t.oid};draw()">Receipt</button>${staff()?`<button class="btn sm ${t.st=='Open'?'d':''}" onclick="tog(${t.id})">${t.st=='Open'?'Close ticket':'Reopen'}</button>`:''}</div>
 <div class="chat">${t.msgs.map(m=>m.r=='sys'?`<div class="m sys">${esc(m.t)}</div>`:`<div class="m ${(m.r!='customer')==staff()?'me':''}"><small>${esc(m.n)} – ${RN[m.r]}</small>${esc(m.t)}</div>`).join('')}</div>
 ${t.st=='Open'?`<div class="row pad"><input id="msg" placeholder="Write your message" onkeydown="if(event.key=='Enter')send(${t.id})"><button class="btn" onclick="send(${t.id})">Send</button></div>`:'<p class="mu pad">This ticket is closed.</p>'}</div></div>`}
async function send(id){const i=$('#msg'),v=i.value.trim();if(!v)return;await api('/tickets/'+id+'/messages','POST',{t:v});await load();draw();$('#msg').focus()}
async function tog(id){const t=S.tickets.find(t=>t.id==id);await api('/tickets/'+id,'PATCH',{st:t.st=='Open'?'Closed':'Open'});await load();draw()}
