import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Marquee = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const items = [
    "Branding",
    "Web Development",
    "UI/UX Design",
    "Digital Strategy",
    "Automation",
    "Creative Direction",
    "Marketing",
    "Motion Design",
  ];

  const doubled = [...items, ...items];

  return (
    <section ref={ref} className="py-16 border-y border-border overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="flex animate-marquee"
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-8 text-2xl md:text-4xl font-display font-light tracking-tight text-muted-foreground whitespace-nowrap"
          >
            {item}
            <span className="mx-8 text-border">•</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
};

export default Marquee;
