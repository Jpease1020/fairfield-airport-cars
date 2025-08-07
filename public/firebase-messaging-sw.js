/* eslint-env serviceworker */
/* global importScripts, firebase, self, clients */
// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.firebasestorage.app",
  messagingSenderId: "1036497512786",
  appId: "1:1036497512786:web:546be81d9ba09e7118728b",
  measurementId: "G-EGTW0BCMLN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📱 Background message received:', payload);

  const { title, body, icon, badge, tag, data } = payload.notification || {};

  // Show notification
  const notificationOptions = {
    body: body || 'New notification from Fairfield Airport Cars',
    icon: icon || '/favicon.ico',
    badge: badge || '/favicon.ico',
    tag: tag || 'booking-notification',
    data: data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  return self.registration.showNotification(title || 'Fairfield Airport Cars', notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event);

  event.notification.close();

  const { action, data } = event.notification.data || {};

  if (action === 'view' || !action) {
    // Open the app or specific page
    const urlToOpen = data?.url || '/bookings';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('📱 Notification closed:', event);
});

// Handle push event (fallback for older browsers)
self.addEventListener('push', (event) => {
  console.log('📱 Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      const { title, body, icon, badge, tag, data } = payload.notification || {};

      const notificationOptions = {
        body: body || 'New notification from Fairfield Airport Cars',
        icon: icon || '/favicon.ico',
        badge: badge || '/favicon.ico',
        tag: tag || 'booking-notification',
        data: data || {},
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ],
        requireInteraction: true,
        silent: false
      };

      event.waitUntil(
        self.registration.showNotification(title || 'Fairfield Airport Cars', notificationOptions)
      );
    } catch (error) {
      console.error('Error handling push event:', error);
    }
  }
});

// Handle install event
self.addEventListener('install', (event) => {
  console.log('📱 Service worker installed');
  self.skipWaiting();
});

// Handle activate event
self.addEventListener('activate', (event) => {
  console.log('📱 Service worker activated');
  event.waitUntil(self.clients.claim());
}); 