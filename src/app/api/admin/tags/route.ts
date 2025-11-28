import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET /api/admin/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("tags", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where = search
      ? {
          organizationId,
          OR: [{ name: { contains: search } }, { slug: { contains: search } }],
        }
      : { organizationId };

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tags GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("tags", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check if tag exists
    const existing = await prisma.tag.findFirst({
      where: {
        organizationId,
        OR: [{ slug: finalSlug }, { name }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag name or slug already exists" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: finalSlug,
        organizationId,
      },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Tag POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
