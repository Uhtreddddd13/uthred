const Q=new URLSearchParams(location.search);
T.v=document.body.dataset.page;T.pid=+Q.get('id')||0;T.tid=+Q.get('t')||0;T.rc=+Q.get('r')||0;
load().then(()=>{draw();if(T.v=='login')initGoogle();if(T.v=='product'){const p=S.products.find(x=>x.id==T.pid);if(p)document.title=p.n+' – Thread'}}).catch(()=>{});
