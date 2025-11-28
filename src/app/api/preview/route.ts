import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Generate a preview token for a specific content
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { contentType, contentId, expiresIn = 3600 } = body; // Default 1 hour

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: "contentType and contentId are required" },
        { status: 400 }
      );
    }

    // Generate a unique token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // We'll use a simple in-memory approach via cookies for preview
    // The preview link will include the token in the URL
    const previewUrl = `/api/preview?token=${token}&type=${contentType}&id=${contentId}`;

    return NextResponse.json({
      success: true,
      previewUrl,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Preview token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Enable preview mode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const contentType = searchParams.get("type");
    const contentId = searchParams.get("id");

    if (!token || !contentType || !contentId) {
      return NextResponse.json(
        { error: "Missing preview parameters" },
        { status: 400 }
      );
    }

    // Verify the content exists
    let content = null;
    let slug = "";

    switch (contentType) {
      case "post":
        const post = await prisma.post.findUnique({
          where: { id: contentId },
          select: { slug: true, status: true },
        });
        if (post) {
          content = post;
          slug = `/blog/${post.slug}`;
        }
        break;

      case "page":
        const page = await prisma.page.findUnique({
          where: { id: contentId },
          select: { slug: true, status: true },
        });
        if (page) {
          content = page;
          slug = `/${page.slug}`;
        }
        break;

      case "product":
        const product = await prisma.product.findUnique({
          where: { id: contentId },
          select: { slug: true, status: true },
        });
        if (product) {
          content = product;
          slug = `/products/${product.slug}`;
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid content type" },
          { status: 400 }
        );
    }

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Set preview cookie and redirect
    const cookieStore = await cookies();
    cookieStore.set(
      "__preview_mode",
      JSON.stringify({
        enabled: true,
        contentType,
        contentId,
        token,
      }),
      {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 3600, // 1 hour
      }
    );

    // Redirect to the preview page with special query param
    return NextResponse.redirect(new URL(`${slug}?preview=true`, request.url));
  } catch (error) {
    console.error("Preview enable error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Disable preview mode
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("__preview_mode");

    return NextResponse.json({
      success: true,
      message: "Preview mode disabled",
    });
  } catch (error) {
    console.error("Preview disable error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
