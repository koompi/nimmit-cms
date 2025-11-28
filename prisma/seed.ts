import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as bcrypt from "bcryptjs";

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Default Organization",
      slug: "default",
    },
  });

  console.log("Created organization:", defaultOrg.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@grood.com" },
    update: {},
    create: {
      email: "admin@grood.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      organizationId: defaultOrg.id,
    },
  });

  // Create sample categories
  const blogCategory = await prisma.category.create({
    data: {
      name: "Blog",
      slug: "blog",
      organizationId: defaultOrg.id,
    },
  });

  const newsCategory = await prisma.category.create({
    data: {
      name: "News",
      slug: "news",
      organizationId: defaultOrg.id,
    },
  });

  // Create sample product categories
  const electricBikes = await prisma.productCategory.create({
    data: {
      name: "Electric Bikes",
      slug: "electric-bikes",
      organizationId: defaultOrg.id,
    },
  });

  const accessories = await prisma.productCategory.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      organizationId: defaultOrg.id,
    },
  });

  // Create sample products
  await prisma.product.create({
    data: {
      name: "Grood Urban Pro",
      slug: "grood-urban-pro",
      organizationId: defaultOrg.id,
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The perfect electric bike for urban commuting. Features a powerful 250W motor, 30-mile range, and sleek design.",
              },
            ],
          },
        ],
      },
      shortDescription: "Premium urban electric bike with 30-mile range",
      price: 1299.99,
      sku: "GP-001",
      inventory: 50,
      status: "ACTIVE",
      featured: true,
      specifications: {
        motor: "250W Brushless",
        battery: "36V 10.4Ah",
        range: "30 miles",
        speed: "20 mph",
        weight: "45 lbs",
      },
      gallery: [],
      options: {},
    },
  });

  await prisma.product.create({
    data: {
      name: "Grood Mountain X",
      slug: "grood-mountain-x",
      organizationId: defaultOrg.id,
      description: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Conquer any terrain with the Grood Mountain X. Built for adventure with rugged tires and powerful motor.",
              },
            ],
          },
        ],
      },
      shortDescription: "All-terrain electric mountain bike",
      price: 1899.99,
      sku: "GM-002",
      inventory: 30,
      status: "ACTIVE",
      featured: true,
      specifications: {
        motor: "500W Brushless",
        battery: "48V 13Ah",
        range: "40 miles",
        speed: "28 mph",
        weight: "55 lbs",
      },
      gallery: [],
      options: {},
    },
  });

  // Create sample pages
  await prisma.page.create({
    data: {
      title: "About Us",
      slug: "about",
      organizationId: defaultOrg.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              {
                type: "text",
                text: "About Grood E-bikes",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "We are passionate about creating the best electric bikes for modern commuters and adventurers.",
              },
            ],
          },
        ],
      },
      status: "PUBLISHED",
      template: "about",
    },
  });

  await prisma.page.create({
    data: {
      title: "Contact",
      slug: "contact",
      organizationId: defaultOrg.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              {
                type: "text",
                text: "Contact Us",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Get in touch with our team for any questions about our products.",
              },
            ],
          },
        ],
      },
      status: "PUBLISHED",
      template: "contact",
    },
  });

  // Create sample posts
  await prisma.post.create({
    data: {
      title: "Welcome to Grood E-bikes",
      slug: "welcome-to-grood-ebikes",
      organizationId: defaultOrg.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              {
                type: "text",
                text: "Welcome to Grood E-bikes",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "We are excited to launch our new line of electric bikes designed for modern riders.",
              },
            ],
          },
        ],
      },
      excerpt: "Introducing our new line of premium electric bikes",
      status: "PUBLISHED",
      type: "POST",
      authorId: adminUser.id,
    },
  });

  // Create sample testimonials
  await prisma.testimonial.create({
    data: {
      name: "John Smith",
      company: "Tech Corp",
      position: "Software Engineer",
      content:
        "The Grood Urban Pro has transformed my daily commute. It's fast, reliable, and stylish!",
      rating: 5,
      approved: true,
      featured: true,
    },
  });

  await prisma.testimonial.create({
    data: {
      name: "Sarah Johnson",
      company: "Design Studio",
      position: "Creative Director",
      content:
        "I love my Grood Mountain X! It handles hills with ease and the battery life is amazing.",
      rating: 5,
      approved: true,
      featured: true,
    },
  });

  // Create site settings with Grood branding
  await prisma.setting.createMany({
    data: [
      {
        key: "siteName",
        value: "Grood",
        organizationId: defaultOrg.id,
      },
      {
        key: "siteTagline",
        value: "Ride the future",
        organizationId: defaultOrg.id,
      },
      {
        key: "heroTitle",
        value: "The Future of Urban Mobility",
        organizationId: defaultOrg.id,
      },
      {
        key: "heroSubtitle",
        value: "Premium electric bikes engineered for the modern city rider",
        organizationId: defaultOrg.id,
      },
      {
        key: "heroCta1Text",
        value: "Explore Bikes",
        organizationId: defaultOrg.id,
      },
      {
        key: "heroCta1Link",
        value: "/products",
        organizationId: defaultOrg.id,
      },
      {
        key: "heroCta2Text",
        value: "Book Test Ride",
        organizationId: defaultOrg.id,
      },
      {
        key: "heroCta2Link",
        value: "/contact",
        organizationId: defaultOrg.id,
      },
      {
        key: "contactEmail",
        value: "hello@getgrood.com",
        organizationId: defaultOrg.id,
      },
      {
        key: "contactPhone",
        value: "+855 23 456 789",
        organizationId: defaultOrg.id,
      },
      {
        key: "contactAddress",
        value: "Phnom Penh, Cambodia",
        organizationId: defaultOrg.id,
      },
      {
        key: "facebook",
        value: "https://facebook.com/getgrood",
        organizationId: defaultOrg.id,
      },
      {
        key: "instagram",
        value: "https://instagram.com/getgrood",
        organizationId: defaultOrg.id,
      },
      {
        key: "twitter",
        value: "https://twitter.com/getgrood",
        organizationId: defaultOrg.id,
      },
      {
        key: "youtube",
        value: "https://youtube.com/@getgrood",
        organizationId: defaultOrg.id,
      },
    ],
  });

  // Create header menu
  const headerMenu = await prisma.menu.create({
    data: {
      name: "Header Navigation",
      location: "header",
      organizationId: defaultOrg.id,
    },
  });

  // Create header menu items
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: headerMenu.id,
        label: "Our Rides",
        url: "/products",
        target: "_self",
        order: 1,
      },
      {
        menuId: headerMenu.id,
        label: "Our Story",
        url: "/about",
        target: "_self",
        order: 2,
      },
      {
        menuId: headerMenu.id,
        label: "Blog",
        url: "/blog",
        target: "_self",
        order: 3,
      },
      {
        menuId: headerMenu.id,
        label: "Support",
        url: "/contact",
        target: "_self",
        order: 4,
      },
    ],
  });

  // Create footer menu
  const footerMenu = await prisma.menu.create({
    data: {
      name: "Footer Navigation",
      location: "footer",
      organizationId: defaultOrg.id,
    },
  });

  // Create footer menu items
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: footerMenu.id,
        label: "Urban Pro",
        url: "/products/grood-urban-pro",
        target: "_self",
        order: 1,
      },
      {
        menuId: footerMenu.id,
        label: "Mountain X",
        url: "/products/grood-mountain-x",
        target: "_self",
        order: 2,
      },
      {
        menuId: footerMenu.id,
        label: "Compare Bikes",
        url: "/products",
        target: "_self",
        order: 3,
      },
      {
        menuId: footerMenu.id,
        label: "Test Rides",
        url: "/contact",
        target: "_self",
        order: 4,
      },
      {
        menuId: footerMenu.id,
        label: "Our Story",
        url: "/about",
        target: "_self",
        order: 5,
      },
      {
        menuId: footerMenu.id,
        label: "Blog",
        url: "/blog",
        target: "_self",
        order: 6,
      },
      {
        menuId: footerMenu.id,
        label: "Privacy Policy",
        url: "/privacy",
        target: "_self",
        order: 7,
      },
      {
        menuId: footerMenu.id,
        label: "Terms & Conditions",
        url: "/terms",
        target: "_self",
        order: 8,
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log("Header menu created with", 4, "items");
  console.log("Footer menu created with", 8, "items");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
