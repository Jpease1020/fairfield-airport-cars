// Comprehensive user interaction tracking system
// Monitors every button, input, form submission, and user action

interface InteractionEvent {
  type: 'click' | 'input' | 'submit' | 'focus' | 'blur' | 'error' | 'load' | 'navigation';
  element: string; // Element type (button, input, form, etc.)
  elementId?: string; // ID if available
  elementClass?: string; // Class if available
  page: string; // Current page URL
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>; // Additional context
  success?: boolean; // For actions that can succeed/fail
  error?: string; // Error message if applicable
  duration?: number; // Time taken for action (ms)
  userAgent?: string;
  viewport?: { width: number; height: number };
}

interface ErrorEvent {
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'validation' | 'api' | 'user';
  element?: string;
  page: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

class InteractionTracker {
  private interactions: InteractionEvent[] = [];
  private errors: ErrorEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events
  private isInitialized = false;

  // Initialize tracking
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.setupGlobalListeners();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.isInitialized = true;
    
    console.log('🔍 Interaction tracking initialized');
  }

  // Track a user interaction
  trackInteraction(event: Omit<InteractionEvent, 'timestamp' | 'page' | 'userAgent' | 'viewport'>) {
    const interaction: InteractionEvent = {
      ...event,
      timestamp: new Date(),
      page: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : undefined
    };

    this.interactions.push(interaction);

    // Keep only the last maxEvents
    if (this.interactions.length > this.maxEvents) {
      this.interactions = this.interactions.slice(-this.maxEvents);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(interaction);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Interaction tracked:', interaction);
    }
  }

  // Track an error
  trackError(error: Omit<ErrorEvent, 'timestamp' | 'page'>) {
    const errorEvent: ErrorEvent = {
      ...error,
      timestamp: new Date(),
      page: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    this.errors.push(errorEvent);

    // Keep only the last maxEvents
    if (this.errors.length > this.maxEvents) {
      this.errors = this.errors.slice(-this.maxEvents);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorEvent);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error tracked:', errorEvent);
    }
  }

  // Setup global event listeners
  private setupGlobalListeners() {
    if (typeof window === 'undefined') return;

    // Track all clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const element = this.getElementInfo(target);
      this.trackInteraction({
        type: 'click',
        element: element.type,
        elementId: element.id,
        elementClass: element.class,
        context: {
          text: target.textContent?.trim().substring(0, 100),
          tagName: target.tagName.toLowerCase(),
          isButton: target.tagName === 'BUTTON' || target.closest('button'),
          isLink: target.tagName === 'A' || target.closest('a'),
          isFormElement: target.closest('form') !== null
        }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      if (!form) return;

      this.trackInteraction({
        type: 'submit',
        element: 'form',
        elementId: form.id,
        elementClass: form.className,
        context: {
          action: form.action,
          method: form.method,
          formData: this.getFormData(form)
        }
      });
    });

    // Track input changes
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;

      this.trackInteraction({
        type: 'input',
        element: target.type || 'input',
        elementId: target.id,
        elementClass: target.className,
        context: {
          fieldName: target.name,
          fieldType: target.type,
          valueLength: target.value.length,
          hasValue: !!target.value.trim()
        }
      });
    });

    // Track focus/blur events
    document.addEventListener('focus', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      this.trackInteraction({
        type: 'focus',
        element: this.getElementInfo(target).type,
        elementId: target.id,
        elementClass: target.className
      });
    }, true);

    document.addEventListener('blur', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      this.trackInteraction({
        type: 'blur',
        element: this.getElementInfo(target).type,
        elementId: target.id,
        elementClass: target.className
      });
    }, true);

    // Track navigation
    const navigationStart = Date.now();
    window.addEventListener('beforeunload', () => {
      this.trackInteraction({
        type: 'navigation',
        element: 'page',
        context: {
          duration: Date.now() - navigationStart,
          referrer: document.referrer
        }
      });
    });

    // Track page loads
    window.addEventListener('load', () => {
      this.trackInteraction({
        type: 'load',
        element: 'page',
        context: {
          loadTime: performance.now(),
          domContentLoaded: (performance.getEntriesByType('navigation')[0] as any)?.domContentLoadedEventEnd
        }
      });
    });
  }

  // Setup error handling
  private setupErrorHandling() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (e) => {
      this.trackError({
        message: e.message,
        stack: e.error?.stack,
        type: 'javascript',
        element: e.target ? this.getElementInfo(e.target as HTMLElement).type : undefined,
        context: {
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackError({
        message: String(e.reason),
        type: 'javascript',
        context: {
          type: 'unhandledrejection'
        }
      });
    });

    // Network errors
    window.addEventListener('error', (e) => {
      if (e.target && (e.target as HTMLElement).tagName === 'IMG') {
        this.trackError({
          message: 'Image failed to load',
          type: 'network',
          element: 'img',
          context: {
            src: (e.target as HTMLImageElement).src
          }
        });
      }
    }, true);
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.trackInteraction({
          type: 'load',
          element: 'api',
          elementId: url,
          success: response.ok,
          duration,
          context: {
            method: args[1]?.method || 'GET',
            status: response.status,
            statusText: response.statusText
          }
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.trackError({
          message: `API call failed: ${url}`,
          type: 'network',
          element: 'api',
          context: {
            url,
            method: args[1]?.method || 'GET',
            duration
          }
        });
        
        throw error;
      }
    };
  }

  // Helper to get element information
  private getElementInfo(element: HTMLElement) {
    const tagName = element.tagName.toLowerCase();
    let type = tagName;
    const id = element.id;
    const className = element.className;

    // Categorize elements
    if (element.closest('button') || tagName === 'button') {
      type = 'button';
    } else if (element.closest('a') || tagName === 'a') {
      type = 'link';
    } else if (element.closest('input') || tagName === 'input') {
      type = 'input';
    } else if (element.closest('form') || tagName === 'form') {
      type = 'form';
    } else if (element.closest('select') || tagName === 'select') {
      type = 'select';
    } else if (element.closest('textarea') || tagName === 'textarea') {
      type = 'textarea';
    }

    return { type, id, class: className };
  }

  // Helper to get form data (safely)
  private getFormData(form: HTMLFormElement) {
    try {
      const formData = new FormData(form);
      const data: Record<string, string> = {};
      
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          // Don't log sensitive data
          if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
            data[key] = '[REDACTED]';
          } else {
            data[key] = value.substring(0, 100); // Limit length
          }
        }
      }
      
      return data;
    } catch {
      return {};
    }
  }

  // Send to analytics service
  private async sendToAnalytics(interaction: InteractionEvent) {
    try {
      await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
      });
    } catch (error) {
      console.error('Failed to send interaction to analytics:', error);
    }
  }

  // Send error to monitoring service
  private async sendErrorToMonitoring(error: ErrorEvent) {
    try {
      await fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (e) {
      console.error('Failed to send error to monitoring:', e);
    }
  }

  // Get recent interactions
  getRecentInteractions(limit = 50): InteractionEvent[] {
    return this.interactions.slice(-limit);
  }

  // Get recent errors
  getRecentErrors(limit = 50): ErrorEvent[] {
    return this.errors.slice(-limit);
  }

  // Get interaction count
  getInteractionCount(): number {
    return this.interactions.length;
  }

  // Get error count
  getErrorCount(): number {
    return this.errors.length;
  }

  // Clear all data
  clearData() {
    this.interactions = [];
    this.errors = [];
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const interactions = this.interactions;
    const errors = this.errors;
    
    const interactionTypes = interactions.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorTypes = errors.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const elementTypes = interactions.reduce((acc, i) => {
      acc[i.element] = (acc[i.element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInteractions: interactions.length,
      totalErrors: errors.length,
      interactionTypes,
      errorTypes,
      elementTypes,
      recentErrors: errors.slice(-10),
      recentInteractions: interactions.slice(-10)
    };
  }
}

// Global interaction tracker instance
export const interactionTracker = new InteractionTracker();

// Initialize tracking when the module loads
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure DOM is ready
  setTimeout(() => {
    interactionTracker.init();
  }, 100);
}

// Export helper functions for manual tracking
export const trackInteraction = (event: Omit<InteractionEvent, 'timestamp' | 'page' | 'userAgent' | 'viewport'>) => {
  interactionTracker.trackInteraction(event);
};

export const trackError = (error: Omit<ErrorEvent, 'timestamp' | 'page'>) => {
  interactionTracker.trackError(error);
};

export const getAnalyticsSummary = () => {
  return interactionTracker.getAnalyticsSummary();
}; 