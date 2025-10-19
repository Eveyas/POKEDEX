/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Cachea los archivos del build
precacheAndRoute(self.__WB_MANIFEST);

// Cache para sprites de Pokémon
registerRoute(
  ({ request, url }) =>
    request.destination === 'image' && url.origin.includes('pokeapi.co'),
  new CacheFirst({
    cacheName: 'pokemon-sprites',
    plugins: [
    ],
  })
);

// Cache para otras imágenes o recursos estáticos externos
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'external-images',
  })
);

// Respuesta fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
