import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/admin/media/folders - List all folders in a tree structure
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("media", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId"); // null for root folders
    const flat = searchParams.get("flat") === "true"; // Return flat list instead of tree

    if (flat) {
      // Return flat list of all folders
      const folders = await prisma.mediaFolder.findMany({
        where: { organizationId },
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { media: true, children: true },
          },
        },
      });

      return NextResponse.json({ folders });
    }

    // Return tree structure (only children of parentId)
    const folders = await prisma.mediaFolder.findMany({
      where: {
        organizationId,
        parentId: parentId || null,
      },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { media: true, children: true },
        },
        children: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { media: true, children: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Folders GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/media/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("media", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { name, parentId, description } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name.trim());

    // Check for duplicate slug in same parent
    const existing = await prisma.mediaFolder.findFirst({
      where: {
        organizationId,
        slug,
        parentId: parentId || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A folder with this name already exists in this location" },
        { status: 400 }
      );
    }

    // Verify parent exists if provided
    if (parentId) {
      const parent = await prisma.mediaFolder.findFirst({
        where: { id: parentId, organizationId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    const folder = await prisma.mediaFolder.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        parentId: parentId || null,
        organizationId: organizationId!,
      },
      include: {
        _count: {
          select: { media: true, children: true },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Folder POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
