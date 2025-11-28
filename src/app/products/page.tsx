import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Star } from 'lucide-react'

import { getProducts, getProductCategories } from '@/modules/ecommerce/services/product'

export default async function ProductsPage() {
  const products = await getProducts()
  const categories = await getProductCategories()

  const calculateRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#fdc501] text-sm font-medium uppercase tracking-wider mb-4 block">Shop</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Our E-Bikes</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover our complete range of premium electric bikes designed for urban mobility
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-none shadow-sm hover:-translate-y-1 rounded-xl">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {category.products.length} models
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">All Models</h2>
            <div className="flex gap-4">
              <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fdc501]">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="18" r="3" />
                  <circle cx="19" cy="18" r="3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 18l7-13 7 13M12 5v8" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No products available at the moment.</p>
              <p className="text-gray-400 mt-2">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none shadow-md rounded-2xl hover:-translate-y-1">
                    <div className="h-64 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                      <span className="text-gray-300 font-bold text-4xl">GROOD</span>

                      {product.featured && (
                        <Badge className="absolute top-4 left-4 bg-[#fdc501] text-black rounded-full">
                          Featured
                        </Badge>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        {product.categories.map((cat) => (
                          <Badge key={cat.category.id} variant="secondary" className="mr-2 rounded-full text-xs">
                            {cat.category.name}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#fdc501] transition-colors">{product.name}</h3>
                      <p className="text-gray-500 mb-4 line-clamp-2 text-sm">
                        {product.shortDescription || 'Premium electric bike with exceptional performance'}
                      </p>

                      {product.reviews.length > 0 && (
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(Number(calculateRating(product.reviews)))
                                ? 'text-[#fdc501] fill-current'
                                : 'text-gray-200'
                                }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            ({calculateRating(product.reviews)})
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold">
                            ${product.price}
                          </span>
                          {product.compareAtPrice && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              ${product.compareAtPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[#fdc501] font-medium flex items-center">
                          View
                          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}