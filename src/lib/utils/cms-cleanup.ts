/**
 * CMS Data Cleanup Utilities
 * 
 * Prevents malformed fallback strings from being saved to the database
 */

// Patterns that indicate malformed CMS content that shouldn't be saved
const MALFORMED_PATTERNS = [
  /^\[LABEL\]/,                    // "[LABEL] form name label *"
  /^\[.*\]/,                       // Any string starting with [brackets]
  /^[A-Z\s]+\*$/,                  // "FORM NAME LABEL *"
  /^[A-Z\s]+label\s*\*$/,          // "FORM NAME LABEL *"
  /^[A-Z\s]+label$/,               // "FORM NAME LABEL"
  /^[A-Z\s]+\s+\*$/,               // "FORM NAME *"
  /^[A-Z\s]+[A-Z]+\s+\*$/,         // "FORM NAME LABEL *"
  /^[A-Z\s]+[a-z]+\s+\*$/,         // "FORM NAME label *"
];

/**
 * Checks if a string is malformed and shouldn't be saved to CMS
 */
export function isMalformedCMSString(value: any): boolean {
  if (typeof value !== 'string') return false;
  
  return MALFORMED_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Cleans CMS data by removing malformed strings
 */
export function cleanCMSData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (isMalformedCMSString(value)) {
      // Skip malformed strings - they shouldn't be in the database
      console.warn(`Removing malformed CMS string for key "${key}":`, value);
      continue;
    }
    
    if (typeof value === 'object' && value !== null) {
      // Recursively clean nested objects
      cleaned[key] = cleanCMSData(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * Validates CMS content before saving
 */
export function validateCMSContent(key: string, value: any): boolean {
  if (isMalformedCMSString(value)) {
    console.error(`Invalid CMS content for key "${key}":`, value);
    return false;
  }
  
  return true;
}
