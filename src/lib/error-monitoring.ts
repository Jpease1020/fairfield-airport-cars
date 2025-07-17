// Error monitoring and logging for production
// Simple, lightweight error tracking

interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
}

class ErrorMonitor {
  private errors: ErrorEvent[] = [];
  private maxErrors = 100; // Keep last 100 errors

  logError(error: Error, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date(),
      context
    };

    this.errors.push(errorEvent);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', errorEvent);
    }

    // In production, you could send to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorEvent);
    }
  }

  private async sendToMonitoringService(error: ErrorEvent) {
    // Simple implementation - could be replaced with Sentry, LogRocket, etc.
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (e) {
      // Fallback to console if monitoring service fails
      console.error('Failed to send error to monitoring service:', e);
    }
  }

  getRecentErrors(limit = 10): ErrorEvent[] {
    return this.errors.slice(-limit);
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorMonitor.logError(event.error, {
      type: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.logError(new Error(event.reason), {
      type: 'unhandledrejection'
    });
  });
}

// React error boundary helper
export function logReactError(error: Error, errorInfo: any) {
  errorMonitor.logError(error, {
    type: 'react.error',
    componentStack: errorInfo.componentStack
  });
} 