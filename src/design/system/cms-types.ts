/**
 * CMS Type Guards and Helpers
 * 
 * Provides type-safe validation for CMS content in text components
 */

import { CMSSafeString, CMSFallbackString } from './shared-types';

// Type guards for CMS content
export function isCMSSafeString(value: any): value is CMSSafeString {
  if (typeof value !== 'string') return false;
  
  // Reject malformed fallback strings that shouldn't be saved
  const malformedPatterns = [
    /^\[LABEL\]/,                    // "[LABEL] form name label *"
    /^\[.*\]/,                       // Any string starting with [brackets]
    /^[A-Z\s]+\*$/,                  // "FORM NAME LABEL *"
    /^[A-Z\s]+label\s*\*$/,          // "FORM NAME LABEL *"
    /^[A-Z\s]+label$/,               // "FORM NAME LABEL"
    /^[A-Z\s]+\s+\*$/,               // "FORM NAME *"
  ];
  
  if (malformedPatterns.some(pattern => pattern.test(value))) {
    return false;
  }
  
  // Only accept strings that look like real content
  return value.length > 0 && value.length < 200 && (
    value.includes('cms') || 
    value.includes('CMS') || 
    value.includes('content') ||
    value.includes('text') ||
    value.includes('title') ||
    value.includes('description') ||
    value.includes('message')
  );
}

export function isCMSFallbackString(value: any): value is CMSFallbackString {
  if (typeof value !== 'string') return false;
  
  // Define allowed fallback patterns
  const allowedPatterns = [
    /^[A-Z][a-z]+$/,                    // "Loading", "Error"
    /^[A-Z][a-z]+\s*[!?]?$/,           // "Loading!", "Success?"
    /^[A-Z][a-z]+\.\.\.$/,              // "Loading..."
    /^[0-9]+$/,                         // Numbers
    /^[A-Z]{2,4}$/,                     // "USD", "EST"
    /^[a-z]+@[a-z]+\.[a-z]+$/,          // Email patterns
    /^\+?[0-9\-\s()]+$/,              // Phone numbers
    /^[0-9]{1,2}:[0-9]{2}$/,            // Time formats like "9:30"
    /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/, // Date formats like "12/25/2024"
    /^[A-Z][a-z]+\s+[A-Z][a-z]+$/,      // Two words like "No data"
  ];
  
  return allowedPatterns.some(pattern => pattern.test(value));
}

// Helper to create CMS-safe strings
export function createCMSSafeString(value: string): CMSSafeString {
  return value as CMSSafeString;
}



// Helper to validate text component children
export function validateTextChildren(children: any): boolean {
  if (typeof children === 'string') {
    return isCMSSafeString(children) || isCMSFallbackString(children);
  }
  
  if (children && typeof children === 'object' && children.type) {
    return true; // React elements are always allowed
  }
  
  if (Array.isArray(children)) {
    return children.every(child => validateTextChildren(child));
  }
  
  return false;
}
