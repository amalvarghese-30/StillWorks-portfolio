import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
    id: string;
    client_name: string;
    client_role: string;
    company: string;
    content: string;
    image: string;
    rating: number;
    featured: boolean;
    metric: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const url = API_BASE ? `${API_BASE}/api/testimonials` : "/api/testimonials";
                const res = await fetch(url);
                const data = await res.json();
                setTestimonials(data);
            } catch (error) {
                // Fallback demo testimonials
                setTestimonials([
                    {
                        id: "1",
                        client_name: "Sarah Johnson",
                        client_role: "CEO",
                        company: "Apex Marketing",
                        content: "Stillworks transformed our digital presence. The automation system they built saved us 20+ hours per week and increased lead conversion by 47%. Absolutely game-changing.",
                        image: "",
                        rating: 5,
                        featured: true,
                        metric: "+47% conversion increase",
                    },
                    {
                        id: "2",
                        client_name: "Michael Chen",
                        client_role: "Founder",
                        company: "TechFlow",
                        content: "Working with Stillworks was the best decision we made this year. Their web development expertise combined with marketing automation knowledge is rare to find.",
                        image: "",
                        rating: 5,
                        featured: true,
                        metric: "3x faster deployment",
                    },
                    {
                        id: "3",
                        client_name: "Emily Rodriguez",
                        client_role: "Marketing Director",
                        company: "GrowthCo",
                        content: "The team at Stillworks delivered beyond our expectations. Our new website is not only beautiful but also generates 2x more qualified leads. Highly recommended!",
                        image: "",
                        rating: 5,
                        featured: true,
                        metric: "2x more qualified leads",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const next = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    if (loading || testimonials.length === 0) {
        return null;
    }

    const active = testimonials[activeIndex];

    return (
        <section id="testimonials" ref={ref} className="py-24 md:py-32 bg-card">
            <div className="container mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
                        Client Love
                    </p>
                    <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-foreground">
                        What Our Clients Say
                    </h2>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-background border border-border rounded-2xl p-8 md:p-12 text-center"
                        >
                            <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />

                            {/* Metric badge */}
                            {active.metric && (
                                <div className="inline-block mb-6 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {active.metric}
                                </div>
                            )}

                            <p className="text-xl md:text-2xl font-body text-foreground leading-relaxed">
                                "{active.content}"
                            </p>

                            {/* Rating stars */}
                            <div className="flex justify-center gap-1 my-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < active.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                                    />
                                ))}
                            </div>

                            <div className="mt-6">
                                <p className="font-display font-semibold text-foreground text-lg">
                                    {active.client_name}
                                </p>
                                <p className="text-sm text-muted-foreground font-body">
                                    {active.client_role}
                                    {active.company && `, ${active.company}`}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={prev}
                                className="p-3 rounded-full border border-border hover:border-foreground transition-colors duration-300"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-5 h-5 text-foreground" />
                            </button>
                            <div className="flex gap-2 items-center">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === i ? "bg-foreground w-6" : "bg-muted-foreground/30"
                                            }`}
                                        aria-label={`Go to testimonial ${i + 1}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={next}
                                className="p-3 rounded-full border border-border hover:border-foreground transition-colors duration-300"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-5 h-5 text-foreground" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;