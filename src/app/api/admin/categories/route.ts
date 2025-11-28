import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("categories", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "post"; // 'post' or 'product'
    const includeHierarchy = searchParams.get("hierarchy") === "true";

    if (type === "product") {
      // Get product categories
      const categories = await prisma.productCategory.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
        include: includeHierarchy
          ? {
              parent: true,
              children: true,
              _count: { select: { products: true } },
            }
          : { _count: { select: { products: true } } },
      });

      return NextResponse.json({ categories, type: "product" });
    }

    // Get post categories (default)
    const categories = await prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      include: includeHierarchy
        ? {
            parent: true,
            children: true,
            _count: { select: { posts: true } },
          }
        : { _count: { select: { posts: true } } },
    });

    return NextResponse.json({ categories, type: "post" });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("categories", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { name, slug, description, parentId, type, image } = body;

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

    if (type === "product") {
      // Check if slug exists for product categories
      const existing = await prisma.productCategory.findFirst({
        where: {
          organizationId,
          OR: [{ slug: finalSlug }, { name }],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Category name or slug already exists" },
          { status: 400 }
        );
      }

      const category = await prisma.productCategory.create({
        data: {
          name,
          slug: finalSlug,
          description,
          image,
          parentId,
          organizationId,
        },
        include: {
          parent: true,
          _count: { select: { products: true } },
        },
      });

      return NextResponse.json(category, { status: 201 });
    }

    // Create post category (default)
    const existing = await prisma.category.findFirst({
      where: {
        organizationId,
        OR: [{ slug: finalSlug }, { name }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category name or slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        parentId,
        organizationId,
      },
      include: {
        parent: true,
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
