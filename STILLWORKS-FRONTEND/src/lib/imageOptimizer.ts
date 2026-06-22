// Image optimization utility for better performance

export interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpeg" | "png";
    loading?: "lazy" | "eager";
}

/**
 * Get optimized image URL with parameters
 */
export function getOptimizedImageUrl(
    url: string,
    options: ImageOptions = {}
): string {
    if (!url) return "/placeholder.svg";

    // If using an image CDN or API that supports query parameters
    const searchParams = new URLSearchParams();

    if (options.width) searchParams.set("w", options.width.toString());
    if (options.height) searchParams.set("h", options.height.toString());
    if (options.quality) searchParams.set("q", options.quality.toString());
    if (options.format) searchParams.set("fm", options.format);

    const queryString = searchParams.toString();

    // Return optimized URL if your backend supports it
    // Otherwise return original URL
    return queryString ? `${url}?${queryString}` : url;
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
    });
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(imageUrls: string[]): void {
    imageUrls.forEach((url) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = url;
        document.head.appendChild(link);
    });
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading(): void {
    if ("IntersectionObserver" in window) {
        const lazyImages = document.querySelectorAll("img[data-src]");

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.removeAttribute("data-src");
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
    }
}