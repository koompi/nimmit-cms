import { prisma } from "@/lib/prisma";

// Public: Get published page by slug (finds first matching published page)
export async function getPage(slug: string[]) {
  const slugString = slug.join("/");
  const page = await prisma.page.findFirst({
    where: {
      slug: slugString,
      status: "PUBLISHED",
    },
  });
  return page;
}

// Admin: Get all pages (including drafts) for an organization
export async function getPages(organizationId: string) {
  return await prisma.page.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
  });
}

// Admin: Get page by ID
export async function getPageById(id: string) {
  return await prisma.page.findUnique({
    where: { id },
  });
}

// Admin: Create page
export async function createPage(data: {
  title: string;
  slug: string;
  content?: any;
  status?: string;
  template?: string;
  seo?: any;
  organizationId: string;
}) {
  return await prisma.page.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content || {},
      status: (data.status as any) || "DRAFT",
      template: data.template || "default",
      seo: data.seo || {},
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      organizationId: data.organizationId,
    },
  });
}

// Admin: Update page
export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    content?: any;
    status?: string;
    template?: string;
    seo?: any;
  }
) {
  const updateData: any = { ...data };

  // Set publishedAt when publishing
  if (data.status === "PUBLISHED") {
    const existing = await prisma.page.findUnique({ where: { id } });
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  return await prisma.page.update({
    where: { id },
    data: updateData,
  });
}

// Admin: Delete page
export async function deletePage(id: string) {
  return await prisma.page.delete({
    where: { id },
  });
}

// Get homepage (for dynamic homepage)
export async function getHomepage() {
  return await prisma.page.findFirst({
    where: {
      template: "homepage",
      status: "PUBLISHED",
    },
  });
}
