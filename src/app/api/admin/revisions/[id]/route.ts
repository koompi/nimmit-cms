import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/lib/permissions";
import {
  getRevision,
  getRevisionByVersion,
  compareRevisions,
  restoreRevision,
} from "@/modules/content/services/revision";

// GET /api/admin/revisions/[id] - Get a specific revision
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const compareWith = searchParams.get("compareWith"); // Version number to compare with

    const revision = await getRevision(id, organizationId);

    if (!revision) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    // If compareWith is provided, fetch that revision and compute diff
    if (compareWith) {
      const compareVersion = parseInt(compareWith);
      const compareRevision = await getRevisionByVersion(
        revision.contentType,
        revision.contentId,
        compareVersion,
        organizationId
      );

      if (compareRevision) {
        const changes = compareRevisions(compareRevision, revision);
        return NextResponse.json({
          revision,
          compareRevision,
          changes,
        });
      }
    }

    return NextResponse.json({ revision });
  } catch (error) {
    console.error("Revision GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/revisions/[id] - Restore a revision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("posts", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { user, organizationId } = authResult;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Restore the revision
    const restoredContent = await restoreRevision(id, organizationId, user.id);

    return NextResponse.json({
      success: true,
      content: restoredContent,
    });
  } catch (error) {
    console.error("Revision restore error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
