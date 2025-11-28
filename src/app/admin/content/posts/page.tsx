'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  FileText,
  Calendar,
  User,
  MoreVertical,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  excerpt?: string
  createdAt: string
  publishedAt?: string
  author: {
    name: string
    email: string
  }
  categories: {
    category: {
      name: string
    }
  }[]
}

export default function PostsPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }

    fetchPosts()
  }, [session, status])

  useEffect(() => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter)
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm, statusFilter])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ARCHIVED':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
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
          <span className="text-gray-500 font-medium">Loading posts...</span>
        </div>
      </div>
    )
  }

  const statusCounts = {
    all: posts.length,
    DRAFT: posts.filter(p => p.status === 'DRAFT').length,
    PUBLISHED: posts.filter(p => p.status === 'PUBLISHED').length,
    SCHEDULED: posts.filter(p => p.status === 'SCHEDULED').length,
    ARCHIVED: posts.filter(p => p.status === 'ARCHIVED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage your blog posts
          </p>
        </div>
        <Link href="/admin/content/posts/new">
          <Button className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
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
            { value: 'SCHEDULED', label: 'Scheduled' },
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

      {/* Posts List */}
      <Card className="overflow-hidden">
        {filteredPosts.length === 0 ? (
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Get started by creating your first blog post'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/admin/content/posts/new">
                  <Button className="bg-[#fdc501] hover:bg-[#e5b101] text-black">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first post
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link 
                          href={`/admin/content/posts/${post.id}/edit`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                          {post.excerpt || 'No excerpt available'}
                        </p>
                      </div>
                      <Badge className={`${getStatusBadge(post.status)} text-xs border flex-shrink-0`}>
                        {post.status}
                      </Badge>
                    </div>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      {post.categories.length > 0 && (
                        <div className="flex gap-1">
                          {post.categories.slice(0, 2).map((cat, index) => (
                            <Badge key={`${post.id}-cat-${index}`} variant="outline" className="text-xs bg-white">
                              {cat.category.name}
                            </Badge>
                          ))}
                          {post.categories.length > 2 && (
                            <span className="text-gray-400">+{post.categories.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.status === 'PUBLISHED' && (
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <a href={`/blog/${post.slug}`} target="_blank" title="View post">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                      <Link href={`/admin/content/posts/${post.id}/edit`} title="Edit post">
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
                          <Link href={`/admin/content/posts/${post.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {post.status === 'PUBLISHED' && (
                          <DropdownMenuItem asChild>
                            <a href={`/blog/${post.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Live
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
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
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}