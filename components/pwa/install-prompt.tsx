"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface InstallPromptProps {
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-blue-900">Install App</CardTitle>
              <CardDescription className="text-blue-700">
                Install Producer Promo Builder for quick access and offline use
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-blue-600 hover:text-blue-800 -mt-2 -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            <Button onClick={onInstall} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button variant="outline" onClick={onDismiss} className="text-blue-600 border-blue-300 bg-transparent">
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
