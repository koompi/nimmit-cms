# Changelog

All notable changes to Nimmit CMS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-29

### 🎉 Initial Release

Nimmit CMS V1 - A complete multi-tenant content management system with inline editing capabilities.

### Added

#### Content Management

- Posts, Pages, Products with full CRUD operations
- Rich text editor powered by Tiptap
- Block-based page builder (Hero, Product Grid, Testimonial, Gallery, Video, CTA)
- Media library with folder organization
- Image optimization (Sharp) with WebP conversion and thumbnails
- Revision history for posts and pages
- Content scheduling (publish/unpublish dates)
- Trash/Recycle bin with restore functionality
- Content duplication (clone posts, pages, products)

#### Inline Editing

- Admin toolbar on frontend for authenticated users
- Edit mode toggle to enable/disable inline editing
- Inline text editing for titles and descriptions
- Inline image replacement from media library
- Inline rich text editing with Tiptap
- Auto-save drafts (3-second debounce)
- Visual indicators for unsaved changes

#### Admin Dashboard

- Dashboard with content statistics
- Role-based access control (RBAC)
  - Super Admin, Admin, Editor, Author, User roles
  - Permission matrix for all resources
- Multi-tenant support with organization switching
- Activity log (who changed what, when)
- Bulk actions (publish, archive, delete)
- Database backup/restore system

#### E-Bikes & Products

- E-bike management with full specifications
- Color variants with images
- Gallery management
- Accessories with categories
- Product categories with hierarchy

#### Frontend Features

- Dynamic page routing from CMS
- SEO optimization with JSON-LD structured data
- Open Graph and Twitter Card meta tags
- Site-wide search (Cmd+K shortcut)
- Store locator with maps
- Testimonials and FAQs
- Responsive Grood branding

#### Technical

- Next.js 16 with App Router and Turbopack
- TypeScript with strict mode
- Prisma 7 ORM with SQLite (dev) / PostgreSQL (prod)
- NextAuth.js with Koompi OAuth provider
- Tailwind CSS 4 with shadcn/ui components
- ESLint configuration

### Security

- Session-based authentication
- RBAC middleware on all API routes
- Organization-scoped data isolation
- CSRF protection via NextAuth

---

## [Unreleased]

### Planned for V2

- E-commerce checkout integration (Baray.js)
- Order management system
- Customer accounts
- Analytics dashboard
- Multi-language support (i18n)
- Error monitoring (Sentry)
- Approval workflows
- API tokens for external access
- Webhooks system
