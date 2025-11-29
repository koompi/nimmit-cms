import { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  price?: {
    amount: number
    currency: string
  }
  availability?: 'in stock' | 'out of stock' | 'preorder'
}

const siteConfig = {
  name: 'Grood',
  tagline: 'Electric Bikes for Urban Mobility',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://grood.com',
  twitterHandle: '@groodbikes',
  defaultImage: '/images/og-default.jpg',
}

export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = siteConfig.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    price,
    availability,
  } = config

  const fullTitle = title === siteConfig.name 
    ? title 
    : `${title} | ${siteConfig.name}`
  
  const imageUrl = image.startsWith('http') 
    ? image 
    : `${siteConfig.url}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: url || siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'article' ? 'article' : type === 'product' ? 'website' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  }

  // Add article-specific metadata
  if (type === 'article' && metadata.openGraph) {
    (metadata.openGraph as Record<string, unknown>).type = 'article'
    if (publishedTime) {
      (metadata.openGraph as Record<string, unknown>).publishedTime = publishedTime
    }
    if (modifiedTime) {
      (metadata.openGraph as Record<string, unknown>).modifiedTime = modifiedTime
    }
    if (author) {
      (metadata.openGraph as Record<string, unknown>).authors = [author]
    }
    if (section) {
      (metadata.openGraph as Record<string, unknown>).section = section
    }
    if (tags.length > 0) {
      (metadata.openGraph as Record<string, unknown>).tags = tags
    }
  }

  // Add product-specific metadata
  if (type === 'product' && price) {
    metadata.other = {
      'product:price:amount': price.amount.toString(),
      'product:price:currency': price.currency,
      ...(availability && { 'product:availability': availability }),
    }
  }

  return metadata
}

// Generate JSON-LD structured data
export function generateProductJsonLd(product: {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  sku?: string
  brand?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Grood',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: product.url,
    },
  }
}

export function generateArticleJsonLd(article: {
  title: string
  description: string
  image: string
  publishedTime: string
  modifiedTime?: string
  author: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grood',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Grood',
    description: 'Premium electric bikes for urban mobility',
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    sameAs: [
      'https://twitter.com/groodbikes',
      'https://instagram.com/groodbikes',
      'https://facebook.com/groodbikes',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-GROOD',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  }
}

export function generateLocalBusinessJsonLd(store: {
  name: string
  address: string
  city: string
  country: string
  phone?: string
  email?: string
  lat?: number
  lng?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: store.country,
    },
    telephone: store.phone,
    email: store.email,
    ...(store.lat && store.lng && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: store.lat,
        longitude: store.lng,
      },
    }),
  }
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateFAQJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
