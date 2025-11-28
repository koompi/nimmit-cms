'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  FileText,
  FilePlus,
  Package,
  Users,
  Image,
  MessageSquare,
  Plus,
  Settings,
  TrendingUp,
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react'

interface DashboardStats {
  posts: { total: number; published: number; draft: number }
  pages: number
  products: number
  users: number
  media: number
  inquiries: { total: number; new: number }
  recentPosts: Array<{
    id: string
    title: string
    slug: string
    status: string
    createdAt: string
    author: { name: string }
  }>
  recentInquiries: Array<{
    id: string
    name: string
    email: string
    subject: string
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
      NEW: 'bg-blue-100 text-blue-700 border-blue-200',
      READ: 'bg-gray-100 text-gray-600 border-gray-200',
      REPLIED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Posts',
      value: stats?.posts.total || 0,
      subtitle: `${stats?.posts.published || 0} published`,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      href: '/admin/content/posts'
    },
    {
      title: 'Pages',
      value: stats?.pages || 0,
      subtitle: 'Total pages',
      icon: FilePlus,
      gradient: 'from-violet-500 to-violet-600',
      href: '/admin/content/pages'
    },
    {
      title: 'Products',
      value: stats?.products || 0,
      subtitle: 'In catalog',
      icon: Package,
      gradient: 'from-emerald-500 to-emerald-600',
      href: '/admin/content/products'
    },
    {
      title: 'Users',
      value: stats?.users || 0,
      subtitle: 'Team members',
      icon: Users,
      gradient: 'from-amber-500 to-amber-600',
      href: '/admin/users'
    },
    {
      title: 'Media',
      value: stats?.media || 0,
      subtitle: 'Files uploaded',
      icon: Image,
      gradient: 'from-pink-500 to-pink-600',
      href: '/admin/media'
    },
    {
      title: 'Inquiries',
      value: stats?.inquiries.total || 0,
      subtitle: stats?.inquiries.new ? `${stats.inquiries.new} new` : 'No new',
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-cyan-600',
      href: '/admin/inquiries',
      highlight: (stats?.inquiries.new || 0) > 0
    },
  ]

  const quickActions = [
    { label: 'New Post', href: '/admin/content/posts/new', icon: FileText },
    { label: 'New Page', href: '/admin/content/pages/new', icon: FilePlus },
    { label: 'New Product', href: '/admin/content/products/new', icon: Package },
    { label: 'Upload Media', href: '/admin/media', icon: Image },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-[#fdc501] rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Welcome back</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Hello, {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            Here&apos;s what&apos;s happening with your site today.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Zap className="h-48 w-48 text-[#fdc501]" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${stat.highlight ? 'ring-2 ring-[#fdc501] ring-offset-2' : ''}`}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-dashed border-2 bg-gray-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#fdc501]" />
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#fdc501] hover:bg-[#fdc501]/5 transition-all group"
                >
                  <action.icon className="h-5 w-5 text-gray-400 group-hover:text-[#fdc501] transition-colors" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Recent Posts</CardTitle>
              </div>
              <Link href="/admin/content/posts">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentPosts && stats.recentPosts.length > 0 ? (
              <div className="space-y-1">
                {stats.recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/content/posts/${post.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {post.author.name} • {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(post.status)} text-xs border`}>
                      {post.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No posts yet</p>
                <Link href="/admin/content/posts/new">
                  <Button size="sm" variant="outline" className="mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Create your first post
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-cyan-600" />
                </div>
                <CardTitle className="text-lg">Recent Inquiries</CardTitle>
              </div>
              <Link href="/admin/inquiries">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentInquiries && stats.recentInquiries.length > 0 ? (
              <div className="space-y-1">
                {stats.recentInquiries.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href="/admin/inquiries"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 truncate group-hover:text-cyan-600 transition-colors">
                        {inquiry.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {inquiry.name} • {formatDate(inquiry.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(inquiry.status)} text-xs border`}>
                      {inquiry.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No inquiries yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Inquiries from your contact form will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Card */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#fdc501] flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Configure your site</h3>
              <p className="text-sm text-gray-600 mb-3">
                Set up your site name, logo, SEO settings, and more to get the most out of your CMS.
              </p>
              <Link href="/admin/settings">
                <Button size="sm" className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white">
                  Go to Settings
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
