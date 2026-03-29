import { motion } from "framer-motion";
import HeroBackground from "./HeroBackground";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden hero-gradient">
      <HeroBackground />
      <div className="container mx-auto px-6 md:px-12 pt-24">
        <div className="max-w-5xl">
          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-8 font-body"
          >
            Stillworks Studio
          </motion.p>

          {/* Main heading - updated for better messaging */}
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter leading-[0.9] text-foreground"
          >
            We build <span className="text-gradient">automation-powered</span>
            <br />
            websites that convert.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground font-body"
          >
            Smart websites and digital systems designed to reduce manual work,
            capture leads automatically, and scale your business faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 flex gap-4"
          >
            <a
              href="#contact"
              className="px-6 py-3 bg-foreground text-background rounded-lg font-display font-semibold hover:opacity-90 transition"
            >
              Start a Project
            </a>

            <a
              href="#work"
              className="px-6 py-3 border border-border rounded-lg font-display font-semibold hover:border-foreground transition"
            >
              View Work
            </a>
          </motion.div>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-foreground/20 my-10 origin-left"
          />

          {/* Subtitle with stronger value prop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-md font-body font-light leading-relaxed">
              Increase conversions and reduce manual work with custom web development and marketing automation systems.
            </p>
            <a
              href="#work"
              className="group flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-foreground font-medium"
            >
              View our work
              <motion.span
                className="inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </a>
          </motion.div>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-12 pt-8 border-t border-border/50 flex flex-wrap gap-8 justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-body">
                Trusted by 30+ companies
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-sm text-muted-foreground font-body">
                ⚡ 20+ hours saved/week
              </span>
              <span className="text-sm text-muted-foreground font-body">
                📈 +47% avg. conversion
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - repositioned for left-aligned layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-10 left-6 md:left-12 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-foreground/30"
        />
      </motion.div>
    </section>
  );
};

export default Hero;