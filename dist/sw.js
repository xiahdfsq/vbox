var version = 'vbox-cache-v1.0.9',
  cacheList = [
    '/',
    '/index.html',
    '/app.js',
    '/static/js/main.js',
    '/static/img/loading.gif',
    '/static/img/logo.jpg',
    '/static/d.mp3']

self.addEventListener('install', function (event) {
  console.log('installing ....')
  event.waitUntil(
    caches.open(version).then(function (cache) {
      return cache.addAll(cacheList)
    }).then(function () {
      // `skipWaiting()` forces the waiting ServiceWorker to become the
      // active ServiceWorker, triggering the `onactivate` event.
      // Together with `Clients.claim()` this allows a worker to take effect
      // immediately in the client(s).
      return self.skipWaiting()
    }).catch(err => console.log(err))
  )
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('message', function (event) {
  console.log('sw:' + event.data)

  /* 
   caches.open(version).then(function (cache) {
     cache.keys().then(keys => {
       event.ports[0].postMessage(keys.map(k => k.url))
     })
   }) */
})

self.addEventListener('activate', function (ev) {
  return event.waitUntil(
    Promise.all([
      console.log('activating ....'),
      self.clients.claim(),
      // 清理旧版本
      caches.keys().then(cacheList => Promise.all(
        cacheList.map(cacheName => {
          console.log('deleting ' + cacheName)
          if (cacheName !== version) {
            caches.delete(cacheName)
          }
        })
      ))
    ]).catch(err => console.log(err))
  )
})
