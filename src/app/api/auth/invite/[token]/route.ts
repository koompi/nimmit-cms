import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/auth/invite/[token] - Get invitation details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        organization: invitation.organization,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Invitation GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/auth/invite/[token] - Accept invitation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 }
      );
    }

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if user email matches invitation (optional, can allow any logged-in user)
    // For flexibility, we'll allow any logged-in user to accept

    // Accept invitation in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark invitation as accepted
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // Check if membership already exists
      const existingMembership = await tx.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: invitation.organizationId,
          },
        },
      });

      if (!existingMembership) {
        // Create membership
        await tx.organizationMembership.create({
          data: {
            userId: session.user.id,
            organizationId: invitation.organizationId,
            role: invitation.role,
            isDefault: false,
          },
        });
      }

      // If user has no organization, set this as default
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });

      if (!user?.organizationId) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { organizationId: invitation.organizationId },
        });
      }
    });

    return NextResponse.json({
      success: true,
      organization: invitation.organization,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error("Invitation accept error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
