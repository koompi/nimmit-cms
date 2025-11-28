'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, ChevronDown, Plus, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  membershipRole?: string
  isDefault?: boolean
}

export function OrganizationSwitcher() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgSlug, setNewOrgSlug] = useState('')
  const [creating, setCreating] = useState(false)

  const currentOrg = organizations.find((o) => o.id === currentOrgId)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      const data = await response.json()
      setOrganizations(data.organizations || [])
      setCurrentOrgId(data.currentOrganizationId)
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitch = async (orgId: string) => {
    if (orgId === currentOrgId) return

    setSwitching(true)
    try {
      const response = await fetch('/api/admin/organizations/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })

      if (response.ok) {
        setCurrentOrgId(orgId)
        // Refresh the page to reload data for new organization
        router.refresh()
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to switch organization:', error)
    } finally {
      setSwitching(false)
    }
  }

  const handleCreate = async () => {
    if (!newOrgName || !newOrgSlug) return

    setCreating(true)
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName, slug: newOrgSlug }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreateDialogOpen(false)
        setNewOrgName('')
        setNewOrgSlug('')
        await fetchOrganizations()
        // Switch to the new organization
        await handleSwitch(data.id)
      }
    } catch (error) {
      console.error('Failed to create organization:', error)
    } finally {
      setCreating(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setNewOrgName(name)
    setNewOrgSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    )
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="w-full justify-start">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (organizations.length === 0) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
        <CreateOrgDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          name={newOrgName}
          slug={newOrgSlug}
          onNameChange={handleNameChange}
          onSlugChange={setNewOrgSlug}
          onCreate={handleCreate}
          creating={creating}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            disabled={switching}
          >
            <div className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[120px]">
                {currentOrg?.name || 'Select Organization'}
              </span>
            </div>
            {switching ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{org.name}</span>
                {org.id === currentOrgId && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrgDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        name={newOrgName}
        slug={newOrgSlug}
        onNameChange={handleNameChange}
        onSlugChange={setNewOrgSlug}
        onCreate={handleCreate}
        creating={creating}
      />
    </>
  )
}

function CreateOrgDialog({
  open,
  onOpenChange,
  name,
  slug,
  onNameChange,
  onSlugChange,
  onCreate,
  creating,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  slug: string
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
  onCreate: () => void
  creating: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to manage your content separately
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="My Company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="my-company"
            />
            <p className="text-xs text-gray-500">
              Used in URLs and must be unique
            </p>
          </div>
          <Button
            className="w-full"
            onClick={onCreate}
            disabled={creating || !name || !slug}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Organization'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
