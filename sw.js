/* Service worker: la página siempre se pide primero a la red (para ver cambios al instante)
   y, si no hay conexión, se abre la última copia guardada. Las miniaturas se guardan al verlas. */
const V="v3",PAG="pagina-"+V,FOT="fotos-"+V;
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(PAG).then(c=>c.addAll(["./","icon-192.png"])).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==PAG&&n!==FOT).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(fetch(r.url,{cache:"no-cache"}).then(x=>{const c=x.clone();caches.open(PAG).then(k=>k.put("./",c));return x}).catch(()=>caches.match("./")));return}
  if(/\/img\/[^/]+\.jpg$/.test(u.pathname)){e.respondWith(caches.open(FOT).then(c=>c.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}))));return}
  e.respondWith(fetch(r).catch(()=>caches.match(r)))});
