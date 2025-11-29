import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Contact Us",
  description: "Get in touch with Grood. Our team is here to help with questions about our e-bikes, orders, service, and more.",
  keywords: ["contact grood", "customer support", "e-bike help", "grood support"],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
