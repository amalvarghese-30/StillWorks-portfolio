import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { number: "50+", label: "Projects Delivered" },
  { number: "30+", label: "Happy Clients" },
  { number: "5+", label: "Years of Experience" },
  { number: "12", label: "Team Members" },
];

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              About Us
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground leading-tight"
            >
              We build digital
              <br />
              experiences that
              <br />
              <span className="text-muted-foreground">matter.</span>
            </motion.h2>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground font-body font-light leading-relaxed mb-10"
            >
              Stillworks is a digital automation and web experience agency. We
              blend creative vision with technical excellence to deliver projects
              that transform businesses and captivate audiences. Every pixel,
              every interaction, every line of code is crafted with intention.
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-border origin-left mb-10"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <p className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                    {stat.number}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-body">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
