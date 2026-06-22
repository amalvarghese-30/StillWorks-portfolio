// STILLWORKS-FRONTEND/src/components/Testimonials.tsx
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Quote, Star, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://stillworks-backend.onrender.com";

interface Testimonial {
    id: string;
    client_name: string;
    client_role: string;
    company: string;
    content: string;
    image?: string;
    rating?: number;
    metric?: string;
}

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const [emblaRef] = useEmblaCarousel(
        {
            loop: true,
            align: "center",
        },
        [Autoplay({ delay: 4000 })]
    );

    const fetchTestimonials = async () => {
        try {
            const url = `${API_URL}/api/testimonials`;
            const res = await fetch(url);
            const data = await res.json();

            setTestimonials(data || []);
        } catch (err) {
            console.error("❌ Error fetching testimonials:", err);
        } finally {
            setLoading(false);
        }
    };

    // Delayed loading - testimonials load after 1 second to prioritize hero content
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTestimonials();
        }, 1000); // Load testimonials after 1 second

        return () => clearTimeout(timer);
    }, []);

    const getImageUrl = (imagePath: string | undefined, clientName: string): string => {
        if (!imagePath || imagePath === "") {
            // Generate a unique avatar based on client name
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=6366f1&color=fff&size=150&bold=true&length=2`;
        }

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        return `${API_URL}/uploads/${imagePath}`;
    };

    const handleImageError = (testimonialId: string) => {
        setImageErrors(prev => ({ ...prev, [testimonialId]: true }));
    };

    if (loading) {
        return (
            <section className="py-32 bg-background text-foreground">
                <div className="container mx-auto px-4 text-center">
                    Loading testimonials...
                </div>
            </section>
        );
    }

    return (
        <section className="py-28 bg-background text-foreground transition-colors duration-500">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-20">
                    <p className="uppercase tracking-[0.3em] text-sm text-muted-foreground mb-4">
                        Client Love
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        What Our Clients Say
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Real stories from businesses we've helped grow
                        through design, automation, and digital systems.
                    </p>
                </div>

                {/* EMPTY STATE */}
                {testimonials.length === 0 ? (
                    <div className="text-center text-muted-foreground py-20">
                        <p>No testimonials found</p>
                        <p className="text-sm mt-2">Add testimonials in the admin dashboard</p>
                    </div>
                ) : (
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {testimonials.map((item) => {
                                const imageUrl = getImageUrl(item.image, item.client_name);
                                const hasError = imageErrors[item.id];

                                return (
                                    <div
                                        key={item.id}
                                        className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 px-4"
                                    >
                                        <div className="rounded-3xl border border-border bg-card p-8 h-full flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow">
                                            <div>
                                                <Quote className="w-10 h-10 text-muted-foreground opacity-40 mb-6" />

                                                <div className="flex gap-1 mb-6">
                                                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>

                                                <p className="text-muted-foreground text-lg leading-relaxed line-clamp-5">
                                                    "{item.content}"
                                                </p>

                                                {item.metric && item.metric !== "" && (
                                                    <div className="inline-flex mt-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                                                        📈 {item.metric}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 border-t border-border pt-6 mt-8">
                                                {!hasError && imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.client_name}
                                                        width="56"
                                                        height="56"
                                                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                                                        onError={() => handleImageError(item.id)}
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-primary" />
                                                    </div>
                                                )}

                                                <div>
                                                    <h4 className="font-semibold text-lg">{item.client_name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.client_role}
                                                        {item.company && `, ${item.company}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;