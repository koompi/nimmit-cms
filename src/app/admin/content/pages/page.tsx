'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileText,
  Calendar,
  Layout,
  MoreVertical,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Page {
  id: string
  title: string
  slug: string
  status: string
  template: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export default function PagesAdminPage() {
  const { data: session, status } = useSession()
  const [pages, setPages] = useState<Page[]>([])
  const [filteredPages, setFilteredPages] = useState<Page[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }

    fetchPages()
  }, [session, status])

  useEffect(() => {
    let filtered = pages

    if (searchTerm) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter)
    }

    setFilteredPages(filtered)
  }, [pages, searchTerm, statusFilter])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPages(pages.filter(page => page.id !== pageId))
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'DRAFT':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getTemplateLabel = (template: string) => {
    const templates: Record<string, { label: string; color: string }> = {
      default: { label: 'Default', color: 'bg-gray-100 text-gray-600' },
      homepage: { label: 'Homepage', color: 'bg-purple-100 text-purple-700' },
      contact: { label: 'Contact', color: 'bg-blue-100 text-blue-700' },
      about: { label: 'About', color: 'bg-cyan-100 text-cyan-700' },
    }
    return templates[template] || { label: template, color: 'bg-gray-100 text-gray-600' }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading pages...</span>
        </div>
      </div>
    )
  }

  const statusCounts = {
    all: pages.length,
    DRAFT: pages.filter(p => p.status === 'DRAFT').length,
    PUBLISHED: pages.filter(p => p.status === 'PUBLISHED').length,
    ARCHIVED: pages.filter(p => p.status === 'ARCHIVED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage your website pages
          </p>
        </div>
        <Link href="/admin/content/pages/new">
          <Button className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-[#fdc501] focus:ring-[#fdc501]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'PUBLISHED', label: 'Published' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                statusFilter === tab.value ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {statusCounts[tab.value as keyof typeof statusCounts] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pages List */}
      <Card className="overflow-hidden">
        {filteredPages.length === 0 ? (
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Get started by creating your first page'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/admin/content/pages/new">
                  <Button className="bg-[#fdc501] hover:bg-[#e5b101] text-black">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first page
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPages.map((page) => {
              const templateInfo = getTemplateLabel(page.template)
              return (
                <div 
                  key={page.id} 
                  className="p-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                      <Layout className="h-5 w-5 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link 
                            href={`/admin/content/pages/${page.id}`}
                            className="font-semibold text-gray-900 hover:text-violet-600 transition-colors line-clamp-1"
                          >
                            {page.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <LinkIcon className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-500 font-mono">/{page.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`${templateInfo.color} text-xs border-0`}>
                            {templateInfo.label}
                          </Badge>
                          <Badge className={`${getStatusBadge(page.status)} text-xs border`}>
                            {page.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated {formatDate(page.updatedAt)}</span>
                        </div>
                        {page.publishedAt && (
                          <div className="flex items-center gap-1">
                            <span>Published {formatDate(page.publishedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {page.status === 'PUBLISHED' && (
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                          <a href={`/${page.slug}`} target="_blank" title="View page">
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/admin/content/pages/${page.id}`} title="Edit page">
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/content/pages/${page.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {page.status === 'PUBLISHED' && (
                            <DropdownMenuItem asChild>
                              <a href={`/${page.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Live
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(page.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
