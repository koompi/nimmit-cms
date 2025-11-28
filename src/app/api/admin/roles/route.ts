import { NextResponse } from "next/server";
import {
  withPermission,
  Role,
  DEFAULT_PERMISSIONS,
  Action,
} from "@/lib/permissions";

// GET /api/admin/roles - Get all roles with their permissions
export async function GET() {
  try {
    // Check permission: users.view (role management requires user management access)
    const authResult = await withPermission("users", "view");
    if (authResult instanceof NextResponse) return authResult;

    // Build role data from default permissions matrix
    // Note: When DB models are available, this will also check for custom overrides
    const roles = Object.values(Role).map((role) => {
      const defaultPerms = DEFAULT_PERMISSIONS[role] || {};

      // Flatten permissions into array format
      const permissions: {
        resource: string;
        action: string;
        enabled: boolean;
      }[] = [];

      for (const [resource, actions] of Object.entries(defaultPerms)) {
        for (const action of actions as Action[]) {
          permissions.push({
            resource,
            action,
            enabled: true,
          });
        }
      }

      return {
        name: role,
        displayName: formatRoleName(role),
        description: getRoleDescription(role),
        permissions,
      };
    });

    return NextResponse.json({
      roles,
      resources: getResources(),
      actions: getActions(),
    });
  } catch (error) {
    console.error("Roles GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/roles/permissions - Update role permissions
// Note: This is a placeholder. Custom permission overrides will be enabled
// after running: npx prisma migrate dev
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Custom permission management requires database migration. Run: npx prisma migrate dev",
    },
    { status: 501 }
  );
}

// Helper functions
function formatRoleName(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    SUPER_ADMIN: "Full system access, can manage other administrators",
    ADMIN: "Full organization access, can manage users and settings",
    EDITOR: "Can create, edit, and publish all content",
    AUTHOR: "Can create and edit own content only",
    USER: "Read-only access to public content",
  };
  return descriptions[role] || "";
}

function getResources() {
  return [
    { name: "posts", displayName: "Blog Posts" },
    { name: "pages", displayName: "Pages" },
    { name: "products", displayName: "Products" },
    { name: "categories", displayName: "Categories" },
    { name: "tags", displayName: "Tags" },
    { name: "media", displayName: "Media Library" },
    { name: "users", displayName: "Users" },
    { name: "settings", displayName: "Settings" },
    { name: "menus", displayName: "Menus" },
    { name: "inquiries", displayName: "Inquiries" },
    { name: "organizations", displayName: "Organizations" },
  ];
}

function getActions() {
  return [
    { name: "view", displayName: "View" },
    { name: "create", displayName: "Create" },
    { name: "edit", displayName: "Edit" },
    { name: "delete", displayName: "Delete" },
    { name: "publish", displayName: "Publish" },
  ];
}
