import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";
import { unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// GET /api/admin/media/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("media", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;
    const media = await prisma.media.findFirst({
      where: { id, organizationId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        folder: {
          select: { id: true, name: true },
        },
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/media/[id] - Update media metadata
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
    const { alt, caption, folderId } = body;

    // Check media exists
    const existing = await prisma.media.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Verify folder exists if provided
    if (folderId) {
      const folder = await prisma.mediaFolder.findFirst({
        where: { id: folderId, organizationId },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }
    }

    const media = await prisma.media.update({
      where: { id },
      data: {
        alt,
        caption,
        folderId: folderId !== undefined ? folderId : existing.folderId,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        folder: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Media PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("media", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    // Get media record to find the file
    const media = await prisma.media.findFirst({
      where: { id, organizationId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete file from disk
    try {
      const filepath = path.join(UPLOAD_DIR, media.filename);
      await unlink(filepath);
    } catch {
      // File might not exist, continue with database deletion
      console.warn(`Could not delete file: ${media.filename}`);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
