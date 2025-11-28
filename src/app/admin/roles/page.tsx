'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Eye,
  Plus,
  Edit,
  Trash2,
  Send,
  Users,
  FileText,
  ImageIcon,
  Settings,
  Menu,
  Mail,
  Building
} from 'lucide-react'

interface Permission {
  resource: string
  action: string
  enabled: boolean
}

interface RoleData {
  name: string
  displayName: string
  description: string
  permissions: Permission[]
}

interface Resource {
  name: string
  displayName: string
}

interface Action {
  name: string
  displayName: string
}

const resourceIcons: Record<string, React.ReactNode> = {
  posts: <FileText className="w-4 h-4" />,
  pages: <FileText className="w-4 h-4" />,
  products: <FileText className="w-4 h-4" />,
  categories: <FileText className="w-4 h-4" />,
  tags: <FileText className="w-4 h-4" />,
  media: <ImageIcon className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  menus: <Menu className="w-4 h-4" />,
  inquiries: <Mail className="w-4 h-4" />,
  organizations: <Building className="w-4 h-4" />,
}

const actionIcons: Record<string, React.ReactNode> = {
  view: <Eye className="w-3 h-3" />,
  create: <Plus className="w-3 h-3" />,
  edit: <Edit className="w-3 h-3" />,
  delete: <Trash2 className="w-3 h-3" />,
  publish: <Send className="w-3 h-3" />,
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  EDITOR: 'bg-blue-100 text-blue-800 border-blue-200',
  AUTHOR: 'bg-green-100 text-green-800 border-green-200',
  USER: 'bg-gray-100 text-gray-800 border-gray-200',
}

const roleIcons: Record<string, React.ReactNode> = {
  SUPER_ADMIN: <ShieldAlert className="w-5 h-5" />,
  ADMIN: <ShieldCheck className="w-5 h-5" />,
  EDITOR: <Shield className="w-5 h-5" />,
  AUTHOR: <Shield className="w-5 h-5" />,
  USER: <Shield className="w-5 h-5" />,
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<RoleData[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }

    const loadRoles = async () => {
      try {
        const response = await fetch('/api/admin/roles')
        if (response.ok) {
          const data = await response.json()
          setRoles(data.roles)
          setResources(data.resources)
          setActions(data.actions)
          if (data.roles.length > 0) {
            setSelectedRole(data.roles[0].name)
          }
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRoles()
  }, [session, status])

  const hasPermission = (role: RoleData, resource: string, action: string) => {
    return role.permissions.some(
      p => p.resource === resource && p.action === action && p.enabled
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
          <p className="text-sm text-gray-500">Loading roles...</p>
        </div>
      </div>
    )
  }

  const currentRole = roles.find(r => r.name === selectedRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl font-bold">Role Management</h1>
        </div>
        <p className="text-gray-300">
          View and manage user roles and their permissions
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roles.map((role) => (
          <Card
            key={role.name}
            className={`cursor-pointer transition-all border rounded-xl overflow-hidden ${
              selectedRole === role.name 
                ? 'ring-2 ring-yellow-500 shadow-lg bg-yellow-50' 
                : 'hover:shadow-md hover:border-yellow-300'
            }`}
            onClick={() => setSelectedRole(role.name)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${roleColors[role.name]}`}>
                  {roleIcons[role.name]}
                </div>
                <div>
                  <CardTitle className="text-sm">{role.displayName}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {role.description}
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs bg-gray-100">
                  {role.permissions.length} permissions
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      {currentRole && (
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${roleColors[currentRole.name]}`}>
                {roleIcons[currentRole.name]}
              </div>
              <div>
                <CardTitle>{currentRole.displayName} Permissions</CardTitle>
                <CardDescription>{currentRole.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Resource</th>
                    {actions.map(action => (
                      <th key={action.name} className="text-center py-3 px-2 font-medium text-gray-700">
                        <div className="flex flex-col items-center gap-1">
                          {actionIcons[action.name]}
                          <span className="text-xs">{action.displayName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map(resource => (
                    <tr key={resource.name} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">{resourceIcons[resource.name]}</span>
                          <span className="font-medium">{resource.displayName}</span>
                        </div>
                      </td>
                      {actions.map(action => (
                        <td key={action.name} className="text-center py-3 px-2">
                          {hasPermission(currentRole, resource.name, action.name) ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-0 p-4 bg-gray-50 border-t">
              <h4 className="font-medium mb-2 text-gray-700">Permission Legend</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Has Permission</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-gray-600">No Permission</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-yellow-50 border-yellow-200 rounded-xl overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">About Role-Based Access Control</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Permissions are currently managed through a default matrix. Each role has predefined 
                access levels that determine what actions users can perform on different resources.
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li><strong>Super Admin:</strong> Full system access across all organizations</li>
                <li><strong>Admin:</strong> Full access within their organization</li>
                <li><strong>Editor:</strong> Can manage all content but not users or settings</li>
                <li><strong>Author:</strong> Can create and edit their own content only</li>
                <li><strong>User:</strong> Read-only access to public content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
