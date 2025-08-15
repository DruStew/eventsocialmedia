"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Wifi } from "lucide-react"
import { useState, useEffect } from "react"

interface OfflineIndicatorProps {
  isOnline: boolean
}

export default function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  const [showOffline, setShowOffline] = useState(false)
  const [showOnline, setShowOnline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
      setShowOnline(false)
    } else {
      setShowOffline(false)
      if (showOffline) {
        setShowOnline(true)
        // Hide the "back online" message after 3 seconds
        setTimeout(() => setShowOnline(false), 3000)
      }
    }
  }, [isOnline, showOffline])

  if (showOffline) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="text-red-800">You're offline. Some features may be limited.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (showOnline) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Alert className="bg-green-50 border-green-200">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">You're back online!</AlertDescription>
        </Alert>
      </div>
    )
  }

  return null
}
