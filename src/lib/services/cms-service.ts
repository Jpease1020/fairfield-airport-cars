import { db } from '@/lib/utils/firebase-server';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

import { BusinessSettings, PricingSettings, EmailTemplates, SMSTemplates } from '@/types/cms';

// Utility function to recursively convert Firebase objects to plain JavaScript objects
function sanitizeFirebaseData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Firebase Timestamp objects
  if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000).toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirebaseData(item));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeFirebaseData(value);
    }
    return sanitized;
  }
  
  // Return primitives as-is
  return data;
}

// Simplified CMS Service that uses only the consolidated Firebase data route
export class CMSFlattenedService {
  private static instance: CMSFlattenedService;

  static getInstance(): CMSFlattenedService {
    if (!CMSFlattenedService.instance) {
      CMSFlattenedService.instance = new CMSFlattenedService();
    }
    return CMSFlattenedService.instance;
  }

  // Get page content directly from Firebase
  async getPageContent(pageType: string): Promise<any | null> {
    try {
      const docRef = doc(db, 'cms', pageType);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const pageData = docSnap.data();
        // Remove metadata if present and sanitize Firebase objects
        const { _metadata, ...cleanData } = pageData;
        return sanitizeFirebaseData(cleanData);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting page content for ${pageType}:`, error);
      return null;
    }
  }

  // Get business settings directly
  async getBusinessSettings(): Promise<BusinessSettings | null> {
    try {
      const docRef = doc(db, 'cms', 'business');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const businessData = docSnap.data();
        const { _metadata, ...cleanData } = businessData;
        return sanitizeFirebaseData(cleanData) as BusinessSettings;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting business settings:', error);
      return null;
    }
  }

  // Get pricing settings directly
  async getPricingSettings(): Promise<PricingSettings | null> {
    try {
      const docRef = doc(db, 'cms', 'pricing');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const pricingData = docSnap.data();
        const { _metadata, ...cleanData } = pricingData;
        return sanitizeFirebaseData(cleanData) as PricingSettings;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting pricing settings:', error);
      return null;
    }
  }

  // Get email templates directly
  async getEmailTemplates(): Promise<EmailTemplates | null> {
    try {
      const docRef = doc(db, 'cms', 'communication');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const commData = docSnap.data();
        const { _metadata, ...cleanData } = commData;
        return sanitizeFirebaseData(cleanData?.email) || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting email templates:', error);
      return null;
    }
  }

  // Get SMS templates directly
  async getSMSTemplates(): Promise<SMSTemplates | null> {
    try {
      const docRef = doc(db, 'cms', 'communication');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const commData = docSnap.data();
        const { _metadata, ...cleanData } = commData;
        return sanitizeFirebaseData(cleanData?.sms) || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting SMS templates:', error);
      return null;
    }
  }

  // Update page content directly
  async updatePageContent(
    pageType: string,
    content: any,
    userId?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Prepare metadata
      const metadata = {
        _metadata: {
          lastUpdated: new Date().toISOString(),
          updatedBy: userId || 'unknown',
          version: '1.0'
        }
      };

      // Save to Firebase
      const docRef = doc(db, 'cms', pageType);
      await setDoc(docRef, { ...content, ...metadata }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error(`Error updating page content for ${pageType}:`, error);
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }

  // Get all CMS data directly from Firestore
  async getAllCMSData(): Promise<Record<string, any>> {
    try {
      // Get all documents from the cms collection directly
      const { collection, getDocs } = await import('firebase/firestore');
      const cmsCollection = collection(db, 'cms');
      const querySnapshot = await getDocs(cmsCollection);
      
      const allData: Record<string, any> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { _metadata, ...cleanData } = data;
        allData[doc.id] = sanitizeFirebaseData(cleanData);
      });
      
      return allData;
      
    } catch (error) {
      console.error('Error getting all CMS data:', error);
      return {};
    }
  }

  // Real-time subscription for page updates
  subscribeToPageUpdates(pageType: string, callback: (data: any) => void): () => void {
    const docRef = doc(db, 'cms', pageType);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const { _metadata, ...cleanData } = data;
        callback(sanitizeFirebaseData(cleanData));
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`CMS subscription error for ${pageType}:`, error);
    });
  }

  // Real-time subscription for settings updates
  subscribeToSettingsUpdates(settingType: string, callback: (data: any) => void): () => void {
    const docRef = doc(db, 'cms', settingType);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const { _metadata, ...cleanData } = data;
        callback(sanitizeFirebaseData(cleanData));
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`CMS subscription error for ${settingType}:`, error);
    });
  }

  // Migration helper - check if migration is needed
  async checkMigrationStatus(): Promise<{
    needsMigration: boolean;
    currentStructure: 'nested' | 'flattened' | 'unknown';
    details: string;
  }> {
    try {
      // Check if old nested structure exists
      const oldConfigRef = doc(db, 'cms', 'configuration');
      const oldConfigSnap = await getDoc(oldConfigRef);
      
      // Check if new flattened structure exists
      const homeRef = doc(db, 'cms', 'home');
      const homeSnap = await getDoc(homeRef);
      
      if (oldConfigSnap.exists() && !homeSnap.exists()) {
        return {
          needsMigration: true,
          currentStructure: 'nested',
          details: 'Found old nested configuration structure, needs migration to flattened pages'
        };
      } else if (homeSnap.exists()) {
        return {
          needsMigration: false,
          currentStructure: 'flattened',
          details: 'Found new flattened page structure, no migration needed'
        };
      } else {
        return {
          needsMigration: false,
          currentStructure: 'unknown',
          details: 'No CMS structure found, starting fresh'
        };
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      return {
        needsMigration: false,
        currentStructure: 'unknown',
        details: 'Error checking migration status'
      };
    }
  }
}

// Export singleton instance
export const cmsFlattenedService = CMSFlattenedService.getInstance();
