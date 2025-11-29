import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Smartphone, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { generateSEO, generateOrganizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = generateSEO({
  title: "Grood",
  description: "Premium electric bikes designed for modern urban mobility. Discover the future of city commuting with Grood e-bikes featuring cutting-edge technology and sleek design.",
  keywords: ["electric bikes", "e-bikes", "urban mobility", "grood", "commuter bikes", "sustainable transport"],
  type: "website",
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

const features = [
  {
    icon: Zap,
    title: "Turbo Boost",
    description: "Hit top speed instantly with the press of a button.",
  },
  {
    icon: Shield,
    title: "Anti-Theft Tech",
    description: "GPS tracking, smart lock, and instant alerts keep your bike safe.",
  },
  {
    icon: Smartphone,
    title: "Grood App",
    description: "Track rides, customize settings, and unlock with your phone.",
  },
];

async function getEBikes() {
  const ebikes = await prisma.eBike.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 3, // Show top 3 on homepage
  });
  return ebikes;
}

async function getTestimonials() {
  const testimonials = await prisma.groodTestimonial.findMany({
    where: { type: "PRESS" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return testimonials;
}

export default async function HomePage() {
  const bikeModels = await getEBikes();
  const pressQuotes = await getTestimonials();
  return (
    <main className="flex flex-col">
      <JsonLd data={generateOrganizationJsonLd()} />
      {/* Hero Section - Full Screen */}
      <section data-header-theme="dark" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&q=80"
            alt="Grood e-bike hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 pt-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight mb-4 sm:mb-6 leading-tight">
            Ride the<br />
            <span className="text-[#fdc501]">Future</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto mb-10">
            Premium electric bikes designed for the modern city. 
            Silent power, smart features, iconic design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/our-rides"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-all"
            >
              Explore E-Bikes
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/test-rides"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border border-white/40 rounded-full hover:bg-white/10 transition-all"
            >
              Book a Test Ride
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Bike Showcase - Individual Cards */}
      <section data-header-theme="light" className="bg-white py-0">
        {bikeModels.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-gray-500">No bikes available at the moment.</p>
              <Link href="/our-rides" className="text-[#fdc501] hover:underline mt-4 inline-block">
                Check back soon →
              </Link>
            </div>
          </div>
        ) : (
          bikeModels.map((bike, index) => {
            const colors = (bike.colors as unknown as EBikeColor[]) || [];
            const firstColor = colors[0]?.name || "";
            
            return (
              <div
                key={bike.slug}
                className={`relative min-h-screen flex items-center ${
                  index % 2 === 0 ? "" : "bg-gray-50"
                }`}
              >
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}>
                    {/* Content */}
                    <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                      {bike.tagline && (
                        <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider">
                          {bike.tagline}
                        </p>
                      )}
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black">
                        {bike.name}
                      </h2>
                      {bike.shortDescription && (
                        <p className="text-xl text-gray-600 max-w-md">
                          {bike.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-6">
                        <span className="text-3xl font-bold text-black">${bike.price.toLocaleString()}</span>
                        {firstColor && <span className="text-gray-500">{firstColor}</span>}
                      </div>
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
                          Test Ride
                        </Link>
                      </div>
                    </div>

                    {/* Image */}
                    <div className={`relative aspect-[4/3] ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                      <Image
                        src={bike.heroImage || "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80"}
                        alt={bike.name}
                        fill
                        className="object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Features Section */}
      <section data-header-theme="dark" className="bg-black py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
              Smart Features
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Built for city life
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Every Grood is packed with technology that makes riding effortless, safe, and connected.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-2xl border border-white/10 hover:border-[#fdc501]/50 transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#fdc501]/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-[#fdc501]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/app"
              className="inline-flex items-center text-[#fdc501] font-medium hover:underline"
            >
              Learn more about the Grood App
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section data-header-theme="light" className="bg-white py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
                Grood App
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Your all-in-one riding companion
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Unlock, track, and customize your ride. The Grood app puts complete control in your hands.
              </p>

              <div className="space-y-6 mb-8">
                {[
                  { title: "Touch Unlock", desc: "Start your ride with just your phone nearby" },
                  { title: "Track Rides", desc: "See your speed, distance, and battery in real-time" },
                  { title: "Customize", desc: "Adjust motor power, alarm settings, and more" },
                  { title: "Share", desc: "Let friends ride with their own app profile" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#fdc501]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-[#fdc501] rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-medium text-black">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </a>
                <a
                  href="#"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  Play Store
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square relative">
                <Image
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80"
                  alt="Grood App"
                  fill
                  className="object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Section */}
      <section data-header-theme="light" className="bg-gray-50 py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Press
            </p>
          </div>

          {pressQuotes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {pressQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="text-center p-4 sm:p-8"
                >
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4">
                    "{quote.quote}"
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base">{quote.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No press quotes available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Find Us Section */}
      <section data-header-theme="light" className="bg-white py-16 sm:py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Link
              href="/test-rides"
              className="group p-6 sm:p-8 border border-gray-200 rounded-2xl hover:border-[#fdc501] transition-colors min-h-[180px]"
            >
              <MapPin className="w-8 h-8 text-[#fdc501] mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Test Rides</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Head to a partner store for your free test ride.
              </p>
              <span className="text-[#fdc501] font-medium group-hover:underline">
                Find locations →
              </span>
            </Link>

            <Link
              href="/find-a-store"
              className="group p-6 sm:p-8 border border-gray-200 rounded-2xl hover:border-[#fdc501] transition-colors min-h-[180px]"
            >
              <MapPin className="w-8 h-8 text-[#fdc501] mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Find a Store</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Check the map for your nearest Grood service location.
              </p>
              <span className="text-[#fdc501] font-medium group-hover:underline">
                View map →
              </span>
            </Link>

            <Link
              href="/support"
              className="group p-6 sm:p-8 border border-gray-200 rounded-2xl hover:border-[#fdc501] transition-colors min-h-[180px]"
            >
              <Shield className="w-8 h-8 text-[#fdc501] mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Support</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Read our FAQs on bikes, repairs, and more.
              </p>
              <span className="text-[#fdc501] font-medium group-hover:underline">
                Get help →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
