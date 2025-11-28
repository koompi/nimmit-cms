import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPage } from '@/modules/content/services/page'
import { TiptapRenderer } from '@/components/content/TiptapRenderer'

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) {
        return {
            title: "Page Not Found",
        };
    }

    const seo = page.seo as { title?: string; description?: string } | null;

    return {
        title: seo?.title || page.title,
        description: seo?.description,
        openGraph: {
            title: seo?.title || page.title,
            description: seo?.description,
        },
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) {
        notFound();
    }

    const content = page.content as { type: 'doc'; content: unknown[] } | null;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-black text-white pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {page.title}
                    </h1>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-[#fdc501] prose-a:no-underline hover:prose-a:underline">
                        <TiptapRenderer content={content} />
                    </div>
                </div>
            </section>
        </div>
    );
}
