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
  })
);

// Cache para otras imágenes o recursos estáticos externos
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'external-images',
  })
);

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_POKEMON_NOTIFICATION') {
    const { title, message, pokemon } = event.data;
    
    const options = {
      body: message,
      icon: pokemon?.sprites?.other?.['official-artwork']?.front_default || 
            pokemon?.sprites?.front_default || '/logo192.png',
      badge: '/logo192.png',
      tag: 'pokemon-consult',
      requireInteraction: true,
      vibrate: [200, 100, 200], // Vibración para móviles
      actions: [
        {
          action: 'open',
          title: 'Abrir Pokédex'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };

    self.registration.showNotification(title, options)
      .catch(error => console.log('Error mostrando notificación:', error));
  }
});

// Notificaciones de los clics
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin);
        }
      })
    );
  }
});

// Respuesta fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
