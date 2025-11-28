import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "post";

    if (type === "product") {
      const category = await prisma.productCategory.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          _count: { select: { products: true } },
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { posts: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, parentId, type, image } = body;

    if (type === "product") {
      // Check if slug/name is taken by another category
      if (slug || name) {
        const existing = await prisma.productCategory.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [...(slug ? [{ slug }] : []), ...(name ? [{ name }] : [])],
              },
            ],
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Category name or slug already exists" },
            { status: 400 }
          );
        }
      }

      const category = await prisma.productCategory.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          image,
          parentId,
        },
        include: {
          parent: true,
          _count: { select: { products: true } },
        },
      });

      return NextResponse.json(category);
    }

    // Update post category
    if (slug || name) {
      const existing = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [...(slug ? [{ slug }] : []), ...(name ? [{ name }] : [])],
            },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Category name or slug already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        parentId,
      },
      include: {
        parent: true,
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "post";

    if (type === "product") {
      // Delete product category associations first
      await prisma.categoryProduct.deleteMany({
        where: { categoryId: id },
      });

      // Update children to have no parent
      await prisma.productCategory.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });

      await prisma.productCategory.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    }

    // Delete post category associations first
    await prisma.postCategory.deleteMany({
      where: { categoryId: id },
    });

    // Update children to have no parent
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
