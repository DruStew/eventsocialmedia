"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, LayoutTemplateIcon as Template, Settings, Users, FolderOpen, ImageIcon } from "lucide-react"
import TemplateGrid from "@/components/templates/template-grid"
import TemplateUpload from "@/components/templates/template-upload"
import FileManager from "@/components/files/file-manager"
import MyRenders from "@/components/renders/my-renders"

interface DashboardContentProps {
  user: any
  profile: any
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("templates")
  const [showUpload, setShowUpload] = useState(false)

  const isAdmin = profile?.role === "admin"
  const organization = profile?.organizations || { id: "default-org-001", name: "Test Organization" }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Producer Promo Builder</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {organization.name}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>{profile?.role || "admin"}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Template className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="renders" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              My Renders
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
                <p className="text-gray-600">Manage your organization's template library</p>
              </div>
              <Button onClick={() => setShowUpload(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </div>

            <TemplateGrid organizationId={organization.id} isAdmin={true} />
          </TabsContent>

          <TabsContent value="renders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Renders</h2>
              <p className="text-gray-600">View and manage your created graphics</p>
            </div>

            <MyRenders userId={user.id} organizationId={organization.id} />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
              <p className="text-gray-600">Upload and organize your logos, images, and assets</p>
            </div>

            <FileManager userId={user.id} organizationId={organization.id} isAdmin={true} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Organization Settings</h2>
              <p className="text-gray-600">Manage your brand kit and organization preferences</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Brand Kit</CardTitle>
                <CardDescription>Configure your organization's colors, fonts, and default logo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Brand kit management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600">Manage organization members and their roles</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>Invite new members and manage existing user permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">User management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <TemplateUpload
          organizationId={organization?.id}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false)
            // Refresh templates
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
