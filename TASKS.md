# Grood CMS - Implementation Tasks

## Project Overview

Transform the Grood e-bike website into a fully dynamic CMS where admin users can manage all content, pages, products, media, and site settings through an intuitive dashboard matching the Grood brand aesthetic.

---

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

## ✅ PHASE 1: Foundation & Architecture (COMPLETE)

### ✅ Task 1.1: Change Auth System

**Status**: Complete

- [x] Koompi OAuth provider configured
- [x] Auth callbacks for Koompi user data
- [x] Account linking, error pages, env setup

### ✅ Task 1.2: User Roles (RBAC)

**Status**: Complete

- [x] Permission matrix implemented
- [x] Role management UI
- [x] Permission-based API routes

### ✅ Task 1.3: Multi-tenant Support

**Status**: Complete

- [x] Organization membership system
- [x] Organization switcher
- [x] All queries filter by organizationId

---

## 🚀 PHASE 7: GROOD CMS DYNAMIC CONTENT (NEW)

### Purpose

Make all Grood frontend pages dynamically editable from the admin dashboard with page templates and block-based editing.

---

### ✅ Task 7.1: Database Schema for Grood Content

**Status**: COMPLETE ✅
**Priority**: P0 - CRITICAL

New models for Grood-specific content:

- [x] `EBike` model - E-bike products with full specs
- [x] `Accessory` model - Accessories with categories
- [x] `Store` model - Store locations
- [x] `GroodTestimonial` model - Press quotes & reviews
- [x] `GroodFAQ` model - FAQs by category
- [x] `PageTemplate` model - Available templates
- [x] `GroodPage` model - Content blocks per page
- [x] `GroodSiteSetting` model - Grood-specific settings
- [x] Database seeded with static content

**Database Changes**:

```prisma
model EBike {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  tagline       String?
  description   Json?    // Tiptap JSON
  price         Float
  originalPrice Float?
  heroImage     String?
  galleryImages Json?    // Array of image URLs
  colors        Json?    // [{name, hex, image}]
  specs         Json?    // {range, speed, weight, battery, motor, etc}
  features      Json?    // [{icon, title, description}]
  badge         String?  // "Best Seller", "New", etc
  status        String   @default("DRAFT")
  order         Int      @default(0)
  organizationId String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Accessory {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   Json?
  price         Float
  originalPrice Float?
  image         String?
  category      String   // safety, bags, comfort, tech, maintenance
  badge         String?
  rating        Float?
  reviewCount   Int      @default(0)
  status        String   @default("DRAFT")
  organizationId String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Store {
  id          String   @id @default(cuid())
  name        String
  type        String   // "Brand Store", "Service Point"
  address     String
  city        String
  country     String
  phone       String?
  email       String?
  hours       String?
  services    Json?    // Array of service names
  image       String?
  lat         Float?
  lng         Float?
  status      String   @default("ACTIVE")
  organizationId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Testimonial {
  id        String   @id @default(cuid())
  quote     String
  source    String   // "Tech Review Asia"
  author    String?
  rating    Int?
  type      String   @default("press") // press, customer
  featured  Boolean  @default(false)
  organizationId String
  createdAt DateTime @default(now())
}

model FAQ {
  id        String   @id @default(cuid())
  question  String
  answer    String
  category  String   // general, shipping, warranty, etc
  order     Int      @default(0)
  organizationId String
  createdAt DateTime @default(now())
}

model PageTemplate {
  id          String   @id @default(cuid())
  name        String   // "Homepage", "Product Listing", "Landing Page"
  slug        String   @unique
  description String?
  thumbnail   String?
  blocks      Json     // Default block structure
  createdAt   DateTime @default(now())
}

model GroodPage {
  id          String   @id @default(cuid())
  title       String
  slug        String
  templateId  String?
  blocks      Json     // Array of block configs
  seoTitle    String?
  seoDesc     String?
  ogImage     String?
  status      String   @default("DRAFT")
  organizationId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([slug, organizationId])
}
```

---

### ✅ Task 7.2: Admin Dashboard UI Redesign

**Status**: COMPLETE ✅
**Priority**: P0 - CRITICAL

Redesign admin to match Grood brand:

- [x] Update color scheme (Gold #fdc501, Dark #303030)
- [x] Redesign sidebar with Grood sections
- [x] Dashboard stats with Grood counts
- [x] Navigation reorganized for Grood content

---

### ✅ Task 7.3: E-Bike Management

**Status**: COMPLETE ✅
**Priority**: P1 - HIGH

Full e-bike product management:

- [x] E-bike list page with grid/table view
- [x] E-bike create/edit form
- [x] Specs editor (range, speed, weight, etc.)
- [x] Color variants with image per color
- [x] Gallery management
- [x] Features editor (icon + title + desc)
- [x] Status & ordering

**Admin Pages**:

- `/admin/ebikes` - List all e-bikes ✅
- `/admin/ebikes/new` - Create e-bike ✅
- `/admin/ebikes/[id]` - Edit e-bike ✅

**API Routes**:

- `GET/POST /api/admin/ebikes` ✅
- `GET/PUT/DELETE /api/admin/ebikes/[id]` ✅

---

### ✅ Task 7.4: Accessories Management

**Status**: COMPLETE ✅
**Priority**: P1 - HIGH

Accessory product management:

- [x] Accessories list with category filter
- [x] Accessory create/edit form
- [x] Category selection (Safety, Bags, Comfort, Tech, Maintenance)
- [x] Pricing, badges, ratings

**Admin Pages**:

- `/admin/accessories` - List ✅
- `/admin/accessories/new` - Create ✅
- `/admin/accessories/[id]` - Edit ✅

**API Routes**:

- `GET/POST /api/admin/accessories` ✅
- `GET/PUT/DELETE /api/admin/accessories/[id]` ✅

---

### ✅ Task 7.5: Store Locations Management

**Status**: COMPLETE ✅
**Priority**: P1 - HIGH

Store/location management:

- [x] Store list with type filter (Brand Store / Service Point)
- [x] Store create/edit form
- [x] Hours & services editor
- [x] Lat/Lng coordinates for map

**Admin Pages**:

- `/admin/stores` - List ✅
- `/admin/stores/new` - Create ✅
- `/admin/stores/[id]` - Edit ✅

**API Routes**:

- `GET/POST /api/admin/stores` ✅
- `GET/PUT/DELETE /api/admin/stores/[id]` ✅

---

### ✅ Task 7.6: Testimonials & FAQ Management

**Status**: COMPLETE ✅
**Priority**: P2 - MEDIUM

Manage testimonials and FAQs:

- [x] Testimonials list with type filter (Text/Video)
- [x] Testimonial create/edit with rating, avatar, bike model
- [x] FAQ list with category grouping
- [x] FAQ create/edit with ordering

**Admin Pages**:

- `/admin/testimonials` - List ✅
- `/admin/testimonials/new` - Create ✅
- `/admin/testimonials/[id]` - Edit ✅
- `/admin/faqs` - List with categories ✅
- `/admin/faqs/new` - Create ✅
- `/admin/faqs/[id]` - Edit ✅

**API Routes**:

- `GET/POST /api/admin/testimonials` ✅
- `GET/PUT/DELETE /api/admin/testimonials/[id]` ✅
- `GET/POST /api/admin/faqs` ✅
- `GET/PUT/DELETE /api/admin/faqs/[id]` ✅

---

### ✅ Task 7.7: Page Templates System

**Status**: COMPLETE ✅
**Priority**: P1 - HIGH

Page template system:

- [x] Define template types:
  - Homepage Template
  - Product Listing Template
  - Product Detail Template
  - Landing Page Template
  - Blog Template
  - Contact Template
  - Store Locator Template
- [x] Template selector when creating pages
- [x] Template preview thumbnails

**Admin Pages**:

- `/admin/page-templates` - List all templates ✅
- `/admin/page-templates/new` - Create template ✅
- `/admin/page-templates/[id]` - Edit template ✅

**API Routes**:

- `GET/POST /api/admin/page-templates` ✅
- `GET/PUT/DELETE /api/admin/page-templates/[id]` ✅

---

### ✅ Task 7.8: Block-Based Page Editor

**Status**: COMPLETE ✅
**Priority**: P1 - HIGH

Visual page builder:

- [x] Block picker UI (existing, enhanced)
- [x] Drag-drop block reordering
- [x] Block configuration panels
- [x] Live preview mode

**Admin Pages**:

- `/admin/grood-pages` - List all pages ✅
- `/admin/grood-pages/new` - Create page ✅
- `/admin/grood-pages/[id]` - Block editor ✅
- `/admin/grood-pages/[id]/preview` - Preview page ✅

**API Routes**:

- `GET/POST /api/admin/grood-pages` ✅
- `GET/PUT/DELETE /api/admin/grood-pages/[id]` ✅

**Public Rendering**:

- `/p/[slug]` - Dynamic page rendering with blocks ✅

**Block Types for Grood**:
| Block | Editable Fields |
|-------|-----------------|
| Hero | Title, subtitle, CTAs, background, overlay |
| Product Grid | Title, columns, product selection |
| Testimonial | Quote, author, rating, avatar |
| Gallery | Images, columns, gap size |
| Video Embed | URL, aspect ratio, caption |
| Call to Action | Title, description, buttons, colors |

---

### ✅ Task 7.9: Dynamic Frontend Rendering

**Status**: COMPLETE ✅
**Priority**: P1 - HIGH

Connect frontend to CMS:

- [x] Homepage from CMS (e-bikes, testimonials, FAQs)
- [x] Our Rides from EBike model
- [x] Product detail from EBike
- [x] Accessories from Accessory model
- [x] Find Store from Store model
- [x] Contact/FAQ from FAQ model
- [x] Blog already done (verified)
- [x] Dynamic navigation from menus

**Files Updated**:

- `src/app/(grood)/page.tsx` - Dynamic homepage with e-bikes, testimonials ✅
- `src/app/(grood)/our-rides/page.tsx` - From DB ✅
- `src/app/(grood)/our-rides/[slug]/page.tsx` - From DB ✅
- `src/app/(grood)/accessories/page.tsx` - From DB ✅
- `src/app/(grood)/find-store/page.tsx` - From DB ✅
- `src/app/(grood)/contact/page.tsx` - FAQs from DB ✅

**Public API Routes**:

- `GET /api/ebikes` - Active e-bikes ✅
- `GET /api/ebikes/[slug]` - Single e-bike ✅
- `GET /api/accessories` - Active accessories with category filter ✅
- `GET /api/stores` - Active stores with type/city filter ✅
- `GET /api/testimonials` - Testimonials with type/featured filter ✅
- `GET /api/faqs` - FAQs with category filter ✅

---

### ✅ Task 7.10: Site Settings for Grood

**Status**: COMPLETE ✅
**Priority**: P2 - MEDIUM

Global site configuration:

- [x] Logo upload
- [x] Contact info (address, phone, email)
- [x] Social media links
- [x] Footer content
- [x] SEO defaults
- [x] Homepage settings

**Admin Page**:

- `/admin/settings` - Full settings dashboard ✅

---

### ✅ Task 7.11: Navigation Management

**Status**: COMPLETE ✅
**Priority**: P2 - MEDIUM

Dynamic menu management:

- [x] Header menu editor
- [x] Footer menu editor
- [x] Sidebar menu config
- [x] Menu item ordering
- [x] External link support

**Admin Page**:

- `/admin/menus` - Menu builder with drag-drop ✅

**API Routes**:

- `GET/POST /api/admin/menus` ✅
- `GET/PUT/DELETE /api/admin/menus/[id]` ✅

---

## 📊 PHASE 7 Implementation Order

```
Day 1-2: Task 7.1 - Database Schema
├── Create migrations
├── Seed with current static data
└── Generate Prisma client

Day 3-4: Task 7.2 - Admin Dashboard UI
├── Redesign layout & sidebar
├── Dashboard home page
└── Theme components

Day 5-6: Task 7.3 - E-Bike Management
├── CRUD API routes
├── List page
└── Create/Edit forms

Day 7: Task 7.4 - Accessories Management
├── CRUD API routes
└── Admin pages

Day 8: Task 7.5 - Store Management
├── CRUD API routes
└── Admin pages

Day 9: Task 7.6 - Testimonials & FAQs
├── CRUD API routes
└── Admin pages

Day 10: Task 7.7 & 7.8 - Page Templates & Editor
├── Template definitions
├── Block editor enhancements
└── Page builder UI

Day 11-12: Task 7.9 - Dynamic Frontend
├── Update all Grood pages
├── Connect to database
└── Dynamic rendering

Day 13: Task 7.10 & 7.11 - Settings & Navigation
├── Site settings page
└── Menu management

Day 14: Testing & Polish
├── End-to-end testing
├── Bug fixes
└── Performance optimization
```

---

## 📝 PHASE 2: Content & Asset Experience (Existing)

### ✅ Task 2.1: Advanced Block Editor - Complete

### ✅ Task 2.2: Media Library 2.0 - Complete

### ✅ Task 2.3: Revision History - Complete

### ✅ Task 2.4: Content Scheduling - Complete

### ✅ Task 2.5: Preview Mode - Complete

### ⬜ Task 2.6: Advanced SEO & Social Preview - Complete ✅

- [x] SEO utility library (`src/lib/seo.ts`)
- [x] JSON-LD structured data component
- [x] Homepage SEO with organization schema
- [x] Product pages with Product schema & breadcrumbs
- [x] Blog, Accessories, Our Rides, Our Story pages with metadata
- [x] Contact & Find Store layouts with metadata

---

## ⚙️ PHASE 3: Workflow & Developer API

### ⬜ Task 3.1: Approval Workflows - Not Started

### ⬜ Task 3.2: API Token Management - Not Started

### ⬜ Task 3.3: Webhooks System - Not Started

### ⬜ Task 3.4: API Documentation - Not Started

---

## 📣 PHASE 4: Marketing & Engagement

### ⬜ Task 4.1: Form Builder - Not Started

### ✅ Task 4.2: Search Functionality - Complete

- [x] Multi-type search API (`/api/search`)
- [x] Command-K search modal component
- [x] Header integration with keyboard shortcut
- [x] Search across e-bikes, accessories, posts, pages, FAQs, stores

### ⬜ Task 4.3: Analytics Integration - Not Started

### ⬜ Task 4.4: Email Notifications - Not Started

---

## 🛒 PHASE 5: Future / E-commerce

### ⬜ Task 5.1: Blog Comments - Not Started

### ⬜ Task 5.2: Product Reviews - Not Started

### ⬜ Task 5.3: E-commerce Features - Not Started

### ⬜ Task 5.4: Internationalization (i18n) - Not Started

---

## 🔧 PHASE 6: Production Readiness

### ✅ Task 6.1: Tiptap Content Renderer - Complete

### ✅ Task 6.2: Build Fixes & Production Setup - Complete

### ✅ Task 6.3: Error & 404 Pages - Complete

- [x] Root 404 page with animated design
- [x] Root error boundary with retry
- [x] Global error handler
- [x] Admin 404 page
- [x] Admin error boundary
- [x] Grood route group 404 page

---

## 📊 Progress Tracker

| Phase       | Description           | Tasks  | Completed | Progress   |
| ----------- | --------------------- | ------ | --------- | ---------- |
| Phase 0     | Foundation            | 19     | 19        | ✅ 100%    |
| Phase 1     | Architecture          | 3      | 3         | ✅ 100%    |
| Phase 2     | Content Experience    | 6      | 6         | ✅ 100%    |
| Phase 3     | Workflow & API        | 4      | 0         | ⬜ 0%      |
| Phase 4     | Marketing             | 4      | 1         | 🔄 25%     |
| Phase 5     | E-commerce            | 4      | 0         | ⬜ 0%      |
| Phase 6     | Production            | 3      | 3         | ✅ 100%    |
| **Phase 7** | **Grood Dynamic CMS** | **11** | **11**    | **✅ 100%** |

**Total**: 54 tasks | **Completed**: 43 | **Remaining**: 11

---

## 🎯 Current Focus: PHASE 7 - Grood Dynamic CMS

**Goal**: Admin users can manage all website content through the dashboard.

**Success Criteria**:

1. ✅ Admin can create/edit/delete e-bikes with full specs
2. ✅ Admin can manage accessories with categories
3. ✅ Admin can manage store locations
4. ✅ Admin can manage testimonials & FAQs
5. ✅ Admin can build pages using block editor
6. ✅ Admin can configure navigation menus
7. ✅ Admin can update site settings
8. ✅ All frontend pages render from CMS data
9. ✅ Dashboard matches Grood brand aesthetic
10. ✅ Mobile-responsive admin interface
