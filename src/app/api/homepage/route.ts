import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch homepage settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "siteName",
            "siteTagline",
            "heroTitle",
            "heroSubtitle",
            "heroCta1Text",
            "heroCta1Link",
            "heroCta2Text",
            "heroCta2Link",
            "feature1Title",
            "feature1Description",
            "feature2Title",
            "feature2Description",
            "feature3Title",
            "feature3Description",
          ],
        },
      },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value as string;
      return acc;
    }, {} as Record<string, string>);

    // Fetch featured products
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        featuredImage: true,
      },
    });

    // Fetch recent blog posts
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", type: "POST" },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    });

    return NextResponse.json({ settings: settingsMap, products, posts });
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return NextResponse.json({ settings: {}, products: [], posts: [] });
  }
}
