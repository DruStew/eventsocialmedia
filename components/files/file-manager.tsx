"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Upload, FolderPlus, Search, ImageIcon, FileText, Trash2, Download, Eye } from "lucide-react"

interface FileManagerProps {
  userId: string
  organizationId: string
  isAdmin: boolean
}

interface FileItem {
  id: string
  name: string
  path: string
  size: number
  type: string
  url: string
  created_at: string
  folder?: string
}

export default function FileManager({ userId, organizationId, isAdmin }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)

  useEffect(() => {
    fetchFiles()
    fetchFolders()
  }, [currentFolder])

  const fetchFiles = async () => {
    try {
      setLoading(true)

      // List files from Supabase Storage
      const folderPath = currentFolder ? `${organizationId}/${userId}/${currentFolder}` : `${organizationId}/${userId}`

      const { data, error } = await supabase.storage.from("assets").list(folderPath, {
        limit: 100,
        offset: 0,
      })

      if (error) throw error

      // Convert to FileItem format and get public URLs
      const fileItems: FileItem[] = await Promise.all(
        (data || [])
          .filter((item) => !item.name.endsWith("/")) // Filter out folders
          .map(async (item) => {
            const fullPath = `${folderPath}/${item.name}`
            const { data: urlData } = supabase.storage.from("assets").getPublicUrl(fullPath)

            return {
              id: item.id || item.name,
              name: item.name,
              path: fullPath,
              size: item.metadata?.size || 0,
              type: item.metadata?.mimetype || "unknown",
              url: urlData.publicUrl,
              created_at: item.created_at || new Date().toISOString(),
              folder: currentFolder,
            }
          }),
      )

      setFiles(fileItems)
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      // For simplicity, we'll use a predefined set of folders
      // In a real implementation, you might store folder structure in the database
      const defaultFolders = ["logos", "images", "assets", "exports"]
      setFolders(defaultFolders)
    } catch (error) {
      console.error("Error fetching folders:", error)
    }
  }

  const handleFileUpload = async (file: File, folder: string = currentFolder) => {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const filePath = folder
        ? `${organizationId}/${userId}/${folder}/${fileName}`
        : `${organizationId}/${userId}/${fileName}`

      const { error } = await supabase.storage.from("assets").upload(filePath, file)

      if (error) throw error

      // Refresh files
      fetchFiles()
      return true
    } catch (error) {
      console.error("Error uploading file:", error)
      return false
    }
  }

  const handleDeleteFile = async (filePath: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const { error } = await supabase.storage.from("assets").remove([filePath])

      if (error) throw error

      // Refresh files
      fetchFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("Failed to delete file")
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Folder Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant={currentFolder === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFolder("")}
            >
              All Files
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder}
                variant={currentFolder === folder ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentFolder(folder)}
              >
                {folder}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowCreateFolder(true)} className="flex items-center">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUpload(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No files found" : "No files yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? `No files match "${searchQuery}"` : "Upload your first file to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowUpload(true)} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* File Preview */}
                <div className="flex items-center justify-center h-20 mb-3 bg-gray-50 rounded">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.type.split("/")[0]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(file.created_at).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => window.open(file.url, "_blank")}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = file.url
                        link.download = file.name
                        link.click()
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.path)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <FileUploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleFileUpload}
          currentFolder={currentFolder}
          folders={folders}
        />
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onSuccess={(folderName) => {
            setFolders([...folders, folderName])
            setShowCreateFolder(false)
          }}
        />
      )}
    </div>
  )
}

// File Upload Modal Component
function FileUploadModal({ onClose, onUpload, currentFolder, folders }: any) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadFolder, setUploadFolder] = useState(currentFolder)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setError("")
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select files to upload")
      return
    }

    setUploading(true)
    setError("")

    try {
      const uploadPromises = selectedFiles.map((file) => onUpload(file, uploadFolder))
      const results = await Promise.all(uploadPromises)

      if (results.every((result) => result)) {
        onClose()
      } else {
        setError("Some files failed to upload")
      }
    } catch (err) {
      setError("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>Select files to upload to your organization's asset library</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload to folder:</label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Root folder</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>

          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select files:</label>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="w-full p-2 border rounded-md"
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Selected files:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600 flex justify-between">
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs">{(file.size / 1024).toFixed(1)}KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Create Folder Modal Component
function CreateFolderModal({ onClose, onSuccess }: any) {
  const [folderName, setFolderName] = useState("")
  const [error, setError] = useState("")

  const handleCreate = () => {
    if (!folderName.trim()) {
      setError("Folder name is required")
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
      setError("Folder name can only contain letters, numbers, hyphens, and underscores")
      return
    }

    onSuccess(folderName.trim())
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Create a new folder to organize your files</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Folder name:</label>
            <Input
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value)
                setError("")
              }}
              placeholder="Enter folder name"
              onKeyPress={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Folder</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
