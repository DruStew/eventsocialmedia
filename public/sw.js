const CACHE_NAME = "producer-promo-builder-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/auth/login",
  "/auth/sign-up",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request)
        }),
    )
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version
        return cachedResponse
      }

      // Fetch from network and cache
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Cache the response
          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Offline fallback for HTML pages
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("/") // Return cached homepage
          }
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "background-sync-render") {
    event.waitUntil(processOfflineRenders())
  }
})

// Process queued render requests
async function processOfflineRenders() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    // Find queued render requests
    const renderRequests = requests.filter((req) => req.url.includes("/api/render") && req.method === "POST")

    for (const request of renderRequests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          // Remove from queue on success
          await cache.delete(request)
        }
      } catch (error) {
        console.log("[SW] Failed to process queued render:", error)
      }
    }
  } catch (error) {
    console.log("[SW] Error processing offline renders:", error)
  }
}

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
      },
      actions: [
        {
          action: "explore",
          title: "View",
          icon: "/icons/checkmark.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icons/xmark.png",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})
