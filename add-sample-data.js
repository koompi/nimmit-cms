const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@grood.com' },
      update: {},
      create: {
        email: 'admin@grood.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin user created:', admin.email);

    // Create categories
    const blogCategory = await prisma.category.upsert({
      where: { slug: 'blog' },
      update: {},
      create: {
        name: 'Blog',
        slug: 'blog',
      },
    });

    const newsCategory = await prisma.category.upsert({
      where: { slug: 'news' },
      update: {},
      create: {
        name: 'News',
        slug: 'news',
      },
    });

    // Create product categories
    const electricBikes = await prisma.productCategory.upsert({
      where: { slug: 'electric-bikes' },
      update: {},
      create: {
        name: 'Electric Bikes',
        slug: 'electric-bikes',
      },
    });

    // Create sample products
    await prisma.product.upsert({
      where: { sku: 'GP-001' },
      update: {},
      create: {
        name: 'Grood Urban Pro',
        slug: 'grood-urban-pro',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The perfect electric bike for urban commuting. Features a powerful 250W motor, 30-mile range, and sleek design.' }] }] },
        shortDescription: 'Premium urban electric bike with 30-mile range',
        price: 1299.99,
        sku: 'GP-001',
        inventory: 50,
        status: 'ACTIVE',
        featured: true,
        specifications: {
          motor: '250W Brushless',
          battery: '36V 10.4Ah',
          range: '30 miles',
          speed: '20 mph',
          weight: '45 lbs'
        }
      },
    });

    await prisma.product.upsert({
      where: { sku: 'GM-002' },
      update: {},
      create: {
        name: 'Grood Mountain X',
        slug: 'grood-mountain-x',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Conquer any terrain with the Grood Mountain X. Built for adventure with rugged tires and powerful motor.' }] }] },
        shortDescription: 'All-terrain electric mountain bike',
        price: 1899.99,
        sku: 'GM-002',
        inventory: 30,
        status: 'ACTIVE',
        featured: true,
        specifications: {
          motor: '500W Brushless',
          battery: '48V 13Ah',
          range: '40 miles',
          speed: '28 mph',
          weight: '55 lbs'
        }
      },
    });

    // Create sample blog post
    await prisma.post.upsert({
      where: { slug: 'welcome-to-grood-ebikes' },
      update: {},
      create: {
        title: 'Welcome to Grood E-bikes',
        slug: 'welcome-to-grood-ebikes',
        content: {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to Grood E-bikes' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'We are excited to launch our new line of electric bikes designed for modern riders.' }] }
          ]
        },
        excerpt: 'Introducing our new line of premium electric bikes',
        status: 'PUBLISHED',
        type: 'POST',
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });

    // Create About page
    await prisma.page.upsert({
      where: { slug: 'about' },
      update: {},
      create: {
        title: 'About Us',
        slug: 'about',
        content: {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'About Grood E-bikes' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'We are passionate about creating the best electric bikes for modern commuters and adventurers.' }] }
          ]
        },
        status: 'PUBLISHED',
        template: 'about',
        publishedAt: new Date(),
      },
    });

    // Create testimonials
    await prisma.testimonial.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'John Smith',
        company: 'Tech Corp',
        position: 'Software Engineer',
        content: 'The Grood Urban Pro has transformed my daily commute. It\'s fast, reliable, and stylish!',
        rating: 5,
        approved: true,
        featured: true,
      },
    });

    await prisma.testimonial.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Sarah Johnson',
        company: 'Design Studio',
        position: 'Creative Director',
        content: 'I love my Grood Mountain X! It handles hills with ease and the battery life is amazing.',
        rating: 5,
        approved: true,
        featured: true,
      },
    });

    // Create site settings
    await prisma.setting.upsert({
      where: { key: 'site_title' },
      update: {},
      create: {
        key: 'site_title',
        value: 'Grood E-bikes - Premium Electric Bikes',
      },
    });

    await prisma.setting.upsert({
      where: { key: 'site_description' },
      update: {},
      create: {
        key: 'site_description',
        value: 'Discover premium electric bikes for urban commuting and mountain adventures. Shop Grood E-bikes today.',
      },
    });

    console.log('Sample data added successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@grood.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();