import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { withPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    // Check permission: posts.view
    const authResult = await withPermission("posts", "view");
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

    if (status) {
      where.status = status;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
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
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Posts GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission: posts.create
    const authResult = await withPermission("posts", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { user, organizationId } = authResult;

    const body = await request.json();
    const { title, content, excerpt, status, featuredImage, seo, categories } =
      body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate slug from title
    let slug = slugify(title);

    // Check if slug already exists in this organization
    const existingPost = await prisma.post.findUnique({
      where: {
        slug_organizationId: {
          slug,
          organizationId,
        },
      },
    });

    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: content || {},
        excerpt,
        status: status || "DRAFT",
        featuredImage,
        seo: seo || {},
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        organizationId,
        authorId: user.id,
        categories: categories
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
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Posts POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
