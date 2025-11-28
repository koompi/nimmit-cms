import { prisma } from "@/lib/prisma";

type ContentType = "post" | "page" | "product";

interface ScheduleContentInput {
  contentType: ContentType;
  contentId: string;
  scheduledAt: Date;
  organizationId: string;
}

/**
 * Schedule content for publishing at a future date
 */
export async function scheduleContent({
  contentType,
  contentId,
  scheduledAt,
  organizationId,
}: ScheduleContentInput) {
  const now = new Date();

  // Validate scheduledAt is in the future
  if (scheduledAt <= now) {
    throw new Error("Scheduled date must be in the future");
  }

  switch (contentType) {
    case "post":
      return prisma.post.update({
        where: { id: contentId, organizationId },
        data: {
          status: "SCHEDULED",
          scheduledAt,
        },
      });

    case "page":
      return prisma.page.update({
        where: { id: contentId, organizationId },
        data: {
          status: "SCHEDULED",
          scheduledAt,
        },
      });

    case "product":
      return prisma.product.update({
        where: { id: contentId, organizationId },
        data: {
          status: "SCHEDULED",
          scheduledAt,
        },
      });

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

/**
 * Unschedule content (revert to draft)
 */
export async function unscheduleContent({
  contentType,
  contentId,
  organizationId,
}: Omit<ScheduleContentInput, "scheduledAt">) {
  switch (contentType) {
    case "post":
      return prisma.post.update({
        where: { id: contentId, organizationId },
        data: {
          status: "DRAFT",
          scheduledAt: null,
        },
      });

    case "page":
      return prisma.page.update({
        where: { id: contentId, organizationId },
        data: {
          status: "DRAFT",
          scheduledAt: null,
        },
      });

    case "product":
      return prisma.product.update({
        where: { id: contentId, organizationId },
        data: {
          status: "DRAFT",
          scheduledAt: null,
        },
      });

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

/**
 * Get all scheduled content that is due for publishing
 */
export async function getScheduledContentDue() {
  const now = new Date();

  const [posts, pages, products] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        organizationId: true,
        scheduledAt: true,
      },
    }),
    prisma.page.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        organizationId: true,
        scheduledAt: true,
      },
    }),
    prisma.product.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        organizationId: true,
        scheduledAt: true,
      },
    }),
  ]);

  return {
    posts,
    pages,
    products,
    total: posts.length + pages.length + products.length,
  };
}

/**
 * Publish all content that is scheduled and due
 */
export async function publishScheduledContent() {
  const now = new Date();
  const results = {
    posts: 0,
    pages: 0,
    products: 0,
    errors: [] as string[],
  };

  // Publish posts
  try {
    const postsResult = await prisma.post.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
        scheduledAt: null,
      },
    });
    results.posts = postsResult.count;
  } catch (error) {
    results.errors.push(`Failed to publish posts: ${error}`);
  }

  // Publish pages
  try {
    const pagesResult = await prisma.page.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
        scheduledAt: null,
      },
    });
    results.pages = pagesResult.count;
  } catch (error) {
    results.errors.push(`Failed to publish pages: ${error}`);
  }

  // Activate products
  try {
    const productsResult = await prisma.product.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      data: {
        status: "ACTIVE",
        scheduledAt: null,
      },
    });
    results.products = productsResult.count;
  } catch (error) {
    results.errors.push(`Failed to activate products: ${error}`);
  }

  return results;
}

/**
 * Get upcoming scheduled content for an organization
 */
export async function getUpcomingScheduled(
  organizationId: string,
  limit: number = 10
) {
  const now = new Date();

  const [posts, pages, products] = await Promise.all([
    prisma.post.findMany({
      where: {
        organizationId,
        status: "SCHEDULED",
        scheduledAt: { gt: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
        author: { select: { name: true, email: true } },
      },
    }),
    prisma.page.findMany({
      where: {
        organizationId,
        status: "SCHEDULED",
        scheduledAt: { gt: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
      },
    }),
    prisma.product.findMany({
      where: {
        organizationId,
        status: "SCHEDULED",
        scheduledAt: { gt: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        scheduledAt: true,
      },
    }),
  ]);

  // Combine and sort by scheduledAt
  const all = [
    ...posts.map((p) => ({ ...p, type: "post" as const })),
    ...pages.map((p) => ({ ...p, type: "page" as const, title: p.title })),
    ...products.map((p) => ({ ...p, type: "product" as const, title: p.name })),
  ].sort((a, b) => {
    const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return dateA - dateB;
  });

  return all.slice(0, limit);
}
