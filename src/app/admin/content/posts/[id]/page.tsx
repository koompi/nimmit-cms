'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Save, Eye, ArrowLeft, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { RichEditor } from '@/components/editor/RichEditor'
import { RevisionHistory } from '@/components/content/RevisionHistory'
import { ScheduleDialog } from '@/components/content/ScheduleDialog'
import { PreviewButton } from '@/components/preview/PreviewButton'

interface Category {
  id: string
  name: string
  slug: string
}

interface EditPostProps {
  params: Promise<{ id: string }>
}

export default function EditPostPage({ params }: EditPostProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [postId, setPostId] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [editorContent, setEditorContent] = useState<any>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const [isScheduling, setIsScheduling] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    status: 'DRAFT',
    featuredImage: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
    },
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }

    const fetchPost = async () => {
      const { id } = await params
      setPostId(id)

      try {
        const [postRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/posts/${id}`),
          fetch('/api/admin/categories')
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        if (postRes.ok) {
          const post = await postRes.json()
          setFormData({
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            status: post.status || 'DRAFT',
            featuredImage: post.featuredImage || '',
            seo: post.seo || { title: '', description: '', keywords: '' },
          })

          // Set scheduled date if exists
          if (post.scheduledAt) {
            setScheduledAt(new Date(post.scheduledAt))
          }

          // Set editor content
          if (post.content) {
            setEditorContent(post.content)
          }

          // Set selected categories
          if (post.categories) {
            setSelectedCategories(
              post.categories.map((c: { category: Category }) => c.category.id)
            )
          }
        } else {
          alert('Post not found')
          router.push('/admin/content/posts')
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
        alert('Failed to load post')
      } finally {
        setIsFetching(false)
      }
    }

    fetchPost()
  }, [session, status, params, router])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent, action: string = 'save') => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const postData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        content: editorContent || {},
        status: action === 'publish' ? 'PUBLISHED' : formData.status,
        categoryIds: selectedCategories,
      }

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        router.push('/admin/content/posts')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Failed to update post:', error)
      alert('Failed to update post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/content/posts')
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSchedule = async (date: Date) => {
    setIsScheduling(true)
    try {
      const response = await fetch('/api/admin/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'post',
          contentId: postId,
          scheduledAt: date.toISOString(),
        }),
      })

      if (response.ok) {
        setScheduledAt(date)
        setFormData({ ...formData, status: 'SCHEDULED' })
        setShowScheduleDialog(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to schedule post')
      }
    } catch (error) {
      console.error('Failed to schedule post:', error)
      alert('Failed to schedule post')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleUnschedule = async () => {
    setIsScheduling(true)
    try {
      const response = await fetch('/api/admin/scheduling', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'post',
          contentId: postId,
        }),
      })

      if (response.ok) {
        setScheduledAt(null)
        setFormData({ ...formData, status: 'DRAFT' })
        setShowScheduleDialog(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to unschedule post')
      }
    } catch (error) {
      console.error('Failed to unschedule post:', error)
      alert('Failed to unschedule post')
    } finally {
      setIsScheduling(false)
    }
  }

  if (status === 'loading' || isFetching) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        </div>
        <div className="flex gap-2">
          {postId && (
            <>
              <PreviewButton
                contentType="post"
                contentId={postId}
                contentSlug={formData.slug}
              />
              <RevisionHistory contentType="post" contentId={postId} />
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setShowScheduleDialog(true)}
            disabled={isLoading}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {scheduledAt ? 'Reschedule' : 'Schedule'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, 'save')}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, 'publish')}
            disabled={isLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSchedule={handleSchedule}
        onUnschedule={handleUnschedule}
        currentSchedule={scheduledAt}
        contentType="post"
        isLoading={isScheduling}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Post title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="post-url-slug"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to auto-generate from title
                  </p>
                </div>

                <div>
                  <Label>Content</Label>
                  <div className="border rounded-lg mt-1">
                    <RichEditor
                      content={editorContent}
                      onChange={setEditorContent}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Brief summary of the post..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seo.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, title: e.target.value },
                      })
                    }
                    placeholder="Override page title for search engines"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seo.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, description: e.target.value },
                      })
                    }
                    placeholder="Description for search engine results..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="seoKeywords">Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seo.keywords}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, keywords: e.target.value },
                      })
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="featuredImage">Image URL</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) =>
                      setFormData({ ...formData, featuredImage: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {formData.featuredImage && (
                  <div className="mt-4">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories found</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
