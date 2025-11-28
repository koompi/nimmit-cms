'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronRight,
  Folder,
  FolderPlus,
  Upload,
  Trash2,
  Edit,
  Copy,
  MoveHorizontal,
  Check,
  X,
  Home,
  Grid,
  List,
  Image as ImageIcon,
  FileVideo,
  FileText,
  Search,
  Loader2,
  HardDrive,
  ChevronLeft,
} from 'lucide-react'

interface MediaFolder {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  _count: {
    media: number
    children: number
  }
  children?: MediaFolder[]
}

interface MediaItem {
  id: string
  filename: string
  originalName: string | null
  alt: string | null
  caption: string | null
  mimeType: string
  size: number
  width: number | null
  height: number | null
  url: string
  createdAt: string
  folderId: string | null
  folder: {
    id: string
    name: string
  } | null
  uploadedBy: {
    id: string
    name: string
    email: string
  } | null
}

interface MediaResponse {
  media: MediaItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface Breadcrumb {
  id: string
  name: string
}

export default function MediaLibraryPage() {
  const { data: session, status } = useSession()
  
  // State
  const [media, setMedia] = useState<MediaItem[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
  })
  
  // Selection
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  
  // Dialogs
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ alt: '', caption: '' })
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [allFolders, setAllFolders] = useState<MediaFolder[]>([])
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Drag and drop
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login')
    }
  }, [status])

  // Fetch media
  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      if (search) {
        params.append('search', search)
      }
      if (currentFolderId) {
        params.append('folderId', currentFolderId)
      }

      const response = await fetch(`/api/admin/media?${params}`)
      const data: MediaResponse = await response.json()

      setMedia(data.media)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, typeFilter, search, currentFolderId])

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (currentFolderId) {
        params.append('parentId', currentFolderId)
      }

      const response = await fetch(`/api/admin/media/folders?${params}`)
      const data = await response.json()
      setFolders(data.folders)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }, [currentFolderId])

  // Fetch all folders for move dialog
  const fetchAllFolders = async () => {
    try {
      const response = await fetch('/api/admin/media/folders?flat=true')
      const data = await response.json()
      setAllFolders(data.folders)
    } catch (error) {
      console.error('Failed to fetch all folders:', error)
    }
  }

  // Fetch breadcrumbs when folder changes
  const fetchBreadcrumbs = useCallback(async () => {
    if (!currentFolderId) {
      setBreadcrumbs([])
      return
    }

    try {
      const response = await fetch(`/api/admin/media/folders/${currentFolderId}`)
      const data = await response.json()
      setBreadcrumbs(data.breadcrumbs || [])
    } catch (error) {
      console.error('Failed to fetch breadcrumbs:', error)
    }
  }, [currentFolderId])

  useEffect(() => {
    fetchMedia()
    fetchFolders()
    fetchBreadcrumbs()
  }, [fetchMedia, fetchFolders, fetchBreadcrumbs])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('file', file)
      })
      if (currentFolderId) {
        formData.append('folderId', currentFolderId)
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }

      fetchMedia()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }

  // Handle delete
  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.originalName || item.filename}"?`)) return

    try {
      const response = await fetch(`/api/admin/media/${item.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMedia()
        setDetailMedia(null)
      } else {
        alert('Failed to delete media')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete media')
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedMedia.size === 0) return
    if (!confirm(`Delete ${selectedMedia.size} selected items?`)) return

    try {
      const response = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'delete',
          mediaIds: Array.from(selectedMedia),
        }),
      })

      if (response.ok) {
        fetchMedia()
        setSelectedMedia(new Set())
        setSelectionMode(false)
      } else {
        alert('Failed to delete selected media')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Failed to delete selected media')
    }
  }

  // Handle bulk move
  const handleBulkMove = async (targetFolderId: string | null) => {
    if (selectedMedia.size === 0) return

    try {
      const response = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'move',
          mediaIds: Array.from(selectedMedia),
          folderId: targetFolderId,
        }),
      })

      if (response.ok) {
        fetchMedia()
        setSelectedMedia(new Set())
        setMoveDialogOpen(false)
      } else {
        alert('Failed to move selected media')
      }
    } catch (error) {
      console.error('Bulk move error:', error)
      alert('Failed to move selected media')
    }
  }

  // Handle edit
  const handleEditOpen = (item: MediaItem) => {
    setEditForm({
      alt: item.alt || '',
      caption: item.caption || '',
    })
    setDetailMedia(item)
    setEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!detailMedia) return

    try {
      const response = await fetch(`/api/admin/media/${detailMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        fetchMedia()
        setEditDialogOpen(false)
      } else {
        alert('Failed to update media')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update media')
    }
  }

  // Handle folder operations
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch('/api/admin/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolderId,
        }),
      })

      if (response.ok) {
        fetchFolders()
        setCreateFolderOpen(false)
        setNewFolderName('')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Create folder error:', error)
      alert('Failed to create folder')
    }
  }

  const handleDeleteFolder = async (folder: MediaFolder) => {
    if (!confirm(`Delete folder "${folder.name}" and all its contents?`)) return

    try {
      const response = await fetch(`/api/admin/media/folders/${folder.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFolders()
      } else {
        alert('Failed to delete folder')
      }
    } catch (error) {
      console.error('Delete folder error:', error)
      alert('Failed to delete folder')
    }
  }

  // Navigate to folder
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId)
    setPagination((prev) => ({ ...prev, page: 1 }))
    setSelectedMedia(new Set())
  }

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedMedia((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedMedia.size === media.length) {
      setSelectedMedia(new Set())
    } else {
      setSelectedMedia(new Set(media.map((m) => m.id)))
    }
  }

  // Copy URL
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('URL copied to clipboard!')
  }

  // Format size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  // Check file type
  const isImage = (mimeType: string) => mimeType.startsWith('image/')
  const isVideo = (mimeType: string) => mimeType.startsWith('video/')

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (isImage(mimeType)) return <ImageIcon className="w-12 h-12 text-gray-400" />
    if (isVideo(mimeType)) return <FileVideo className="w-12 h-12 text-gray-400" />
    return <FileText className="w-12 h-12 text-gray-400" />
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <HardDrive className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Media Library</h1>
              <p className="text-gray-400 text-sm">Upload and manage your images, videos, and documents</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-gray-600 bg-transparent text-white hover:bg-white/10"
              onClick={() => setCreateFolderOpen(true)}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
            <span className="text-yellow-800">
              Uploading {uploadProgress.current} of {uploadProgress.total} files...
            </span>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm bg-white rounded-lg border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-yellow-50"
          onClick={() => navigateToFolder(null)}
        >
          <Home className="w-4 h-4 text-yellow-600" />
        </Button>
        {breadcrumbs.map((crumb) => (
          <div key={crumb.id} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-yellow-50"
              onClick={() => navigateToFolder(crumb.id)}
            >
              {crumb.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-lg border p-4">
        <div className="flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          {/* Selection Mode Toggle */}
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode)
              setSelectedMedia(new Set())
            }}
            className={selectionMode ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
          >
            {selectionMode ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
            {selectionMode ? 'Cancel' : 'Select'}
          </Button>

          {/* Bulk Actions */}
          {selectionMode && selectedMedia.size > 0 && (
            <>
              <span className="text-sm text-gray-600 font-medium">
                {selectedMedia.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchAllFolders()
                  setMoveDialogOpen(true)
                }}
              >
                <MoveHorizontal className="w-4 h-4 mr-1" />
                Move
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          )}

          {/* View Mode */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'grid' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none ${viewMode === 'list' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`
          border-2 border-dashed rounded-xl transition-all bg-white
          ${isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="p-12 text-center">
            <Upload className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <p className="text-yellow-600 font-medium">Drop files here to upload</p>
          </div>
        )}

        {!isDragging && (
          <div className="p-6">
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Folders
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="group relative bg-gradient-to-b from-white to-gray-50 rounded-lg border p-4 hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer"
                      onClick={() => navigateToFolder(folder.id)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Folder className="w-12 h-12 text-yellow-500" />
                        <div className="w-full">
                          <p className="font-medium truncate">{folder.name}</p>
                          <p className="text-xs text-gray-500">
                            {folder._count.media} files
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFolder(folder)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium">No media files found</p>
                <p className="text-sm mt-1">Drag and drop files here or click Upload</p>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                {selectionMode && (
                  <div className="mb-3">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      {selectedMedia.size === media.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className={`
                        relative bg-white rounded-lg border overflow-hidden group cursor-pointer
                        hover:shadow-lg hover:border-yellow-300 transition-all
                        ${selectedMedia.has(item.id) ? 'ring-2 ring-yellow-500 border-yellow-500' : ''}
                      `}
                      onClick={() => {
                        if (selectionMode) {
                          toggleSelection(item.id)
                        } else {
                          setDetailMedia(item)
                        }
                      }}
                    >
                      {selectionMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <div
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                              ${selectedMedia.has(item.id) ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'}
                            `}
                          >
                            {selectedMedia.has(item.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      )}
                      <div className="aspect-square relative bg-gray-100">
                        {isImage(item.mimeType) ? (
                          <Image
                            src={item.url}
                            alt={item.alt || item.filename}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-50">
                            {getFileIcon(item.mimeType)}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm truncate font-medium">
                          {item.originalName || item.filename}
                        </p>
                        <p className="text-xs text-gray-500">{formatSize(item.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {selectionMode && (
                        <th className="w-10 p-3">
                          <input
                            type="checkbox"
                            checked={selectedMedia.size === media.length && media.length > 0}
                            onChange={selectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                      )}
                      <th className="text-left p-3 font-medium text-gray-700">Name</th>
                      <th className="text-left p-3 font-medium text-gray-700">Type</th>
                      <th className="text-left p-3 font-medium text-gray-700">Size</th>
                      <th className="text-left p-3 font-medium text-gray-700">Date</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {media.map((item) => (
                      <tr
                        key={item.id}
                        className={`
                          border-b hover:bg-yellow-50 cursor-pointer transition-colors
                          ${selectedMedia.has(item.id) ? 'bg-yellow-50' : ''}
                        `}
                        onClick={() => {
                          if (selectionMode) {
                            toggleSelection(item.id)
                          } else {
                            setDetailMedia(item)
                          }
                        }}
                      >
                        {selectionMode && (
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedMedia.has(item.id)}
                              onChange={() => toggleSelection(item.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-300"
                            />
                          </td>
                        )}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {isImage(item.mimeType) ? (
                                <Image
                                  src={item.url}
                                  alt={item.alt || item.filename}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  {getFileIcon(item.mimeType)}
                                </div>
                              )}
                            </div>
                            <span className="truncate max-w-xs font-medium">
                              {item.originalName || item.filename}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{item.mimeType}</td>
                        <td className="p-3 text-sm text-gray-600">{formatSize(item.size)}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-yellow-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditOpen(item)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} files
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Media Detail Dialog */}
      {detailMedia && !editDialogOpen && (
        <Dialog
          open={!!detailMedia}
          onOpenChange={() => setDetailMedia(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isImage(detailMedia.mimeType) ? (
                  <ImageIcon className="w-5 h-5 text-yellow-500" />
                ) : isVideo(detailMedia.mimeType) ? (
                  <FileVideo className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-500" />
                )}
                {detailMedia.originalName || detailMedia.filename}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                {isImage(detailMedia.mimeType) ? (
                  <Image
                    src={detailMedia.url}
                    alt={detailMedia.alt || detailMedia.filename}
                    fill
                    className="object-contain"
                  />
                ) : isVideo(detailMedia.mimeType) ? (
                  <video
                    src={detailMedia.url}
                    controls
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getFileIcon(detailMedia.mimeType)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wide">Size</span>
                  <span className="font-medium">{formatSize(detailMedia.size)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wide">Type</span>
                  <span className="font-medium">{detailMedia.mimeType}</span>
                </div>
                {detailMedia.width && detailMedia.height && (
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Dimensions</span>
                    <span className="font-medium">{detailMedia.width}x{detailMedia.height}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wide">Uploaded</span>
                  <span className="font-medium">{new Date(detailMedia.createdAt).toLocaleDateString()}</span>
                </div>
                {detailMedia.folder && (
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Folder</span>
                    <span className="font-medium">{detailMedia.folder.name}</span>
                  </div>
                )}
                {detailMedia.alt && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Alt text</span>
                    <span className="font-medium">{detailMedia.alt}</span>
                  </div>
                )}
                {detailMedia.caption && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Caption</span>
                    <span className="font-medium">{detailMedia.caption}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(detailMedia.url)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOpen(detailMedia)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(detailMedia)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-yellow-500" />
              Edit Media
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={editForm.alt}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, alt: e.target.value }))
                }
                placeholder="Describe this image for accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={editForm.caption}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, caption: e.target.value }))
                }
                placeholder="Optional caption"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditSave}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-yellow-500" />
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateFolderOpen(false)
                  setNewFolderName('')
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateFolder}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoveHorizontal className="w-5 h-5 text-yellow-500" />
              Move to Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a destination folder for {selectedMedia.size} selected items:
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <button
                className="w-full text-left px-4 py-3 hover:bg-yellow-50 flex items-center gap-2 border-b transition-colors"
                onClick={() => handleBulkMove(null)}
              >
                <Home className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Root (No Folder)</span>
              </button>
              {allFolders.map((folder) => (
                <button
                  key={folder.id}
                  className="w-full text-left px-4 py-3 hover:bg-yellow-50 flex items-center gap-2 border-b last:border-b-0 transition-colors"
                  style={{ paddingLeft: folder.parentId ? '2rem' : '1rem' }}
                  onClick={() => handleBulkMove(folder.id)}
                >
                  <Folder className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{folder.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setMoveDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
