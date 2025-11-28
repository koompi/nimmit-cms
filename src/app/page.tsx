import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  featuredImage: string | null;
  description?: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string | null };
}

interface HomePageData {
  settings: Record<string, string>;
  products: Product[];
  posts: Post[];
}

async function getHomePageData(): Promise<HomePageData> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/homepage`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { settings: {}, products: [], posts: [] };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return { settings: {}, products: [], posts: [] };
  }
}

export default async function Home() {
  const { settings, products, posts } = await getHomePageData();

  const heroTitle = settings.heroTitle || "Ride the city";
  const heroSubtitle =
    settings.heroSubtitle ||
    "Experience the future of urban mobility with Grood e-bikes";

  return (
    <div className="flex flex-col">
      {/* Hero Section - Full Screen with Video/Image Background */}
      <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* Background Image/Video Placeholder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10" />
          {/* Hero image - urban cyclist scene */}
          <Image
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&q=80"
            alt="Urban e-bike rider"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6">
            {heroTitle}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-[#fdc501] rounded-full hover:bg-[#e5b100] transition-all duration-300 transform hover:scale-105"
            >
              Explore E-Bikes
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Book a Test Ride
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Our E-Bikes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Engineered for the modern commuter. Silent, powerful, and built to
              last.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {products.slice(0, 2).map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative bg-gray-50 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center"
                >
                  {/* Product Image */}
                  <div className="absolute inset-0">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg
                          className="w-32 h-32 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="5" cy="18" r="3" />
                          <circle cx="19" cy="18" r="3" />
                          <path d="M12 2l3 7h-6l3-7z" />
                          <path d="M5 18l4-10h6l4 10" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-[#fdc501] text-sm font-medium uppercase tracking-wider">
                        {index === 0 ? "City Series" : "Sport Series"}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-white/70 mb-4">
                        Starting at ${product.price.toLocaleString()}
                      </p>
                      <span className="inline-flex items-center text-white font-medium group-hover:text-[#fdc501] transition-colors">
                        Discover
                        <svg
                          className="ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Placeholder Products */}
              {[
                { name: "Grood City", series: "City Series", price: 2499 },
                { name: "Grood Sport", series: "Sport Series", price: 3299 },
              ].map((product, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <svg
                    className="w-48 h-48 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="5" cy="18" r="3" />
                    <circle cx="19" cy="18" r="3" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M5 18l7-13 7 13M12 5v8"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <span className="text-[#fdc501] text-sm font-medium uppercase tracking-wider">
                      {product.series}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-white/70">
                      Starting at ${product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Dark */}
      <section className="bg-black py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Grood?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Every detail designed for the perfect ride
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors">
                <svg
                  className="w-10 h-10 text-[#fdc501]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Powerful Motor
              </h3>
              <p className="text-white/60">
                250W brushless motor with 50Nm torque. Conquer any hill
                effortlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors">
                <svg
                  className="w-10 h-10 text-[#fdc501]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                150km Range
              </h3>
              <p className="text-white/60">
                Industry-leading battery capacity. Ride all week on a single
                charge.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors">
                <svg
                  className="w-10 h-10 text-[#fdc501]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Anti-Theft
              </h3>
              <p className="text-white/60">
                Built-in GPS tracking and smart lock. Your bike is always safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="relative min-h-[80vh] flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
            alt="Grood lifestyle"
            fill
            className="object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="text-[#fdc501] text-sm font-medium uppercase tracking-wider mb-4 block">
              Designed in Cambodia
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Built for the streets of tomorrow
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Every Grood e-bike is designed to navigate the urban jungle. From
              Phnom Penh to cities worldwide, we&apos;re redefining how people
              move.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center text-white font-medium hover:text-[#fdc501] transition-colors"
            >
              Our Story
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Press/Testimonials */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What people are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The best e-bike I&apos;ve ever ridden. Smooth, silent, and incredibly stylish.",
                author: "Tech Review Cambodia",
                rating: 5,
              },
              {
                quote:
                  "Grood is setting a new standard for urban mobility in Southeast Asia.",
                author: "Urban Mobility Magazine",
                rating: 5,
              },
              {
                quote:
                  "Finally, an e-bike that looks as good as it performs. A game changer.",
                author: "Design Weekly",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#fdc501]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-gray-500 font-medium">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {posts.length > 0 && (
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Stories
              </h2>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center"
              >
                View all
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featuredImage ? (
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-200" />
                    )}
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-2">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#fdc501] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-[#fdc501] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            Ready to ride?
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto mb-8">
            Book a test ride at our showroom or have a Grood delivered to your
            door. Free shipping nationwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
            >
              Book a Test Ride
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
            >
              Shop E-Bikes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
