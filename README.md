# SmallWorld CMS (Grood Edition)

**SmallWorld CMS** is a modern, modular content management system designed for SmallWorld businesses. Built with Next.js 16, TypeScript, and a WordPress-like editing experience, it empowers teams to manage websites without code.

**Grood CMS** is the first tenant, powering the [Grood E-bikes](https://getgrood.com) website.

---

## 🎯 Vision

Create a **multi-tenant, no-code CMS platform** where businesses can:
- Manage content (pages, posts, products) without touching code
- Customize branding (colors, fonts, logos) from the admin panel
- Build pages with a drag-and-drop block editor
- Scale from a single site to multiple brands

---

## 🚀 Tech Stack

- **Next.js 16** - App Router, Server Components, Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript** - End-to-end type safety
- **Prisma 7** - Type-safe ORM with SQLite (dev) / PostgreSQL (prod)
- **Tailwind CSS 4** - Modern utility-first styling
- **shadcn/ui** - Beautiful, accessible components (Radix UI)
- **NextAuth.js** - Session-based authentication
- **tRPC** - Type-safe API layer
- **Tiptap** - Extensible rich text editor
- **Roboto Fonts** - Grood branding (Roboto Condensed for headings)

See [TECH_STACK.md](./TECH_STACK.md) for complete details.

---

## 📋 Features

### ✅ Implemented
- **Module-Based Architecture**: `core`, `ecommerce`, `content` modules for reusability
- **Dynamic Page Routing**: `/[...slug]` renders user-created pages from the database
- **Grood Branding**: Gold (`#fdc501`) and Dark Grey (`#303030`) theme
- **Product Catalog**: E-bikes with categories, reviews, specifications
- **Blog System**: Posts with categories, tags, featured images
- **Authentication**: Role-based (Admin, Editor, User) with NextAuth + Prisma
- **SEO-Ready**: Dynamic metadata generation per page

### 🚧 In Progress
- **Media Library UI**: Centralized upload and asset management
- **Theme Customizer**: Admin panel for colors, fonts, logos
- **Block Editor**: No-code page builder (Hero, CTA, Product Grid blocks)

### 📋 Planned
- **Navigation Builder**: Drag-and-drop menu management
- **Content Workflows**: Draft → Pending Review → Published
- **Multi-Language**: i18n support for global markets
- **Analytics Dashboard**: Traffic, conversions, top content

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd grood-cms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and NextAuth secret
   ```

4. **Initialize the database:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Public site: [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

### Default Admin Credentials
After seeding, log in with:
- **Email**: `admin@grood.com`
- **Password**: `admin123`

---

## 📁 Project Structure

```
grood-cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [...slug]/         # Dynamic pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth pages (login)
│   │   ├── blog/              # Blog listing
│   │   ├── products/          # Product catalog
│   │   └── page.tsx           # Homepage
│   │
│   ├── modules/               # SmallWorld CMS Modules
│   │   ├── core/              # Auth, users, settings
│   │   │   ├── auth.ts
│   │   │   └── providers/
│   │   ├── ecommerce/         # Products, reviews
│   │   │   └── services/
│   │   └── content/           # Pages, posts
│   │       └── services/
│   │
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Database client
│   │   └── utils.ts           # Helper functions
│   │
│   └── types/                 # TypeScript definitions
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed data
│
└── public/                    # Static assets
```

---

## 🎨 Grood Branding

The CMS is pre-configured with Grood's visual identity:

| Element | Value |
|---------|-------|
| Primary Color | `#fdc501` (Gold) |
| Secondary Color | `#303030` (Dark Grey) |
| Heading Font | Roboto Condensed (Bold, Italic) |
| Body Font | Roboto (Regular, Medium, Bold) |
| Style | High-contrast, italic headings, rounded buttons |

Theme settings are stored in `src/app/globals.css` and will be migrated to the database for the Theme Customizer feature.

---

## �️ Database Schema

Core models include:

- **User** - Authentication, roles (Admin/Editor/User)
- **Session** - NextAuth sessions
- **Post** - Blog posts with categories, tags, author
- **Page** - Static pages (About, Contact) with dynamic routing
- **Product** - E-bikes with SKU, price, inventory, categories
- **ProductCategory** - Hierarchical product organization
- **Review** - Customer reviews (approved/unapproved)
- **Testimonial** - Customer testimonials
- **Media** - Uploaded files (images, documents)
- **Setting** - Site configuration (key-value JSON store)

See `prisma/schema.prisma` for the full schema.

---

## 🔐 Authentication

Built with **NextAuth.js** + **Prisma Adapter**:
- **Credentials Provider**: Email + password (bcrypt hashed)
- **Session Strategy**: JWT-based (default)
- **Roles**: `ADMIN`, `EDITOR`, `USER`
- **Protected Routes**: Admin panel requires authentication

Custom pages:
- Login: `/auth/login`
- Error: `/auth/error`

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub/GitLab
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
4. Deploy!

### Database Setup (Production)
Use **PostgreSQL** for production:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com) (free tier available)
- [PlanetScale](https://planetscale.com) (serverless MySQL alternative)
- [Neon](https://neon.tech) (serverless Postgres)

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Run migrations:
```bash
npx prisma migrate deploy
```

---

## 📚 Documentation

- [Tech Stack Details](./TECH_STACK.md) - In-depth technical overview
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Prisma Docs](https://www.prisma.io/docs) - ORM and migrations
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling utilities

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Development Guidelines
- **Type Safety**: Use TypeScript, no `any` types
- **Code Style**: Follow ESLint rules (`npm run lint`)
- **Commit Messages**: Use conventional commits (feat, fix, docs, etc.)
- **Testing**: Add tests for new features (when test suite is added)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with ❤️ by the SmallWorld team for businesses that put people first.

Powered by:
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Vercel](https://vercel.com)
- [shadcn/ui](https://ui.shadcn.com)