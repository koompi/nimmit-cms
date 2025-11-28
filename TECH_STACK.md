# SmallWorld CMS - Tech Stack

**SmallWorld CMS** is a multi-tenant, module-based content management system built for SmallWorld businesses. The first implementation is **Grood CMS**, powering the Grood E-bikes website.

## Core Framework & Runtime
- **Next.js 16.0.4** - React framework with App Router and Turbopack
- **React 19.2.0** - UI library with latest features
- **TypeScript 5.x** - Type-safe JavaScript throughout
- **Node.js** - Runtime environment

## Database & ORM
- **Prisma 7.0.1** - Next-generation ORM with type-safety
- **SQLite** - Database (development), easily swappable for PostgreSQL/MySQL
- **Prisma Client** - Fully typed database access

## Authentication & Security
- **NextAuth.js 4.24.13** - Authentication with session management
- **@next-auth/prisma-adapter** - Prisma integration for NextAuth
- **bcryptjs** - Secure password hashing
- **Role-based access control** - Admin, Editor, User roles

## UI & Styling
- **Tailwind CSS 4.x** - Utility-first CSS with new @theme syntax
- **Roboto & Roboto Condensed** - Typography (Google Fonts)
- **shadcn/ui (Radix UI)** - Accessible, composable components
- **Lucide React 0.554.0** - Beautiful icon library
- **class-variance-authority** - Component variant utilities
- **clsx & tailwind-merge** - Conditional classNames

## Form Handling & Validation
- **React Hook Form 7.66.1** - Performant, flexible forms
- **@hookform/resolvers** - Validation integration
- **Zod 4.1.13** - TypeScript-first schema validation

## Rich Text Editor
- **Tiptap 3.11.0** - Extensible rich text editor
- **@tiptap/starter-kit** - Core editor functionality

## API & Data Fetching
- **tRPC 11.7.2** - End-to-end typesafe APIs
- **Next.js API Routes** - Server-side API endpoints
- **Server Components** - Data fetching at the component level

## State Management
- **Zustand 5.0.8** - Lightweight state management
- **React Context** - Built-in for global state (Session, Theme)

## Development Tools
- **ESLint 9** - Code quality and consistency
- **TypeScript** - Static type checking
- **tsx** - TypeScript execution for scripts
- **Turbopack** - Next-gen bundler (faster than Webpack)

---

## SmallWorld CMS Architecture

### 🏗️ Module System
The codebase is organized into independent, reusable modules:

```
src/modules/
├── core/               # Authentication, users, settings
│   ├── auth.ts
│   └── providers/
├── ecommerce/          # Products, orders, reviews
│   └── services/
│       └── product.ts
└── content/            # Posts, pages, media
    └── services/
        ├── page.ts
        └── post.ts
```

**Benefits:**
- **Modularity**: Features can be enabled/disabled per tenant
- **Reusability**: Modules work across different SmallWorld businesses
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new modules (e.g., `booking`, `events`)

### 🎨 Grood Branding (First Tenant)
The system is pre-configured with Grood's visual identity:
- **Primary Color**: `#fdc501` (Gold/Yellow)
- **Secondary Color**: `#303030` (Dark Grey)
- **Fonts**: Roboto Condensed (Headings), Roboto (Body)
- **Style**: Italic, bold, high-contrast design

### 🚀 Next.js 16 Features Utilized
- **App Router** - File-based routing with layouts
- **Server Components** - Zero JavaScript by default
- **Dynamic Routing** - `[...slug]` for user-created pages
- **Streaming UI** - Progressive rendering for faster perceived load
- **generateMetadata** - Dynamic SEO per page
- **Turbopack** - 700x faster updates than Webpack

### 🔐 Security Best Practices
- **Password hashing** with bcrypt (10 rounds)
- **Session management** via JWT (NextAuth)
- **Input validation** with Zod schemas on all forms
- **Role-based access control** enforced at API and UI levels
- **SQL injection protection** via Prisma's prepared statements

### 📊 Performance Optimizations
- **Server-side rendering** (SSR) for public pages
- **Static generation** where applicable
- **Automatic code splitting** per route
- **Image optimization** (Next.js Image component ready)
- **Database connection pooling** via Prisma

---

## Why This Stack?

### For SmallWorld Businesses
1. **Multi-Tenancy Ready**: Architecture supports multiple brands/sites
2. **No-Code Foundation**: Page builder with blocks (planned)
3. **E-commerce Native**: Built-in product catalog, reviews, testimonials
4. **SEO Optimized**: Dynamic meta tags, semantic HTML, fast load times

### For Developers
1. **Modern & Future-Proof**: Latest Next.js 16, React 19
2. **Type Safety**: TypeScript + Prisma = zero runtime errors
3. **Excellent DX**: Hot reload, clear errors, auto-complete everywhere
4. **Scalable**: Module system grows with business needs
5. **Maintainable**: Clean code, clear separation of concerns

### For Performance
1. **Fast Initial Load**: Server components, code splitting
2. **Fast Navigation**: Client-side routing, prefetching
3. **Fast Builds**: Turbopack, incremental compilation
4. **Fast Queries**: Prisma with connection pooling

---

## Deployment Options

This stack can be deployed to:
- **Vercel** (Recommended for Next.js, zero-config)
- **Netlify** (Good alternative with similar DX)
- **AWS Amplify** (More control, integrates with AWS services)
- **DigitalOcean App Platform** (Affordable, straightforward)
- **Self-hosted** on any Node.js server (VPS, Docker, Kubernetes)

### Database for Production
For production, switch from SQLite to:
- **PostgreSQL** (Recommended, best Prisma support)
- **MySQL/MariaDB** (Good alternative)
- **CockroachDB** (Serverless PostgreSQL)
- **PlanetScale** (Serverless MySQL)

---

## Roadmap

### ✅ Implemented
- Module-based architecture (core, ecommerce, content)
- Dynamic page routing with `/[...slug]`
- Grood theme (colors, fonts)
- Product catalog with services
- Blog system with categories
- Authentication (NextAuth + Prisma)

### 🚧 In Progress
- Media Library UI
- Theme Customizer (admin-editable colors/fonts)
- Block-based page builder

### 📋 Planned
- Navigation menu builder (drag & drop)
- Content workflows (draft → review → publish)
- Multi-language support
- Advanced SEO tools
- Analytics dashboard