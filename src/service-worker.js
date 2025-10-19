/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';

// Cachea todos los assets generados por el build
precacheAndRoute(self.__WB_MANIFEST);

// Respuesta en caché cuando no hay conexión
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

