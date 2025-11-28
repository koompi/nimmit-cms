import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import {
  getPageById,
  updatePage,
  deletePage,
} from "@/modules/content/services/page";
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
    const page = await getPageById(id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Page GET error:", error);
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
    const { title, slug, content, status, template, seo, skipRevision } = body;

    // Get existing page for revision
    const existingPage = await getPageById(id);

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check for content changes that warrant a revision
    const hasContentChanges =
      title !== existingPage.title ||
      content !== existingPage.content ||
      template !== existingPage.template ||
      JSON.stringify(seo) !== JSON.stringify(existingPage.seo);

    // Create revision before updating (unless explicitly skipped)
    if (hasContentChanges && !skipRevision && session.user?.organizationId) {
      await createRevision({
        contentType: "page",
        contentId: id,
        title: existingPage.title,
        content: JSON.stringify(existingPage.content),
        metadata: {
          slug: existingPage.slug,
          status: existingPage.status,
          template: existingPage.template,
          seo: existingPage.seo,
        },
        organizationId: session.user.organizationId,
        authorId: session.user.id,
      });
    }

    const page = await updatePage(id, {
      title,
      slug,
      content,
      status,
      template,
      seo,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Page PUT error:", error);
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

    // Delete revisions first
    await prisma.revision.deleteMany({
      where: {
        contentType: "page",
        contentId: id,
      },
    });

    await deletePage(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
