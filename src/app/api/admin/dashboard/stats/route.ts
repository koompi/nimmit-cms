import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

export async function GET() {
  try {
    // Dashboard view requires basic authentication - any logged in user can view
    const authResult = await withPermission("posts", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    // Get counts for dashboard (filtered by organization)
    const orgFilter = { organizationId };

    const [
      postsCount,
      publishedPostsCount,
      pagesCount,
      productsCount,
      usersCount,
      mediaCount,
      inquiriesCount,
      newInquiriesCount,
      recentPosts,
      recentInquiries,
    ] = await Promise.all([
      prisma.post.count({ where: orgFilter }),
      prisma.post.count({ where: { ...orgFilter, status: "PUBLISHED" } }),
      prisma.page.count({ where: orgFilter }),
      prisma.product.count({ where: orgFilter }),
      prisma.user.count({ where: orgFilter }),
      prisma.media.count({ where: orgFilter }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.post.findMany({
        where: orgFilter,
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const stats = {
      posts: {
        total: postsCount,
        published: publishedPostsCount,
        draft: postsCount - publishedPostsCount,
      },
      pages: pagesCount,
      products: productsCount,
      users: usersCount,
      media: mediaCount,
      inquiries: {
        total: inquiriesCount,
        new: newInquiriesCount,
      },
      recentPosts,
      recentInquiries,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
