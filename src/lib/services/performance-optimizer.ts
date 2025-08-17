// Performance Optimization Service
// Handles code splitting, bundle optimization, and performance monitoring
import React from 'react';

interface PerformanceMetrics {
    pageLoadTime: number;
    timeToInteractive: number;
    bundleSize: number;
    apiResponseTime: number;
    errorRate: number;
}

interface OptimizationConfig {
    enableCodeSplitting: boolean;
    enableImageOptimization: boolean;
    enableCaching: boolean;
    enableCompression: boolean;
    performanceBudget: {
        pageLoadTime: number;

 // ms
        bundleSize: number;

 // bytes
        apiResponseTime: number;
 // ms
    };
}

// Narrow type for layout-shift entries (only fields we read)
interface LayoutShiftEntry { value: number; hadRecentInput: boolean }

function isLayoutShiftEntry(entry: unknown): entry is LayoutShiftEntry {
    const e = entry as { value?: unknown; hadRecentInput?: unknown };
    return typeof e.value === 'number' && typeof e.hadRecentInput === 'boolean';
}

class PerformanceOptimizer {
    private metrics: PerformanceMetrics[] = [];
    private config: OptimizationConfig;
    constructor(config: OptimizationConfig) {
        this.config = config;
        this.setupPerformanceMonitoring();
    }
    // Monitor Core Web Vitals
    private setupPerformanceMonitoring() {
        if (typeof window === 'undefined')
            return;
        
        // Monitor Largest Contentful Paint (LCP)
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries.at(-1);
            
            if (lastEntry)
                this.recordMetric('lcp', lastEntry.startTime);
        });
        
        observer.observe({
            entryTypes: ['largest-contentful-paint'],
        });
        // Monitor First Input Delay (FID)

                const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            for (const entry of entries) {
                const firstInputEntry = entry as any;
                
                if (firstInputEntry.processingStart)
                    this.recordMetric('fid', firstInputEntry.processingStart - firstInputEntry.startTime);
            }
        });
        
        fidObserver.observe({
            entryTypes: ['first-input'],
        });
        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        
        const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            for (const entry of entries) {
                if (isLayoutShiftEntry(entry) && !entry.hadRecentInput)
                    clsValue += entry.value;
            }
            
            this.recordMetric('cls', clsValue);
        });
        
        clsObserver.observe({
            entryTypes: ['layout-shift'],
        });
    }
    // Record performance metric
    private recordMetric(type: string, value: number) {
        const metric = {
            type,
            value,
            timestamp: Date.now(),
            url: window.location.href,
        };
        
        // Store metric
        this.metrics.push({
            pageLoadTime: type === 'pageLoad' ? value : 0,
            timeToInteractive: type === 'tti' ? value : 0,
            bundleSize: type === 'bundleSize' ? value : 0,
            apiResponseTime: type === 'apiResponse' ? value : 0,
            errorRate: type === 'errorRate' ? value : 0,
        });

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production')
            this.sendToAnalytics(metric);
        
        // Log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Performance metric recorded:', metric);
        }    }
    // Optimize images
    optimizeImage(src: string, width: number): string {
        if (!this.config.enableImageOptimization)
            return src;
        
        // Use Next.js Image optimization
        return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
    }
    // Lazy load components
    lazyLoadComponent<T extends React.ComponentType<Record<string, unknown>>>(importFunc: () => Promise<{    default: T}>): React.LazyExoticComponent<T> {
        return React.lazy(() => importFunc().then((module) => ({
            default: module.default,
        })));
    }
    // Optimize API calls with caching
    async cachedApiCall<T>(url: string, options: RequestInit = {}, cacheTime: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
        if (!this.config.enableCaching)
            return this.makeApiCall<T>(url, options);
        
        const cacheKey = `api-cache-${url}-${JSON.stringify(options)}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
            const {data, timestamp} = JSON.parse(cached);
            
            if (cacheTime > Date.now() - timestamp)
                return data;
        }
        
        const data = await this.makeApiCall<T>(url, options);
        
        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now(),
        }));
        
        return data;
    }
    
    private async makeApiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
        const startTime = Date.now();
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            
            const responseTime = Date.now() - startTime;
            this.recordMetric('apiResponse', responseTime);
            
            if (!response.ok)
                throw Error(`API call failed: ${response.status}`);
            
            return await response.json();
        } catch(error) {
            this.recordMetric('errorRate', 1);
            throw error;
        }
    }
    // Bundle size optimization
    optimizeBundleSize(): void {
        if (!this.config.enableCodeSplitting)
            return;
        
        // Dynamic imports for heavy components
        const heavyComponents = {
            DataTable: () => import('@/ui'),
            // Only include components that actually exist
        };
        
        // Preload critical components
        for (const [name, importFunc] of Object.entries(heavyComponents)) {
            if (document.querySelector(`[data-component="${name}"]`))
                importFunc();
        }
    }
    // Compression optimization
    enableCompression(): void {
        if (!this.config.enableCompression)
            return;
        
        // Enable gzip compression for text assets
        const textAssets = document.querySelectorAll('link[rel="stylesheet"], script[type="text/javascript"]');
        
        for (const asset of textAssets) {
            if (asset instanceof HTMLLinkElement)
                asset.href = asset.href.replace(/\.(css|js)$/, '.gz.$1');
        }
    }
    // Performance budget checking
    checkPerformanceBudget(metrics: PerformanceMetrics): boolean {
        const budget = this.config.performanceBudget;
        
        const violations = [
            metrics.pageLoadTime > budget.pageLoadTime && 'Page load time exceeded budget',
            metrics.bundleSize > budget.bundleSize && 'Bundle size exceeded budget',
            metrics.apiResponseTime > budget.apiResponseTime && 'API response time exceeded budget',
        ].filter(Boolean);
        
        return violations.length <= 0;
    }
    // Get performance report
    getPerformanceReport(): {
        averagePageLoadTime: number;
        averageApiResponseTime: number;
        errorRate: number;
        recommendations: string[];
    } {
        if (!this.metrics.length)
            return {
                averagePageLoadTime: 0,
                averageApiResponseTime: 0,
                errorRate: 0,
                recommendations: ['No performance data available'],
            };
        
        const avgPageLoadTime = this.metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / this.metrics.length;
        const avgApiResponseTime = this.metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / this.metrics.length;
        const errorRate = this.metrics.reduce((sum, m) => sum + m.errorRate, 0) / this.metrics.length;
        
        const recommendations: string[] = [];
        
        if (avgPageLoadTime > 3000)
            recommendations.push('Consider implementing code splitting for faster page loads');
        
        if (avgApiResponseTime > 1000)
            recommendations.push('Optimize API endpoints or implement caching');
        
        if (errorRate > 0.05)
            recommendations.push('Investigate and fix error sources');
        
        return {
            averagePageLoadTime: avgPageLoadTime,
            averageApiResponseTime: avgApiResponseTime,
            errorRate,
            recommendations,
        };
    }
    
    private async sendToAnalytics(metric: Record<string, unknown>) {
        try {
            await fetch('/api/analytics/performance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metric),
        });
        
        } catch (error) {
            console.error('Failed to send performance metric to analytics', error);
        }    }
}

// Default configuration
const defaultConfig: OptimizationConfig = {
    enableCodeSplitting: true,
    enableImageOptimization: true,
    enableCaching: true,
    enableCompression: true,
    performanceBudget: {
        pageLoadTime: 3000, // 3 seconds
        bundleSize: 500 * 1024, // 500KB
        apiResponseTime: 1000, // 1 second
    },
};

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer(defaultConfig);
// Export types
