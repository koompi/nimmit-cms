'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

// =====================
// Role Definitions (mirror from server)
// =====================
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  AUTHOR = "AUTHOR",
  USER = "USER"
}

export type Resource = 
  | "posts" 
  | "pages" 
  | "products" 
  | "categories"
  | "tags"
  | "media" 
  | "users" 
  | "settings" 
  | "menus" 
  | "inquiries"
  | "organizations"

export type Action = "view" | "create" | "edit" | "delete" | "publish"

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: Role[] = [
  Role.USER,
  Role.AUTHOR,
  Role.EDITOR,
  Role.ADMIN,
  Role.SUPER_ADMIN
]

// Default permission matrix (same as server)
const DEFAULT_PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  [Role.SUPER_ADMIN]: {
    posts: ["view", "create", "edit", "delete", "publish"],
    pages: ["view", "create", "edit", "delete", "publish"],
    products: ["view", "create", "edit", "delete", "publish"],
    categories: ["view", "create", "edit", "delete", "publish"],
    tags: ["view", "create", "edit", "delete", "publish"],
    media: ["view", "create", "edit", "delete", "publish"],
    users: ["view", "create", "edit", "delete", "publish"],
    settings: ["view", "create", "edit", "delete", "publish"],
    menus: ["view", "create", "edit", "delete", "publish"],
    inquiries: ["view", "create", "edit", "delete", "publish"],
    organizations: ["view", "create", "edit", "delete", "publish"],
  },
  [Role.ADMIN]: {
    posts: ["view", "create", "edit", "delete", "publish"],
    pages: ["view", "create", "edit", "delete", "publish"],
    products: ["view", "create", "edit", "delete", "publish"],
    categories: ["view", "create", "edit", "delete", "publish"],
    tags: ["view", "create", "edit", "delete", "publish"],
    media: ["view", "create", "edit", "delete", "publish"],
    users: ["view", "create", "edit", "delete"],
    settings: ["view", "edit"],
    menus: ["view", "create", "edit", "delete", "publish"],
    inquiries: ["view", "edit", "delete"],
    organizations: ["view", "edit"],
  },
  [Role.EDITOR]: {
    posts: ["view", "create", "edit", "delete", "publish"],
    pages: ["view", "create", "edit", "delete", "publish"],
    products: ["view", "create", "edit", "delete", "publish"],
    categories: ["view", "create", "edit", "delete"],
    tags: ["view", "create", "edit", "delete"],
    media: ["view", "create", "edit", "delete"],
    users: ["view"],
    settings: ["view"],
    menus: ["view", "create", "edit", "delete"],
    inquiries: ["view", "edit"],
    organizations: [],
  },
  [Role.AUTHOR]: {
    posts: ["view", "create", "edit"],
    pages: ["view"],
    products: ["view", "create", "edit"],
    categories: ["view"],
    tags: ["view", "create"],
    media: ["view", "create", "edit"],
    users: ["view"],
    settings: [],
    menus: ["view"],
    inquiries: ["view"],
    organizations: [],
  },
  [Role.USER]: {
    posts: ["view"],
    pages: ["view"],
    products: ["view"],
    categories: ["view"],
    tags: ["view"],
    media: ["view"],
    users: [],
    settings: [],
    menus: ["view"],
    inquiries: [],
    organizations: [],
  },
}

// =====================
// Helper Functions
// =====================

function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role)
}

function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

function checkPermission(role: Role, resource: Resource, action: Action): boolean {
  if (role === Role.SUPER_ADMIN) return true
  
  const rolePermissions = DEFAULT_PERMISSIONS[role]
  if (!rolePermissions) return false

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}

// =====================
// usePermissions Hook
// =====================

export interface UsePermissionsReturn {
  role: Role | null
  isLoading: boolean
  isAuthenticated: boolean
  hasPermission: (resource: Resource, action: Action) => boolean
  hasRole: (role: Role | Role[]) => boolean
  hasMinRole: (minRole: Role) => boolean
  canView: (resource: Resource) => boolean
  canCreate: (resource: Resource) => boolean
  canEdit: (resource: Resource) => boolean
  canDelete: (resource: Resource) => boolean
  canPublish: (resource: Resource) => boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isEditor: boolean
  isAuthor: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession()
  
  const role = (session?.user?.role as Role) || null
  const isLoading = status === 'loading'
  const isAuthenticated = !!session

  const permissions = useMemo(() => {
    const hasPermissionFn = (resource: Resource, action: Action): boolean => {
      if (!role) return false
      return checkPermission(role, resource, action)
    }

    const hasRoleFn = (targetRole: Role | Role[]): boolean => {
      if (!role) return false
      const roles = Array.isArray(targetRole) ? targetRole : [targetRole]
      return roles.includes(role)
    }

    const hasMinRoleFn = (minRole: Role): boolean => {
      if (!role) return false
      return hasRoleLevel(role, minRole)
    }

    return {
      hasPermission: hasPermissionFn,
      hasRole: hasRoleFn,
      hasMinRole: hasMinRoleFn,
      canView: (resource: Resource) => hasPermissionFn(resource, 'view'),
      canCreate: (resource: Resource) => hasPermissionFn(resource, 'create'),
      canEdit: (resource: Resource) => hasPermissionFn(resource, 'edit'),
      canDelete: (resource: Resource) => hasPermissionFn(resource, 'delete'),
      canPublish: (resource: Resource) => hasPermissionFn(resource, 'publish'),
      isAdmin: hasMinRoleFn(Role.ADMIN),
      isSuperAdmin: hasRoleFn(Role.SUPER_ADMIN),
      isEditor: hasMinRoleFn(Role.EDITOR),
      isAuthor: hasMinRoleFn(Role.AUTHOR),
    }
  }, [role])

  return {
    role,
    isLoading,
    isAuthenticated,
    ...permissions,
  }
}

// =====================
// PermissionGate Component
// =====================

interface PermissionGateProps {
  children: React.ReactNode
  resource?: Resource
  action?: Action
  role?: Role | Role[]
  minRole?: Role
  fallback?: React.ReactNode
  showLoading?: boolean
}

export function PermissionGate({
  children,
  resource,
  action,
  role: requiredRole,
  minRole,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { isLoading, hasPermission, hasRole, hasMinRole } = usePermissions()

  if (isLoading && showLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded" />
  }

  if (isLoading) {
    return null
  }

  let hasAccess = false

  // Check specific permission
  if (resource && action) {
    hasAccess = hasPermission(resource, action)
  }
  // Check specific role
  else if (requiredRole) {
    hasAccess = hasRole(requiredRole)
  }
  // Check minimum role level
  else if (minRole) {
    hasAccess = hasMinRole(minRole)
  }
  // No requirements = allow
  else {
    hasAccess = true
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// =====================
// Utility Components
// =====================

// Show content only to admins
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate minRole={Role.ADMIN} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// Show content only to editors and above
export function EditorOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate minRole={Role.EDITOR} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// Show content only to authors and above
export function AuthorOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate minRole={Role.AUTHOR} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// Can Create Resource Button/Content wrapper
export function CanCreate({ 
  resource, 
  children, 
  fallback = null 
}: { 
  resource: Resource
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate resource={resource} action="create" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// Can Edit Resource Button/Content wrapper
export function CanEdit({ 
  resource, 
  children, 
  fallback = null 
}: { 
  resource: Resource
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate resource={resource} action="edit" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// Can Delete Resource Button/Content wrapper
export function CanDelete({ 
  resource, 
  children, 
  fallback = null 
}: { 
  resource: Resource
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate resource={resource} action="delete" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
