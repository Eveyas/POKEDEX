const CACHE_NAME = 'pokepwa-v2';
const API_CACHE_NAME = 'pokeapi-cache-v2';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/css/main.chunk.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Cachear peticiones a la API de Pokémon (incluyendo búsquedas)
  if (event.request.url.includes('pokeapi.co')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(event.request).then((response) => {
          // Clonar la respuesta porque solo se puede consumir una vez
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          // Si falla la red, devolver desde cache
          return caches.match(event.request).then(response => {
            if (response) {
              return response;
            }
            // Si no está en cache, devolver error
            return new Response(JSON.stringify({ 
              error: 'No se pudo cargar el Pokémon. Revisa tu conexión.' 
            }), {
              status: 408,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
  } else {
    // Estrategia cache-first
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
