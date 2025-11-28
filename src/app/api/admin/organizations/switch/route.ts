import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";

// POST /api/admin/organizations/switch - Switch current organization
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
      include: { organization: true },
    });

    // Also check direct organization relation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const hasAccess = membership || user?.organizationId === organizationId;

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Update user's current organization
    await prisma.user.update({
      where: { id: session.user.id },
      data: { organizationId },
    });

    // Update membership to be default
    if (membership) {
      // Reset all memberships to non-default
      await prisma.organizationMembership.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });

      // Set this one as default
      await prisma.organizationMembership.update({
        where: { id: membership.id },
        data: { isDefault: true },
      });
    }

    return NextResponse.json({
      success: true,
      organizationId,
      message: "Organization switched successfully",
    });
  } catch (error) {
    console.error("Organization switch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
