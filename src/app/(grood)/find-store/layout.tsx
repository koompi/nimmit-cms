import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Find a Store",
  description: "Find a Grood store near you. Visit our brand stores or authorized service points for test rides, purchases, and expert maintenance.",
  keywords: ["grood store", "e-bike store", "bike shop near me", "grood dealer", "test ride"],
});

export default function FindStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
