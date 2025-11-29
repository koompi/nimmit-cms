import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Our Rides",
  description: "Explore our collection of premium electric bikes. From city commuters to adventure seekers, find the perfect Grood e-bike for your lifestyle.",
  keywords: ["grood e-bikes", "electric bikes", "city bikes", "commuter bikes", "premium e-bikes"],
});

interface EBikeSpecs {
  range?: string;
  speed?: string;
  weight?: string;
  battery?: string;
  motor?: string;
}

interface EBikeColor {
  name: string;
  hex: string;
  image?: string;
}

async function getEBikes() {
  const ebikes = await prisma.eBike.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return ebikes;
}

export default async function OurRidesPage() {
  const bikeModels = await getEBikes();
  return (
    <main>
      {/* Hero */}
      <section data-header-theme="dark" className="bg-black pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
            Our Rides
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6">
            Find your perfect ride
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Every Grood is engineered for the city. Choose the frame that fits your style.
          </p>
        </div>
      </section>

      {/* Bike Grid */}
      <section data-header-theme="light" className="bg-white py-16 md:py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {bikeModels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">No bikes available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-16">
              {bikeModels.map((bike, index) => {
                const specs = (bike.specs as unknown as EBikeSpecs) || {};
                const colors = (bike.colors as unknown as EBikeColor[]) || [];
                
                return (
                  <div
                    key={bike.slug}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Image */}
                    <Link 
                      href={`/our-rides/${bike.slug}`}
                      className={`relative aspect-[4/3] group overflow-hidden rounded-2xl bg-gray-100 ${
                        index % 2 === 1 ? "lg:order-2" : ""
                      }`}
                    >
                      <Image
                        src={bike.heroImage || "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80"}
                        alt={bike.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {bike.badge && (
                        <span className="absolute top-4 left-4 bg-[#fdc501] text-black text-sm font-bold px-3 py-1 rounded-full">
                          {bike.badge}
                        </span>
                      )}
                    </Link>

                    {/* Content */}
                    <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                      {bike.tagline && (
                        <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider">
                          {bike.tagline}
                        </p>
                      )}
                      <h2 className="text-4xl md:text-5xl font-bold text-black">
                        {bike.name}
                      </h2>
                      {bike.shortDescription && (
                        <p className="text-lg text-gray-600 max-w-md">
                          {bike.shortDescription}
                        </p>
                      )}

                      {/* Specs */}
                      {(specs.range || specs.speed || specs.weight) && (
                        <div className="grid grid-cols-3 gap-4 sm:gap-8 py-4 border-y border-gray-200">
                          {specs.range && (
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-black">{specs.range}</p>
                              <p className="text-xs sm:text-sm text-gray-500">Range</p>
                            </div>
                          )}
                          {specs.speed && (
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-black">{specs.speed}</p>
                              <p className="text-xs sm:text-sm text-gray-500">Top Speed</p>
                            </div>
                          )}
                          {specs.weight && (
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-black">{specs.weight}</p>
                              <p className="text-xs sm:text-sm text-gray-500">Weight</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-black">
                          ${bike.price.toLocaleString()}
                        </span>
                        {bike.originalPrice && bike.originalPrice > bike.price && (
                          <span className="text-lg text-gray-400 line-through">
                            ${bike.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Colors */}
                      {colors.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Available in:</span>
                          <span className="text-sm text-black">
                            {colors.map(c => c.name).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                          href={`/our-rides/${bike.slug}`}
                          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all"
                        >
                          Explore
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link
                          href="/test-rides"
                          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black border border-gray-300 rounded-full hover:bg-gray-50 transition-all"
                        >
                          Book Test Ride
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Compare Section */}
      <section data-header-theme="light" className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Not sure which to choose?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Compare all models side by side to find the perfect match for your riding style.
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all"
          >
            Compare Models
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
