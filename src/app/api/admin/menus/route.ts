import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET /api/admin/menus - List all menus
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("menus", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    const where: any = {
      organizationId,
    };

    if (location) where.location = location;

    const menus = await prisma.menu.findMany({
      where,
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
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ menus });
  } catch (error) {
    console.error("Menus GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/menus - Create new menu
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("menus", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { name, location, items } = body;

    if (!name || !location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    // Check if menu name exists in this organization
    const existing = await prisma.menu.findUnique({
      where: {
        name_organizationId: {
          name,
          organizationId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Menu name already exists" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        location,
        organizationId,
        items: items
          ? {
              create: items.map(
                (
                  item: {
                    label: string;
                    url: string;
                    target?: string;
                    order?: number;
                  },
                  index: number
                ) => ({
                  label: item.label,
                  url: item.url,
                  target: item.target || "_self",
                  order: item.order ?? index,
                })
              ),
            }
          : undefined,
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Menu POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
