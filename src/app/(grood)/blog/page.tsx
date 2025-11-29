import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, ChevronRight } from "lucide-react";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Blog",
  description: "Stories, tips, and insights from the world of Grood e-bikes. Discover the latest in urban mobility, cycling culture, and sustainable living.",
  keywords: ["grood blog", "e-bike news", "cycling tips", "urban mobility", "sustainable transport"],
});

const categories = [
  { name: "All", slug: "all" },
  { name: "News", slug: "news" },
  { name: "Culture", slug: "culture" },
  { name: "Technology", slug: "technology" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "City Guides", slug: "guides" },
];

const featuredPost = {
  id: 1,
  title: "The Future of Urban Mobility: How E-Bikes Are Changing Cities",
  excerpt:
    "Cities around the world are embracing e-bikes as a sustainable solution to urban transportation challenges. Here's how Grood is leading the revolution.",
  category: "Technology",
  author: "Sarah Chen",
  date: "Dec 15, 2024",
  readTime: "8 min read",
  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  slug: "future-urban-mobility",
};

const posts = [
  {
    id: 2,
    title: "5 Essential Accessories for Your Daily Commute",
    excerpt:
      "From panniers to phone mounts, these accessories will transform your daily ride into an effortless experience.",
    category: "Lifestyle",
    author: "James Wilson",
    date: "Dec 12, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
    slug: "essential-accessories-commute",
  },
  {
    id: 3,
    title: "Phnom Penh: The Ultimate E-Bike City Guide",
    excerpt:
      "Discover the best routes, hidden gems, and local favorites in Cambodia's vibrant capital city.",
    category: "City Guides",
    author: "Sokha Vann",
    date: "Dec 10, 2024",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1558618047-3c8b73fc3a58?w=600&q=80",
    slug: "phnom-penh-city-guide",
  },
  {
    id: 4,
    title: "Behind the Design: The Making of Grood S1",
    excerpt:
      "Our head of design shares the inspiration and engineering behind our flagship sport model.",
    category: "Technology",
    author: "David Kim",
    date: "Dec 8, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1558618047-f4b511986f01?w=600&q=80",
    slug: "behind-design-grood-s1",
  },
  {
    id: 5,
    title: "Meet the Grood Community: Stories from Our Riders",
    excerpt:
      "Real stories from real riders who have made Grood part of their daily lives.",
    category: "Culture",
    author: "Emily Torres",
    date: "Dec 5, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    slug: "grood-community-stories",
  },
  {
    id: 6,
    title: "Winter Riding Tips: Stay Safe and Comfortable",
    excerpt:
      "Everything you need to know about maintaining your e-bike and staying warm during the colder months.",
    category: "Lifestyle",
    author: "Michael Brown",
    date: "Dec 3, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
    slug: "winter-riding-tips",
  },
  {
    id: 7,
    title: "Grood Opens New Flagship Store in Singapore",
    excerpt:
      "Expanding our presence in Southeast Asia with a stunning new brand experience center on Orchard Road.",
    category: "News",
    author: "Grood Team",
    date: "Dec 1, 2024",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1558618047-3c8b73fc3a58?w=600&q=80",
    slug: "singapore-flagship-store",
  },
];

export default function BlogPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-black pt-28 pb-12 md:pt-32 md:pb-16" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Stories
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            News, insights, and stories from the world of Grood and urban mobility.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <nav className="flex gap-2 sm:gap-3 py-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`px-4 sm:px-6 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-all min-h-[44px] ${
                  category.slug === "all"
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Featured Post */}
      <section className="bg-white py-12" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group grid lg:grid-cols-2 gap-8 items-center"
          >
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:pl-8">
              <span className="inline-block bg-[#fdc501] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
                {featuredPost.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 group-hover:text-[#fdc501] transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-gray-600 mb-6">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{featuredPost.author}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Post Grid */}
      <section className="bg-gray-50 py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#fdc501] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors">
              Load more stories
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-black py-16 md:py-24" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in the loop
            </h2>
            <p className="text-white/60 mb-8">
              Subscribe to our newsletter for the latest stories, product updates, and exclusive content.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-[#fdc501] text-black font-medium rounded-full hover:bg-[#fdc501]/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
