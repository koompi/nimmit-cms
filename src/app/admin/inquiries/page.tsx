'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MessageSquare,
  Search,
  Mail,
  MailOpen,
  Reply,
  CheckCircle,
  Loader2,
  Phone,
  Calendar,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'

type Inquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED'
  readAt: string | null
  createdAt: string
}

type StatusCounts = {
  NEW?: number
  READ?: number
  REPLIED?: number
  CLOSED?: number
}

export default function InquiriesPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({})
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (authStatus === 'loading') return
    if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      router.push('/auth/login')
      return
    }
    fetchInquiries()
  }, [session, authStatus, router, page, statusFilter, search])

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/inquiries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries)
        setStatusCounts(data.statusCounts)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchInquiries()
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: status as Inquiry['status'] })
        }
      }
    } catch (error) {
      console.error('Failed to update inquiry:', error)
    }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchInquiries()
        setSelectedInquiry(null)
      }
    } catch (error) {
      console.error('Failed to delete inquiry:', error)
    }
  }

  const openInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    if (inquiry.status === 'NEW') {
      await updateStatus(inquiry.id, 'READ')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'READ':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'REPLIED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Mail className="w-3.5 h-3.5" />
      case 'READ':
        return <MailOpen className="w-3.5 h-3.5" />
      case 'REPLIED':
        return <Reply className="w-3.5 h-3.5" />
      case 'CLOSED':
        return <CheckCircle className="w-3.5 h-3.5" />
      default:
        return <Mail className="w-3.5 h-3.5" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  const totalInquiries =
    (statusCounts.NEW || 0) +
    (statusCounts.READ || 0) +
    (statusCounts.REPLIED || 0) +
    (statusCounts.CLOSED || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <MessageSquare className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Inquiries</h1>
            <p className="text-gray-400 text-sm">Manage contact form submissions and customer messages</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'all' ? 'ring-2 ring-yellow-500 border-yellow-500' : ''
          }`}
          onClick={() => setStatusFilter('all')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              All
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalInquiries}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'NEW' ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          onClick={() => setStatusFilter('NEW')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.NEW || 0}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'READ' ? 'ring-2 ring-yellow-500 border-yellow-500' : ''
          }`}
          onClick={() => setStatusFilter('READ')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <MailOpen className="w-4 h-4" />
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.READ || 0}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'REPLIED' ? 'ring-2 ring-green-500 border-green-500' : ''
          }`}
          onClick={() => setStatusFilter('REPLIED')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <Reply className="w-4 h-4" />
              Replied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{statusCounts.REPLIED || 0}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'CLOSED' ? 'ring-2 ring-gray-500 border-gray-500' : ''
          }`}
          onClick={() => setStatusFilter('CLOSED')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{statusCounts.CLOSED || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inquiries by name, email, or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">No inquiries found</p>
            <p className="text-sm mt-1">New messages will appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`p-4 hover:bg-yellow-50 cursor-pointer transition-colors ${
                  inquiry.status === 'NEW' ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => openInquiry(inquiry)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{inquiry.name}</span>
                      <Badge className={`${getStatusColor(inquiry.status)} flex items-center gap-1`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {inquiry.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{inquiry.message}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {inquiry.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) => {
                        event?.stopPropagation()
                        updateStatus(inquiry.id, value)
                      }}
                    >
                      <SelectTrigger className="w-[120px]" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="READ">Read</SelectItem>
                        <SelectItem value="REPLIED">Replied</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 bg-white rounded-lg border p-4">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-yellow-500" />
              {selectedInquiry?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(selectedInquiry.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedInquiry.status)}
                  {selectedInquiry.status}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedInquiry.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                  <p className="font-medium mt-1">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium mt-1">
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedInquiry.email}
                    </a>
                  </p>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="font-medium mt-1">
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedInquiry.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Message</p>
                <div className="p-4 bg-white border rounded-lg whitespace-pre-wrap text-gray-700">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(value) => updateStatus(selectedInquiry.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="READ">Read</SelectItem>
                      <SelectItem value="REPLIED">Replied</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`,
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Reply via Email
                  </Button>
                  {session?.user.role === 'ADMIN' && (
                    <Button
                      variant="destructive"
                      onClick={() => deleteInquiry(selectedInquiry.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
