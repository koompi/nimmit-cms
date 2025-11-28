import { prisma } from '@/lib/prisma'

export async function getProducts() {
  return await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      reviews: {
        where: { approved: true },
        take: 3
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getProductCategories() {
  return await prisma.productCategory.findMany({
    include: {
      products: {
        where: {
          product: {
            status: 'ACTIVE'
          }
        },
        include: {
          product: true
        }
      }
    }
  })
}

export async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      reviews: {
        where: { approved: true },
        include: {
          product: true
        }
      }
    }
  })

  if (!product || product.status !== 'ACTIVE') {
    return null
  }

  return product
}

export async function getRelatedProducts(currentProductId: string) {
  return await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: currentProductId }
    },
    take: 4,
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })
}
