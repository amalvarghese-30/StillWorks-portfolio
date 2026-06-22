// Performance monitoring utility with web worker support

export interface PerformanceMetrics {
    FCP: number;  // First Contentful Paint
    LCP: number;  // Largest Contentful Paint
    FID: number;  // First Input Delay
    CLS: number;  // Cumulative Layout Shift
    TTFB: number; // Time to First Byte
    TBT?: number; // Total Blocking Time (optional)
}

// Send metrics to analytics or logging endpoint
export function sendMetricsToAnalytics(metrics: Partial<PerformanceMetrics>): void {
    // Don't send in development
    if (import.meta.env.DEV) return;

    // Send to your analytics endpoint
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metrics));
    } else {
        fetch('/api/analytics/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metrics),
            keepalive: true,
        }).catch(console.error);
    }
}

export function monitorPerformance(): () => void {
    if (typeof window === "undefined") return () => { };

    const metrics: Partial<PerformanceMetrics> = {};
    const observers: PerformanceObserver[] = [];

    // Monitor Core Web Vitals
    if ("PerformanceObserver" in window) {
        // First Contentful Paint
        try {
            const fcpObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.name === "first-contentful-paint") {
                        metrics.FCP = entry.startTime;
                    }
                }
            });
            fcpObserver.observe({ type: "paint", buffered: true });
            observers.push(fcpObserver);
        } catch (e) {
            console.warn("FCP monitoring not supported", e);
        }

        // Largest Contentful Paint
        try {
            let lcpValue = 0;
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                lcpValue = lastEntry.startTime;
                metrics.LCP = lcpValue;
            });
            lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
            observers.push(lcpObserver);
        } catch (e) {
            console.warn("LCP monitoring not supported", e);
        }

        // First Input Delay
        try {
            const fidObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
                    metrics.FID = fid;
                }
            });
            fidObserver.observe({ type: "first-input", buffered: true });
            observers.push(fidObserver);
        } catch (e) {
            console.warn("FID monitoring not supported", e);
        }

        // Cumulative Layout Shift
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                    }
                }
                metrics.CLS = clsValue;
            });
            clsObserver.observe({ type: "layout-shift", buffered: true });
            observers.push(clsObserver);
        } catch (e) {
            console.warn("CLS monitoring not supported", e);
        }

        // Total Blocking Time (TBT)
        try {
            let tbtValue = 0;
            const longTaskObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    const duration = entry.duration;
                    if (duration > 50) {
                        tbtValue += (duration - 50);
                    }
                }
                metrics.TBT = tbtValue;
            });
            longTaskObserver.observe({ type: "longtask", buffered: true });
            observers.push(longTaskObserver);
        } catch (e) {
            console.warn("TBT monitoring not supported", e);
        }
    }

    // Monitor Time to First Byte
    if ("performance" in window && "getEntriesByType" in performance) {
        try {
            const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
            if (navEntry) {
                const ttfb = navEntry.responseStart - navEntry.requestStart;
                metrics.TTFB = ttfb;
            }
        } catch (e) {
            console.warn("TTFB monitoring not supported", e);
        }
    }

    // Send metrics on page unload
    const sendOnUnload = () => {
        if (Object.keys(metrics).length > 0) {
            sendMetricsToAnalytics(metrics);
        }
    };
    window.addEventListener("beforeunload", sendOnUnload);
    window.addEventListener("pagehide", sendOnUnload);

    // Also send after page load (deferred)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(() => sendMetricsToAnalytics(metrics), 3000);
        });
    } else {
        setTimeout(() => sendMetricsToAnalytics(metrics), 3000);
    }

    // Return cleanup function
    return () => {
        window.removeEventListener("beforeunload", sendOnUnload);
        window.removeEventListener("pagehide", sendOnUnload);
        observers.forEach(observer => observer.disconnect());
    };
}

// Create a web worker for heavy computations
export function createOptimizationWorker(): Worker | null {
    if (typeof window === "undefined") return null;

    const workerCode = `
        self.addEventListener('message', (e) => {
            const { type, data } = e.data;
            
            if (type === 'processImages') {
                // Process images in background
                const results = data.map((img: string) => ({
                    src: img,
                    optimized: true,
                    timestamp: Date.now()
                }));
                self.postMessage({ type: 'imagesProcessed', data: results });
            }
            
            if (type === 'analyzeBundle') {
                // Analyze bundle size data in background
                const totalSize = data.reduce((acc: number, item: any) => acc + (item.size || 0), 0);
                self.postMessage({ 
                    type: 'bundleAnalyzed', 
                    data: { totalSize, items: data }
                });
            }
        });
    `;

    try {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    } catch (e) {
        console.warn("Web workers not supported", e);
        return null;
    }
}

// Debounced resize handler to reduce layout thrashing
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Use requestIdleCallback for non-critical operations
export function runWhenIdle(callback: () => void, timeout = 2000): void {
    if (typeof window === "undefined") {
        callback();
        return;
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => callback(), { timeout });
    } else {
        setTimeout(callback, 50);
    }
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Measure component render time
export function measureRenderTime(componentName: string): () => void {
    const startTime = performance.now();
    return () => {
        const duration = performance.now() - startTime;
        if (duration > 16) { // Warn if render takes longer than one frame
            console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
        }
        // Send to analytics in production
        if (!import.meta.env.DEV && duration > 50) {
            sendMetricsToAnalytics({
                [componentName]: duration
            } as any);
        }
    };
}