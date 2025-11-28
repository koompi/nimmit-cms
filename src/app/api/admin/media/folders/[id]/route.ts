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

// GET /api/admin/media/folders/[id] - Get a single folder with its contents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("media", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const folder = await prisma.mediaFolder.findFirst({
      where: { id, organizationId },
      include: {
        parent: true,
        children: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { media: true, children: true },
            },
          },
        },
        media: {
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { media: true, children: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Build breadcrumb path
    const breadcrumbs: { id: string; name: string }[] = [];
    let currentFolder = folder;
    while (currentFolder) {
      breadcrumbs.unshift({ id: currentFolder.id, name: currentFolder.name });
      if (currentFolder.parentId) {
        const parent = await prisma.mediaFolder.findUnique({
          where: { id: currentFolder.parentId },
        });
        currentFolder = parent as typeof currentFolder;
      } else {
        break;
      }
    }

    return NextResponse.json({ folder, breadcrumbs });
  } catch (error) {
    console.error("Folder GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/media/folders/[id] - Update a folder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("media", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;
    const body = await request.json();
    const { name, parentId, description } = body;

    // Check folder exists
    const existing = await prisma.mediaFolder.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      parentId?: string | null;
    } = {};

    if (name && typeof name === "string" && name.trim() !== "") {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name.trim());

      // Check for duplicate slug in same parent
      const duplicate = await prisma.mediaFolder.findFirst({
        where: {
          organizationId,
          slug: updateData.slug,
          parentId: parentId !== undefined ? parentId : existing.parentId,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "A folder with this name already exists in this location" },
          { status: 400 }
        );
      }
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (parentId !== undefined) {
      // Prevent circular reference
      if (parentId === id) {
        return NextResponse.json(
          { error: "A folder cannot be its own parent" },
          { status: 400 }
        );
      }

      // Check if new parent is a descendant of this folder
      if (parentId) {
        let checkFolder = await prisma.mediaFolder.findUnique({
          where: { id: parentId },
        });
        while (checkFolder) {
          if (checkFolder.id === id) {
            return NextResponse.json(
              { error: "Cannot move folder into its own subfolder" },
              { status: 400 }
            );
          }
          if (checkFolder.parentId) {
            checkFolder = await prisma.mediaFolder.findUnique({
              where: { id: checkFolder.parentId },
            });
          } else {
            break;
          }
        }
      }

      updateData.parentId = parentId;
    }

    const folder = await prisma.mediaFolder.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { media: true, children: true },
        },
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Folder PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media/folders/[id] - Delete a folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("media", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const moveToParent = searchParams.get("moveToParent") === "true";

    const folder = await prisma.mediaFolder.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { media: true, children: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (moveToParent) {
      // Move all contents to parent folder before deleting
      await prisma.$transaction([
        // Move media to parent
        prisma.media.updateMany({
          where: { folderId: id },
          data: { folderId: folder.parentId },
        }),
        // Move subfolders to parent
        prisma.mediaFolder.updateMany({
          where: { parentId: id },
          data: { parentId: folder.parentId },
        }),
        // Delete the folder
        prisma.mediaFolder.delete({
          where: { id },
        }),
      ]);
    } else {
      // Recursively delete folder and all contents
      await deleteRecursive(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Folder DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Recursively delete folder and all contents
async function deleteRecursive(folderId: string) {
  // Get all subfolders
  const subfolders = await prisma.mediaFolder.findMany({
    where: { parentId: folderId },
  });

  // Recursively delete subfolders
  for (const subfolder of subfolders) {
    await deleteRecursive(subfolder.id);
  }

  // Delete all media in this folder
  await prisma.media.deleteMany({
    where: { folderId },
  });

  // Delete the folder
  await prisma.mediaFolder.delete({
    where: { id: folderId },
  });
}
