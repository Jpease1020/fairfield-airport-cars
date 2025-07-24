// Performance monitoring for production
// Track key metrics like page load times, API response times, etc.

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  logMetric(name: string, value: number, unit: string, context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}: ${value}${unit}`);
    }
  }

  // Track page load performance
  trackPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const perf = window.performance;
      const navigation = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.logMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        this.logMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
        this.logMetric('first_paint', navigation.responseStart - navigation.requestStart, 'ms');
      }
    }
  }

  // Track API response times
  trackApiCall(url: string, startTime: number, endTime: number) {
    const duration = endTime - startTime;
    this.logMetric('api_response_time', duration, 'ms', { url });
  }

  // Track user interactions
  trackInteraction(name: string, duration: number) {
    this.logMetric('user_interaction', duration, 'ms', { interaction: name });
  }

  // Get performance summary
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, any> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { values: [], count: 0 };
      }
      summary[metric.name].values.push(metric.value);
      summary[metric.name].count++;
    });

    // Calculate stats
    Object.keys(summary).forEach(key => {
      const values = summary[key].values;
      summary[key] = {
        avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: summary[key].count
      };
    });

    return summary;
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-track page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.trackPageLoad();
  });
} 