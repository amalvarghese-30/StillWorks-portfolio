// STILLWORKS-FRONTEND/src/components/Contact.tsx
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Send, Loader2, CheckCircle, Phone } from "lucide-react";
import { toast } from "./ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setStatus("sent");
      toast({
        title: "Message sent successfully!",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("idle");
      toast({
        title: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="py-24 md:py-32 border-t border-border"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
            >
              Get in Touch
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter text-foreground leading-tight mb-8"
            >
              Let's create something
              <br />
              <span className="text-muted-foreground">extraordinary.</span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-px bg-border origin-left mb-10"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              {/* EMAIL */}
              <a
                href="mailto:info@stillworks.in"
                className="group flex items-center gap-3 text-xl md:text-2xl font-display text-foreground hover:text-muted-foreground transition-colors duration-300"
              >
                info@stillworks.in
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>

              {/* PHONE */}
              <a
                href="tel:+919987231107"
                className="group flex items-center gap-3 text-xl md:text-2xl font-display text-foreground hover:text-muted-foreground transition-colors duration-300"
              >
                +91 99872 31107
                <Phone className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>

              {/* WHATSAPP */}
              <a
                href="https://wa.me/919987231107"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-xl md:text-2xl font-display text-foreground hover:text-muted-foreground transition-colors duration-300"
              >
                Chat on WhatsApp
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>

              {/* EXISTING SOCIAL LINKS */}
              <div className="flex gap-8 pt-4">
                {["Twitter", "LinkedIn", "Dribbble"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-sm uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-300 font-body"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right - Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
            ].map(({ key, label, type }) => (
              <div key={key} className="group">
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-body group-focus-within:text-foreground transition-colors">
                  {label}
                </label>

                <input
                  type={type}
                  required
                  value={formData[key as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className="w-full bg-transparent border-b-2 border-border pb-3 text-foreground font-body focus:outline-none focus:border-foreground transition-colors duration-300"
                />
              </div>
            ))}

            <div className="group">
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-body group-focus-within:text-foreground transition-colors">
                Message
              </label>

              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full bg-transparent border-b-2 border-border pb-3 text-foreground font-body focus:outline-none focus:border-foreground transition-colors duration-300 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status !== "idle"}
              className="flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-lg font-display font-semibold tracking-wide hover:opacity-90 transition-all duration-300 disabled:opacity-60"
            >
              {status === "idle" && (
                <>
                  Send Message
                  <Send className="w-4 h-4" />
                </>
              )}

              {status === "sending" && (
                <>
                  Sending...
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
              )}

              {status === "sent" && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  Message Sent!
                  <CheckCircle className="w-4 h-4" />
                </motion.span>
              )}
            </button>
          </motion.form>

        </div>
      </div>
    </section>
  );
};

export default Contact;