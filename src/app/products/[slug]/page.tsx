import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Check, Shield, Battery, Bike } from 'lucide-react'
import { TiptapRenderer } from '@/components/content/TiptapRenderer'

import { getProduct, getRelatedProducts } from '@/modules/ecommerce/services/product'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id)
  const specifications = product.specifications as Record<string, string> | null
  const description = product.description as { type: 'doc'; content: unknown[] } | null

  const calculateRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <section className="pt-24 pb-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm">
            <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            <span className="mx-2 text-gray-400">/</span>
            <a href="/products" className="text-gray-500 hover:text-gray-700">Products</a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                {product.categories.map((cat) => (
                  <Badge key={cat.category.id} variant="secondary" className="mr-2 rounded-full">
                    {cat.category.name}
                  </Badge>
                ))}
                {product.featured && (
                  <Badge className="bg-[#fdc501] text-black rounded-full">Featured</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(Number(calculateRating(product.reviews)))
                        ? 'text-[#fdc501] fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {calculateRating(product.reviews)} ({product.reviews.length} reviews)
                </span>
              </div>

              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">
                  ${product.price}
                </span>
                {product.compareAtPrice && (
                  <span className="ml-3 text-xl text-gray-400 line-through">
                    ${product.compareAtPrice}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6">
                {product.shortDescription || 'Premium electric bike designed for your lifestyle.'}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-3" />
                  <span>2-Year Warranty</span>
                </div>
                <div className="flex items-center">
                  <Battery className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Long-Lasting Battery</span>
                </div>
                <div className="flex items-center">
                  <Bike className="h-5 w-5 text-purple-600 mr-3" />
                  <span>Premium Components</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-[#fdc501] text-black hover:bg-[#e5b100] rounded-full">
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-gray-300">
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <button className="pb-4 border-b-2 border-[#fdc501] font-medium text-gray-900">
                  Description
                </button>
                <button className="pb-4 text-gray-500 hover:text-gray-900 transition-colors">
                  Specifications
                </button>
                <button className="pb-4 text-gray-500 hover:text-gray-900 transition-colors">
                  Reviews ({product.reviews.length})
                </button>
              </div>
            </div>

            <div className="py-8">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <div className="prose prose-lg max-w-none text-gray-600">
                <TiptapRenderer content={description} />
              </div>
            </div>

            {specifications && (
              <>
                <Separator />
                <div className="py-8">
                  <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {product.reviews.length > 0 && (
              <>
                <Separator />
                <div className="py-8">
                  <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">{review.name}</span>
                            {review.title && (
                              <span className="ml-2 text-gray-600">- {review.title}</span>
                            )}
                          </div>
                          <p className="text-gray-600">{review.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <a key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="group">
                  <Card className="overflow-hidden border-none shadow-md rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 font-bold text-2xl">GROOD</span>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2 group-hover:text-[#fdc501] transition-colors">{relatedProduct.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">
                          ${relatedProduct.price}
                        </span>
                        <span className="text-[#fdc501] font-medium flex items-center text-sm">
                          View
                          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}