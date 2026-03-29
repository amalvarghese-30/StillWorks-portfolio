import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const services = [
  {
    number: "01",
    title: "Branding & Identity",
    description: "Logo design, brand guidelines, visual identity systems that tell your story.",
  },
  {
    number: "02",
    title: "Web Development",
    description: "High-performance websites and web applications built with modern technologies.",
  },
  {
    number: "03",
    title: "UI/UX Design",
    description: "User-centered design that balances aesthetics with seamless functionality.",
  },
  {
    number: "04",
    title: "Digital Marketing",
    description: "Strategic campaigns that amplify your brand and drive measurable results.",
  },
  {
    number: "05",
    title: "Automation",
    description: "Workflow automation and digital transformation to scale your business.",
  },
];

const Services = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={ref} className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            What We Do
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-foreground">
            Services
          </h2>
        </motion.div>

        <div className="space-y-0">
          {services.map((service, i) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="group py-8 border-b border-border flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 cursor-default"
            >
              <span className="text-sm text-muted-foreground font-body w-12 flex-shrink-0">
                {service.number}
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight group-hover:text-muted-foreground transition-colors duration-300 flex-1">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
