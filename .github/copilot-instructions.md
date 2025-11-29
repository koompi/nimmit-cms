# Nimmit CMS - AI Coding Instructions

> **Version 1.0** - Production-ready multi-tenant CMS

## Architecture Overview

**Multi-tenant CMS** built with Next.js 16 App Router. All content is scoped by `organizationId`.

```
src/
├── app/                    # Next.js App Router
│   ├── [...slug]/         # Dynamic CMS pages (Server Components)
│   ├── (grood)/           # Grood e-bike branded pages
│   ├── admin/             # Admin dashboard (Client Components)
│   └── api/admin/         # Protected API routes
├── modules/               # Domain logic (tenant-agnostic)
│   ├── core/auth.ts       # NextAuth config + Koompi OAuth
│   ├── content/services/  # Post, Page, Revision, Scheduling services
│   └── ecommerce/         # Product, E-bike services
├── hooks/
│   └── useAutoSave.ts     # Auto-save drafts hook
├── lib/
│   ├── prisma.ts          # DB client singleton
│   ├── permissions.ts     # RBAC middleware (server)
│   ├── permissions-client.tsx  # RBAC hooks (client)
│   ├── backup.ts          # Database backup/restore
│   └── image-optimizer.ts # Sharp image processing
└── components/
    ├── ui/                # shadcn/ui components
    ├── admin/             # Admin toolbar, AutoSaveIndicator
    └── editor/            # Tiptap RichEditor, blocks
```

## Critical Patterns

### API Routes: Always use `withPermission()`

```typescript
import { withPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authResult = await withPermission("posts", "view");
  if (authResult instanceof NextResponse) return authResult;
  const { user, organizationId } = authResult;

  // Always filter by organizationId for multi-tenant isolation
  const posts = await prisma.post.findMany({
    where: { organizationId },
  });
}
```

### Admin Pages: Client Components with session check

```typescript
"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div>Loading...</div>;
  if (!session) redirect("/auth/login");
  // ...
}
```

### Permission Gating in UI

```typescript
import {
  PermissionGate,
  CanCreate,
  usePermissions,
} from "@/lib/permissions-client";

// Component-based
<CanCreate resource="posts">
  <Button>New Post</Button>
</CanCreate>;

// Hook-based
const { canEdit, isAdmin } = usePermissions();
```

## Database Conventions

- **Schema**: `prisma/schema.prisma` with `@@map()` for snake_case tables
- **Content**: Stored as `Json` in Tiptap format
- **Multi-tenancy**: All content models have `organizationId` field
- **Unique constraints**: `@@unique([slug, organizationId])` pattern

```bash
npx prisma migrate dev    # Create migration
npx prisma db seed        # Seed with admin@grood.com / admin123
npx prisma generate       # Regenerate client after schema changes
```

## Role-Based Access (RBAC)

Roles hierarchy: `USER < AUTHOR < EDITOR < ADMIN < SUPER_ADMIN`

| Role          | Capabilities                    |
| ------------- | ------------------------------- |
| `SUPER_ADMIN` | Full access, manage admins      |
| `ADMIN`       | Full org access, manage users   |
| `EDITOR`      | Create/edit/publish all content |
| `AUTHOR`      | Create/edit own content only    |
| `USER`        | Read-only                       |

Permission matrix in `src/lib/permissions.ts` - check `DEFAULT_PERMISSIONS` object.

## Content & Rich Text

Tiptap JSON format for all rich content fields:

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Hello" }] }
  ]
}
```

Custom blocks available when `enableBlocks={true}` on `RichEditor`:

- `HeroBlock`, `ProductGridBlock`, `TestimonialBlock`, `GalleryBlock`, `VideoEmbedBlock`, `CallToActionBlock`

## Key Services

| Service        | Location                                     | Purpose                       |
| -------------- | -------------------------------------------- | ----------------------------- |
| Auth           | `src/modules/core/auth.ts`                   | NextAuth config, Koompi OAuth |
| Revisions      | `src/modules/content/services/revision.ts`   | Content versioning            |
| Scheduling     | `src/modules/content/services/scheduling.ts` | Scheduled publishing          |
| Backup         | `src/lib/backup.ts`                          | Database backup/restore       |
| Image Optimize | `src/lib/image-optimizer.ts`                 | Sharp WebP conversion         |
| Auto-Save      | `src/hooks/useAutoSave.ts`                   | Draft auto-save hook          |

## Auto-Save Pattern

Use the `useAutoSave` hook for content editors:

```typescript
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveIndicator } from "@/components/admin/AutoSaveIndicator";

const { isDirty, isSaving, lastSavedAt, lastError, markDirty, resetDirty } =
  useAutoSave({
    onSave: async () => {
      await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    },
    debounceMs: 3000,
  });

// Mark dirty on changes
const handleChange = (value: string) => {
  setFormData({ ...formData, title: value });
  markDirty();
};

// Reset after manual save
const handleSubmit = async () => {
  await saveToServer();
  resetDirty();
};

// Show indicator
<AutoSaveIndicator
  isDirty={isDirty}
  isSaving={isSaving}
  lastSavedAt={lastSavedAt}
  lastError={lastError}
/>;
```

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint check
npm run db:seed      # Seed database
```

## Import Conventions

Always use `@/` alias:

```typescript
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";
import { cn, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

## UI Components

Use existing shadcn/ui components from `src/components/ui/`. Use `cn()` for conditional classes:

```typescript
import { cn } from "@/lib/utils";
<div className={cn("base-class", isActive && "active-class")} />;
```

Theme: Primary `#fdc501` (Gold), Secondary `#303030` (Dark Grey)
