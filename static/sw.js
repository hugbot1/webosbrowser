importScripts('./dip/dip.worker.js');
importScripts('./uv/uv.bundle.js');
importScripts('./uv/uv.config.js');
importScripts('./uv/uv.sw.js');

const dip = new DIPServiceWorker('./dip/dip.worker.js');
const uv = new UVServiceWorker();

self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(location.origin + '/dynamicip/')) {
        event.respondWith(dip.fetch(event))
    } else if (event.request.url.startsWith(location.origin + '/ultraviolet/')) {
        event.respondWith(uv.fetch(event))
    }
});
