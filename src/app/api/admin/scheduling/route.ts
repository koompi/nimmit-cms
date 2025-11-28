import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/lib/permissions";
import {
  scheduleContent,
  unscheduleContent,
  getUpcomingScheduled,
} from "@/modules/content/services/scheduling";

// GET /api/admin/scheduling - Get upcoming scheduled content
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
    const limit = parseInt(searchParams.get("limit") || "10");

    const upcoming = await getUpcomingScheduled(organizationId, limit);

    return NextResponse.json({
      scheduled: upcoming,
      count: upcoming.length,
    });
  } catch (error) {
    console.error("Scheduling GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/scheduling - Schedule content
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { contentType, contentId, scheduledAt } = body;

    if (!contentType || !contentId || !scheduledAt) {
      return NextResponse.json(
        { error: "contentType, contentId, and scheduledAt are required" },
        { status: 400 }
      );
    }

    const validTypes = ["post", "page", "product"];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const scheduled = await scheduleContent({
      contentType,
      contentId,
      scheduledAt: new Date(scheduledAt),
      organizationId,
    });

    return NextResponse.json({
      success: true,
      content: scheduled,
    });
  } catch (error) {
    console.error("Scheduling POST error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/scheduling - Unschedule content
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { contentType, contentId } = body;

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: "contentType and contentId are required" },
        { status: 400 }
      );
    }

    const unscheduled = await unscheduleContent({
      contentType,
      contentId,
      organizationId,
    });

    return NextResponse.json({
      success: true,
      content: unscheduled,
    });
  } catch (error) {
    console.error("Scheduling DELETE error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
