"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Download, Eye, Share } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ProjectPreview from "./project-preview"

interface ProjectEditorProps {
  project: any
  user: any
  profile: any
}

export default function ProjectEditor({ project, user, profile }: ProjectEditorProps) {
  const [formData, setFormData] = useState(project.data_values || {})
  const [projectName, setProjectName] = useState(project.name || "")
  const [saving, setSaving] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const router = useRouter()

  const template = project.templates
  const dataFields = template?.data_fields || []

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify(project.data_values) || projectName !== project.name) {
        handleSave(false)
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formData, projectName])

  const handleSave = async (showFeedback = true) => {
    if (saving) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("graphics")
        .update({
          name: projectName,
          data_values: formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) throw error

      setLastSaved(new Date())
      if (showFeedback) {
        // Could show a toast notification here
      }
    } catch (error) {
      console.error("Error saving project:", error)
      if (showFeedback) {
        alert("Failed to save project")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRender = async () => {
    setRendering(true)
    try {
      // First save the current state
      await handleSave(false)

      // Call render API
      const response = await fetch(`/api/render?projectId=${project.id}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to render graphic")
      }

      const result = await response.json()

      // Download the rendered image
      if (result.url) {
        const link = document.createElement("a")
        link.href = result.url
        link.download = `${projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Update project status
        await supabase
          .from("graphics")
          .update({
            status: "completed",
            png_url: result.url,
          })
          .eq("id", project.id)

        // Try to share the image if Web Share API is available
        if (navigator.share && navigator.canShare) {
          try {
            const response = await fetch(result.url)
            const blob = await response.blob()
            const file = new File([blob], `${projectName}.png`, { type: "image/png" })

            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: projectName,
                text: `Check out my graphic created with Producer Promo Builder`,
                files: [file],
              })
            }
          } catch (shareError) {
            console.log("[PWA] Web Share failed:", shareError)
          }
        }
      }
    } catch (error) {
      console.error("Error rendering graphic:", error)
      alert("Failed to render graphic. Please try again.")
    } finally {
      setRendering(false)
    }
  }

  const handleShare = async () => {
    if (!project.png_url) {
      alert("Please render the graphic first")
      return
    }

    if (navigator.share) {
      try {
        const response = await fetch(project.png_url)
        const blob = await response.blob()
        const file = new File([blob], `${projectName}.png`, { type: "image/png" })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: projectName,
            text: `Check out my graphic created with Producer Promo Builder`,
            files: [file],
          })
        } else {
          // Fallback to URL sharing
          await navigator.share({
            title: projectName,
            text: `Check out my graphic created with Producer Promo Builder`,
            url: project.png_url,
          })
        }
      } catch (error) {
        console.log("[PWA] Web Share failed:", error)
        // Fallback to copying URL
        navigator.clipboard.writeText(project.png_url)
        alert("Link copied to clipboard!")
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(project.png_url)
      alert("Link copied to clipboard!")
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const renderFormField = (field: any) => {
    const value = formData[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || field.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.id.replace(/_/g, " ")}`}
              maxLength={field.rules?.maxChars}
              required={field.required}
            />
            {field.rules?.maxChars && (
              <p className="text-xs text-gray-500">
                {value.length}/{field.rules.maxChars} characters
              </p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || field.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.id.replace(/_/g, " ")}`}
              rows={3}
              maxLength={field.rules?.maxChars}
              required={field.required}
            />
            {field.rules?.maxChars && (
              <p className="text-xs text-gray-500">
                {value.length}/{field.rules.maxChars} characters
              </p>
            )}
          </div>
        )

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || field.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        )

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || field.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.id.replace(/_/g, " ")}`}
              required={field.required}
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project Editor</h1>
                <p className="text-sm text-gray-500">
                  {template?.name} • {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Unsaved changes"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={() => handleSave(true)} disabled={saving} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>

              {project.png_url && (
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}

              <Button onClick={handleRender} disabled={rendering} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                {rendering ? "Rendering..." : "Export PNG"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Customize your graphic by filling out the fields below</CardDescription>
              </CardHeader>
              <CardContent>
                {dataFields.length > 0 ? (
                  <div className="space-y-6">{dataFields.map(renderFormField)}</div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No customizable fields available for this template</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Live Preview
                </CardTitle>
                <CardDescription>See your changes in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectPreview template={template} formData={formData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
