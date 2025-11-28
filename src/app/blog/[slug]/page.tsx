import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getPost } from '@/modules/content/services/post'
import { TiptapRenderer } from '@/components/content/TiptapRenderer'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const seo = post.seo as { title?: string; description?: string } | null

  return {
    title: seo?.title || post.title,
    description: seo?.description || post.excerpt || undefined,
    openGraph: {
      title: seo?.title || post.title,
      description: seo?.description || post.excerpt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const content = post.content as { type: 'doc'; content: unknown[] } | null

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-2 mb-4">
            {post.categories.map((cat) => (
              <Badge key={cat.category.id} className="bg-[#fdc501] text-black rounded-full">
                {cat.category.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

          <div className="flex items-center text-white/60">
            <User className="h-5 w-5 mr-2" />
            <span className="mr-6">{post.author.name}</span>
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-blue-600 pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none">
            <TiptapRenderer content={content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tagItem) => (
                  <Badge key={tagItem.tag.id} variant="outline">
                    {tagItem.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author.bio && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{post.author.name}</h3>
                  <p className="text-gray-600 mt-1">{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center text-[#fdc501] hover:text-[#e5b100] font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
