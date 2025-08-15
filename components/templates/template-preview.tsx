"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TemplatePreviewProps {
  template: any
  user: any
  profile: any
}

export default function TemplatePreview({ template, user, profile }: TemplatePreviewProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartProject = async () => {
    setLoading(true)
    try {
      // Create a new project
      const { data: project, error } = await supabase
        .from("graphics")
        .insert({
          name: `${template.name} - ${new Date().toLocaleDateString()}`,
          template_id: template.id,
          organization_id: profile.organizations.id,
          created_by: user.id,
          data_values: {},
          status: "draft",
        })
        .select()
        .single()

      if (error) throw error

      // Navigate to project editor
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Template Preview</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{template.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {template.description || "No description available"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {template.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Template Preview Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4" />
                      <p>Template Preview</p>
                      <p className="text-sm">1080 × 1080 pixels</p>
                    </div>
                  )}
                </div>

                {/* Start Project Button */}
                <Button
                  onClick={handleStartProject}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                >
                  {loading ? (
                    "Creating Project..."
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Creating
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Template Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customizable Fields</h4>
                  {template.data_fields && template.data_fields.length > 0 ? (
                    <div className="space-y-2">
                      {template.data_fields.map((field: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{field.id || field.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{field.type}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {field.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No customizable fields defined</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Output Format</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium">1080 × 1080 pixels</p>
                    <p className="text-xs text-gray-500">Perfect for Instagram posts</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                  <p className="text-sm text-gray-600">{new Date(template.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Fill the form</p>
                      <p className="text-xs text-gray-500">Enter your event details and customize the content</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Preview live</p>
                      <p className="text-xs text-gray-500">See your changes in real-time as you type</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Export & share</p>
                      <p className="text-xs text-gray-500">Download your graphic and share it anywhere</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
