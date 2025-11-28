import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface RevisionData {
  contentType: "post" | "page" | "product";
  contentId: string;
  title: string;
  content?: string;
  metadata?: Record<string, unknown>;
  authorId?: string;
  organizationId: string;
}

export interface RevisionListOptions {
  contentType: string;
  contentId: string;
  organizationId: string;
  limit?: number;
}

const MAX_REVISIONS_PER_CONTENT = 50; // Configurable limit

/**
 * Create a new revision for content
 */
export async function createRevision(data: RevisionData) {
  // Get the latest version number for this content
  const latestRevision = await prisma.revision.findFirst({
    where: {
      contentType: data.contentType,
      contentId: data.contentId,
      organizationId: data.organizationId,
    },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const newVersion = (latestRevision?.version || 0) + 1;

  // Create the new revision
  const revision = await prisma.revision.create({
    data: {
      contentType: data.contentType,
      contentId: data.contentId,
      version: newVersion,
      title: data.title,
      content: data.content,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
      authorId: data.authorId,
      organizationId: data.organizationId,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Clean up old revisions if exceeding limit
  await cleanupOldRevisions(
    data.contentType,
    data.contentId,
    data.organizationId
  );

  return revision;
}

/**
 * Get revision history for content
 */
export async function getRevisions(options: RevisionListOptions) {
  const { contentType, contentId, organizationId, limit = 20 } = options;

  const revisions = await prisma.revision.findMany({
    where: {
      contentType,
      contentId,
      organizationId,
    },
    orderBy: { version: "desc" },
    take: limit,
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return revisions;
}

/**
 * Get a specific revision by ID
 */
export async function getRevision(revisionId: string, organizationId: string) {
  const revision = await prisma.revision.findFirst({
    where: {
      id: revisionId,
      organizationId,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return revision;
}

/**
 * Get a specific revision by version number
 */
export async function getRevisionByVersion(
  contentType: string,
  contentId: string,
  version: number,
  organizationId: string
) {
  const revision = await prisma.revision.findFirst({
    where: {
      contentType,
      contentId,
      version,
      organizationId,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return revision;
}

/**
 * Compare two revisions and return differences
 */
export function compareRevisions(
  oldRevision: { title: string; content?: string | null; metadata?: unknown },
  newRevision: { title: string; content?: string | null; metadata?: unknown }
) {
  const changes: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[] = [];

  // Compare title
  if (oldRevision.title !== newRevision.title) {
    changes.push({
      field: "title",
      oldValue: oldRevision.title,
      newValue: newRevision.title,
    });
  }

  // Compare content
  if (oldRevision.content !== newRevision.content) {
    changes.push({
      field: "content",
      oldValue: oldRevision.content,
      newValue: newRevision.content,
    });
  }

  // Compare metadata
  const oldMeta = JSON.stringify(oldRevision.metadata || {});
  const newMeta = JSON.stringify(newRevision.metadata || {});
  if (oldMeta !== newMeta) {
    changes.push({
      field: "metadata",
      oldValue: oldRevision.metadata,
      newValue: newRevision.metadata,
    });
  }

  return changes;
}

/**
 * Delete old revisions to keep within the limit
 */
async function cleanupOldRevisions(
  contentType: string,
  contentId: string,
  organizationId: string
) {
  const count = await prisma.revision.count({
    where: {
      contentType,
      contentId,
      organizationId,
    },
  });

  if (count > MAX_REVISIONS_PER_CONTENT) {
    // Get IDs of revisions to delete (oldest ones)
    const toDelete = await prisma.revision.findMany({
      where: {
        contentType,
        contentId,
        organizationId,
      },
      orderBy: { version: "asc" },
      take: count - MAX_REVISIONS_PER_CONTENT,
      select: { id: true },
    });

    await prisma.revision.deleteMany({
      where: {
        id: { in: toDelete.map((r) => r.id) },
      },
    });
  }
}

/**
 * Delete all revisions for content (when content is deleted)
 */
export async function deleteContentRevisions(
  contentType: string,
  contentId: string,
  organizationId: string
) {
  await prisma.revision.deleteMany({
    where: {
      contentType,
      contentId,
      organizationId,
    },
  });
}

/**
 * Restore content from a specific revision
 */
export async function restoreRevision(
  revisionId: string,
  organizationId: string,
  userId: string
) {
  // Get the revision to restore
  const revision = await getRevision(revisionId, organizationId);

  if (!revision) {
    throw new Error("Revision not found");
  }

  const { contentType, contentId, title, content, metadata } = revision;

  // Restore based on content type
  let restoredContent;

  switch (contentType) {
    case "post":
      restoredContent = await prisma.post.update({
        where: {
          id: contentId,
          organizationId,
        },
        data: {
          title,
          content: content ? JSON.parse(content) : null,
          excerpt: (metadata as Record<string, unknown> | null)?.excerpt as
            | string
            | undefined,
          updatedAt: new Date(),
        },
      });
      break;

    case "page":
      restoredContent = await prisma.page.update({
        where: {
          id: contentId,
          organizationId,
        },
        data: {
          title,
          content: content ? JSON.parse(content) : null,
          updatedAt: new Date(),
        },
      });
      break;

    case "product":
      restoredContent = await prisma.product.update({
        where: {
          id: contentId,
          organizationId,
        },
        data: {
          name: title,
          description: content ? JSON.parse(content) : null,
          updatedAt: new Date(),
        },
      });
      break;

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }

  // Create a new revision for the restore action
  await createRevision({
    contentType: contentType as "post" | "page" | "product",
    contentId,
    title,
    content: content ?? undefined,
    metadata: {
      ...(metadata as Record<string, unknown> | null),
      restoredFrom: revision.version,
    },
    authorId: userId,
    organizationId,
  });

  return restoredContent;
}
