// Security utilities for production
// Input sanitization, rate limiting, data validation

import DOMPurify from 'dompurify';

export class SecurityUtils {
  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(input);
    }
    // Server-side fallback
    return input.replace(/[<>]/g, '');
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number format
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9]\d{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, [now]);
        return true;
      }

      const userRequests = requests.get(identifier)!;
      const recentRequests = userRequests.filter(time => time > windowStart);
      
      if (recentRequests.length >= maxRequests) {
        return false; // Rate limited
      }

      recentRequests.push(now);
      requests.set(identifier, recentRequests);
      return true;
    };
  }

  // Validate booking data
  static validateBookingData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.phone?.trim()) errors.push('Phone is required');
    if (!data.pickupLocation?.trim()) errors.push('Pickup location is required');
    if (!data.dropoffLocation?.trim()) errors.push('Dropoff location is required');
    if (!data.pickupDateTime) errors.push('Pickup date/time is required');

    // Format validation
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    // Date validation
    if (data.pickupDateTime) {
      const pickupDate = new Date(data.pickupDateTime);
      const now = new Date();
      
      if (pickupDate <= now) {
        errors.push('Pickup date must be in the future');
      }
    }

    // Passenger validation
    if (data.passengers) {
      const passengers = parseInt(data.passengers);
      if (isNaN(passengers) || passengers < 1 || passengers > 10) {
        errors.push('Passengers must be between 1 and 10');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate secure random ID
  static generateSecureId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Mask sensitive data for logging
  static maskSensitiveData(data: any): any {
    const masked = { ...data };
    
    if (masked.email) {
      const [local, domain] = masked.email.split('@');
      masked.email = `${local.substring(0, 2)}***@${domain}`;
    }
    
    if (masked.phone) {
      masked.phone = masked.phone.replace(/\d(?=\d{4})/g, '*');
    }
    
    if (masked.apiKey) {
      masked.apiKey = '***' + masked.apiKey.slice(-4);
    }

    return masked;
  }
}

// Rate limiter instances
export const bookingRateLimiter = SecurityUtils.createRateLimiter(5, 60000); // 5 requests per minute
export const apiRateLimiter = SecurityUtils.createRateLimiter(100, 60000); // 100 requests per minute 