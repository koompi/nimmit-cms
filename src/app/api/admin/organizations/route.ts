import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";

// GET /api/admin/organizations - List user's organizations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all organizations the user is a member of
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
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
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Also include the user's direct organization if not in memberships
    const directOrg = session.user.organizationId
      ? await prisma.organization.findUnique({
          where: { id: session.user.organizationId },
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
        })
      : null;

    const organizations = memberships.map((m) => ({
      ...m.organization,
      membershipRole: m.role,
      isDefault: m.isDefault,
    }));

    // Add direct org if not already in list
    if (directOrg && !organizations.find((o) => o.id === directOrg.id)) {
      organizations.unshift({
        ...directOrg,
        membershipRole: session.user.role as any, // User's role in direct org
        isDefault: true,
      });
    }

    return NextResponse.json({
      organizations,
      currentOrganizationId: session.user.organizationId,
    });
  } catch (error) {
    console.error("Organizations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, website } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is available
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Organization slug already exists" },
        { status: 400 }
      );
    }

    // Create organization and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          description,
          website,
        },
      });

      // Create membership for the creator as ADMIN
      await tx.organizationMembership.create({
        data: {
          userId: session.user.id,
          organizationId: organization.id,
          role: "ADMIN",
          isDefault: !session.user.organizationId, // Make default if user has no org
        },
      });

      // If user has no organization, set this as their default
      if (!session.user.organizationId) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { organizationId: organization.id },
        });
      }

      return organization;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Organizations POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
