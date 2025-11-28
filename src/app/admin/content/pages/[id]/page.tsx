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
import { Save, ArrowLeft, Trash2, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { RevisionHistory } from '@/components/content/RevisionHistory'
import { ScheduleDialog } from '@/components/content/ScheduleDialog'
import { PreviewButton } from '@/components/preview/PreviewButton'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function EditPageAdminPage({ params }: EditPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [pageId, setPageId] = useState<string>('')
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const [isScheduling, setIsScheduling] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'DRAFT',
    template: 'default',
    seo: {
      title: '',
      description: '',
    },
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px]',
      },
    },
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }

    const fetchPage = async () => {
      const { id } = await params
      setPageId(id)
      
      try {
        const response = await fetch(`/api/admin/pages/${id}`)
        if (response.ok) {
          const page = await response.json()
          setFormData({
            title: page.title,
            slug: page.slug,
            status: page.status,
            template: page.template || 'default',
            seo: page.seo || { title: '', description: '' },
          })
          
          // Set scheduled date if exists
          if (page.scheduledAt) {
            setScheduledAt(new Date(page.scheduledAt))
          }
          
          // Set editor content
          if (editor && page.content) {
            editor.commands.setContent(page.content)
          }
        } else {
          alert('Page not found')
          router.push('/admin/content/pages')
        }
      } catch (error) {
        console.error('Failed to fetch page:', error)
        alert('Failed to load page')
      } finally {
        setIsFetching(false)
      }
    }

    fetchPage()
  }, [session, status, params, editor, router])

  const handleSubmit = async (e: React.FormEvent, action: string = 'save') => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const pageData = {
        ...formData,
        content: editor?.getJSON() || {},
        status: action === 'publish' ? 'PUBLISHED' : formData.status,
      }

      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      })

      if (response.ok) {
        router.push('/admin/content/pages')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update page')
      }
    } catch (error) {
      console.error('Failed to update page:', error)
      alert('Failed to update page')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/content/pages')
      } else {
        alert('Failed to delete page')
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
      alert('Failed to delete page')
    }
  }

  const handleSchedule = async (date: Date) => {
    setIsScheduling(true)
    try {
      const response = await fetch('/api/admin/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'page',
          contentId: pageId,
          scheduledAt: date.toISOString(),
        }),
      })

      if (response.ok) {
        setScheduledAt(date)
        setFormData({ ...formData, status: 'SCHEDULED' })
        setShowScheduleDialog(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to schedule page')
      }
    } catch (error) {
      console.error('Failed to schedule page:', error)
      alert('Failed to schedule page')
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
          contentType: 'page',
          contentId: pageId,
        }),
      })

      if (response.ok) {
        setScheduledAt(null)
        setFormData({ ...formData, status: 'DRAFT' })
        setShowScheduleDialog(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to unschedule page')
      }
    } catch (error) {
      console.error('Failed to unschedule page:', error)
      alert('Failed to unschedule page')
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
          <Link href="/admin/content/pages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pages
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Page</h1>
        </div>
        <div className="flex gap-2">
          {pageId && (
            <>
              <PreviewButton
                contentType="page"
                contentId={pageId}
                contentSlug={formData.slug}
              />
              <RevisionHistory contentType="page" contentId={pageId} />
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
        contentType="page"
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
                    placeholder="Enter page title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="page-url-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label>Content</Label>
                  <div className="border rounded-lg p-4 min-h-[400px] focus-within:border-blue-500">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={formData.template}
                    onValueChange={(value) =>
                      setFormData({ ...formData, template: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Update Page'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
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
                    placeholder="SEO title (optional)"
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
                    placeholder="Meta description (optional)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
