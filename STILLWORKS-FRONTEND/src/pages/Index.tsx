import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import ClientLogos from "@/components/ClientLogos";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import { SEO } from "@/components/SEO";
import { OrganizationSchema, ServiceSchema } from "@/components/JSONLD";

const Index = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <SEO
          title="Home"
          description="Stillworks builds automation-powered websites that increase conversions and reduce manual work. Web development, marketing automation, and custom digital systems."
        />
        <OrganizationSchema />
        <ServiceSchema />
        <ScrollProgress />
        <Navbar />
        <Hero />
        <Marquee />
        <Portfolio />
        <About />
        <Services />
        <ClientLogos />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Index;