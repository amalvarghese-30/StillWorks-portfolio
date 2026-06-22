import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { monitorPerformance, runWhenIdle } from "@/lib/performance";

// Performance monitoring (start early)
const cleanupPerformance = monitorPerformance();

// Check if running in production
const isProduction = import.meta.env.PROD;

// Ensure proper cleanup for bfcache (back/forward cache)
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        // Dispatch resize to re-calculate any layout-dependent components
        window.dispatchEvent(new Event("resize"));

        // Re-attach any event listeners that might have been cleaned up
        if (typeof window !== "undefined") {
            // Force a re-render of scroll-dependent elements
            window.scrollTo(window.scrollX, window.scrollY);
        }
    }
});

// Prevent issues with bfcache by cleaning up on page hide
window.addEventListener("pagehide", () => {
    // Close any WebSocket connections if they exist (HMR in development only)
    if (!isProduction && (window as any).__vite_hmr_ws) {
        (window as any).__vite_hmr_ws.close();
    }

    // Clean up any pending requests or timers
    // Note: We don't clean up performance observer here as it's already handled
});

// Register Service Worker for PWA/offline capabilities
if ('serviceWorker' in navigator && isProduction) {
    window.addEventListener('load', () => {
        // Defer service worker registration to avoid competing with critical resources
        runWhenIdle(() => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    window.dispatchEvent(new CustomEvent('sw-update-available'));
                                }
                            });
                        }
                    });
                })
                .catch(() => {
                    // ServiceWorker registration failed silently in production
                });
        });
    });
}

// Optional: Report Web Vitals to analytics
if (isProduction && typeof window !== 'undefined') {
    // Send performance metrics after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            // This is where you'd send to Google Analytics, etc.
            if ('performance' in window && 'getEntriesByType' in performance) {
                const navigationEntries = performance.getEntriesByType('navigation');
                if (navigationEntries.length > 0) {
                    const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
                    // Page load timing logged for analytics
                }
            }
        }, 1000);
    });
}

// Report unhandled errors to analytics (production only)
if (isProduction) {
    window.addEventListener('error', (event) => {
        // Send to analytics endpoint
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/error', JSON.stringify({
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                col: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now(),
                url: window.location.href
            }));
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        // Send to analytics endpoint
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/error', JSON.stringify({
                type: 'unhandledrejection',
                reason: String(event.reason),
                timestamp: Date.now(),
                url: window.location.href
            }));
        }
    });
}

// Render the app
const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found. Make sure there's a <div id='root'> in your HTML.");
}

// Create and render root
const root = createRoot(rootElement);
root.render(<App />);

// Optional: Export cleanup for testing
if (import.meta.env.DEV) {
    (window as any).__cleanupPerformance = cleanupPerformance;
}

