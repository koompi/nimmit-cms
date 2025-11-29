import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type"); // ebikes, accessories, posts, pages, all
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query || query.length < 2) {
    return NextResponse.json({ 
      results: [],
      message: "Query must be at least 2 characters" 
    });
  }

  const searchTerm = query.toLowerCase();
  const results: {
    ebikes: unknown[];
    accessories: unknown[];
    posts: unknown[];
    pages: unknown[];
    stores: unknown[];
    faqs: unknown[];
  } = {
    ebikes: [],
    accessories: [],
    posts: [],
    pages: [],
    stores: [],
    faqs: [],
  };

  try {
    // Search E-Bikes
    if (!type || type === "all" || type === "ebikes") {
      const ebikes = await prisma.eBike.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: searchTerm } },
            { tagline: { contains: searchTerm } },
            { slug: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          heroImage: true,
          price: true,
        },
        take: limit,
      });
      results.ebikes = ebikes.map((bike) => ({
        ...bike,
        type: "ebike",
        url: `/our-rides/${bike.slug}`,
      }));
    }

    // Search Accessories
    if (!type || type === "all" || type === "accessories") {
      const accessories = await prisma.accessory.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: searchTerm } },
            { slug: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          price: true,
          category: true,
        },
        take: limit,
      });
      results.accessories = accessories.map((acc) => ({
        ...acc,
        type: "accessory",
        url: `/accessories#${acc.slug}`,
      }));
    }

    // Search Blog Posts
    if (!type || type === "all" || type === "posts") {
      const posts = await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: searchTerm } },
            { slug: { contains: searchTerm } },
            { excerpt: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          publishedAt: true,
        },
        take: limit,
      });
      results.posts = posts.map((post) => ({
        ...post,
        type: "post",
        url: `/blog/${post.slug}`,
      }));
    }

    // Search Pages
    if (!type || type === "all" || type === "pages") {
      const pages = await prisma.page.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: searchTerm } },
            { slug: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: limit,
      });
      results.pages = pages.map((page) => ({
        ...page,
        type: "page",
        url: `/${page.slug}`,
      }));
    }

    // Search Stores
    if (!type || type === "all" || type === "stores") {
      const stores = await prisma.store.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: searchTerm } },
            { city: { contains: searchTerm } },
            { address: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          type: true,
        },
        take: limit,
      });
      results.stores = stores.map((store) => ({
        ...store,
        type: "store",
        url: `/find-store`,
      }));
    }

    // Search FAQs
    if (!type || type === "all" || type === "faqs") {
      const faqs = await prisma.fAQ.findMany({
        where: {
          OR: [
            { question: { contains: searchTerm } },
            { answer: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
        },
        take: limit,
      });
      results.faqs = faqs.map((faq) => ({
        ...faq,
        type: "faq",
        url: `/contact#faq`,
      }));
    }

    // Calculate total count
    const totalCount =
      results.ebikes.length +
      results.accessories.length +
      results.posts.length +
      results.pages.length +
      results.stores.length +
      results.faqs.length;

    return NextResponse.json({
      query,
      totalCount,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
