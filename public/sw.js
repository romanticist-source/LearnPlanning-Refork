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
      ] : []
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

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
  }
})