import { db } from '@/lib/utils/firebase-server';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { CMSConfiguration } from '@/types/cms';
import { BusinessSettings, PricingSettings, EmailTemplates, SMSTemplates } from '@/types/cms';
import { authService } from '@/lib/services/auth-service';

// Updated CMS Service for Flattened Structure
export class CMSFlattenedService {
  private static instance: CMSFlattenedService;
  private currentUser: any = null;

  static getInstance(): CMSFlattenedService {
    if (!CMSFlattenedService.instance) {
      CMSFlattenedService.instance = new CMSFlattenedService();
    }
    return CMSFlattenedService.instance;
  }

  // Get page content directly from flattened structure
  async getPageContent(pageType: string): Promise<any | null> {
    try {
      const docRef = doc(db, 'cms', pageType);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const pageData = docSnap.data();
        // Remove metadata if present
        const { _metadata, ...cleanData } = pageData;
        return cleanData;
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
        return cleanData as BusinessSettings;
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
        return cleanData as PricingSettings;
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
        return cleanData?.email || null;
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
        return cleanData?.sms || null;
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
      console.log(`Updating page content for: ${pageType}`);
      
      // Validate user permissions
      if (userId) {
        console.log('User editing CMS (page):', userId);
      }

      // Get current page content for merging
      const currentContent = await this.getPageContent(pageType);
      
      // Merge new content with existing
      const mergedContent = {
        ...currentContent,
        ...content,
        lastUpdated: new Date()
      };

      // Update the page document directly
      const docRef = doc(db, 'cms', pageType);
      await setDoc(docRef, mergedContent, { merge: true });
      
      // Log activity
      if (userId) {
        try {
          await authService.logUserActivity(userId, 'page_update', {
            pageType,
            changes: Object.keys(content),
            timestamp: new Date()
          });
        } catch (logError) {
          console.warn('Failed to log user activity:', logError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating page content:', error);
      return { success: false, errors: [(error as Error).message] };
    }
  }

  // Update business settings directly
  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<void> {
    try {
      const currentSettings = await this.getBusinessSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date()
      };

      const docRef = doc(db, 'cms', 'business');
      await setDoc(docRef, updatedSettings, { merge: true });
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }

  // Update pricing settings directly
  async updatePricingSettings(settings: Partial<PricingSettings>): Promise<void> {
    try {
      const currentSettings = await this.getPricingSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date()
      };

      const docRef = doc(db, 'cms', 'pricing');
      await setDoc(docRef, updatedSettings, { merge: true });
    } catch (error) {
      console.error('Error updating pricing settings:', error);
      throw error;
    }
  }

  // Update email templates directly
  async updateEmailTemplates(templates: Partial<EmailTemplates>): Promise<void> {
    try {
      const currentComm = await this.getCommunicationSettings();
      const currentEmail = currentComm?.email || {};
      
      const mergedEmail: EmailTemplates = {
        bookingConfirmation: { subject: '', body: '', includeCalendarInvite: false },
        bookingReminder: { subject: '', body: '', sendHoursBefore: 24 },
        cancellation: { subject: '', body: '' },
        feedback: { subject: '', body: '', sendDaysAfter: 7 },
        ...currentEmail,
        ...templates
      };

      const updatedComm = {
        ...currentComm,
        email: mergedEmail,
        lastUpdated: new Date()
      };

      const docRef = doc(db, 'cms', 'communication');
      await setDoc(docRef, updatedComm, { merge: true });
    } catch (error) {
      console.error('Error updating email templates:', error);
      throw error;
    }
  }

  // Update SMS templates directly
  async updateSMSTemplates(templates: Partial<SMSTemplates>): Promise<void> {
    try {
      const currentComm = await this.getCommunicationSettings();
      const currentSMS = currentComm?.sms || {};
      
      const mergedSMS: SMSTemplates = {
        bookingConfirmation: '',
        bookingReminder: '',
        driverEnRoute: '',
        driverArrived: '',
        ...currentSMS,
        ...templates
      };

      const updatedComm = {
        ...currentComm,
        sms: mergedSMS,
        lastUpdated: new Date()
      };

      const docRef = doc(db, 'cms', 'communication');
      await setDoc(docRef, updatedComm, { merge: true });
    } catch (error) {
      console.error('Error updating SMS templates:', error);
      throw error;
    }
  }

  // Get communication settings
  async getCommunicationSettings(): Promise<any | null> {
    try {
      const docRef = doc(db, 'cms', 'communication');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const commData = docSnap.data();
        const { _metadata, ...cleanData } = commData;
        return cleanData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting communication settings:', error);
      return null;
    }
  }

  // Get all CMS data for admin purposes
  async getAllCMSData(): Promise<Record<string, any>> {
    try {
      const pages = ['home', 'help', 'about', 'contact', 'privacy', 'terms'];
      const settings = ['business', 'pricing', 'communication'];
      
      const allData: Record<string, any> = {};
      
      // Get page data
      for (const page of pages) {
        const pageData = await this.getPageContent(page);
        if (pageData) {
          allData[page] = pageData;
        }
      }
      
      // Get settings data
      for (const setting of settings) {
        const settingData = await this.getPageContent(setting);
        if (settingData) {
          allData[setting] = settingData;
        }
      }
      
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
        callback(cleanData);
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
        callback(cleanData);
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
          details: 'Data exists in old nested structure but new flattened structure is empty'
        };
      } else if (homeSnap.exists() && oldConfigSnap.exists()) {
        return {
          needsMigration: false,
          currentStructure: 'flattened',
          details: 'Both structures exist - migration completed but old structure not cleaned up'
        };
      } else if (homeSnap.exists() && !oldConfigSnap.exists()) {
        return {
          needsMigration: false,
          currentStructure: 'flattened',
          details: 'New flattened structure is active, old structure removed'
        };
      } else {
        return {
          needsMigration: false,
          currentStructure: 'unknown',
          details: 'No CMS data found in either structure'
        };
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      return {
        needsMigration: false,
        currentStructure: 'unknown',
        details: `Error checking status: ${error}`
      };
    }
  }
}

export const cmsFlattenedService = CMSFlattenedService.getInstance();

// Legacy compatibility functions (will be removed after migration)
export async function getCMSConfig(): Promise<CMSConfiguration & { themeColors?: Record<string, string> }> {
  const service = CMSFlattenedService.getInstance();
  const allData = await service.getAllCMSData();
  
  // Reconstruct old structure for compatibility
  const legacyConfig: any = {
    pages: {},
    business: allData.business,
    pricing: allData.pricing,
    communication: allData.communication
  };
  
  // Add pages
  ['home', 'help', 'about', 'contact', 'privacy', 'terms'].forEach(page => {
    if (allData[page]) {
      legacyConfig.pages[page] = allData[page];
    }
  });
  
  return legacyConfig;
}

export const getBusinessConfig = () => cmsFlattenedService.getBusinessSettings();
export const getPricingConfig = () => cmsFlattenedService.getPricingSettings();
export const getEmailTemplates = () => cmsFlattenedService.getEmailTemplates();
export const getSMSTemplates = () => cmsFlattenedService.getSMSTemplates();
