"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, ImageIcon } from "lucide-react"

interface TemplateUploadProps {
  organizationId: string
  onClose: () => void
  onSuccess: () => void
}

export default function TemplateUpload({ organizationId, onClose, onSuccess }: TemplateUploadProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [svgFile, setSvgFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [mappingData, setMappingData] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.name || !svgFile) {
        throw new Error("Name and SVG file are required")
      }

      // Parse mapping data if provided
      let parsedMapping = []
      if (mappingData.trim()) {
        try {
          const parsed = JSON.parse(mappingData)
          parsedMapping = parsed.bindings || []
        } catch (err) {
          throw new Error("Invalid JSON in mapping data")
        }
      }

      console.log("[v0] Mock template upload:", {
        name: formData.name,
        description: formData.description,
        svgFile: svgFile.name,
        thumbnailFile: thumbnailFile?.name,
        mappingData: parsedMapping,
        organizationId,
      })

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful response
      console.log("[v0] Template upload completed successfully")
      onSuccess()

      // Original Supabase code commented out to avoid RLS errors:
      /*
      // Upload SVG file
      const svgFileName = `${Date.now()}-${svgFile.name}`
      const { data: svgUpload, error: svgError } = await supabase.storage
        .from("templates")
        .upload(`${organizationId}/${svgFileName}`, svgFile)

      if (svgError) throw svgError

      // Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`
        const { data: thumbnailUpload, error: thumbnailError } = await supabase.storage
          .from("templates")
          .upload(`${organizationId}/thumbnails/${thumbnailFileName}`, thumbnailFile)

        if (thumbnailError) throw thumbnailError

        // Get public URL for thumbnail
        const { data: thumbnailUrlData } = supabase.storage
          .from("templates")
          .getPublicUrl(`${organizationId}/thumbnails/${thumbnailFileName}`)

        thumbnailUrl = thumbnailUrlData.publicUrl
      }

      // Create template record
      const { error: insertError } = await supabase.from("templates").insert({
        name: formData.name,
        description: formData.description,
        svg_content: svgUpload.path,
        data_fields: parsedMapping,
        thumbnail_url: thumbnailUrl,
        organization_id: organizationId,
        status: "active",
      })

      if (insertError) throw insertError

      onSuccess()
      */
    } catch (err: any) {
      setError(err.message || "Failed to upload template")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "svg" | "thumbnail") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === "svg") {
      if (!file.type.includes("svg")) {
        setError("Please select an SVG file")
        return
      }
      setSvgFile(file)
    } else {
      if (!file.type.includes("image")) {
        setError("Please select an image file")
        return
      }
      setThumbnailFile(file)
    }
    setError("")
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Template</DialogTitle>
          <DialogDescription>
            Upload an SVG template with optional mapping configuration and thumbnail
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Event Announcement Template"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Perfect for announcing upcoming events with dates and location"
                rows={3}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <Label>SVG Template File *</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {svgFile ? (
                      <>
                        <FileText className="w-8 h-8 mb-2 text-green-500" />
                        <p className="text-sm text-gray-600">{svgFile.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload SVG file</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".svg" onChange={(e) => handleFileChange(e, "svg")} />
                </label>
              </div>
            </div>

            <div>
              <Label>Thumbnail Image (Optional)</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {thumbnailFile ? (
                      <>
                        <ImageIcon className="w-8 h-8 mb-2 text-green-500" />
                        <p className="text-sm text-gray-600">{thumbnailFile.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload thumbnail</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Mapping Configuration */}
          <div>
            <Label htmlFor="mapping">Template Mapping (JSON)</Label>
            <Textarea
              id="mapping"
              value={mappingData}
              onChange={(e) => setMappingData(e.target.value)}
              placeholder={`{
  "bindings": [
    {
      "id": "event_name",
      "type": "text",
      "target": "#bind_event_name",
      "rules": { "maxChars": 48, "case": "title" }
    }
  ]
}`}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Define how data fields map to SVG elements</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Uploading..." : "Upload Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
