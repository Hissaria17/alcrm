"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { useClientRouteGuard } from "@/hooks/useClientRouteGuard"
import { useAuth } from "@/hooks/useAuth"
import { useUser } from "@/contexts/SupabaseProvider"
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BookOpen, Upload, Plus, ExternalLink, FileText, Video, ImageIcon, Download, User } from "lucide-react"
import { truncateToWords } from "@/utils/text"
import { DataTable, type DataColumn, formatDate, getThemeBadge } from "@/components/data-table"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"
import type { DataAction } from "@/components/data-table"
import { uploadFreeResourceAndGetUrl, FREE_RESOURCE_UPLOAD_VALIDATION } from "@/lib/utils"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)



interface FreeResource {
  resource_id: string
  title: string
  description: string
  resource_url: string
  resource_type: string
  created_by: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  resource_link: string
  users?: {
    first_name: string
    last_name: string
    email: string
  }
}

const ITEMS_PER_PAGE = 10

export default function FreeResourcesPage() {
  // Auth checks
  const { loading: authLoading, isAuthenticated } = useAuthGuard()
  const { isAdmin, requireRole } = useAuth()
  const user = useUser()
  useClientRouteGuard()

  // State
  const [resources, setResources] = useState<FreeResource[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Add resource dialog
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    resource_url: "",
    resource_type: "",
    created_by: "",
    resource_link: "",
  })

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Verify admin role access
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      requireRole(["ADMIN"])
    }
  }, [authLoading, isAuthenticated, requireRole])



  // Load resources
  const loadResources = useCallback(async () => {
  try {
    setLoading(true)
    const { data, count, error } = await supabase
      .from("free_resources")
      .select("*, users(first_name, last_name, email)", { count: "exact" })
      .eq("is_deleted", false)  // This filter should be included
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
      .order("created_at", { ascending: false })
    if (error) throw error
    setResources(data || [])
    setTotalCount(count || 0)
  } catch (error) {
    console.error("Error loading resources:", error)
    toast.error("Failed to load resources")
  } finally {
    setLoading(false)
  }
}, [currentPage])

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadResources()
    }
  }, [currentPage, isAuthenticated, isAdmin, loadResources])

  // Handle file upload to Supabase Storage
  const handleFileUpload = async (file: File): Promise<{ resource_url: string; resource_link: string }> => {
    if (!user?.id) {
      throw new Error("User not authenticated")
    }

    const result = await uploadFreeResourceAndGetUrl(file, user.id, FREE_RESOURCE_UPLOAD_VALIDATION)
    
    if (!result.success) {
      throw new Error(result.error || "Failed to upload file")
    }

    return {
      resource_url: result.url!,
      resource_link: result.url!
    }
  }

  const handleAddResource = async () => {
    try {
      setIsCreating(true)

      let resourceUrl = newResource.resource_url
      let resourceLink = newResource.resource_link

      // If a file is selected, upload it first
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await handleFileUpload(selectedFile)
        resourceUrl = uploadResult.resource_url
        resourceLink = uploadResult.resource_link
        
        // Automatically set resource type to PDF if it's a PDF file
        if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
          setNewResource(prev => ({ ...prev, resource_type: 'PDF' }))
        }
        
        setUploading(false)
      }

      // Use current user ID for created_by field
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("free_resources").insert([
        {
          ...newResource,
          resource_url: resourceUrl,
          resource_link: resourceLink,
          created_by: user.id, // Use current user ID instead of manual selection
        },
      ])

      if (error) throw error

      toast.success("Resource added successfully")
      setIsAddOpen(false)
      setNewResource({ title: "", description: "", resource_url: "", resource_type: "", created_by: "", resource_link: "" })
      setSelectedFile(null)
      loadResources()
    } catch (error) {
      console.error("Error adding resource:", error)
      toast.error("Failed to add resource")
    } finally {
      setIsCreating(false)
      setUploading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Free Resources" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
      case "document":
        return FileText
      case "video":
        return Video
      case "image":
        return ImageIcon
      case "link":
        return ExternalLink
      default:
        return BookOpen
    }
  }

  const getResourceTypeTheme = (
    type: string,
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (type.toLowerCase()) {
      case "pdf":
      case "document":
        return "primary"
      case "video":
        return "secondary"
      case "image":
        return "success"
      case "link":
        return "warning"
      default:
        return "default"
    }
  }

  const columns: DataColumn<FreeResource>[] = [
    {
      key: "title",
      header: "Resource",
      render: (resource) => {
        const IconComponent = getResourceTypeIcon(resource.resource_type)
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{resource.title}</div>
              <div className="text-sm text-gray-500">
                {truncateToWords(resource.description || "No description", 3)}
              </div>
            </div>
          </div>
        )
      },
      sortable: true,
      width: "300px",
    },
    {
      key: "resource_type",
      header: "Type",
      render: (resource) =>
        getThemeBadge(resource.resource_type.toUpperCase(), getResourceTypeTheme(resource.resource_type)),
      sortable: true,
      align: "center",
    },
    {
      key: "users",
      header: "Created By",
      render: (resource) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">
              {resource.users?.first_name} {resource.users?.last_name}
            </div>
            <div className="text-sm text-gray-500">{resource.users?.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "resource_url",
      header: "Resource",
      render: (resource) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <ExternalLink className="h-4 w-4" />
            {resource.resource_type}
          </span>
        </div>
      ),
      sortable: false,
      align: "center",
    },
    {
      key: "created_at",
      header: "Created",
      render: (resource) => (
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDate(resource.created_at)}</span>
        </div>
      ),
      sortable: true,
      align: "center",
    },
  ]

  const actions: DataAction<FreeResource>[] = [
    {
      label: "Download",
      icon: Download,
      onClick: (resource: FreeResource) => {
        const link = document.createElement("a")
        link.href = resource.resource_link || resource.resource_url
        link.download = resource.title
        link.click()
      },
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Free Resources" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <DataTable
              data={resources.map((resource) => ({ ...resource, id: resource.resource_id }))}
              columns={columns}
              title={`All Resources (${totalCount})`}
              titleIcon={BookOpen}
              subtitle="Manage and share free learning resources"
              actions={actions}
              searchable={true}
              searchPlaceholder="Search resources..."
              searchKeys={["title", "description", "resource_type"]}
              filterable={true}
              filters={[
                {
                  key: "resource_type",
                  label: "Type",
                  options: [
                    { value: "PDF", label: "PDF" },
                    { value: "VIDEO", label: "Video" },
                    { value: "IMAGE", label: "Image" },
                    { value: "DOCUMENT", label: "Document" },
                    { value: "LINK", label: "Link" },
                    { value: "OTHER", label: "Other" },
                  ],
                },
              ]}
              sortable={true}
              pagination={{
                enabled: true,
                pageSize: ITEMS_PER_PAGE,
                currentPage: currentPage,
                totalCount: totalCount,
                onPageChange: setCurrentPage,
              }}
              emptyMessage="No resources found"
              emptyIcon={BookOpen}
              emptyAction={{
                label: "Add Resource",
                onClick: () => setIsAddOpen(true),
                icon: Plus,
              }}
              addAction={{
                label: "Add Resource",
                onClick: () => setIsAddOpen(true),
                icon: Plus,
                show: true,
              }}
              loading={loading}
              onRefresh={loadResources}
              striped={true}
              hoverable={true}
              bordered={true}
              theme="primary"
              cardProps={{
                showCard: true,
                className: "shadow-sm",
              }}
            />

            {/* Add Resource Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Resource
                  </DialogTitle>
                  <DialogDescription>
                    Add a new free resource. You can either upload a file or provide a URL.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="title" className="mb-2 block text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Enter resource title"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="mb-2 block text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        placeholder="Enter resource description"
                        rows={3}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resource_type" className="mb-2 block text-sm font-medium">
                          Resource Type *
                        </Label>
                        <Select
                          value={newResource.resource_type}
                          onValueChange={(value) => setNewResource({ ...newResource, resource_type: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select resource type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PDF">PDF Document</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="IMAGE">Image</SelectItem>
                            <SelectItem value="DOCUMENT">Document</SelectItem>
                            <SelectItem value="LINK">External Link</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>


                    </div>
                  </div>

                  {/* Upload Method */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Method</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload File
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setSelectedFile(file)
                                setNewResource({ ...newResource, resource_url: "", resource_link: "" })
                                
                                // Automatically set resource type to PDF if it's a PDF file
                                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                                  setNewResource(prev => ({ ...prev, resource_type: 'PDF' }))
                                }
                              }
                            }}
                            accept={FREE_RESOURCE_UPLOAD_VALIDATION.allowedTypes.join(',')}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </div>
                              <div className="text-xs text-gray-500">
                                PDF, DOC, Images, Videos up to 10MB
                              </div>
                            </div>
                          </label>
                        </div>
                        {selectedFile && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Selected: {selectedFile.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="resource_url" className="text-sm font-medium flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Enter URL
                        </Label>
                        <Input
                          id="resource_url"
                          value={newResource.resource_url}
                          onChange={(e) => {
                            setNewResource({ ...newResource, resource_url: e.target.value, resource_link: e.target.value })
                            if (e.target.value) {
                              setSelectedFile(null)
                            }
                          }}
                          placeholder="https://example.com/resource"
                          disabled={!!selectedFile}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddOpen(false)
                        setSelectedFile(null)
                        setNewResource({ title: "", description: "", resource_url: "", resource_type: "", created_by: "", resource_link: "" })
                      }}
                      disabled={isCreating || uploading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddResource}
                      disabled={
                        isCreating ||
                        uploading ||
                        !newResource.title ||
                        !newResource.resource_type ||
                        (!newResource.resource_url && !selectedFile)
                      }
                      className="flex-1"
                    >
                      {uploading ? "Uploading..." : isCreating ? "Adding..." : "Add Resource"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
