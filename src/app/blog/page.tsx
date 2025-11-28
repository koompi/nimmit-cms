import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

import { getPosts } from '@/modules/content/services/post'

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#fdc501] text-sm font-medium uppercase tracking-wider mb-4 block">Stories</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">The Grood Blog</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Tips, guides, and stories about electric bikes and sustainable urban mobility
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No blog posts available yet.</p>
              <p className="text-gray-400 mt-2">Check back soon for new stories!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none shadow-md rounded-2xl hover:-translate-y-1 h-full">
                    {post.featuredImage ? (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-2xl">GROOD</span>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {post.categories.map((cat) => (
                          <Badge key={cat.category.id} variant="secondary" className="rounded-full text-xs">
                            {cat.category.name}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#fdc501] transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span className="mr-4">{post.author.name}</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 line-clamp-3 text-sm">
                        {post.excerpt || 'Read more about this amazing post...'}
                      </p>
                      <span className="inline-flex items-center mt-4 text-[#fdc501] font-medium">
                        Read More
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-[#fdc501] py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Stay Updated</h2>
          <p className="text-lg text-black/70 mb-8">
            Get the latest news and tips about electric bikes delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border-2 border-black/20 rounded-full bg-white focus:outline-none focus:border-black"
            />
            <button className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}