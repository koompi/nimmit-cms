import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =====================
// Role Definitions
// =====================
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  AUTHOR = "AUTHOR",
  USER = "USER",
}

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY: Role[] = [
  Role.USER,
  Role.AUTHOR,
  Role.EDITOR,
  Role.ADMIN,
  Role.SUPER_ADMIN,
];

// =====================
// Resource & Action Definitions
// =====================
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
  | "organizations";

export type Action = "view" | "create" | "edit" | "delete" | "publish";

// =====================
// Default Permission Matrix
// =====================
// This defines the default permissions for each role
// Can be overridden by database entries in RolePermission table
export const DEFAULT_PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
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
    posts: ["view", "create", "edit"], // Can only edit own posts
    pages: ["view"],
    products: ["view", "create", "edit"], // Can only edit own products
    categories: ["view"],
    tags: ["view", "create"],
    media: ["view", "create", "edit"], // Can only edit own media
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
};

// =====================
// Helper Functions
// =====================

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

// =====================
// Permission Checking
// =====================

/**
 * Check if a role has permission for a specific resource and action
 * First checks database overrides, then falls back to default matrix
 */
export async function checkPermission(
  role: Role,
  resource: Resource,
  action: Action
): Promise<boolean> {
  // Super admin always has access
  if (role === Role.SUPER_ADMIN) {
    return true;
  }

  // Check database for custom permission overrides
  try {
    const dbPermission = await prisma.permission.findUnique({
      where: { resource_action: { resource, action } },
      include: {
        rolePermissions: {
          where: { role },
        },
      },
    });

    // If permission exists in DB and role has it, allow
    if (dbPermission && dbPermission.rolePermissions.length > 0) {
      return true;
    }

    // If permission exists in DB but role doesn't have it, deny
    if (dbPermission && dbPermission.rolePermissions.length === 0) {
      // Fall through to check default matrix as backup
    }
  } catch (error) {
    // Database not available or error, use defaults
    console.warn("Permission DB check failed, using defaults:", error);
  }

  // Fall back to default permission matrix
  const rolePermissions = DEFAULT_PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Check if current user has permission
 */
export async function hasPermission(
  resource: Resource,
  action: Action
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return checkPermission(user.role as Role, resource, action);
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(role: Role | Role[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role as Role);
}

/**
 * Check if user has at least the specified role level
 */
export async function hasMinRole(minRole: Role): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return hasRoleLevel(user.role as Role, minRole);
}

// =====================
// Convenience Functions
// =====================

export async function isAdmin(): Promise<boolean> {
  return hasMinRole(Role.ADMIN);
}

export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(Role.SUPER_ADMIN);
}

export async function isEditor(): Promise<boolean> {
  return hasMinRole(Role.EDITOR);
}

export async function isAuthor(): Promise<boolean> {
  return hasMinRole(Role.AUTHOR);
}

export async function canView(resource: Resource): Promise<boolean> {
  return hasPermission(resource, "view");
}

export async function canCreate(resource: Resource): Promise<boolean> {
  return hasPermission(resource, "create");
}

export async function canEdit(resource: Resource): Promise<boolean> {
  return hasPermission(resource, "edit");
}

export async function canDelete(resource: Resource): Promise<boolean> {
  return hasPermission(resource, "delete");
}

export async function canPublish(resource: Resource): Promise<boolean> {
  return hasPermission(resource, "publish");
}

// =====================
// API Route Middleware
// =====================

export type PermissionCheckResult = {
  authorized: boolean;
  user: any | null;
  error?: string;
};

/**
 * Middleware function for API routes to check permissions
 * Returns the user if authorized, or null with error
 */
export async function requirePermission(
  resource: Resource,
  action: Action
): Promise<PermissionCheckResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false,
      user: null,
      error: "Unauthorized",
    };
  }

  const user = session.user;
  const hasAccess = await checkPermission(user.role as Role, resource, action);

  if (!hasAccess) {
    return {
      authorized: false,
      user,
      error: `Forbidden: Missing permission ${action} on ${resource}`,
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Combined auth + permission check for API routes
 * Returns NextResponse if unauthorized, or user if authorized
 */
export async function withPermission(
  resource: Resource,
  action: Action
): Promise<NextResponse | { user: any; organizationId: string }> {
  const { authorized, user, error } = await requirePermission(resource, action);

  if (!authorized) {
    if (!user) {
      return unauthorizedResponse(error);
    }
    return forbiddenResponse(error);
  }

  if (!user.organizationId) {
    return unauthorizedResponse("No organization assigned");
  }

  return { user, organizationId: user.organizationId };
}

// =====================
// Ownership Checking
// =====================

/**
 * Check if user owns a resource (for AUTHOR role restrictions)
 */
export async function isOwner(
  userId: string,
  resourceAuthorId: string
): Promise<boolean> {
  return userId === resourceAuthorId;
}

/**
 * Check if user can edit a specific resource instance
 * Authors can only edit their own content
 */
export async function canEditResource(
  resource: Resource,
  authorId?: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Editors and above can edit anything
  if (hasRoleLevel(user.role as Role, Role.EDITOR)) {
    return checkPermission(user.role as Role, resource, "edit");
  }

  // Authors can only edit their own content
  if (user.role === Role.AUTHOR && authorId) {
    return user.id === authorId;
  }

  return false;
}
