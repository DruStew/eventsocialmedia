"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { Search, Download, Eye, Copy, Trash2, Calendar } from "lucide-react"

interface MyRendersProps {
  userId: string
  organizationId: string
}

interface Render {
  id: string
  name: string
  png_url: string
  status: string
  created_at: string
  updated_at: string
  templates: {
    name: string
    thumbnail_url: string
  }
}

export default function MyRenders({ userId, organizationId }: MyRendersProps) {
  const [renders, setRenders] = useState<Render[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "draft">("all")

  useEffect(() => {
    fetchRenders()
  }, [userId, filter])

  const fetchRenders = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from("graphics")
        .select(`
          id,
          name,
          png_url,
          status,
          created_at,
          updated_at,
          templates (
            name,
            thumbnail_url
          )
        `)
        .eq("created_by", userId)
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setRenders(data || [])
    } catch (error) {
      console.error("Error fetching renders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (renderId: string) => {
    try {
      // Get the original render
      const { data: original, error: fetchError } = await supabase
        .from("graphics")
        .select("*")
        .eq("id", renderId)
        .single()

      if (fetchError) throw fetchError

      // Create a duplicate
      const { data: duplicate, error: createError } = await supabase
        .from("graphics")
        .insert({
          name: `${original.name} (Copy)`,
          template_id: original.template_id,
          data_values: original.data_values,
          organization_id: original.organization_id,
          created_by: userId,
          status: "draft",
        })
        .select()
        .single()

      if (createError) throw createError

      // Navigate to the duplicate
      window.location.href = `/projects/${duplicate.id}`
    } catch (error) {
      console.error("Error duplicating render:", error)
      alert("Failed to duplicate render")
    }
  }

  const handleDelete = async (renderId: string) => {
    if (!confirm("Are you sure you want to delete this render?")) return

    try {
      const { error } = await supabase.from("graphics").delete().eq("id", renderId)

      if (error) throw error

      // Refresh renders
      fetchRenders()
    } catch (error) {
      console.error("Error deleting render:", error)
      alert("Failed to delete render")
    }
  }

  const filteredRenders = renders.filter(
    (render) =>
      render.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      render.templates.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search renders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
            <Button variant={filter === "draft" ? "default" : "outline"} size="sm" onClick={() => setFilter("draft")}>
              Drafts
            </Button>
          </div>
        </div>
      </div>

      {/* Renders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRenders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No renders found" : "No renders yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? `No renders match "${searchQuery}"` : "Create your first graphic to see it here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRenders.map((render) => (
            <Card key={render.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Render Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {render.png_url ? (
                    <img
                      src={render.png_url || "/placeholder.svg"}
                      alt={render.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : render.templates.thumbnail_url ? (
                    <img
                      src={render.templates.thumbnail_url || "/placeholder.svg"}
                      alt={render.name}
                      className="w-full h-full object-cover rounded-lg opacity-50"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">No preview</p>
                    </div>
                  )}
                </div>

                {/* Render Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-lg truncate" title={render.name}>
                      {render.name}
                    </h4>
                    <p className="text-sm text-gray-500">Template: {render.templates.name}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(render.status)}>{render.status}</Badge>
                    <span className="text-xs text-gray-400">{new Date(render.updated_at).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex space-x-1">
                      {render.png_url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(render.png_url, "_blank")}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = render.png_url
                              link.download = `${render.name}.png`
                              link.click()
                            }}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(render.id)} title="Duplicate">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (window.location.href = `/projects/${render.id}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(render.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
