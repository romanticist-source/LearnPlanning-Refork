const CACHE_NAME = 'learnplanning-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/goals',
  '/groups',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // CSS and JS files will be cached automatically by Next.js
]

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then(function(response) {
          // Check if we received a valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache)
            })

          return response
        }).catch(function() {
          // If fetch fails (offline), try to serve a fallback page
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
        })
      }
    )
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background Sync for offline actions
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync offline data when connection is restored
  console.log('Background sync triggered')
}

// Push notification handling
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.data?.url || '/dashboard',
        type: data.data?.type || 'general',
        ...data.data
      },
      actions: data.data?.type === 'group_invitation' ? [
        {
          action: 'view',
          title: '確認する',
          icon: '/icon-192x192.png'
        }
      ] : data.data?.type === 'event_reminder' ? [
        {
          action: 'view',
          title: 'イベントを確認',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: '後で',
          icon: '/icon-192x192.png'
        }
      ] : [],
      tag: data.data?.type || 'general',
      renotify: true,
      requireInteraction: data.data?.type === 'event_reminder'
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click handling
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/dashboard'
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        // 既にアプリが開いている場合は、そのタブにフォーカス
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen)
            })
          }
        }
        // アプリが開いていない場合は新しいウィンドウを開く
        return clients.openWindow(urlToOpen)
      })
    )
  } else if (event.action === 'dismiss') {
    // 通知を閉じるだけ（何もしない）
    console.log('Notification dismissed by user')
  }
})

// App shortcuts handling
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})