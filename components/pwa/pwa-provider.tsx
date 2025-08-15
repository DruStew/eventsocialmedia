"use client"

import type React from "react"

import { useEffect, useState } from "react"
import InstallPrompt from "./install-prompt"
import OfflineIndicator from "./offline-indicator"

interface PWAProviderProps {
  children: React.ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration)

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm("A new version is available. Reload to update?")) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.log("[PWA] Service Worker registration failed:", error)
        })
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register("background-sync-render")
        })
      }
    }
    const handleOffline = () => setIsOnline(false)

    // Set initial online status
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Check if user has dismissed install prompt recently
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      const daysSinceDismissal = dismissed ? (Date.now() - Number.parseInt(dismissed)) / (1000 * 60 * 60 * 24) : 999

      if (daysSinceDismissal > 7) {
        // Show again after 7 days
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Handle app installed
    const handleAppInstalled = () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log("[PWA] App was installed")
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt")
    } else {
      console.log("[PWA] User dismissed the install prompt")
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    // Store dismissal in localStorage to avoid showing again soon
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  return (
    <>
      {children}
      <OfflineIndicator isOnline={isOnline} />
      {showInstallPrompt && <InstallPrompt onInstall={handleInstall} onDismiss={handleDismissInstall} />}
    </>
  )
}
