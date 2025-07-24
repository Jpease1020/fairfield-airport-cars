import DOMPurify from 'dompurify';

export interface ContentValidation {
  maxLength: number;
  required: boolean;
  pattern?: RegExp;
  sanitize?: boolean;
  allowedTags?: string[];
  minLength?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class ContentValidator {
  private static readonly DEFAULT_VALIDATIONS: Record<string, ContentValidation> = {
    title: {
      maxLength: 100,
      required: true,
      sanitize: true,
      allowedTags: []
    },
    subtitle: {
      maxLength: 200,
      required: false,
      sanitize: true,
      allowedTags: []
    },
    description: {
      maxLength: 1000,
      required: false,
      sanitize: true,
      allowedTags: ['b', 'i', 'em', 'strong', 'a']
    },
    content: {
      maxLength: 5000,
      required: false,
      sanitize: true,
      allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3']
    },
    email: {
      maxLength: 100,
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      sanitize: true,
      allowedTags: []
    },
    phone: {
      maxLength: 20,
      required: false,
      pattern: /^$|^[\+]?[1-9][\d]{0,15}$/,
      sanitize: true,
      allowedTags: []
    },
    price: {
      maxLength: 10,
      required: false,
      pattern: /^\d+(\.\d{1,2})?$/,
      sanitize: true,
      allowedTags: []
    }
  };

  static validateField(
    field: string, 
    value: string, 
    customValidation?: ContentValidation
  ): { isValid: boolean; error?: ValidationError; sanitizedValue?: string } {
    const validation = customValidation || this.DEFAULT_VALIDATIONS[field] || {
      maxLength: 500,
      required: false,
      sanitize: true,
      allowedTags: []
    };

    // Check if required
    if (validation.required && (!value || !value.trim())) {
      return {
        isValid: false,
        error: {
          field,
          message: `${field} is required`,
          code: 'REQUIRED_FIELD'
        }
      };
    }

    // Check minimum length
    if (validation.minLength && value.length < validation.minLength) {
      return {
        isValid: false,
        error: {
          field,
          message: `${field} must be at least ${validation.minLength} characters`,
          code: 'MIN_LENGTH'
        }
      };
    }

    // Check maximum length
    if (value.length > validation.maxLength) {
      return {
        isValid: false,
        error: {
          field,
          message: `${field} exceeds ${validation.maxLength} characters`,
          code: 'MAX_LENGTH'
        }
      };
    }

    // Check pattern
    if (validation.pattern && !validation.pattern.test(value)) {
      return {
        isValid: false,
        error: {
          field,
          message: `${field} format is invalid`,
          code: 'INVALID_FORMAT'
        }
      };
    }

    // Sanitize content
    let sanitizedValue = value;
    if (validation.sanitize) {
      if (typeof window !== 'undefined') {
        // Client-side sanitization
        sanitizedValue = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: validation.allowedTags || [],
          ALLOWED_ATTR: ['href', 'target']
        });
      } else {
        // Server-side sanitization (basic)
        sanitizedValue = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
      }
    }

    return {
      isValid: true,
      sanitizedValue
    };
  }

  static validateContent(content: Record<string, any>): {
    isValid: boolean;
    errors: ValidationError[];
    sanitizedContent: Record<string, any>;
  } {
    const errors: ValidationError[] = [];
    const sanitizedContent: Record<string, any> = {};

    for (const [field, value] of Object.entries(content)) {
      if (typeof value === 'string') {
        const validation = this.validateField(field, value);
        
        if (!validation.isValid && validation.error) {
          errors.push(validation.error);
        } else if (validation.sanitizedValue !== undefined) {
          sanitizedContent[field] = validation.sanitizedValue;
        }
      } else {
        // For non-string values, just copy them
        sanitizedContent[field] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedContent
    };
  }

  static validatePageContent(pageType: string, content: any): {
    isValid: boolean;
    errors: ValidationError[];
    sanitizedContent: any;
  } {
    // Page-specific validation rules
    const pageValidations: Record<string, Record<string, ContentValidation>> = {
      home: {
        'hero.title': { maxLength: 100, required: true, sanitize: true },
        'hero.subtitle': { maxLength: 200, required: false, sanitize: true },
        'hero.ctaText': { maxLength: 50, required: false, sanitize: true },
        'features.title': { maxLength: 100, required: false, sanitize: true },
        'about.title': { maxLength: 100, required: false, sanitize: true },
        'about.content': { maxLength: 2000, required: false, sanitize: true, allowedTags: ['p', 'b', 'i', 'em', 'strong'] },
        'contact.title': { maxLength: 100, required: false, sanitize: true },
        'contact.content': { maxLength: 1000, required: false, sanitize: true, allowedTags: ['p', 'b', 'i', 'em', 'strong'] },
        'contact.phone': { maxLength: 20, required: false, pattern: /^$|^[\+]?[1-9][\d]{0,15}$/, sanitize: true },
        'contact.email': { maxLength: 100, required: false, pattern: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, sanitize: true }
      },
      booking: {
        title: { maxLength: 100, required: true, sanitize: true },
        subtitle: { maxLength: 200, required: false, sanitize: true },
        description: { maxLength: 1000, required: false, sanitize: true, allowedTags: ['p', 'b', 'i', 'em', 'strong'] }
      },
      help: {
        title: { maxLength: 100, required: false, sanitize: true },
        subtitle: { maxLength: 200, required: false, sanitize: true },
        faqTitle: { maxLength: 100, required: false, sanitize: true },
        'contactInfo.phone': { maxLength: 20, required: false, pattern: /^$|^[\+]?[1-9][\d]{0,15}$/, sanitize: true },
        'contactInfo.email': { maxLength: 100, required: false, pattern: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, sanitize: true },
        'contactInfo.hours': { maxLength: 100, required: false, sanitize: true }
      }
    };

    const validations = pageValidations[pageType] || {};
    const errors: ValidationError[] = [];
    const sanitizedContent: any = {};

    // Flatten nested objects for validation
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
      const flattened: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          flattened[newKey] = value;
        } else if (typeof value === 'object' && value !== null) {
          Object.assign(flattened, flattenObject(value, newKey));
        }
      }
      
      return flattened;
    };

    const flattenedContent = flattenObject(content);

    for (const [field, value] of Object.entries(flattenedContent)) {
      const validation = validations[field] || this.DEFAULT_VALIDATIONS[field.split('.').pop() || ''] || {
        maxLength: 500,
        required: false,
        sanitize: true,
        allowedTags: []
      };

      const result = this.validateField(field, value, validation);
      
      if (!result.isValid && result.error) {
        errors.push(result.error);
      } else if (result.sanitizedValue !== undefined) {
        // Reconstruct nested object
        const keys = field.split('.');
        let current = sanitizedContent;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = result.sanitizedValue;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedContent
    };
  }
} 