import { db } from './firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { CMSConfiguration } from '@/types/cms';
import { BusinessSettings, PricingSettings, EmailTemplates, SMSTemplates } from '@/types/cms';
import { ContentValidator } from './content-validation';
import { VersionControl } from './version-control';
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
      const docRef = doc(db, 'cms', 'configuration');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as CMSConfiguration;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting CMS configuration:', error as Error);
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
      await this.updateCMSConfiguration({
        ...config,
        communication: {
          ...config.communication,
          email: { ...config.communication.email, ...templates }
        }
      });
    }
  }

  async updateSMSTemplates(templates: Partial<SMSTemplates>): Promise<void> {
    const config = await this.getCMSConfiguration();
    if (config) {
      await this.updateCMSConfiguration({
        ...config,
        communication: {
          ...config.communication,
          sms: { ...config.communication.sms, ...templates }
        }
      });
    }
  }

  async updateCMSConfiguration(
    updates: Partial<CMSConfiguration>,
    userId?: string,
    userEmail?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Validate user permissions
      if (userId) {
        const canEdit = await authService.canEdit(userId);
        if (!canEdit) {
          return { success: false, errors: ['Insufficient permissions'] };
        }
      }

      // Validate content before saving
      const validationResults = await this.validateContent(updates);
      
      if (!validationResults.isValid) {
        return {
          success: false,
          errors: validationResults.errors.map(error =>
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message: string }).message
              : String(error)
          )
        };
      }

      // Save versions for each changed field
      const currentConfig = await this.getCMSConfiguration();
      if (currentConfig && userId && userEmail) {
        await this.saveVersionsForChanges(currentConfig, updates, userId, userEmail);
      }

      // Update the configuration
      const docRef = doc(db, 'cms', 'configuration');
      await updateDoc(docRef, updates);

      // Log activity
      if (userId) {
        await authService.logUserActivity(userId, 'cms_update', {
          changes: Object.keys(updates),
          timestamp: new Date()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating CMS configuration:', error as Error);
      return { success: false, errors: ['Failed to update configuration'] };
    }
  }

  async updatePageContent(
    pageType: string,
    content: any,
    userId?: string,
    userEmail?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Validate user permissions
      if (userId) {
        const canEdit = await authService.canEdit(userId);
        if (!canEdit) {
          return { success: false, errors: ['Insufficient permissions'] };
        }
      }

      // Validate page-specific content
      const validation = ContentValidator.validatePageContent(pageType, content);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors.map(error => error.message)
        };
      }

      // Get current content for versioning
      const currentConfig = await this.getCMSConfiguration();
      const currentContent = (currentConfig?.pages as any)?.[pageType];

      // Save versions for changes
      if (currentContent && userId && userEmail) {
        await this.saveVersionsForPageChanges(
          pageType,
          currentContent as unknown,
          validation.sanitizedContent,
          userId,
          userEmail
        );
      }

      // Update the configuration
      const docRef = doc(db, 'cms', 'configuration');
      await updateDoc(docRef, {
        [`pages.${pageType}`]: validation.sanitizedContent
      });

      // Log activity
      if (userId) {
        await authService.logUserActivity(userId, 'page_update', {
          pageType,
          changes: Object.keys(validation.sanitizedContent),
          timestamp: new Date()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating page content:', error as Error);
      return { success: false, errors: ['Failed to update page content'] };
    }
  }

  private async validateContent(
    content: Partial<CMSConfiguration>
  ): Promise<{ isValid: boolean; errors: unknown[] }> {
    const errors: unknown[] = [];

    // Validate pages
    if (content.pages) {
      for (const [pageType, pageContent] of Object.entries(content.pages)) {
        const validation = ContentValidator.validatePageContent(pageType, pageContent as unknown);
        errors.push(...validation.errors);
      }
    }

    // Validate business settings
    if (content.business) {
      const businessValidation = ContentValidator.validateContent(content.business as Record<string, any>);
      errors.push(...businessValidation.errors);
    }

    // Validate pricing settings
    if (content.pricing) {
      const pricingValidation = ContentValidator.validateContent(content.pricing as Record<string, any>);
      errors.push(...pricingValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async saveVersionsForChanges(
    currentConfig: CMSConfiguration,
    updates: Partial<CMSConfiguration>,
    userId: string,
    userEmail: string
  ): Promise<void> {
    // Save versions for page changes
    if (updates.pages) {
      for (const [pageType, pageContent] of Object.entries(updates.pages)) {
        const currentPageContent = (currentConfig.pages as any)?.[pageType];
        if (currentPageContent) {
          await this.saveVersionsForPageChanges(
            pageType,
            currentPageContent as unknown,
            pageContent as unknown,
            userId,
            userEmail
          );
        }
      }
    }

    // Save versions for other changes
    if (updates.business && currentConfig.business) {
      await this.saveVersionsForObjectChanges(
        'business',
        currentConfig.business as unknown,
        updates.business as unknown,
        userId,
        userEmail
      );
    }

    if (updates.pricing && currentConfig.pricing) {
      await this.saveVersionsForObjectChanges(
        'pricing',
        currentConfig.pricing as unknown,
        updates.pricing as unknown,
        userId,
        userEmail
      );
    }
  }

  private async saveVersionsForPageChanges(
    pageType: string,
    oldContent: unknown,
    newContent: unknown,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const changes = this.detectObjectChanges(
      oldContent as Record<string, unknown>,
      newContent as Record<string, unknown>
    );
    
    for (const change of changes) {
      await VersionControl.saveVersion(
        pageType,
        change.field,
        change.oldValue,
        change.newValue,
        userId,
        userEmail,
        `Updated ${pageType} ${change.field}`
      );
    }
  }

  private async saveVersionsForObjectChanges(
    objectType: string,
    oldObject: unknown,
    newObject: unknown,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const changes = this.detectObjectChanges(
      oldObject as Record<string, unknown>,
      newObject as Record<string, unknown>
    );
    
    for (const change of changes) {
      await VersionControl.saveVersion(
        objectType,
        change.field,
        change.oldValue,
        change.newValue,
        userId,
        userEmail,
        `Updated ${objectType} ${change.field}`
      );
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
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as CMSConfiguration);
      }
    });
  }
}

export const cmsService = CMSService.getInstance(); 