import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import { createRevision } from "@/modules/content/services/revision";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      featuredImage,
      seo,
      categoryIds,
      tagIds,
      skipRevision,
    } = body;

    // Get existing post for revision comparison
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check for content changes that warrant a revision
    const hasContentChanges =
      title !== existingPost.title ||
      content !== existingPost.content ||
      excerpt !== existingPost.excerpt ||
      featuredImage !== existingPost.featuredImage ||
      JSON.stringify(seo) !== JSON.stringify(existingPost.seo);

    // Create revision before updating (unless explicitly skipped)
    if (hasContentChanges && !skipRevision && session.user?.organizationId) {
      await createRevision({
        contentType: "post",
        contentId: id,
        title: existingPost.title,
        content: JSON.stringify(existingPost.content),
        metadata: {
          slug: existingPost.slug,
          excerpt: existingPost.excerpt,
          status: existingPost.status,
          featuredImage: existingPost.featuredImage,
          seo: existingPost.seo,
          categories: existingPost.categories.map((c) => c.category.name),
          tags: existingPost.tags.map((t) => t.tag.name),
        },
        organizationId: session.user.organizationId,
        authorId: session.user.id,
      });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (status !== undefined) updateData.status = status;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (seo !== undefined) updateData.seo = seo;

    // Handle categories
    if (categoryIds !== undefined) {
      // Remove existing category associations
      await prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      // Create new category associations
      if (categoryIds.length > 0) {
        await prisma.postCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            postId: id,
            categoryId,
          })),
        });
      }
    }

    // Handle tags
    if (tagIds !== undefined) {
      // Remove existing tag associations
      await prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // Create new tag associations
      if (tagIds.length > 0) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: id,
            tagId,
          })),
        });
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete category associations first
    await prisma.postCategory.deleteMany({
      where: { postId: id },
    });

    // Delete tag associations
    await prisma.postTag.deleteMany({
      where: { postId: id },
    });

    // Delete revisions
    await prisma.revision.deleteMany({
      where: {
        contentType: "post",
        contentId: id,
      },
    });

    // Delete post
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
