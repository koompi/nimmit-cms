import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Our Story",
  description: "Born in Phnom Penh, Grood is on a mission to make urban mobility sustainable, stylish, and accessible for everyone.",
  keywords: ["grood story", "about grood", "grood history", "cambodia e-bikes", "sustainable mobility"],
});

const timeline = [
  {
    year: "2020",
    title: "The Beginning",
    description: "Grood was founded in Phnom Penh with a simple mission: make urban mobility sustainable, stylish, and accessible.",
  },
  {
    year: "2021",
    title: "First Prototype",
    description: "After months of research and development, we unveiled our first prototype at Cambodia Tech Summit.",
  },
  {
    year: "2022",
    title: "S1 Launch",
    description: "The Grood S1 launched to critical acclaim, selling out within the first month.",
  },
  {
    year: "2023",
    title: "Regional Expansion",
    description: "Expanded to Thailand, Vietnam, and Singapore. Opened our first flagship store in Bangkok.",
  },
  {
    year: "2024",
    title: "Next Generation",
    description: "Launched the Grood X1 and S1 Open, completing our lineup for every type of urban rider.",
  },
  {
    year: "2025",
    title: "The Future",
    description: "Continuing to innovate with new models, expanded service network, and commitment to sustainability.",
  },
];

const values = [
  {
    title: "Rider First",
    description: "Every decision we make starts with the rider. We design for real city life, real commutes, real adventures.",
  },
  {
    title: "Built to Last",
    description: "Quality over quantity. Our bikes are engineered to ride for years, not months. We stand behind every Grood.",
  },
  {
    title: "Sustainable Future",
    description: "Electric mobility is just the start. We're committed to reducing our environmental impact at every step.",
  },
];

export default function OurStoryPage() {
  return (
    <main>
      {/* Hero */}
      <section data-header-theme="dark" className="relative min-h-[80vh] flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
            alt="Our Story"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
            The Grood<br />Story
          </h1>
        </div>
      </section>

      {/* Mission Statement */}
      <section data-header-theme="light" className="bg-white py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black leading-relaxed">
              Since <span className="text-[#fdc501] font-bold">2020</span>, we've been on a relentless quest to 
              make the perfect city bike.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black leading-relaxed mt-6">
              We've pioneered an electric revolution, developing next-level rides that 
              redefine the way we move from A to B in the city.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black leading-relaxed mt-6">
              We were the first to introduce <span className="text-[#fdc501] font-bold">smart anti-theft</span> technology 
              and create practically unstealable bikes with cutting-edge security.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black leading-relaxed mt-6">
              The new Grood is changing what's possible in city movement. And we're 
              always placing riders at the core of every decision we make.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section data-header-theme="light" className="bg-gray-50 py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
              Our Journey
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              Building the future of mobility
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-300 transform md:-translate-x-1/2" />

              {/* Timeline Items */}
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-1/2 pl-8 md:pl-0 ${
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}>
                    <span className="text-4xl font-bold text-[#fdc501]">{item.year}</span>
                    <h3 className="text-xl font-bold text-black mt-2 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-[#fdc501] rounded-full transform md:-translate-x-1/2 border-4 border-white" />

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section data-header-theme="dark" className="bg-black py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
              Our Values
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              What we stand for
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-8 border border-white/10 rounded-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section data-header-theme="light" className="bg-white py-24 md:py-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-[#fdc501] uppercase tracking-wider mb-4">
                Our Team
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Riders building for riders
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our team is made up of engineers, designers, and urban mobility enthusiasts 
                who ride Grood bikes every day. We build what we ride, and we ride what we build.
              </p>
              <p className="text-xl text-gray-600 mb-8">
                Headquartered in Phnom Penh with team members across Southeast Asia, 
                we're a diverse group united by our passion for better cities.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center text-black font-medium hover:text-[#fdc501] transition-colors"
              >
                Join our team
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="relative aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Grood Team"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-header-theme="light" className="bg-[#fdc501] py-24">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Ready to join the movement?
          </h2>
          <p className="text-xl text-black/70 max-w-2xl mx-auto mb-8">
            Experience the future of urban mobility. Book a test ride today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/our-rides"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all"
            >
              Explore E-Bikes
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/test-rides"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black border-2 border-black rounded-full hover:bg-black hover:text-white transition-all"
            >
              Book Test Ride
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
