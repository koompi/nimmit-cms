import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { withPermission } from "@/lib/permissions";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBNAIL_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "thumbnails"
);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for bulk uploads
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
];

// Ensure upload directories exist
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await mkdir(THUMBNAIL_DIR, { recursive: true });
  } catch {
    // Directory might already exist
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${sanitized}-${timestamp}-${random}${ext.toLowerCase()}`;
}

// GET /api/admin/media - List media files
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("media", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const type = searchParams.get("type"); // 'image', 'video', 'document'
    const folderId = searchParams.get("folderId"); // null for root, 'all' for all media
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
    };

    // Filter by folder
    if (folderId === "all") {
      // Show all media regardless of folder
    } else if (folderId) {
      where.folderId = folderId;
    } else {
      // Default: show root-level media (no folder)
      where.folderId = null;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { originalName: { contains: search } },
        { alt: { contains: search } },
        { caption: { contains: search } },
      ];
    }

    if (type === "image") {
      where.mimeType = { startsWith: "image/" };
    } else if (type === "video") {
      where.mimeType = { startsWith: "video/" };
    } else if (type === "document") {
      where.mimeType = "application/pdf";
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
          folder: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/media - Upload new media (supports bulk)
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("media", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { user, organizationId } = authResult;

    await ensureUploadDir();

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const folderId = formData.get("folderId") as string | null;
    const alt = formData.get("alt") as string | null;
    const caption = formData.get("caption") as string | null;

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
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

    const uploadResults: {
      success: boolean;
      filename: string;
      error?: string;
      media?: unknown;
    }[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        uploadResults.push({
          success: false,
          filename: file.name,
          error: `File type not allowed: ${file.type}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        uploadResults.push({
          success: false,
          filename: file.name,
          error: `File too large. Maximum size: ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        });
        continue;
      }

      try {
        // Generate unique filename
        const filename = generateFilename(file.name);
        const filepath = path.join(UPLOAD_DIR, filename);
        const url = `/uploads/${filename}`;

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Get image dimensions (placeholder - would use sharp in production)
        const width: number | null = null;
        const height: number | null = null;

        // Create media record in database
        const media = await prisma.media.create({
          data: {
            filename,
            originalName: file.name,
            alt,
            caption,
            mimeType: file.type,
            size: file.size,
            width,
            height,
            url,
            folderId: folderId || null,
            uploadedById: user?.id,
            organizationId,
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

        uploadResults.push({
          success: true,
          filename: file.name,
          media,
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        uploadResults.push({
          success: false,
          filename: file.name,
          error: "Upload failed",
        });
      }
    }

    // If single file, return just the result
    if (files.length === 1) {
      if (uploadResults[0].success) {
        return NextResponse.json(uploadResults[0].media, { status: 201 });
      } else {
        return NextResponse.json(
          { error: uploadResults[0].error },
          { status: 400 }
        );
      }
    }

    // For bulk upload, return all results
    const successCount = uploadResults.filter((r) => r.success).length;
    return NextResponse.json(
      {
        results: uploadResults,
        summary: {
          total: files.length,
          success: successCount,
          failed: files.length - successCount,
        },
      },
      { status: successCount > 0 ? 201 : 400 }
    );
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/media - Bulk operations (move to folder, delete multiple)
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withPermission("media", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { operation, mediaIds, folderId } = body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: "Media IDs required" },
        { status: 400 }
      );
    }

    if (operation === "move") {
      // Move media to folder
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

      const result = await prisma.media.updateMany({
        where: {
          id: { in: mediaIds },
          organizationId,
        },
        data: {
          folderId: folderId || null,
        },
      });

      return NextResponse.json({
        success: true,
        updated: result.count,
      });
    }

    if (operation === "delete") {
      // Bulk delete
      const result = await prisma.media.deleteMany({
        where: {
          id: { in: mediaIds },
          organizationId,
        },
      });

      return NextResponse.json({
        success: true,
        deleted: result.count,
      });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error("Media PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
