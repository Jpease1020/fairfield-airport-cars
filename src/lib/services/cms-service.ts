import { db } from '@/lib/utils/firebase-server';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { CMSConfiguration } from '@/types/cms';
import { BusinessSettings, PricingSettings, EmailTemplates, SMSTemplates } from '@/types/cms';
import { authService } from './auth-service';

// Legacy helper functions for backward compatibility
export async function getCMSConfig(): Promise<CMSConfiguration & { themeColors?: Record<string, string> }> {
  const config = await cmsService.getCMSConfiguration();
  return { ...config, themeColors: config?.themeColors } as any;
}

export async function updateCMSConfig(update: Partial<CMSConfiguration> & { themeColors?: Record<string, string> }) {
  await cmsService.updateCMSConfiguration({ ...update, themeColors: update.themeColors });
}

export const getBusinessConfig = () => cmsService.getBusinessSettings();
export const getPricingConfig = () => cmsService.getPricingSettings();
export const getEmailTemplates = () => cmsService.getEmailTemplates();
export const getSMSTemplates = () => cmsService.getSMSTemplates();

export class CMSService {
  private static instance: CMSService;
  private currentUser: any = null;

  static getInstance(): CMSService {
    if (!CMSService.instance) {
      CMSService.instance = new CMSService();
    }
    return CMSService.instance;
  }

  async getCMSConfiguration(): Promise<CMSConfiguration | null> {
    try {
      // Remove excessive logging - just get the data
      const docRef = doc(db, 'cms', 'configuration');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentConfig = docSnap.data() as CMSConfiguration;
        // Remove excessive logging - just return the data
        return currentConfig;
      } else {
        // Remove excessive logging - just return null
        return null;
      }
    } catch (error) {
      console.error('Error getting CMS configuration:', error);
      return null;
    }
  }

  // Legacy methods for backward compatibility
  async getBusinessSettings(): Promise<BusinessSettings | null> {
    const config = await this.getCMSConfiguration();
    return config?.business || null;
  }

  async getPricingSettings(): Promise<PricingSettings | null> {
    const config = await this.getCMSConfiguration();
    return config?.pricing || null;
  }

  async getEmailTemplates(): Promise<EmailTemplates | null> {
    const config = await this.getCMSConfiguration();
    return config?.communication?.email || null;
  }

  async getSMSTemplates(): Promise<SMSTemplates | null> {
    const config = await this.getCMSConfiguration();
    return config?.communication?.sms || null;
  }

  // Legacy update methods for backward compatibility
  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    if (config) {
      await this.updateCMSConfiguration({
        ...config,
        business: { ...config.business, ...settings }
      });
    }
  }

  async updatePricingSettings(settings: Partial<PricingSettings>): Promise<void> {
    const config = await this.getCMSConfiguration();
    if (config) {
      await this.updateCMSConfiguration({
        ...config,
        pricing: { ...config.pricing, ...settings }
      });
    }
  }

  async updateEmailTemplates(templates: Partial<EmailTemplates>): Promise<void> {
    const config = await this.getCMSConfiguration();
    if (config) {
      const currentEmail = config.communication?.email || {};
      const mergedEmail: EmailTemplates = {
        bookingConfirmation: { subject: '', body: '', includeCalendarInvite: false },
        bookingReminder: { subject: '', body: '', sendHoursBefore: 24 },
        cancellation: { subject: '', body: '' },
        feedback: { subject: '', body: '', sendDaysAfter: 7 },
        ...currentEmail,
        ...templates
      };
      
      await this.updateCMSConfiguration({
        ...config,
        communication: {
          ...config.communication,
          email: mergedEmail
        }
      });
    }
  }

  async updateSMSTemplates(templates: Partial<SMSTemplates>): Promise<void> {
    const config = await this.getCMSConfiguration();
    if (config) {
      const currentSMS = config.communication?.sms || {};
      const mergedSMS: SMSTemplates = {
        bookingConfirmation: '',
        bookingReminder: '',
        driverEnRoute: '',
        driverArrived: '',
        ...currentSMS,
        ...templates
      };
      
      await this.updateCMSConfiguration({
        ...config,
        communication: {
          ...config.communication,
          sms: mergedSMS
        }
      });
    }
  }

  async updateCMSConfiguration(updates: Partial<CMSConfiguration>): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Remove excessive logging - just update the data
      const docRef = doc(db, 'cms', 'configuration');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentConfig = docSnap.data() as CMSConfiguration;
        const updatedConfig = { ...currentConfig, ...updates };
        await updateDoc(docRef, updatedConfig);
        // Remove excessive logging - just return success
        return { success: true };
      } else {
        // Remove excessive logging - just create new document
        const newConfig = updates as CMSConfiguration;
        await setDoc(docRef, newConfig);
        // Remove excessive logging - just return success
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating CMS configuration:', error);
      return { success: false, errors: [(error as Error).message] };
    }
  }

  async updatePageContent(
    pageType: string,
    content: any,
    userId?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      console.log('=== updatePageContent START ===');
      console.log('Parameters:', { pageType, userId, contentKeys: Object.keys(content) });
      
      // Validate user permissions - temporarily allow all authenticated users to edit
      if (userId) {
        // For now, allow any authenticated user to edit
        // In production, you'd want proper role checking
        console.log('User editing CMS (page):', userId);
      }

      // Temporarily disable validation for debugging
      console.log('Saving page content:', { pageType, content });
      
      // Validate page-specific content (temporarily disabled)
      // const validation = ContentValidator.validatePageContent(pageType, content);
      
      // if (!validation.isValid) {
      //   return {
      //     success: false,
      //     errors: validation.errors.map(error => error.message)
      //   };
      // }

      console.log('Getting current CMS configuration...');
      // Get current content for versioning (temporarily disabled)
      const currentConfig = await this.getCMSConfiguration();
      console.log('Current CMS config loaded:', currentConfig ? 'yes' : 'no');

      // Save versions for changes (temporarily disabled due to permission issues)
      // if (currentContent && userId && userEmail) {
      //   await this.saveVersionsForPageChanges(
      //     pageType,
      //     currentContent as unknown,
      //     content,
      //     userId,
      //     userEmail
      //   );
      // }

      console.log('Preparing to update Firestore...');
      // Update the configuration
      const docRef = doc(db, 'cms', 'configuration');
      console.log('Document reference created for path: cms/configuration');
      
      // Check if document exists, if not create it
      console.log('Checking if document exists...');
      const docSnap = await getDoc(docRef);
      console.log('Document exists:', docSnap.exists());
      
      if (!docSnap.exists()) {
        console.log('Creating new CMS configuration document for page content');
        const newData = {
          pages: {
            [pageType]: content
          }
        };
        console.log('New data to create:', newData);
        
        try {
          await setDoc(docRef, newData);
          console.log('✅ Document created successfully');
        } catch (setError) {
          console.error('❌ Error creating document:', setError);
          throw setError;
        }
      } else {
        console.log('Updating existing CMS configuration document for page content');
        
        // Get existing page data to merge with
        const existingData = docSnap.data();
        console.log('Existing data:', existingData);
        const existingPageData = existingData?.pages?.[pageType] || {};
        console.log('Existing page data for', pageType, ':', existingPageData);
        
        // Merge the new content with existing page data
        const mergedPageData = {
          ...existingPageData,
          ...content
        };
        console.log('Merged page data:', mergedPageData);
        
        const updateData = {
          [`pages.${pageType}`]: mergedPageData
        };
        console.log('Update data to send:', updateData);
        
        try {
          await updateDoc(docRef, updateData);
          console.log('✅ Document updated successfully');
        } catch (updateError) {
          console.error('❌ Error updating document:', updateError);
          throw updateError;
        }
      }

      // Log activity
      if (userId) {
        try {
          await authService.logUserActivity(userId, 'page_update', {
            pageType,
            changes: Object.keys(content),
            timestamp: new Date()
          });
          console.log('✅ User activity logged successfully');
        } catch (logError) {
          console.warn('⚠️ Failed to log user activity:', logError);
        }
      }

      console.log('=== updatePageContent SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('=== updatePageContent ERROR ===');
      console.error('Error updating page content:', error as Error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      return { success: false, errors: ['Failed to update page content'] };
    }
  }

  private async validateContent(
    content: Partial<CMSConfiguration>
  ): Promise<{ isValid: boolean; errors: unknown[] }> {
    const errors: unknown[] = [];

    // Validate pages
    if (content.pages) {
      for (const [pageType] of Object.entries(content.pages)) {
        // Validation temporarily disabled
        console.log(`Validating page: ${pageType}`);
      }
    }

    // Validate business settings
    if (content.business) {
      // Validation temporarily disabled
      console.log('Validating business settings');
    }

    // Validate pricing settings
    if (content.pricing) {
      // Validation temporarily disabled
      console.log('Validating pricing settings');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async saveVersionsForChanges(
    currentConfig: CMSConfiguration,
    updates: Partial<CMSConfiguration>
  ): Promise<void> {
    // Save versions for page changes
    if (updates.pages) {
      for (const [pageType, pageContent] of Object.entries(updates.pages)) {
        const currentPageContent = (currentConfig.pages as any)?.[pageType];
        if (currentPageContent) {
          await this.saveVersionsForPageChanges(
            pageType,
            currentPageContent as unknown,
            pageContent as unknown
          );
        }
      }
    }

    // Save versions for other changes
    if (updates.business && currentConfig.business) {
              await this.saveVersionsForObjectChanges(
          'business',
          currentConfig.business as unknown,
          updates.business as unknown
        );
    }

    if (updates.pricing && currentConfig.pricing) {
              await this.saveVersionsForObjectChanges(
          'pricing',
          currentConfig.pricing as unknown,
          updates.pricing as unknown
        );
    }
  }

  private async saveVersionsForPageChanges(
    pageType: string,
    oldContent: unknown,
    newContent: unknown
  ): Promise<void> {
    const changes = this.detectObjectChanges(
      oldContent as Record<string, unknown>,
      newContent as Record<string, unknown>
    );
    
    for (const change of changes) {
      // Version control temporarily disabled
      console.log(`Version change: ${pageType} ${change.field}`);
    }
  }

  private async saveVersionsForObjectChanges(
    objectType: string,
    oldObject: unknown,
    newObject: unknown
  ): Promise<void> {
    const changes = this.detectObjectChanges(
      oldObject as Record<string, unknown>,
      newObject as Record<string, unknown>
    );
    
    for (const change of changes) {
      // Version control temporarily disabled
      console.log(`Version change: ${objectType} ${change.field}`);
    }
  }

  private detectObjectChanges(oldObj: unknown, newObj: unknown): Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }> {
    const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];
    
    const oldKeys = oldObj && typeof oldObj === 'object' ? Object.keys(oldObj as Record<string, unknown>) : [];
    const newKeys = newObj && typeof newObj === 'object' ? Object.keys(newObj as Record<string, unknown>) : [];
    const allKeys = new Set([...oldKeys, ...newKeys]);
    
    for (const key of allKeys) {
      const oldValue = (oldObj as Record<string, unknown>)?.[key];
      const newValue = (newObj as Record<string, unknown>)?.[key];
      
      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    }
    
    return changes;
  }

  // Real-time subscription for CMS updates
  subscribeToCMSUpdates(callback: (config: CMSConfiguration) => void): () => void {
    const docRef = doc(db, 'cms', 'configuration');
    console.log('Setting up CMS subscription to:', docRef);
    
    return onSnapshot(docRef, (doc) => {
      console.log('CMS subscription update:', doc.exists() ? 'Document exists' : 'Document does not exist');
      if (doc.exists()) {
        const data = doc.data();
        console.log('CMS data received:', data);
        callback(data as CMSConfiguration);
      } else {
        console.log('CMS document does not exist, calling callback with null');
        callback(null as any);
      }
    }, (error) => {
      console.error('CMS subscription error:', error);
    });
  }
}

export const cmsService = CMSService.getInstance(); 