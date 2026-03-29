import { motion } from "framer-motion";

const segments = [
    "Early-stage startups",
    "Local businesses",
    "Personal brands",
    "Agencies",
    "Creators",
];

const ClientLogos = () => {
    return (
        <section className="py-20 border-y border-border overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 text-center">

                <p className="text-sm tracking-widest uppercase text-muted-foreground mb-8">
                    Projects delivered for
                </p>

                <div className="relative w-full overflow-hidden mask-gradient">

                    <motion.div
                        className="flex gap-12 whitespace-nowrap text-lg md:text-xl font-display text-foreground/70"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            duration: 18,
                            ease: "linear",
                        }}
                    >
                        {[...segments, ...segments].map((item, index) => (
                            <span
                                key={index}
                                className="hover:text-foreground transition-colors"
                            >
                                {item}
                            </span>
                        ))}
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default ClientLogos;