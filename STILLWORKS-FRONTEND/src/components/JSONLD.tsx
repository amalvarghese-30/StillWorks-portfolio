import { Helmet } from "react-helmet-async";

interface JSONLDProps {
    type: "Organization" | "LocalBusiness" | "Service" | "CreativeWork";
    data: Record<string, any>;
}

export const JSONLD = ({ type, data }: JSONLDProps) => {
    const baseSchema = {
        "@context": "https://schema.org",
        "@type": type,
        ...data,
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(baseSchema)}</script>
        </Helmet>
    );
};

// Pre-configured Organization schema
export const OrganizationSchema = () => (
    <JSONLD
        type="Organization"
        data={{
            name: "Stillworks",
            url: "https://stillworks.com",
            logo: "https://stillworks.com/logo.png",
            sameAs: [
                "https://twitter.com/stillworks",
                "https://linkedin.com/company/stillworks",
                "https://github.com/stillworks",
            ],
            description: "We build automation-powered websites that increase conversions and reduce manual work.",
            address: {
                "@type": "PostalAddress",
                addressLocality: "Your City",
                addressRegion: "Your State",
                addressCountry: "US",
            },
            contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-555-123-4567",
                contactType: "customer service",
                email: "hello@stillworks.com",
            },
        }}
    />
);

// Service schema for homepage
export const ServiceSchema = () => (
    <JSONLD
        type="Service"
        data={{
            name: "Website Automation & Development",
            provider: {
                "@type": "Organization",
                name: "Stillworks",
            },
            description: "Custom web development and marketing automation systems that increase conversions and reduce manual work.",
            areaServed: "Worldwide",
            hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Services",
                itemListElement: [
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Web Development",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Marketing Automation",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Digital Strategy",
                        },
                    },
                ],
            },
        }}
    />
);