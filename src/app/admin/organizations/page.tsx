'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Mail, 
  Copy, 
  Trash2, 
  Plus,
  Loader2,
  CheckCircle,
  FileText,
  Package
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  website: string | null
  _count: {
    users: number
    posts: number
    products: number
    pages: number
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  token: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
}

export default function OrganizationSettingsPage() {
  useSession() // Ensure user is authenticated
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('USER')
  const [inviting, setInviting] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    fetchOrganization()
    fetchInvitations()
  }, [])

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      const data = await response.json()
      
      if (data.organizations?.length > 0) {
        const currentOrg = data.organizations.find(
          (o: Organization & { isDefault?: boolean }) => o.id === data.currentOrganizationId
        ) || data.organizations[0]
        
        setOrganization(currentOrg)
        setName(currentOrg.name)
        setSlug(currentOrg.slug)
        setDescription(currentOrg.description || '')
        setWebsite(currentOrg.website || '')
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/admin/organizations/invitations')
      const data = await response.json()
      setInvitations(data.invitations || [])
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    }
  }

  const handleSave = async () => {
    if (!organization) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/organizations/${organization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, website }),
      })

      if (response.ok) {
        await fetchOrganization()
      }
    } catch (error) {
      console.error('Failed to save organization:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return

    setInviting(true)
    try {
      const response = await fetch('/api/admin/organizations/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (response.ok) {
        setInviteDialogOpen(false)
        setInviteEmail('')
        setInviteRole('USER')
        await fetchInvitations()
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteInvitation = async (id: string) => {
    try {
      await fetch(`/api/admin/organizations/invitations?id=${id}`, {
        method: 'DELETE',
      })
      await fetchInvitations()
    } catch (error) {
      console.error('Failed to delete invitation:', error)
    }
  }

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/auth/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <Building2 className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Organization Settings</h1>
            <p className="text-gray-400 text-sm">Manage your organization details and team members</p>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <Card className="border rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-yellow-500" />
            Organization Details
          </CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Slug cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your organization"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      {organization && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{organization._count.users}</div>
                  <p className="text-sm text-gray-500">Team Members</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{organization._count.posts}</div>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{organization._count.pages}</div>
                  <p className="text-sm text-gray-500">Pages</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{organization._count.products}</div>
                  <p className="text-sm text-gray-500">Products</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Invitations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Invitations
              </CardTitle>
              <CardDescription>
                Invite new members to your organization
              </CardDescription>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="AUTHOR">Author</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail}
                  >
                    {inviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{invitation.role}</Badge>
                        {invitation.acceptedAt ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Accepted
                          </Badge>
                        ) : new Date(invitation.expiresAt) < new Date() ? (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!invitation.acceptedAt && new Date(invitation.expiresAt) > new Date() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInviteLink(invitation.token)}
                      >
                        {copiedToken === invitation.token ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvitation(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
