import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Accessories",
  description: "Premium e-bike accessories designed to enhance your Grood experience. From safety gear to tech add-ons, find everything you need for the perfect ride.",
  keywords: ["e-bike accessories", "bike gear", "grood accessories", "bike safety", "bike tech"],
});

const categories = [
  { name: "All", slug: "all" },
  { name: "Safety & Security", slug: "SAFETY" },
  { name: "Bags & Storage", slug: "BAGS" },
  { name: "Comfort", slug: "COMFORT" },
  { name: "Tech", slug: "TECH" },
  { name: "Maintenance", slug: "MAINTENANCE" },
];

const featuredCollection = {
  title: "City Commuter Bundle",
  description: "Everything you need for the perfect urban ride. Save $50 when you buy the bundle.",
  price: 249,
  originalPrice: 299,
  image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80",
  items: ["Front Carrier", "LED Light Set", "Phone Mount Pro", "Rain Cover"],
};

async function getAccessories() {
  const accessories = await prisma.accessory.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ createdAt: "desc" }],
  });
  return accessories;
}

export default async function AccessoriesPage() {
  const accessories = await getAccessories();
  return (
    <main>
      {/* Hero */}
      <section className="bg-black pt-28 pb-16 md:pt-32 md:pb-24" data-header-theme="dark">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Accessories
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Gear up for the ride. Premium accessories designed to enhance your Grood experience.
          </p>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="bg-gray-50 py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
              <Image
                src={featuredCollection.image}
                alt={featuredCollection.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 lg:p-12">
              <span className="inline-block bg-[#fdc501] text-black text-sm font-bold px-3 py-1 rounded-full mb-4">
                Bundle & Save
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                {featuredCollection.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {featuredCollection.description}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {featuredCollection.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <span className="w-1.5 h-1.5 bg-[#fdc501] rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-black">${featuredCollection.price}</span>
                <span className="text-xl text-gray-400 line-through">${featuredCollection.originalPrice}</span>
                <span className="text-[#fdc501] font-medium">Save $50</span>
              </div>
              <button className="inline-flex items-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
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

      {/* Product Grid */}
      <section className="bg-white py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {accessories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">No accessories available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {accessories.map((product) => (
                <Link
                  key={product.id}
                  href={`/accessories/${product.slug}`}
                  className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={product.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span
                        className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${
                          product.badge === "Sale"
                            ? "bg-red-500 text-white"
                            : product.badge === "New"
                            ? "bg-[#fdc501] text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-black mb-2 group-hover:text-[#fdc501] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#fdc501] text-[#fdc501]" />
                        <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
                      </div>
                      <span className="text-sm text-gray-400">({product.reviewCount || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black">${product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="bg-[#fdc501] py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Get 10% off your first accessory order
          </h2>
          <p className="text-black/70 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new product releases, and riding tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 sm:px-6 py-3 sm:py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black min-w-0"
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors min-h-[48px]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="bg-white py-16" data-header-theme="light">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Free Shipping</h3>
              <p className="text-gray-600">On all orders over $50</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day hassle-free returns</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">2-year warranty on all products</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
