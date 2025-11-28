import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/lib/permissions";
import { getRevisions } from "@/modules/content/services/revision";

// GET /api/admin/revisions - List revisions for content
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const contentId = searchParams.get("contentId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: "contentType and contentId are required" },
        { status: 400 }
      );
    }

    const revisions = await getRevisions({
      contentType,
      contentId,
      organizationId,
      limit,
    });

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error("Revisions GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
