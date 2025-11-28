import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// Default settings structure
const DEFAULT_SETTINGS = {
  site: {
    name: "SmallWorld CMS",
    tagline: "Your Multi-Tenant Business Platform",
    description: "",
    logo: "",
    favicon: "",
    email: "",
    phone: "",
    address: "",
  },
  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
  seo: {
    defaultTitle: "",
    titleSeparator: " | ",
    defaultDescription: "",
    keywords: "",
    ogImage: "",
  },
  homepage: {
    heroTitle: "Welcome to SmallWorld",
    heroSubtitle: "Your one-stop platform for all your business needs",
    heroImage: "",
    showFeaturedProducts: true,
    showLatestPosts: true,
    showTestimonials: true,
  },
  footer: {
    copyrightText: "© {year} SmallWorld. All rights reserved.",
    showSocialLinks: true,
  },
};

// GET /api/admin/settings - Get all settings or specific key
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // Get specific setting
      const setting = await prisma.setting.findUnique({
        where: {
          key_organizationId: {
            key,
            organizationId,
          },
        },
      });

      if (!setting) {
        // Return default value if exists
        const defaultValue =
          DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
        if (defaultValue) {
          return NextResponse.json({ key, value: defaultValue });
        }
        return NextResponse.json(
          { error: "Setting not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(setting);
    }

    // Get all settings for this organization
    const settings = await prisma.setting.findMany({
      where: { organizationId },
    });

    // Merge with defaults
    const settingsMap: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      settingsMap[k] = v;
    }
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Create or update setting
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const setting = await prisma.setting.upsert({
      where: {
        key_organizationId: {
          key,
          organizationId,
        },
      },
      update: { value },
      create: {
        key,
        value,
        organizationId,
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Bulk update settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      );
    }

    // Update all settings
    const results = await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.setting.upsert({
          where: {
            key_organizationId: {
              key,
              organizationId,
            },
          },
          update: { value: value as object },
          create: {
            key,
            value: value as object,
            organizationId,
          },
        })
      )
    );

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
