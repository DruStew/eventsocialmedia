"use client"

import { useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"

interface ProjectPreviewProps {
  template: any
  formData: any
}

export default function ProjectPreview({ template, formData }: ProjectPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generatePreview()
  }, [template, formData])

  const generatePreview = async () => {
    if (!template?.svg_content || !canvasRef.current) return

    setLoading(true)
    try {
      // For now, we'll show a placeholder
      // In a real implementation, you would:
      // 1. Load the SVG from storage
      // 2. Apply the form data to the SVG elements
      // 3. Render to canvas using canvg or similar
      // 4. Generate a preview image

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Clear canvas
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw placeholder content
        ctx.fillStyle = "#374151"
        ctx.font = "24px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Live Preview", canvas.width / 2, canvas.height / 2 - 40)

        ctx.font = "16px sans-serif"
        ctx.fillStyle = "#6b7280"
        ctx.fillText("Template: " + template.name, canvas.width / 2, canvas.height / 2)

        // Show some form data
        let yOffset = canvas.height / 2 + 40
        Object.entries(formData)
          .slice(0, 3)
          .forEach(([key, value]) => {
            if (value) {
              ctx.fillText(`${key}: ${String(value).substring(0, 20)}`, canvas.width / 2, yOffset)
              yOffset += 25
            }
          })

        // Convert to blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setPreviewUrl(url)
          }
        })
      }
    } catch (error) {
      console.error("Error generating preview:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Canvas for rendering (hidden) */}
      <canvas ref={canvasRef} width={400} height={400} className="hidden" />

      {/* Preview Display */}
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Generating preview...</p>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-center text-gray-400">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <p>Preview will appear here</p>
            <p className="text-sm">1080 × 1080 pixels</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">Preview updates automatically as you type</p>
      </div>
    </div>
  )
}
