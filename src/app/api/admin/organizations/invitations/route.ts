import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";
import crypto from "crypto";

// GET /api/admin/organizations/invitations - List invitations for current org
export async function GET() {
  try {
    const authResult = await withPermission("users", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const invitations = await prisma.organizationInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Invitations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/organizations/invitations - Create invitation
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("users", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { email, role = "USER" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists in organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.organizationInvitation.findUnique({
      where: {
        email_organizationId: { email, organizationId },
      },
    });

    if (existingInvitation && !existingInvitation.acceptedAt) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Delete old invitation if exists and create new one
    if (existingInvitation) {
      await prisma.organizationInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        organizationId,
        role,
        token,
        expiresAt,
      },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
      },
    });

    // In production, send email here
    // For MVP, just return the invitation link
    const inviteUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/invite/${token}`;

    return NextResponse.json(
      {
        invitation,
        inviteUrl,
        message: "Invitation created. Share the link with the user.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invitations POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/organizations/invitations - Delete invitation
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withPermission("users", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    // Verify invitation belongs to this organization
    const invitation = await prisma.organizationInvitation.findFirst({
      where: { id: invitationId, organizationId },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    await prisma.organizationInvitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invitations DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
