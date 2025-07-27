// Security and Monitoring Service
// Handles threat detection, data protection, audit logging, and security compliance

interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'payment' | 'api_call' | 'error' | 'threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

interface ThreatDetection {
  suspiciousActivity: boolean;
  rateLimitExceeded: boolean;
  unusualPattern: boolean;
  potentialAttack: boolean;
  riskScore: number; // 0-100
  recommendations: string[];
}

interface DataProtection {
  encryption: boolean;
  anonymization: boolean;
  retention: boolean;
  accessControl: boolean;
  auditTrail: boolean;
}

class SecurityMonitoringService {
  private securityEvents: SecurityEvent[] = [];
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private threatPatterns: Map<string, number> = new Map();
  private maxEvents = 1000; // Keep last 1000 events

  constructor() {
    this.setupSecurityMonitoring();
  }

  // Setup security monitoring
  private setupSecurityMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor for suspicious activities
    this.monitorUserBehavior();
    this.monitorNetworkRequests();
    this.monitorDataAccess();
    this.setupRateLimiting();
  }

  // Monitor user behavior for suspicious patterns
  private monitorUserBehavior(): void {
    // Track rapid clicks (potential bot activity)
    let clickCount = 0;
    let lastClickTime = 0;

    document.addEventListener('click', (event) => {
      const now = Date.now();
      if (now - lastClickTime < 100) { // Less than 100ms between clicks
        clickCount++;
        if (clickCount > 10) { // More than 10 rapid clicks
          this.logSecurityEvent({
            type: 'threat',
            severity: 'medium',
            action: 'rapid_clicking',
            details: { clickCount, target: (event.target as HTMLElement)?.tagName },
            success: false,
          });
        }
      } else {
        clickCount = 0;
      }
      lastClickTime = now;
    });

    // Monitor form submissions for suspicious patterns
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Check for suspicious form data
      for (const [key, value] of formData.entries()) {
        if (this.containsSuspiciousContent(value.toString())) {
          this.logSecurityEvent({
            type: 'threat',
            severity: 'high',
            action: 'suspicious_form_data',
            details: { field: key, value: value.toString().substring(0, 100) },
            success: false,
          });
        }
      }
    });
  }

  // Monitor network requests for suspicious patterns
  private monitorNetworkRequests(): void {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = Date.now();
      
      try {
        const response = await originalFetch(input, init);
        
        // Log API calls
        this.logSecurityEvent({
          type: 'api_call',
          severity: 'low',
          action: 'api_request',
          resource: typeof input === 'string' ? input : input.toString(),
          details: {
            method: init?.method || 'GET',
            status: response.status,
            responseTime: Date.now() - startTime,
          },
          success: response.ok,
        });

        return response;
      } catch (error) {
        this.logSecurityEvent({
          type: 'error',
          severity: 'medium',
          action: 'api_request_failed',
          resource: typeof input === 'string' ? input : input.toString(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    };
  }

  // Monitor data access patterns
  private monitorDataAccess(): void {
    // Monitor localStorage access
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key: string, value: string) => {
      this.logSecurityEvent({
        type: 'data_access',
        severity: 'low',
        action: 'localStorage_write',
        resource: key,
        details: { valueLength: value.length },
        success: true,
      });
      return originalSetItem.call(localStorage, key, value);
    };

    const originalGetItem = localStorage.getItem;
    localStorage.getItem = (key: string) => {
      this.logSecurityEvent({
        type: 'data_access',
        severity: 'low',
        action: 'localStorage_read',
        resource: key,
        details: {},
        success: true,
      });
      return originalGetItem.call(localStorage, key);
    };
  }

  // Setup rate limiting
  private setupRateLimiting(): void {
    // Rate limit API calls
    this.addRateLimit('api_calls', 100, 60000); // 100 calls per minute
    this.addRateLimit('login_attempts', 5, 300000); // 5 attempts per 5 minutes
    this.addRateLimit('booking_attempts', 10, 60000); // 10 bookings per minute
  }

  // Add rate limit for a specific action
  addRateLimit(action: string, maxAttempts: number, windowMs: number): void {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const current = this.rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      current.count++;
      if (current.count > maxAttempts) {
        this.logSecurityEvent({
          type: 'threat',
          severity: 'high',
          action: 'rate_limit_exceeded',
          details: { action, count: current.count, maxAttempts },
          success: false,
        });
        throw new Error(`Rate limit exceeded for ${action}`);
      }
    }
  }

  // Check if content contains suspicious patterns
  private containsSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
      /alert\s*\(/i,
      /confirm\s*\(/i,
      /prompt\s*\(/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  // Log security event
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
    };

    this.securityEvents.push(securityEvent);

    // Keep only the last maxEvents
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    // Check for threat patterns
    this.analyzeThreatPatterns(securityEvent);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(securityEvent);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', securityEvent);
    }
  }

  // Analyze threat patterns
  private analyzeThreatPatterns(event: SecurityEvent): void {
    const key = `${event.type}_${event.action}`;
    const currentCount = this.threatPatterns.get(key) || 0;
    this.threatPatterns.set(key, currentCount + 1);

    // Check for unusual patterns
    if (currentCount > 10) { // More than 10 similar events
      this.logSecurityEvent({
        type: 'threat',
        severity: 'medium',
        action: 'unusual_pattern_detected',
        details: { pattern: key, count: currentCount + 1 },
        success: false,
      });
    }
  }

  // Get client IP address (simplified)
  private getClientIP(): string {
    // In a real implementation, this would come from the server
    return 'unknown';
  }

  // Get session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Validate user input
  validateInput(input: string, type: 'email' | 'phone' | 'name' | 'address'): boolean {
    const validators = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$/,
      name: /^[a-zA-Z\s'-]{2,50}$/,
      address: /^[a-zA-Z0-9\s,.-]{5,200}$/,
    };

    const isValid = validators[type].test(input);
    
    if (!isValid) {
      this.logSecurityEvent({
        type: 'threat',
        severity: 'low',
        action: 'invalid_input',
        details: { type, input: input.substring(0, 100) },
        success: false,
      });
    }

    return isValid;
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    // Remove potentially dangerous content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/document\./gi, '')
      .replace(/window\./gi, '')
      .trim();
  }

  // Encrypt sensitive data
  async encryptData(data: string): Promise<string> {
    // In a real implementation, this would use proper encryption
    // For now, return a simple hash
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Decrypt sensitive data
  async decryptData(encryptedData: string): Promise<string> {
    // In a real implementation, this would decrypt the data
    // For now, return the original data (this is just a placeholder)
    return encryptedData;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Check for valid authentication token
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      // In a real implementation, this would validate the JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp < now) {
        this.logSecurityEvent({
          type: 'authentication',
          severity: 'medium',
          action: 'token_expired',
          details: { tokenExp: payload.exp, currentTime: now },
          success: false,
        });
        return false;
      }

      return true;
    } catch (error) {
      this.logSecurityEvent({
        type: 'authentication',
        severity: 'high',
        action: 'invalid_token',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      });
      return false;
    }
  }

  // Check user permissions
  hasPermission(permission: string): boolean {
    if (!this.isAuthenticated()) return false;

    // In a real implementation, this would check user roles and permissions
    const userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
    return userPermissions.includes(permission);
  }

  // Detect threats
  detectThreats(): ThreatDetection {
    const recentEvents = this.securityEvents.filter(
      event => Date.now() - event.timestamp.getTime() < 300000 // Last 5 minutes
    );

    const suspiciousActivity = recentEvents.some(event => event.type === 'threat');
    const rateLimitExceeded = recentEvents.some(event => event.action === 'rate_limit_exceeded');
    const unusualPattern = recentEvents.filter(event => event.action === 'unusual_pattern_detected').length > 0;
    const potentialAttack = recentEvents.filter(event => event.severity === 'critical').length > 0;

    // Calculate risk score
    let riskScore = 0;
    recentEvents.forEach(event => {
      switch (event.severity) {
        case 'low': riskScore += 1; break;
        case 'medium': riskScore += 5; break;
        case 'high': riskScore += 10; break;
        case 'critical': riskScore += 20; break;
      }
    });

    const recommendations: string[] = [];
    if (suspiciousActivity) recommendations.push('Monitor for suspicious user behavior');
    if (rateLimitExceeded) recommendations.push('Implement stricter rate limiting');
    if (unusualPattern) recommendations.push('Investigate unusual activity patterns');
    if (potentialAttack) recommendations.push('Immediate security review required');

    return {
      suspiciousActivity,
      rateLimitExceeded,
      unusualPattern,
      potentialAttack,
      riskScore: Math.min(riskScore, 100),
      recommendations,
    };
  }

  // Get security audit log
  getSecurityAuditLog(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get security statistics
  getSecurityStatistics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentThreats: number;
    averageRiskScore: number;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    let totalRiskScore = 0;

    this.securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      switch (event.severity) {
        case 'low': totalRiskScore += 1; break;
        case 'medium': totalRiskScore += 5; break;
        case 'high': totalRiskScore += 10; break;
        case 'critical': totalRiskScore += 20; break;
      }
    });

    const recentThreats = this.securityEvents.filter(
      event => event.type === 'threat' && 
      Date.now() - event.timestamp.getTime() < 3600000 // Last hour
    ).length;

    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      recentThreats,
      averageRiskScore: this.securityEvents.length > 0 ? totalRiskScore / this.securityEvents.length : 0,
    };
  }

  // Send to monitoring service
  private async sendToMonitoringService(event: SecurityEvent): Promise<void> {
    try {
      await fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send security event to monitoring service:', error);
    }
  }

  // Clear security events (for testing)
  clearSecurityEvents(): void {
    this.securityEvents = [];
    this.threatPatterns.clear();
    this.rateLimitMap.clear();
  }
}

// Export singleton instance
export const securityMonitoringService = new SecurityMonitoringService();

// Export types
export type { SecurityEvent, ThreatDetection, DataProtection }; 