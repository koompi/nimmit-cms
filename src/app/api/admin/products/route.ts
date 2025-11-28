import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { withPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("products", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
    };

    if (status) where.status = status;
    if (featured === "true") where.featured = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("products", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      inventory,
      trackInventory,
      status,
      featured,
      specifications,
      seo,
      categories,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!sku) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    }

    // Check if SKU already exists in this organization
    const existingSku = await prisma.product.findUnique({
      where: {
        sku_organizationId: {
          sku,
          organizationId,
        },
      },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 400 }
      );
    }

    // Generate slug from name
    let slug = slugify(name);

    // Check if slug already exists in this organization
    const existingProduct = await prisma.product.findUnique({
      where: {
        slug_organizationId: {
          slug,
          organizationId,
        },
      },
    });

    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || {},
        shortDescription,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku,
        inventory: parseInt(inventory) || 0,
        trackInventory: trackInventory ?? true,
        status: status || "DRAFT",
        featured: featured ?? false,
        specifications: specifications || {},
        gallery: [],
        options: {},
        seo: seo || {},
        organizationId,
        categories: categories?.length
          ? {
              create: categories.map((categoryId: string) => ({
                category: {
                  connect: { id: categoryId },
                },
              })),
            }
          : undefined,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
