import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchProjects, fetchCategories, getImageUrl } from "@/lib/api";
import type { Project } from "@/lib/projects";

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  // Load categories on mount
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Load projects when category changes
  useEffect(() => {
    setLoading(true);
    fetchProjects(activeCategory).then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, [activeCategory]);

  return (
    <section id="work" ref={ref} className="py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Selected Work
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-foreground">
            Our Work
          </h2>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm font-medium tracking-wide rounded-full border transition-all duration-300 ${activeCategory === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-lg bg-muted mb-4" />
                  <div className="h-5 w-2/3 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/3 bg-muted rounded" />
                </div>
              ))
            ) : (
              projects.map((project, i) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-muted mb-4">
                    <motion.img
                      src={getImageUrl(project.image, project.cover_image)}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https:///placeholder.svg/800x600?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-display font-semibold text-foreground tracking-tight group-hover:text-muted-foreground transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {project.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.category}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground font-body">
                      {project.year}
                    </span>
                  </div>
                </motion.article>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Portfolio;