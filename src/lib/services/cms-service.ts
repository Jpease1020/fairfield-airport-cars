import { getStaticCmsData, getStaticCmsPage, isStaticCmsSource } from './cms-source';

// Types removed - using any for flexibility

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

async function getFirestoreDb() {
  const { db } = await import('@/lib/utils/firebase-server');
  return db;
}

async function getDocById(documentId: string): Promise<any | null> {
  const db = await getFirestoreDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'cms', documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const pageData = docSnap.data();
  const { _metadata, ...cleanData } = pageData;
  return sanitizeFirebaseData(cleanData);
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
    if (isStaticCmsSource()) {
      return getStaticCmsPage(pageType);
    }

    try {
      return await getDocById(pageType);
    } catch (error) {
      console.error(`Error getting page content for ${pageType}:`, error);
      return null;
    }
  }

  // Get business settings directly
  async getBusinessSettings(): Promise<any | null> {
    if (isStaticCmsSource()) {
      return getStaticCmsPage('business');
    }

    try {
      return await getDocById('business');
    } catch (error) {
      console.error('Error getting business settings:', error);
      return null;
    }
  }

  // Get pricing settings directly
  async getPricingSettings(): Promise<any | null> {
    if (isStaticCmsSource()) {
      return getStaticCmsPage('pricing');
    }

    try {
      return await getDocById('pricing');
    } catch (error) {
      console.error('Error getting pricing settings:', error);
      return null;
    }
  }

  // Get email templates directly
  async getEmailTemplates(): Promise<any | null> {
    if (isStaticCmsSource()) {
      const communication = getStaticCmsPage('communication');
      return communication?.email ?? null;
    }

    try {
      const commData = await getDocById('communication');
      return sanitizeFirebaseData(commData?.email) || null;
    } catch (error) {
      console.error('Error getting email templates:', error);
      return null;
    }
  }

  // Get SMS templates directly
  async getSMSTemplates(): Promise<any | null> {
    if (isStaticCmsSource()) {
      const communication = getStaticCmsPage('communication');
      return communication?.sms ?? null;
    }

    try {
      const commData = await getDocById('communication');
      return sanitizeFirebaseData(commData?.sms) || null;
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
    if (isStaticCmsSource()) {
      return {
        success: false,
        errors: ['CMS is in static read-only mode. Content updates are disabled.'],
      };
    }

    try {
      const db = await getFirestoreDb();
      const { doc, setDoc } = await import('firebase/firestore');

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

  // Update a specific field in CMS data
  async updateField(fieldPath: string, value: string): Promise<void> {
    if (isStaticCmsSource()) {
      throw new Error('CMS is in static read-only mode. Field updates are disabled.');
    }

    try {
      const db = await getFirestoreDb();
      const { doc, getDoc, setDoc } = await import('firebase/firestore');

      // Parse the field path to determine which document to update
      const pathParts = fieldPath.split('.');
      const pageType = pathParts[0]; // e.g., 'home', 'about', etc.

      // Get the current document
      const docRef = doc(db, 'cms', pageType);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`CMS page '${pageType}' not found`);
      }

      const currentData = docSnap.data();

      // Update the nested field
      let current = currentData;
      for (let i = 1; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;

      // Save the updated document
      await setDoc(docRef, currentData, { merge: true });
    } catch (error) {
      console.error(`Error updating field ${fieldPath}:`, error);
      throw error;
    }
  }

  // Get all CMS data directly from Firestore
  async getAllCMSData(): Promise<Record<string, any>> {
    if (isStaticCmsSource()) {
      return getStaticCmsData();
    }

    try {
      const db = await getFirestoreDb();
      const { collection, getDocs } = await import('firebase/firestore');

      // Get all documents from the cms collection directly
      const cmsCollection = collection(db, 'cms');
      const querySnapshot = await getDocs(cmsCollection);

      const allData: Record<string, any> = {};

      querySnapshot.forEach((pageDoc) => {
        const data = pageDoc.data();
        const { _metadata, ...cleanData } = data;
        allData[pageDoc.id] = sanitizeFirebaseData(cleanData);
      });

      return allData;
    } catch (error) {
      console.error('Error getting all CMS data:', error);
      return {};
    }
  }

  // Real-time subscription for page updates
  subscribeToPageUpdates(pageType: string, callback: (data: any) => void): () => void {
    if (isStaticCmsSource()) {
      callback(getStaticCmsPage(pageType));
      return () => {};
    }

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const db = await getFirestoreDb();
        const { doc, onSnapshot } = await import('firebase/firestore');
        const docRef = doc(db, 'cms', pageType);

        unsubscribe = onSnapshot(docRef, (pageDoc) => {
          if (pageDoc.exists()) {
            const data = pageDoc.data();
            const { _metadata, ...cleanData } = data;
            callback(sanitizeFirebaseData(cleanData));
          } else {
            callback(null);
          }
        }, (error) => {
          console.error(`CMS subscription error for ${pageType}:`, error);
        });
      } catch (error) {
        console.error(`Error subscribing to CMS updates for ${pageType}:`, error);
        callback(null);
      }
    })();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  // Real-time subscription for settings updates
  subscribeToSettingsUpdates(settingType: string, callback: (data: any) => void): () => void {
    if (isStaticCmsSource()) {
      callback(getStaticCmsPage(settingType));
      return () => {};
    }

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const db = await getFirestoreDb();
        const { doc, onSnapshot } = await import('firebase/firestore');
        const docRef = doc(db, 'cms', settingType);

        unsubscribe = onSnapshot(docRef, (settingsDoc) => {
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            const { _metadata, ...cleanData } = data;
            callback(sanitizeFirebaseData(cleanData));
          } else {
            callback(null);
          }
        }, (error) => {
          console.error(`CMS subscription error for ${settingType}:`, error);
        });
      } catch (error) {
        console.error(`Error subscribing to CMS settings updates for ${settingType}:`, error);
        callback(null);
      }
    })();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  // Migration helper - check if migration is needed
  async checkMigrationStatus(): Promise<{
    needsMigration: boolean;
    currentStructure: 'nested' | 'flattened' | 'unknown';
    details: string;
  }> {
    if (isStaticCmsSource()) {
      return {
        needsMigration: false,
        currentStructure: 'flattened',
        details: 'Static CMS source enabled; migration checks are not applicable',
      };
    }

    try {
      const db = await getFirestoreDb();
      const { doc, getDoc } = await import('firebase/firestore');

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
      }

      if (homeSnap.exists()) {
        return {
          needsMigration: false,
          currentStructure: 'flattened',
          details: 'Found new flattened page structure, no migration needed'
        };
      }

      return {
        needsMigration: false,
        currentStructure: 'unknown',
        details: 'No CMS structure found, starting fresh'
      };
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
