# Nimmit CMS

> An experimental multi-tenant CMS built by KOOMPI as part of the SmallWorld initiative.

This project explores modern CMS architecture with inline editing, block-based page building, and multi-tenant isolation. Currently deployed for the Grood E-bikes website as a proof of concept.

## Features

- **Multi-tenant** – Organization-scoped content with RBAC
- **Inline Editing** – Edit content directly on the frontend
- **Block Builder** – Hero, Gallery, Testimonial, CTA blocks
- **Media Library** – Image uploads with auto-optimization
- **Auto-save** – Drafts saved automatically while editing
- **Revision History** – Track and restore previous versions

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript, Prisma 7, Tailwind CSS 4
- NextAuth.js, Tiptap, Sharp

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Login**: `admin@grood.com` / `admin123`

## Project Structure

```
src/
├── app/           # Next.js routes (admin, api, frontend)
├── components/    # UI components, editor, admin toolbar
├── hooks/         # useAutoSave, etc.
├── lib/           # Prisma, permissions, utilities
└── modules/       # Domain logic (content, auth, ecommerce)
```

## Roadmap

See [TODO.md](./TODO.md) for V2 plans including e-commerce, i18n, and SaaS infrastructure.

## License

MIT – Built by KOOMPI
