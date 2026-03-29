import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    publishedTime?: string;
    author?: string;
    keywords?: string;
}

const defaultTitle = "Stillworks — Automation Websites & Digital Systems Agency";
const defaultDescription = "Stillworks builds automation-powered websites that increase conversions and reduce manual work. Web development, marketing automation, and custom digital systems.";
const defaultImage = "https://stillworks.com/og-image.png";
const defaultUrl = "https://stillworks.com";

export const SEO = ({
    title,
    description,
    image,
    url,
    type = "website",
    publishedTime,
    author = "Stillworks",
    keywords,
}: SEOProps) => {
    const metaTitle = title ? `${title} | Stillworks` : defaultTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || defaultUrl;

    return (
        <Helmet>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />

            {/* Open Graph */}
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:site_name" content="Stillworks" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* Canonical */}
            <link rel="canonical" href={metaUrl} />

            {/* Article specific */}
            {type === "article" && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
        </Helmet>
    );
};