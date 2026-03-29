export interface Project {
  id: string;
  title: string;
  slug?: string;
  category: string;
  category_id?: string;
  description: string;
  cover_image: string;
  images?: string[];
  sections?: Section[];
  video_url?: string;
  year: string;
  client: string;
  featured: boolean;
  visible?: boolean;
  order?: number;
}

// Section types for dynamic layouts
export interface Section {
  id: string;
  type: SectionType;
  data: SectionData;
}

export type SectionType =
  | "hero"
  | "text"
  | "gallery"
  | "video"
  | "stats"
  | "timeline"
  | "quote"
  | "cta"
  | "two-column"
  | "before-after"
  | "tech-stack"
  | "testimonial";

export interface SectionData {
  // Hero
  image?: string;
  title?: string;
  subtitle?: string;

  // Text
  heading?: string;
  body?: string;

  // Gallery
  images?: string[];
  layout?: "grid" | "carousel" | "masonry";

  // Video
  url?: string;
  caption?: string;

  // Stats
  stats?: { label: string; value: string }[];

  // Timeline
  events?: { year: string; title: string; description: string }[];

  // Quote
  quote?: string;
  author?: string;
  role?: string;

  // CTA
  buttonText?: string;
  buttonLink?: string;

  // Two Column
  leftContent?: string;
  rightContent?: string;

  // Before/After
  beforeImage?: string;
  afterImage?: string;

  // Tech Stack
  technologies?: { name: string; icon?: string }[];

  // Testimonial
  testimonial?: string;
  clientName?: string;
  clientRole?: string;
  clientImage?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

// Category templates for different project types
export interface CategoryTemplate {
  category: string;
  sections: Section[];
}

export const categoryTemplates: CategoryTemplate[] = [
  {
    category: "Branding",
    sections: [
      {
        id: "hero",
        type: "hero",
        data: { image: "", title: "", subtitle: "" }
      },
      {
        id: "concept",
        type: "text",
        data: { heading: "Concept", body: "" }
      },
      {
        id: "typography",
        type: "text",
        data: { heading: "Typography", body: "" }
      },
      {
        id: "color-palette",
        type: "gallery",
        data: { images: [], layout: "grid" }
      },
      {
        id: "mockups",
        type: "gallery",
        data: { images: [], layout: "carousel" }
      },
      {
        id: "results",
        type: "stats",
        data: { stats: [] }
      }
    ]
  },
  {
    category: "Automation Systems",
    sections: [
      {
        id: "hero",
        type: "hero",
        data: { image: "", title: "", subtitle: "" }
      },
      {
        id: "problem",
        type: "text",
        data: { heading: "The Challenge", body: "" }
      },
      {
        id: "architecture",
        type: "text",
        data: { heading: "System Architecture", body: "" }
      },
      {
        id: "diagram",
        type: "gallery",
        data: { images: [], layout: "grid" }
      },
      {
        id: "dashboard",
        type: "gallery",
        data: { images: [], layout: "carousel" }
      },
      {
        id: "results",
        type: "stats",
        data: { stats: [] }
      },
      {
        id: "tech-stack",
        type: "tech-stack",
        data: { technologies: [] }
      }
    ]
  },
  {
    category: "Business Websites",
    sections: [
      {
        id: "hero",
        type: "hero",
        data: { image: "", title: "", subtitle: "" }
      },
      {
        id: "overview",
        type: "text",
        data: { heading: "Overview", body: "" }
      },
      {
        id: "design",
        type: "two-column",
        data: { leftContent: "", rightContent: "" }
      },
      {
        id: "gallery",
        type: "gallery",
        data: { images: [], layout: "carousel" }
      },
      {
        id: "testimonial",
        type: "testimonial",
        data: { testimonial: "", clientName: "", clientRole: "", clientImage: "" }
      }
    ]
  },
  {
    category: "Landing Pages",
    sections: [
      {
        id: "hero",
        type: "hero",
        data: { image: "", title: "", subtitle: "" }
      },
      {
        id: "features",
        type: "text",
        data: { heading: "Key Features", body: "" }
      },
      {
        id: "screenshots",
        type: "gallery",
        data: { images: [], layout: "carousel" }
      },
      {
        id: "results",
        type: "stats",
        data: { stats: [] }
      },
      {
        id: "cta",
        type: "cta",
        data: { buttonText: "View Live", buttonLink: "" }
      }
    ]
  },
  {
    category: "Dashboards & Tools",
    sections: [
      {
        id: "hero",
        type: "hero",
        data: { image: "", title: "", subtitle: "" }
      },
      {
        id: "problem",
        type: "text",
        data: { heading: "The Challenge", body: "" }
      },
      {
        id: "solution",
        type: "two-column",
        data: { leftContent: "", rightContent: "" }
      },
      {
        id: "dashboard",
        type: "gallery",
        data: { images: [], layout: "grid" }
      },
      {
        id: "tech-stack",
        type: "tech-stack",
        data: { technologies: [] }
      }
    ]
  },
  {
    category: "Performance Marketing",
    sections: [
      {
        id: "hero",
        type: "hero",
        data: { image: "", title: "", subtitle: "" }
      },
      {
        id: "strategy",
        type: "text",
        data: { heading: "Strategy", body: "" }
      },
      {
        id: "results",
        type: "stats",
        data: { stats: [] }
      },
      {
        id: "timeline",
        type: "timeline",
        data: { events: [] }
      },
      {
        id: "testimonial",
        type: "testimonial",
        data: { testimonial: "", clientName: "", clientRole: "", clientImage: "" }
      }
    ]
  }
];

// Default categories
export const defaultCategories = [
  "All",
  "Automation Systems",
  "Business Websites",
  "Landing Pages",
  "Dashboards & Tools",
  "Branding",
  "Performance Marketing",
] as const;

// Static fallback projects (used when API is unavailable)
export const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "Noir Brand Identity",
    category: "Branding",
    description: "Complete brand overhaul for a luxury fashion house. From logo design to brand guidelines, we crafted an identity that speaks elegance.",
    cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    year: "2024",
    client: "Noir Fashion",
    featured: true,
    sections: []
  },
  {
    id: "2",
    title: "AutoFlow Pipeline",
    category: "Automation Systems",
    description: "End-to-end marketing automation pipeline with CRM integration, lead scoring, and automated email sequences.",
    cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    year: "2024",
    client: "AutoFlow Inc",
    featured: true,
    sections: []
  },
  {
    id: "3",
    title: "Zenith Analytics Dashboard",
    category: "Dashboards & Tools",
    description: "Real-time analytics dashboard with custom reporting, data visualization, and automated insights for fintech.",
    cover_image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
    year: "2024",
    client: "Zenith Finance",
    featured: true,
    sections: []
  },
  {
    id: "4",
    title: "Pulse Campaign System",
    category: "Performance Marketing",
    description: "Multi-channel performance marketing system with A/B testing, conversion tracking, and ROI optimization.",
    cover_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    year: "2023",
    client: "Pulse Media",
    featured: false,
    sections: []
  },
  {
    id: "5",
    title: "Ecliptic Landing Suite",
    category: "Landing Pages",
    description: "High-converting landing page system with dynamic content personalization and integrated analytics.",
    cover_image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3579?w=800&q=80",
    year: "2023",
    client: "Ecliptic Labs",
    featured: true,
    sections: []
  },
  {
    id: "6",
    title: "Apex Commerce Platform",
    category: "Business Websites",
    description: "Next-generation e-commerce platform with 3D product visualization and AI-powered recommendations.",
    cover_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&q=80",
    year: "2024",
    client: "Apex Retail",
    featured: false,
    sections: []
  },
  {
    id: "7",
    title: "Monochrome Studio",
    category: "Branding",
    description: "Minimalist brand identity for a photography studio focusing on black and white aesthetics.",
    cover_image: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&q=80",
    year: "2023",
    client: "Monochrome Studio",
    featured: false,
    sections: []
  },
  {
    id: "8",
    title: "Flux Workflow Engine",
    category: "Automation Systems",
    description: "Custom workflow automation engine for a SaaS platform serving 50k+ daily users with intelligent task routing.",
    cover_image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    year: "2023",
    client: "Flux Technologies",
    featured: false,
    sections: []
  },
];