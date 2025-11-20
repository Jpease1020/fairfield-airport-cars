import { cmsFlattenedService } from './cms-service';

let cmsDataCache: any = null;

// Sanitize Firebase data to handle timestamps and other non-serializable objects
function sanitizeFirebaseData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'object') {
    // Handle Firebase timestamps
    if (data._nanoseconds !== undefined && data._seconds !== undefined) {
      return new Date(data._seconds * 1000).toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => sanitizeFirebaseData(item));
    }
    
    // Handle objects
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeFirebaseData(value);
    }
    return sanitized;
  }
  
  return data;
}

export async function getAllCMSDataCached() {
  // Disable caching in development for hot reloading
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && cmsDataCache) {
    return cmsDataCache;
  }

  try {
    const data = await cmsFlattenedService.getAllCMSData();
    const sanitizedData = sanitizeFirebaseData(data);
    
    // Only cache in production
    if (!isDevelopment) {
      cmsDataCache = sanitizedData;
    }
    
    return sanitizedData;
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    // Return fallback data
    const fallbackData = {
      home: {
        'hero-title': 'Welcome to Fairfield Airport Cars',
        'hero-subtitle': 'Premium airport transportation service'
      },
      about: {
        'about-title': 'About Us',
        'about-subtitle': 'Your trusted airport transportation partner'
      },
      contact: {
        'contact-title': 'Contact Us',
        'contact-subtitle': 'Get in touch with our team'
      }
    };
    
    // Only cache fallback in production
    if (!isDevelopment) {
      cmsDataCache = fallbackData;
    }
    
    return fallbackData;
  }
}
