/* Service worker: la página se pide primero a la red (para ver cambios al instante); si la red tarda más de 3.5 s
   o no hay conexión, se abre la última copia guardada y la nueva se guarda en segundo plano para la siguiente vez.
   Miniaturas y fuentes se guardan al usarlas (la caché de fotos conserva su nombre para no volver a descargarlas). */
const V="v7",PAG="pagina-"+V,FOT="fotos-v6",FUE="fuentes-v1",ESPERA=3500;
const FUENTES=["400","500","600","700"].map(w=>"fonts/poppins-"+w+".woff2");
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(Promise.all([
  caches.open(PAG).then(c=>c.addAll(["./","icon-192.png"])).catch(()=>{}),
  caches.open(FUE).then(c=>c.addAll(FUENTES)).catch(()=>{})]))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==PAG&&n!==FOT&&n!==FUE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){
    const red=fetch(r.url,{cache:"no-cache"}).then(x=>{if(x.ok){const c=x.clone();return caches.open(PAG).then(k=>k.put("./",c)).then(()=>x,()=>x)}return x});
    e.waitUntil(red.catch(()=>{}));
    e.respondWith(caches.match("./").then(g=>{
      if(!g)return red;
      return Promise.race([red.catch(()=>g),new Promise(ok=>setTimeout(()=>ok(g),ESPERA))])}));
    return}
  if(/\/img\/[^/]+\.jpg$/.test(u.pathname)){e.respondWith(caches.open(FOT).then(c=>c.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}))));return}
  if(/\/fonts\/[^/]+\.woff2$/.test(u.pathname)){e.respondWith(caches.open(FUE).then(c=>c.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}))));return}
  e.respondWith(fetch(r).catch(()=>caches.match(r)))});
