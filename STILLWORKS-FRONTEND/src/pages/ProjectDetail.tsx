import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProject, getImageUrl, resolveImageUrl } from "@/lib/api";
import type { Project, Section } from "@/lib/projects";
import { ArrowLeft, Star, Play, Quote, ChevronRight, CheckCircle, Users, TrendingUp, Zap, Code, Layout, Smartphone, Database, Cloud } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { JSONLD } from "@/components/JSONLD";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

// Section component for Hero
const HeroSection = ({ data }: { data: Section["data"] }) => {
  const heroImage = data.image ? resolveImageUrl(data.image) : null;

  const projectSchema = project ? {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    creator: {
      "@type": "Organization",
      name: "Stillworks",
    },
    datePublished: project.year,
    image: coverImage,
    keywords: project.category,
  } : null;


  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {heroImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={data.title || "Hero"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
        {data.title && (
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter text-white mb-4">
            {data.title}
          </h1>
        )}
        {data.subtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-body">
            {data.subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

// Section component for Gallery - update image resolution
const GallerySection = ({ data }: { data: Section["data"] }) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = data.images || [];

  if (!images.length) return null;

  const layout = data.layout || "grid";

  if (layout === "carousel") {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6 md:px-12">
          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={resolveImageUrl(images[activeImage])}
                  alt={`Gallery image ${activeImage + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-[60vh] object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https:///placeholder.svg/1200x800?text=Image+Not+Found";
                  }}
                />
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-background transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${activeImage === i ? "bg-foreground w-4" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Grid layout
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-video rounded-xl overflow-hidden bg-muted"
            >
              <img
                src={resolveImageUrl(img)}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https:///placeholder.svg/800x600?text=Image+Not+Found";
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Section component for Testimonial - update image resolution
const TestimonialSection = ({ data }: { data: Section["data"] }) => {
  if (!data.testimonial) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
          <Quote className="w-10 h-10 text-primary mx-auto mb-6" />
          <p className="text-xl md:text-2xl font-body text-foreground leading-relaxed">
            "{data.testimonial}"
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            {data.clientImage && (
              <img
                src={resolveImageUrl(data.clientImage)}
                alt={data.clientName || "Client"}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              {data.clientName && (
                <p className="font-display font-semibold text-foreground">{data.clientName}</p>
              )}
              {data.clientRole && (
                <p className="text-sm text-muted-foreground font-body">{data.clientRole}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Other section components (Text, Video, Stats, Timeline, Quote, CTA, TwoColumn, TechStack) remain the same
// but they should use resolveImageUrl for any image fields

// Main ProjectDetail component
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProject(id).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 md:px-12">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="aspect-[21/9] bg-muted rounded-lg" />
            <div className="h-10 w-2/3 bg-muted rounded" />
            <div className="h-5 w-1/2 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Navbar />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Project not found</h2>
          <p className="text-muted-foreground font-body mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-foreground text-background rounded-lg font-display font-medium hover:opacity-90 transition-opacity"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const coverImage = getImageUrl(project.cover_image);

  const renderSection = (section: Section) => {
    switch (section.type) {
      case "hero":
        return <HeroSection key={section.id} data={section.data} />;
      case "text":
        return <TextSection key={section.id} data={section.data} />;
      case "gallery":
        return <GallerySection key={section.id} data={section.data} />;
      case "video":
        return <VideoSection key={section.id} data={section.data} />;
      case "stats":
        return <StatsSection key={section.id} data={section.data} />;
      case "timeline":
        return <TimelineSection key={section.id} data={section.data} />;
      case "quote":
        return <QuoteSection key={section.id} data={section.data} />;
      case "cta":
        return <CTASection key={section.id} data={section.data} />;
      case "two-column":
        return <TwoColumnSection key={section.id} data={section.data} />;
      case "tech-stack":
        return <TechStackSection key={section.id} data={section.data} />;
      case "testimonial":
        return <TestimonialSection key={section.id} data={section.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <main className="pt-16">
        {/* Back button */}
        <div className="container mx-auto px-6 md:px-12 py-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 uppercase tracking-[0.15em] font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </motion.button>
        </div>

        {/* Render all sections */}
        {project.sections && project.sections.length > 0 ? (
          <>
            {project.sections.map((section, index) => (
              <>
                {renderSection(section)}

                {/* Insert description AFTER hero */}
                {section.type === "hero" && index === 0 && project.description && (
                  <section className="py-12">
                    <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                      <p className="text-lg text-muted-foreground font-body leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </section>
                )}
              </>
            ))}
          </>
        ) : (
          // Fallback to basic layout if no sections
          <>
            {/* Hero image */}
            {coverImage && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="container mx-auto px-6 md:px-12"
              >
                <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg bg-muted relative">
                  <img
                    src={coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https:///placeholder.svg/1920x1080?text=No+Image";
                    }}
                  />
                  {project.featured && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Star className="w-3 h-3 text-foreground" fill="currentColor" />
                      <span className="text-xs font-body font-medium text-foreground">Featured</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Content */}
            <div className="container mx-auto px-6 md:px-12 py-16 md:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
                <div className="lg:col-span-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-foreground mb-6"
                  >
                    {project.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-muted-foreground font-body font-light leading-relaxed"
                  >
                    {project.description}
                  </motion.p>

                  {project.video_url && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mt-10"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                        <iframe
                          src={project.video_url.replace("watch?v=", "embed/")}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`${project.title} video`}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-6"
                >
                  {[
                    { label: "Client", value: project.client },
                    { label: "Category", value: project.category },
                    { label: "Year", value: project.year },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 font-body">
                        {item.label}
                      </p>
                      <p className="text-foreground font-display font-medium">{item.value}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

// Add missing section component imports at the top (they should be defined before use)
// These are the basic section components that need to be added:

const TextSection = ({ data }: { data: Section["data"] }) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        {data.heading && (
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground mb-6">
            {data.heading}
          </h2>
        )}
        {data.body && (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-wrap">
              {data.body}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const VideoSection = ({ data }: { data: Section["data"] }) => {
  if (!data.url) return null;

  const embedUrl = data.url.includes("youtube.com/watch?v=")
    ? data.url.replace("watch?v=", "embed/")
    : data.url;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={data.caption || "Video"}
          />
        </div>
        {data.caption && (
          <p className="text-sm text-muted-foreground text-center mt-4 font-body">
            {data.caption}
          </p>
        )}
      </div>
    </section>
  );
};

const StatsSection = ({ data }: { data: Section["data"] }) => {
  const stats = data.stats || [];

  if (!stats.length) return null;

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-display font-bold">{stat.value}</p>
              <p className="text-sm uppercase tracking-wide mt-2 opacity-90">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TimelineSection = ({ data }: { data: Section["data"] }) => {
  const events = data.events || [];

  if (!events.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        {data.heading && (
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground mb-12 text-center">
            {data.heading}
          </h2>
        )}
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col md:flex-row gap-4 mb-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
            >
              <div className="md:w-1/2 pl-12 md:pl-0">
                <div className="bg-card border border-border rounded-xl p-6">
                  <span className="text-sm font-display font-bold text-primary mb-2 block">
                    {event.year}
                  </span>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground font-body text-sm">
                    {event.description}
                  </p>
                </div>
              </div>
              <div className="absolute left-0 md:left-1/2 top-6 w-8 h-8 rounded-full bg-primary border-4 border-background -translate-x-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const QuoteSection = ({ data }: { data: Section["data"] }) => {
  if (!data.quote) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
        <Quote className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
        <p className="text-2xl md:text-3xl font-display font-light text-foreground leading-relaxed">
          "{data.quote}"
        </p>
        {(data.author || data.role) && (
          <div className="mt-6">
            {data.author && (
              <p className="font-display font-semibold text-foreground">{data.author}</p>
            )}
            {data.role && (
              <p className="text-sm text-muted-foreground font-body">{data.role}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const CTASection = ({ data }: { data: Section["data"] }) => {
  if (!data.buttonText || !data.buttonLink) return null;

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
          {data.heading || "Ready to start your project?"}
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          {data.body || "Let's create something extraordinary together."}
        </p>
        <a
          href={data.buttonLink}
          className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 rounded-lg font-display font-semibold hover:opacity-90 transition-opacity"
        >
          {data.buttonText}
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

const TwoColumnSection = ({ data }: { data: Section["data"] }) => {
  if (!data.leftContent && !data.rightContent) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {data.leftContent && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: data.leftContent }} />
            </div>
          )}
          {data.rightContent && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: data.rightContent }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const TechStackSection = ({ data }: { data: Section["data"] }) => {
  const technologies = data.technologies || [];
  const techIcons: Record<string, React.ReactNode> = {
    "React": <Layout className="w-6 h-6" />,
    "Next.js": <Layout className="w-6 h-6" />,
    "Node.js": <Database className="w-6 h-6" />,
    "Python": <Code className="w-6 h-6" />,
    "Flask": <Code className="w-6 h-6" />,
    "MongoDB": <Database className="w-6 h-6" />,
    "PostgreSQL": <Database className="w-6 h-6" />,
    "AWS": <Cloud className="w-6 h-6" />,
    "Vercel": <Zap className="w-6 h-6" />,
    "Tailwind": <Smartphone className="w-6 h-6" />,
    "TypeScript": <Code className="w-6 h-6" />,
  };

  if (!technologies.length) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground mb-12">
          {data.heading || "Tech Stack"}
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {technologies.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center">
                {techIcons[tech.name] || <Code className="w-6 h-6" />}
              </div>
              <span className="text-sm font-body text-muted-foreground">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectDetail;