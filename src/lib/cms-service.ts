import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  getDocs,
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  CMSConfiguration, 
  DEFAULT_CMS_CONFIG,
  PageContent,
  BusinessSettings,
  PricingSettings,
  PaymentSettings,
  EmailTemplates,
  SMSTemplates,
  DriverSettings,
  AnalyticsSettings,
  BookingFormText
} from '@/types/cms';

// CMS Service for managing all content and settings
export class CMSService {
  private static instance: CMSService;
  private cache: Map<string, { data: CMSConfiguration; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): CMSService {
    if (!CMSService.instance) {
      CMSService.instance = new CMSService();
    }
    return CMSService.instance;
  }

  // Get the main CMS configuration
  async getCMSConfiguration(): Promise<CMSConfiguration> {
    const cacheKey = 'cms-config';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const docRef = doc(db, 'cms', 'configuration');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CMSConfiguration;
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } else {
        // Initialize with default configuration
        await this.initializeCMS();
        return DEFAULT_CMS_CONFIG;
      }
    } catch (error) {
      console.error('Error fetching CMS configuration:', error);
      return DEFAULT_CMS_CONFIG;
    }
  }

  // Update the entire CMS configuration
  async updateCMSConfiguration(config: Partial<CMSConfiguration>): Promise<void> {
    try {
      const docRef = doc(db, 'cms', 'configuration');
      const currentConfig = await this.getCMSConfiguration();
      
      const updatedConfig = {
        ...currentConfig,
        ...config,
        lastUpdated: new Date(),
        version: this.incrementVersion(currentConfig.version)
      };

      await setDoc(docRef, updatedConfig);
      this.cache.delete('cms-config');
    } catch (error) {
      console.error('Error updating CMS configuration:', error);
      throw error;
    }
  }

  // Page Content Management
  async getPageContent(pageId: string): Promise<PageContent | null> {
    try {
      const docRef = doc(db, 'cms', 'pages', pageId, 'content');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as PageContent;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching page content for ${pageId}:`, error);
      return null;
    }
  }

  async updatePageContent(pageId: string, content: Partial<PageContent>): Promise<void> {
    try {
      const docRef = doc(db, 'cms', 'pages', pageId, 'content');
      const currentContent = await this.getPageContent(pageId);
      
      const updatedContent = {
        ...currentContent,
        ...content,
        lastUpdated: new Date()
      };

      await setDoc(docRef, updatedContent);
    } catch (error) {
      console.error(`Error updating page content for ${pageId}:`, error);
      throw error;
    }
  }

  // Business Settings Management
  async getBusinessSettings(): Promise<BusinessSettings> {
    const config = await this.getCMSConfiguration();
    return config.business;
  }

  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      business: { ...config.business, ...settings }
    });
  }

  // Pricing Settings Management
  async getPricingSettings(): Promise<PricingSettings> {
    const config = await this.getCMSConfiguration();
    return config.pricing;
  }

  async updatePricingSettings(settings: Partial<PricingSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      pricing: { ...config.pricing, ...settings }
    });
  }

  // Payment Settings Management
  async getPaymentSettings(): Promise<PaymentSettings> {
    const config = await this.getCMSConfiguration();
    return config.payment;
  }

  async updatePaymentSettings(settings: Partial<PaymentSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      payment: { ...config.payment, ...settings }
    });
  }

  // Email Templates Management
  async getEmailTemplates(): Promise<EmailTemplates> {
    const config = await this.getCMSConfiguration();
    return config.communication.email;
  }

  async updateEmailTemplates(templates: Partial<EmailTemplates>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      communication: {
        ...config.communication,
        email: { ...config.communication.email, ...templates }
      }
    });
  }

  // SMS Templates Management
  async getSMSTemplates(): Promise<SMSTemplates> {
    const config = await this.getCMSConfiguration();
    return config.communication.sms;
  }

  async updateSMSTemplates(templates: Partial<SMSTemplates>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      communication: {
        ...config.communication,
        sms: { ...config.communication.sms, ...templates }
      }
    });
  }

  // Driver Settings Management
  async getDriverSettings(): Promise<DriverSettings> {
    const config = await this.getCMSConfiguration();
    return config.driver;
  }

  async updateDriverSettings(settings: Partial<DriverSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      driver: { ...config.driver, ...settings }
    });
  }

  // Analytics Settings Management
  async getAnalyticsSettings(): Promise<AnalyticsSettings> {
    const config = await this.getCMSConfiguration();
    return config.analytics;
  }

  async updateAnalyticsSettings(settings: Partial<AnalyticsSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      analytics: { ...config.analytics, ...settings }
    });
  }

  // Booking Form Text Management
  async getBookingFormText(): Promise<BookingFormText> {
    const config = await this.getCMSConfiguration();
    return config.bookingForm;
  }

  async updateBookingFormText(text: Partial<BookingFormText>): Promise<void> {
    const config = await this.getCMSConfiguration();
    await this.updateCMSConfiguration({
      ...config,
      bookingForm: { ...config.bookingForm, ...text }
    });
  }

  // Content History and Versioning
  async getContentHistory(pageId?: string): Promise<Array<{ id: string; [key: string]: unknown }>> {
    try {
      const collectionRef = collection(db, 'cms', 'history');
      let q = query(collectionRef, orderBy('timestamp', 'desc'));
      
      if (pageId) {
        q = query(q, where('pageId', '==', pageId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching content history:', error);
      return [];
    }
  }

  // Initialize CMS with default configuration
  private async initializeCMS(): Promise<void> {
    try {
      const docRef = doc(db, 'cms', 'configuration');
      await setDoc(docRef, {
        ...DEFAULT_CMS_CONFIG,
        lastUpdated: serverTimestamp(),
        version: '1.0.0'
      });
    } catch (error) {
      console.error('Error initializing CMS:', error);
      throw error;
    }
  }

  // Utility method to increment version
  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const cmsService = CMSService.getInstance();

// Helper functions for common operations
export async function getCMSConfig(): Promise<CMSConfiguration & { themeColors?: Record<string, string> }> {
  const config = await cmsService.getCMSConfiguration();
  return { ...config, themeColors: config.themeColors };
}

export async function updateCMSConfig(update: Partial<CMSConfiguration> & { themeColors?: Record<string, string> }) {
  await cmsService.updateCMSConfiguration({ ...update, themeColors: update.themeColors });
}
export const getBusinessConfig = () => cmsService.getBusinessSettings();
export const getPricingConfig = () => cmsService.getPricingSettings();
export const getEmailTemplates = () => cmsService.getEmailTemplates();
export const getSMSTemplates = () => cmsService.getSMSTemplates(); 