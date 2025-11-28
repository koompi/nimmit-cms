import { NextRequest, NextResponse } from "next/server";
import { publishScheduledContent } from "@/modules/content/services/scheduling";

// This endpoint should be protected by a cron secret in production
// Configure in Vercel: https://vercel.com/docs/cron-jobs

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await publishScheduledContent();

    console.log("Scheduled content published:", results);

    return NextResponse.json({
      success: true,
      published: {
        posts: results.posts,
        pages: results.pages,
        products: results.products,
      },
      errors: results.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron publish error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export { GET as POST };
