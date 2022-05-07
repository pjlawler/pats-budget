// Service worker default values
const APP_PREFIX = 'pats-budget-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATE_CACHE_NAME = 'data-cache-' + VERSION;

// files that the service worker will serve if offline
const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./js/idb.js",
    "./manifest.json",
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
  ];

// event listen to detect when the page is installing so ut caches the needed files for offline access
self.addEventListener('install', function(e)  {
  e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
});

// event listener for an API fetch request, which will return the cached files if unable to fetch the online files
self.addEventListener('fetch', function(e) {
  console.log('fetch request : ' + e.request.url)

  if(e.request.url.includes('/api/')) {
    e.respondWith(
      caches.open(DATE_CACHE_NAME).then(function(cache) {
        return fetch(e.request).then(response => {
          if(response.status === 200) {
            cache.put(e.request.url, response.clone())
          }

          return response;
        })
        .catch(err => {
          console.log('network request failed',err)
          return cache.match(e.request)
        })
      })
      .catch(err => {
        console.log('failed to open the data cache', err)
      })
    )
    return;
  }

  e.respondWith(

    fetch(e.request).catch(() => {
      return caches.match(e.request).then(function(response) {
        if (response) {
          console.log('responding with cache : ' + e.request.url)
          return response
        } else if (e.request.headers.get('accept').includes('text/html')) {
          console.log('file is not cached, fetching : ' + e.request.url)
          return caches.match('/')
        }
      })

    })
    
  )

})

// fires when the service worker activates, deletes old cache if any
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      let cacheKeeplist = keyList.filter(function(key) {
        return key.indexOf(APP_PREFIX);
      });
  
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function(key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('deleting cache : ' + keyList[i]);
            return caches.delete(keyList[i]);  
          }
      })
      );
    })
  );
});