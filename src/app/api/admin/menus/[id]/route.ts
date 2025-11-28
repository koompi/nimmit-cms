import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/menus/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: "asc" },
          include: {
            children: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Menu GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menus/[id]
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
    const { name, location, items } = body;

    // Check if name is taken by another menu
    if (name) {
      const existing = await prisma.menu.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Menu name already exists" },
          { status: 400 }
        );
      }
    }

    // Update menu and replace items
    if (items !== undefined) {
      // Delete existing items
      await prisma.menuItem.deleteMany({
        where: { menuId: id },
      });

      // Create new items with hierarchy
      if (items.length > 0) {
        // First pass: create all items without parent references
        const itemMap = new Map<string, string>();

        for (const item of items) {
          const created = await prisma.menuItem.create({
            data: {
              menuId: id,
              label: item.label,
              url: item.url,
              target: item.target || "_self",
              order: item.order ?? 0,
            },
          });
          if (item.tempId) {
            itemMap.set(item.tempId, created.id);
          }
        }

        // Second pass: update parent references
        for (const item of items) {
          if (item.parentTempId && item.tempId) {
            const itemId = itemMap.get(item.tempId);
            const parentId = itemMap.get(item.parentTempId);
            if (itemId && parentId) {
              await prisma.menuItem.update({
                where: { id: itemId },
                data: { parentId },
              });
            }
          }
        }
      }
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: { name, location },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: "asc" },
          include: {
            children: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Menu PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menus/[id]
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

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Menu DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
