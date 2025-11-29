import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Zap, Shield, Smartphone, Battery, Gauge, Scale, Settings, Timer, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

interface EBikeSpecs {
  range?: string;
  rangeEco?: string;
  speed?: string;
  weight?: string;
  battery?: string;
  chargeTime?: string;
  motor?: string;
  torque?: string;
  riderHeight?: string;
}

interface EBikeColor {
  name: string;
  hex: string;
  image?: string;
}

interface EBikeFeature {
  icon: string;
  title: string;
  description: string;
}

async function getEBike(slug: string) {
  const ebike = await prisma.eBike.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  return ebike;
}

async function getTestimonials() {
  const testimonials = await prisma.groodTestimonial.findMany({
    where: { featured: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
  return testimonials;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bike = await getEBike(slug);
  
  if (!bike) {
    return { title: "E-Bike Not Found | Grood" };
  }

  return {
    title: `${bike.name} | Grood E-Bikes`,
    description: bike.tagline || `Discover the ${bike.name} - Premium electric bike by Grood`,
    openGraph: {
      title: `${bike.name} | Grood E-Bikes`,
      description: bike.tagline || `Discover the ${bike.name}`,
      images: bike.heroImage ? [{ url: bike.heroImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${bike.name} | Grood`,
      description: bike.tagline || `Discover the ${bike.name}`,
      images: bike.heroImage ? [bike.heroImage] : [],
    },
  };
}

export default async function BikePage({ params }: PageProps) {
  const { slug } = await params;
  const bike = await getEBike(slug);
  const testimonials = await getTestimonials();

  if (!bike) {
    notFound();
  }

  const specs = (bike.specs as unknown as EBikeSpecs) || {};
  const colors = (bike.colors as unknown as EBikeColor[]) || [];
  const features = (bike.features as unknown as EBikeFeature[]) || [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grood.com";
  const productJsonLd = generateProductJsonLd({
    name: bike.name,
    description: bike.tagline || `${bike.name} electric bike by Grood`,
    image: bike.heroImage || "",
    price: bike.price,
    currency: "USD",
    sku: bike.slug,
    brand: "Grood",
    availability: "InStock",
    url: `${siteUrl}/our-rides/${bike.slug}`,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteUrl },
    { name: "Our Rides", url: `${siteUrl}/our-rides` },
    { name: bike.name, url: `${siteUrl}/our-rides/${bike.slug}` },
  ]);

  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    zap: Zap,
    shield: Shield,
    smartphone: Smartphone,
    battery: Battery,
    gauge: Gauge,
    scale: Scale,
    settings: Settings,
    timer: Timer,
    user: User,
  };

  return (
    <main>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center" data-header-theme="dark">
        <div className="absolute inset-0">
          <Image
            src={bike.heroImage || "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&q=80"}
            alt={bike.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-xl">
            {bike.tagline && (
              <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
                {bike.tagline}
              </p>
            )}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              {bike.name}
            </h1>
            {bike.shortDescription && (
              <p className="text-xl text-white/80 mb-8">
                {bike.shortDescription}
              </p>
            )}

            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-white">${bike.price.toLocaleString()}</span>
              {bike.originalPrice && bike.originalPrice > bike.price && (
                <span className="text-xl text-white/50 line-through">
                  ${bike.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Color Options */}
            {colors.length > 0 && (
              <div className="mb-8">
                <p className="text-sm text-white/60 mb-3">Available colors</p>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 hover:border-white transition-colors"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-all">
                Add to Cart
              </button>
              <Link
                href="/test-rides"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border border-white/40 rounded-full hover:bg-white/10 transition-all"
              >
                Book Test Ride
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {features.length > 0 && (
        <section className="bg-black py-24 md:py-32">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Packed with city-smart features
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Every detail refined for the ultimate urban riding experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = IconMap[feature.icon?.toLowerCase()] || Zap;
                return (
                  <div
                    key={feature.title}
                    className="text-center p-8 rounded-2xl border border-white/10"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#fdc501]/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-[#fdc501]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/60">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Specs Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Technical specifications
            </h2>
            <p className="text-xl text-gray-600">
              For the {bike.name}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {specs.range && (
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <Battery className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Battery Range</p>
                  <p className="text-lg font-bold text-black">{specs.range} (full power)</p>
                  {specs.rangeEco && <p className="text-sm text-gray-600">{specs.rangeEco} (eco mode)</p>}
                </div>
              </div>
            )}

            {specs.speed && (
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <Gauge className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Top Speed</p>
                  <p className="text-lg font-bold text-black">{specs.speed}</p>
                  <p className="text-sm text-gray-600">Motor assisted</p>
                </div>
              </div>
            )}

            {specs.weight && (
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <Scale className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Weight</p>
                  <p className="text-lg font-bold text-black">{specs.weight}</p>
                </div>
              </div>
            )}

            {specs.battery && (
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <Zap className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Battery</p>
                  <p className="text-lg font-bold text-black">{specs.battery}</p>
                  {specs.chargeTime && <p className="text-sm text-gray-600">{specs.chargeTime} to full</p>}
                </div>
              </div>
            )}

            {specs.motor && (
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <Settings className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Motor</p>
                  <p className="text-lg font-bold text-black">{specs.motor}</p>
                  {specs.torque && <p className="text-sm text-gray-600">{specs.torque} torque</p>}
                </div>
              </div>
            )}

            {specs.riderHeight && (
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <User className="w-6 h-6 text-[#fdc501] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rider Height</p>
                  <p className="text-lg font-bold text-black">{specs.riderHeight}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {testimonials.length > 0 && (
        <section className="bg-gray-50 py-24">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                What riders say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((review) => (
                <div key={review.id} className="text-center p-8 bg-white rounded-2xl">
                  {review.rating && (
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
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
                  )}
                  <p className="text-2xl font-bold text-black mb-4">
                    "{review.quote}"
                  </p>
                  <p className="text-gray-500">{review.source}{review.author ? ` - ${review.author}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-black py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to ride?
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Book a test ride and experience the {bike.name} for yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-[#fdc501] rounded-full hover:bg-[#e5b100] transition-all">
              Add to Cart - ${bike.price.toLocaleString()}
            </button>
            <Link
              href="/test-rides"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border border-white/40 rounded-full hover:bg-white/10 transition-all"
            >
              Book Test Ride
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Generate static params from database
export async function generateStaticParams() {
  const ebikes = await prisma.eBike.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return ebikes.map((bike) => ({ slug: bike.slug }));
}
