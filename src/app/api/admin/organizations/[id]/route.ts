import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/organizations/[id] - Get organization details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            posts: true,
            products: true,
            pages: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Organization GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/organizations/[id] - Update organization
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    // Users can only update their own organization
    if (id !== organizationId) {
      return NextResponse.json(
        { error: "You can only update your own organization" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, website, logo } = body;

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(logo !== undefined && { logo }),
      },
      include: {
        _count: {
          select: {
            users: true,
            posts: true,
            products: true,
            pages: true,
          },
        },
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Organization PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
