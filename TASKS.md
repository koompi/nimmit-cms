# SmallWorld CMS - Implementation Tasks

## ✅ PHASE 0: FOUNDATION COMPLETE (19/19 Tasks)

**Completed**: November 2025

Core CMS features implemented:

- Content management (Posts, Pages, Products)
- Media library with file uploads
- User management with roles
- Navigation/menu builder
- Contact form with inquiry management
- Site settings
- Dynamic homepage, header, footer

---

## 🚀 PHASE 1: Foundation & Architecture

### ✅ Task 1.1: Change Auth System

**Status**: Complete
**Priority**: High

Replace current NextAuth credentials with Koompi OAuth as primary auth:

- [x] Configure Koompi OAuth provider (`src/modules/core/providers/koompi-provider.ts`)
- [x] Update auth callbacks to handle Koompi user data
- [x] Add account linking for existing users
- [x] Update login page UI for Koompi OAuth flow
- [x] Handle user profile sync from Koompi
- [x] Create auth error page (`src/app/auth/error/page.tsx`)
- [x] Create `.env.example` with documented variables

**Reference**: https://github.com/koompi/koompi-oauth-nodejs-starter

### ✅ Task 1.2: User Roles (RBAC)

**Status**: Complete
**Priority**: High

Implement granular role-based access control:

- [x] Define permission matrix (view, create, edit, delete, publish per resource)
- [x] Create `Permission` and `RolePermission` models in Prisma
- [x] Build `src/lib/permissions.ts` middleware for API routes
- [x] Add permission checks to all admin API routes
- [x] Create role management UI (`src/app/admin/roles/page.tsx`)
- [x] Add permission-based UI components (`src/lib/permissions-client.tsx`)

**Roles**: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, USER

**Files Created/Modified**:

- `prisma/schema.prisma` - Added Permission, RolePermission models, updated Role enum
- `src/lib/permissions.ts` - Full RBAC middleware with permission matrix
- `src/lib/permissions-client.tsx` - React hooks and components (usePermissions, PermissionGate)
- `src/app/api/admin/roles/route.ts` - Roles API endpoint
- `src/app/admin/roles/page.tsx` - Role management UI
- All admin API routes updated with `withPermission`:
  - `posts/route.ts`, `users/route.ts`, `pages/route.ts`, `products/route.ts`
  - `media/route.ts`, `menus/route.ts`, `categories/route.ts`, `tags/route.ts`
  - `settings/route.ts`, `inquiries/route.ts`, `dashboard/stats/route.ts`

### ✅ Task 1.3: Multi-tenant Support

**Status**: Complete
**Priority**: High

Complete multi-tenant isolation:

- [x] Add organization selection/creation on signup
- [x] Create organization settings page
- [x] Implement organization invitation system
- [x] Add organization switcher for users with multiple orgs
- [x] Ensure all queries filter by `organizationId`
- [x] Add organization-level settings override

**Files Created/Modified**:

- `prisma/schema.prisma` - Added OrganizationMembership, OrganizationInvitation models
- `src/app/api/admin/organizations/route.ts` - List/create organizations
- `src/app/api/admin/organizations/[id]/route.ts` - Single org CRUD
- `src/app/api/admin/organizations/switch/route.ts` - Switch active org
- `src/app/api/admin/organizations/invitations/route.ts` - Invitation management
- `src/app/api/auth/invite/[token]/route.ts` - Accept invitation
- `src/app/auth/invite/[token]/page.tsx` - Invitation acceptance UI
- `src/app/admin/organizations/page.tsx` - Organization settings UI
- `src/components/organization-switcher.tsx` - Org switcher dropdown
- `src/app/admin/dashboard/layout.tsx` - Added org switcher to header
- `src/modules/core/auth.ts` - Updated to create memberships on signup

---

## 📝 PHASE 2: Content & Asset Experience

### ✅ Task 2.1: Advanced Block Editor

**Status**: Complete
**Priority**: Medium

Extend Tiptap with custom SmallWorld blocks:

- [x] Hero block (image, title, subtitle, CTA buttons)
- [x] Product grid block (select products to display)
- [x] Testimonial block (quote, author, image)
- [x] Gallery block (image grid with lightbox)
- [x] Video embed block (YouTube, Vimeo)
- [x] Call-to-action block
- [x] Create block picker UI
- [x] Updated RichEditor with enableBlocks option

**Files Created**:

- `src/components/editor/blocks/types.ts` - Block type definitions
- `src/components/editor/blocks/HeroBlock.tsx` - Hero section with image, CTA
- `src/components/editor/blocks/ProductGridBlock.tsx` - Product grid with selection
- `src/components/editor/blocks/TestimonialBlock.tsx` - Customer testimonial
- `src/components/editor/blocks/GalleryBlock.tsx` - Image gallery with lightbox
- `src/components/editor/blocks/VideoEmbedBlock.tsx` - YouTube/Vimeo embed
- `src/components/editor/blocks/CallToActionBlock.tsx` - CTA section
- `src/components/editor/blocks/index.ts` - Block exports
- `src/components/editor/BlockPicker.tsx` - Block selection UI
- `src/components/ui/checkbox.tsx` - Checkbox component

### ✅ Task 2.2: Media Library 2.0

**Status**: Complete
**Priority**: Medium

Enhanced media management:

- [x] Add folder support with nested structure (MediaFolder model)
- [x] Implement drag-drop folder organization (files and UI)
- [x] Bulk upload with progress indicator
- [x] Move media between folders (bulk operations)
- [x] Search and filter by type, date, folder
- [x] Grid/list view toggle
- [x] Selection mode with bulk actions
- [ ] Add basic image editor (crop, resize, rotate) - deferred to future
- [ ] Add image optimization on upload - deferred to future
- [ ] Media usage tracking (where is this file used?) - deferred to future

**Files Created/Modified**:

- `prisma/schema.prisma` - Added MediaFolder model, updated Media model with folderId, originalName, updatedAt
- `src/app/api/admin/media/route.ts` - Updated with folder filtering, bulk upload, PATCH for bulk operations
- `src/app/api/admin/media/[id]/route.ts` - Updated with folder support, permission checks
- `src/app/api/admin/media/folders/route.ts` - Folder list/create API
- `src/app/api/admin/media/folders/[id]/route.ts` - Folder CRUD with breadcrumbs
- `src/app/admin/media/page.tsx` - Complete rewrite with folders, drag-drop, bulk ops, grid/list view

### ✅ Task 2.3: Revision History

**Status**: Complete
**Priority**: Medium

Content versioning system:

- [x] Create `Revision` model in Prisma
- [x] Auto-save revisions on content update
- [x] Revision list UI with diff viewer
- [x] Restore previous revision functionality
- [x] Limit revision count per content (configurable via cleanupOldRevisions)

**Files Created/Modified**:

- `prisma/schema.prisma` - Added Revision model with version, contentType, contentId, changes JSON
- `src/modules/content/services/revision.ts` - Full revision service (create, get, compare, restore, cleanup)
- `src/app/api/admin/revisions/route.ts` - List revisions for content
- `src/app/api/admin/revisions/[id]/route.ts` - Get revision, restore revision (POST)
- `src/app/api/admin/posts/[id]/route.ts` - New file with revision creation on PUT
- `src/app/api/admin/pages/[id]/route.ts` - Updated with revision creation on PUT
- `src/app/api/admin/products/[id]/route.ts` - Updated with revision creation on PUT
- `src/components/content/RevisionHistory.tsx` - Reusable revision history sheet/dialog
- `src/app/admin/content/posts/[id]/page.tsx` - New edit page with RevisionHistory
- `src/app/admin/content/pages/[id]/page.tsx` - Added RevisionHistory component
- `src/app/admin/content/products/[id]/page.tsx` - Added RevisionHistory component

### ✅ Task 2.4: Content Scheduling

**Status**: Complete
**Priority**: Medium

Schedule content publishing:

- [x] Add `scheduledAt` field to Post, Page, Product
- [x] Add SCHEDULED status to PostStatus, PageStatus, ProductStatus enums
- [x] Create scheduling UI (date/time picker dialog)
- [x] Implement cron endpoint for publishing scheduled content
- [x] Show scheduled content in admin with countdown
- [ ] Email notification on publish (deferred - requires email service)

**Files Created/Modified**:

- `prisma/schema.prisma` - Added scheduledAt field and SCHEDULED enum values
- `src/modules/content/services/scheduling.ts` - Full scheduling service
- `src/app/api/admin/scheduling/route.ts` - Schedule/unschedule API
- `src/app/api/cron/publish/route.ts` - Cron endpoint for auto-publishing
- `src/components/content/ScheduleDialog.tsx` - Scheduling UI dialog
- `src/app/admin/content/posts/[id]/page.tsx` - Added scheduling UI
- `src/app/admin/content/pages/[id]/page.tsx` - Added scheduling UI

### ✅ Task 2.5: Preview Mode

**Status**: Complete
**Priority**: Low

Device simulation preview:

- [x] Create preview API route with draft token
- [x] Add preview button in content editor
- [x] Device frame simulation (mobile, tablet, desktop)
- [x] Share preview link with expiration

**Files Created/Modified**:

- `src/app/api/preview/route.ts` - Preview token generation, validation, exit
- `src/components/preview/PreviewToolbar.tsx` - Device frame simulation toolbar
- `src/components/preview/PreviewButton.tsx` - Preview button with share dialog
- `src/app/admin/content/posts/[id]/page.tsx` - Added PreviewButton
- `src/app/admin/content/pages/[id]/page.tsx` - Added PreviewButton
- `src/app/admin/content/products/[id]/page.tsx` - Added PreviewButton

### ⬜ Task 2.6: Advanced SEO & Social Preview

**Status**: Not Started
**Priority**: Medium

Enhanced SEO tooling:

- [ ] Google SERP preview
- [ ] Facebook/Twitter card preview
- [ ] Open Graph image generator
- [ ] SEO score/checklist (title length, meta desc, etc.)
- [ ] Canonical URL management
- [ ] Structured data (JSON-LD) editor

---

## ⚙️ PHASE 3: Workflow & Developer API

### ⬜ Task 3.1: Approval Workflows

**Status**: Not Started
**Priority**: High

Content approval system:

- [ ] Add `PENDING_REVIEW` status to content models
- [ ] Create workflow configuration per content type
- [ ] Assign reviewers/approvers
- [ ] Email notifications for review requests
- [ ] Approval/rejection with comments
- [ ] Audit log for workflow actions

### ⬜ Task 3.2: API Token Management

**Status**: Not Started
**Priority**: Medium

Developer API access:

- [ ] Create `ApiToken` model with scopes
- [ ] Token generation UI in admin settings
- [ ] Token authentication middleware
- [ ] Rate limiting per token
- [ ] Usage analytics per token

### ⬜ Task 3.3: Webhooks System

**Status**: Not Started
**Priority**: Medium

Event-driven integrations:

- [ ] Create `Webhook` model (URL, events, secret)
- [ ] Webhook management UI
- [ ] Trigger webhooks on content events (create, update, delete, publish)
- [ ] Webhook delivery logs with retry
- [ ] Signature verification for security

### ⬜ Task 3.4: API Documentation

**Status**: Not Started
**Priority**: Low

Developer documentation:

- [ ] Generate OpenAPI/Swagger spec
- [ ] Create `/api/docs` page with Swagger UI
- [ ] Document all public API endpoints
- [ ] Add code examples (cURL, JS, Python)

---

## 📣 PHASE 4: Marketing & Engagement

### ⬜ Task 4.1: Form Builder

**Status**: Not Started
**Priority**: Medium

Dynamic form creation:

- [ ] Create `Form` and `FormField` models
- [ ] Drag-drop form builder UI
- [ ] Field types: text, email, phone, select, checkbox, file
- [ ] Form embed via shortcode or block
- [ ] Form submissions management
- [ ] Export submissions to CSV

### ⬜ Task 4.2: Search Functionality

**Status**: Not Started
**Priority**: High

Site-wide search:

- [ ] Create search API endpoint
- [ ] Full-text search across posts, pages, products
- [ ] Search results page with filters
- [ ] Search suggestions/autocomplete
- [ ] Search analytics (what are users searching for?)

### ⬜ Task 4.3: Analytics Integration

**Status**: Not Started
**Priority**: Medium

Built-in analytics:

- [ ] Page view tracking
- [ ] Unique visitors
- [ ] Top content dashboard
- [ ] Traffic sources
- [ ] Google Analytics integration option

### ⬜ Task 4.4: Email Notifications

**Status**: Not Started
**Priority**: Medium

Transactional emails:

- [ ] Email template system
- [ ] Contact form notifications
- [ ] User invitation emails
- [ ] Password reset emails
- [ ] Newsletter subscription. Allow admin to send newsletter from admin dashboard
- [ ] Integration with SendGrid/Resend

---

## 🛒 PHASE 5: Future / E-commerce

### ⬜ Task 5.1: Blog Comments

**Status**: Not Started
**Priority**: Low

Commenting system:

- [ ] Create `Comment` model
- [ ] Comment form on blog posts
- [ ] Comment moderation (approve, spam, delete)
- [ ] Nested replies
- [ ] Email notifications for replies

### ⬜ Task 5.2: Product Reviews

**Status**: Not Started
**Priority**: Low

Review system:

- [ ] Create `Review` model with rating
- [ ] Review form on product pages
- [ ] Review moderation
- [ ] Average rating calculation
- [ ] Verified purchase badge

### ⬜ Task 5.3: E-commerce Features

**Status**: Not Started
**Priority**: Low

Shopping functionality:

- [ ] Shopping cart (Zustand state)
- [ ] Checkout flow
- [ ] Payment integration (Stripe)
- [ ] Order management
- [ ] Inventory tracking

### ⬜ Task 5.4: Internationalization (i18n)

**Status**: Not Started
**Priority**: Low

Multi-language support:

- [ ] Content translation model
- [ ] Language switcher
- [ ] URL-based locale (`/en/`, `/km/`)
- [ ] Admin UI translations
- [ ] RTL support

---

## 🔧 PHASE 6: Production Readiness

### ✅ Task 6.1: Tiptap Content Renderer

**Status**: Complete
**Priority**: CRITICAL

Render Tiptap JSON content on public pages:

- [x] Create `TiptapRenderer` component for standard nodes (paragraph, heading, list, etc.)
- [x] Add block renderers (Hero, Gallery, ProductGrid, CTA, Video, Testimonial)
- [x] Update `[...slug]/page.tsx` to use renderer
- [x] Update `/blog/[slug]/page.tsx` to use renderer
- [x] Update `/products/[slug]/page.tsx` to use renderer

**Files Created/Modified**:

- `src/components/content/TiptapRenderer.tsx` - Full renderer with all node types and custom blocks
- `src/app/[...slug]/page.tsx` - Updated to use TiptapRenderer
- `src/app/blog/[slug]/page.tsx` - Updated to use TiptapRenderer
- `src/app/products/[slug]/page.tsx` - Updated to use TiptapRenderer

### ✅ Task 6.2: Build Fixes & Production Setup

**Status**: Complete
**Priority**: CRITICAL

Fix build issues for production:

- [x] Fix Prisma 7 adapter configuration (better-sqlite3)
- [x] Fix TypeScript errors in revision service (restoreRevision)
- [x] Fix Prisma model names (postCategory, postTag)
- [x] Fix withPermission return types
- [x] Add Suspense boundaries for useSearchParams (auth/login, auth/error)
- [x] Install missing dependencies (date-fns)
- [x] Fix Role enum usage (remove OWNER/MEMBER)

**Files Modified**:

- `src/lib/prisma.ts` - Updated for Prisma 7 adapter
- `prisma/schema.prisma` - Removed engineType
- `prisma.config.ts` - Added datasource URL
- `src/modules/content/services/revision.ts` - Added restoreRevision function
- `src/app/api/admin/posts/[id]/route.ts` - Fixed Prisma model names
- `src/app/api/admin/pages/[id]/route.ts` - Fixed createRevision params
- `src/app/api/admin/products/[id]/route.ts` - Fixed createRevision params
- `src/app/api/admin/revisions/[id]/route.ts` - Fixed user destructuring
- `src/modules/core/auth.ts` - Fixed Role enum values
- `src/app/auth/login/page.tsx` - Added Suspense boundary
- `src/app/auth/error/page.tsx` - Added Suspense boundary

### ⬜ Task 6.3: Error & 404 Pages

**Status**: Not Started
**Priority**: Medium

- [ ] Create styled 404 page
- [ ] Create styled error page
- [ ] Add error boundaries

---

## 📊 Progress Tracker

| Phase   | Tasks | Completed | Progress |
| ------- | ----- | --------- | -------- |
| Phase 0 | 19    | 19        | ✅ 100%  |
| Phase 1 | 3     | 3         | ✅ 100%  |
| Phase 2 | 6     | 5         | 🔄 83%   |
| Phase 3 | 4     | 0         | ⬜ 0%    |
| Phase 4 | 4     | 0         | ⬜ 0%    |
| Phase 5 | 4     | 0         | ⬜ 0%    |
| Phase 6 | 3     | 2         | 🔄 67%   |

**Total**: 42 tasks | **Completed**: 28 | **Remaining**: 14
