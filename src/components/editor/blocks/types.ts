// Block type definitions for the editor

export interface HeroBlockAttrs {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  alignment: "left" | "center" | "right";
  overlayOpacity: number;
}

export interface ProductGridBlockAttrs {
  title: string;
  productIds: string[];
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showDescription: boolean;
}

export interface TestimonialBlockAttrs {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorImage: string;
  rating?: number;
}

export interface GalleryBlockAttrs {
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  columns: 2 | 3 | 4;
  gap: "small" | "medium" | "large";
  lightbox: boolean;
}

export interface VideoEmbedBlockAttrs {
  videoUrl: string;
  caption?: string;
  autoplay: boolean;
  aspectRatio: "16:9" | "4:3" | "1:1";
}

export interface CallToActionBlockAttrs {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor: string;
  textColor: string;
  alignment: "left" | "center" | "right";
}

export type BlockType =
  | "hero"
  | "productGrid"
  | "testimonial"
  | "gallery"
  | "videoEmbed"
  | "callToAction";

export interface BlockTemplate {
  id: string;
  name: string;
  type: BlockType;
  description: string;
  thumbnail?: string;
  defaultAttrs: Record<string, unknown>;
}

// Default templates
export const blockTemplates: BlockTemplate[] = [
  {
    id: "hero-centered",
    name: "Centered Hero",
    type: "hero",
    description: "Full-width hero with centered text",
    defaultAttrs: {
      alignment: "center",
      overlayOpacity: 50,
    },
  },
  {
    id: "hero-left",
    name: "Left-aligned Hero",
    type: "hero",
    description: "Hero with left-aligned content",
    defaultAttrs: {
      alignment: "left",
      overlayOpacity: 30,
    },
  },
  {
    id: "product-grid-3",
    name: "3-Column Products",
    type: "productGrid",
    description: "Display products in 3 columns",
    defaultAttrs: {
      columns: 3,
      showPrice: true,
      showDescription: true,
    },
  },
  {
    id: "testimonial-basic",
    name: "Basic Testimonial",
    type: "testimonial",
    description: "Simple testimonial with quote",
    defaultAttrs: {
      rating: 5,
    },
  },
  {
    id: "gallery-grid",
    name: "Image Gallery",
    type: "gallery",
    description: "Image grid with lightbox",
    defaultAttrs: {
      columns: 3,
      gap: "medium",
      lightbox: true,
    },
  },
  {
    id: "video-16-9",
    name: "Video Embed",
    type: "videoEmbed",
    description: "YouTube/Vimeo embed",
    defaultAttrs: {
      aspectRatio: "16:9",
      autoplay: false,
    },
  },
  {
    id: "cta-centered",
    name: "Call to Action",
    type: "callToAction",
    description: "Centered CTA block",
    defaultAttrs: {
      alignment: "center",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
    },
  },
];
