import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { createPage } from "@/modules/content/services/page";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("pages", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
    };

    if (status) where.status = status;

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.page.count({ where }),
    ]);

    return NextResponse.json({
      pages,
      total,
      page: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Pages GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("pages", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { title, content, status, template, seo } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate slug from title
    let slug = slugify(title);

    // Check if slug already exists in this organization
    const existingPage = await prisma.page.findUnique({
      where: {
        slug_organizationId: {
          slug,
          organizationId,
        },
      },
    });

    if (existingPage) {
      slug = `${slug}-${Date.now()}`;
    }

    const page = await createPage({
      title,
      slug,
      content,
      status,
      template,
      seo,
      organizationId,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Pages POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
