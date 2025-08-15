"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { Edit, Plus } from "lucide-react"
import TemplateIcon from "@/components/icons/template-icon" // Declare the Template variable

interface Template {
  id: string
  name: string
  description: string
  thumbnail_url: string
  status: string
  created_at: string
  data_fields: any[]
}

interface TemplateGridProps {
  organizationId: string
  isAdmin: boolean
}

export default function TemplateGrid({ organizationId, isAdmin }: TemplateGridProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [organizationId])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = (templateId: string) => {
    // Navigate to template selection/project creation
    window.location.href = `/templates/${templateId}`
  }

  const handleEditTemplate = (templateId: string) => {
    // Navigate to template editor
    window.location.href = `/admin/templates/${templateId}/edit`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-4">
            {isAdmin ? "Upload your first template to get started" : "Ask your administrator to upload templates"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description || "No description"}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {template.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Template Preview */}
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              {template.thumbnail_url ? (
                <img
                  src={template.thumbnail_url || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <TemplateIcon className="h-12 w-12 mx-auto mb-2" /> {/* Use TemplateIcon instead of Template */}
                  <p className="text-sm">No preview</p>
                </div>
              )}
            </div>

            {/* Data Fields Info */}
            {template.data_fields && template.data_fields.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">{template.data_fields.length} customizable fields</p>
                <div className="flex flex-wrap gap-1">
                  {template.data_fields.slice(0, 3).map((field: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {field.id || field.name}
                    </Badge>
                  ))}
                  {template.data_fields.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.data_fields.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => handleUseTemplate(template.id)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {isAdmin ? "Preview" : "Use Template"}
              </Button>

              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
