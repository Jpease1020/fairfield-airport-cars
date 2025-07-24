import { db } from '../utils/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export interface ContentVersion {
  id: string;
  pageType: string;
  field: string;
  oldValue: any;
  newValue: any;
  author: string;
  authorEmail: string;
  timestamp: Date;
  changes: string[];
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  comment?: string;
}

export interface VersionMetadata {
  versionId: string;
  pageType: string;
  field: string;
  timestamp: Date;
  author: string;
  summary: string;
}

export class VersionControl {
  private static readonly VERSIONS_COLLECTION = 'content-versions';
  private static readonly MAX_VERSIONS_PER_FIELD = 50;

  static async saveVersion(
    pageType: string,
    field: string,
    oldValue: any,
    newValue: any,
    author: string,
    authorEmail: string,
    comment?: string
  ): Promise<string> {
    try {
      const changes = this.detectChanges(oldValue, newValue);
      
      const version: Omit<ContentVersion, 'id'> = {
        pageType,
        field,
        oldValue,
        newValue,
        author,
        authorEmail,
        timestamp: new Date(),
        changes,
        approved: false,
        comment
      };

      const docRef = await addDoc(collection(db, this.VERSIONS_COLLECTION), version);
      
      // Clean up old versions to prevent database bloat
      await this.cleanupOldVersions(pageType, field);
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving version:', error);
      throw new Error('Failed to save version');
    }
  }

  static async getVersions(
    pageType: string,
    field: string,
    limitCount: number = 10
  ): Promise<ContentVersion[]> {
    try {
      const q = query(
        collection(db, this.VERSIONS_COLLECTION),
        where('pageType', '==', pageType),
        where('field', '==', field),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentVersion[];
    } catch (error) {
      console.error('Error getting versions:', error);
      return [];
    }
  }

  static async getVersion(versionId: string): Promise<ContentVersion | null> {
    try {
      const docRef = doc(db, this.VERSIONS_COLLECTION, versionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ContentVersion;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting version:', error);
      return null;
    }
  }

  static async approveVersion(
    versionId: string,
    approvedBy: string
  ): Promise<boolean> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Update the version to approved
      await addDoc(collection(db, this.VERSIONS_COLLECTION), {
        ...version,
        approved: true,
        approvedBy,
        approvedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error approving version:', error);
      return false;
    }
  }

  static async rollbackToVersion(
    versionId: string,
    author: string,
    authorEmail: string
  ): Promise<boolean> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Create a new version that rolls back to the old value
      await this.saveVersion(
        version.pageType,
        version.field,
        version.newValue, // Current value becomes old value
        version.oldValue, // Old value becomes new value (rollback)
        author,
        authorEmail,
        `Rollback to version ${versionId}`
      );

      return true;
    } catch (error) {
      console.error('Error rolling back version:', error);
      return false;
    }
  }

  static async getVersionHistory(
    pageType: string,
    field: string
  ): Promise<VersionMetadata[]> {
    try {
      const versions = await this.getVersions(pageType, field, 100);
      
      return versions.map(version => ({
        versionId: version.id,
        pageType: version.pageType,
        field: version.field,
        timestamp: version.timestamp,
        author: version.author,
        summary: this.generateChangeSummary(version.changes)
      }));
    } catch (error) {
      console.error('Error getting version history:', error);
      return [];
    }
  }

  private static detectChanges(oldValue: any, newValue: any): string[] {
    const changes: string[] = [];

    if (typeof oldValue === 'string' && typeof newValue === 'string') {
      if (oldValue.length !== newValue.length) {
        changes.push(`Length changed from ${oldValue.length} to ${newValue.length} characters`);
      }
      
      if (oldValue !== newValue) {
        changes.push('Content modified');
      }
    } else if (typeof oldValue === 'object' && typeof newValue === 'object') {
      const oldKeys = Object.keys(oldValue || {});
      const newKeys = Object.keys(newValue || {});
      
      // Check for added keys
      const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
      if (addedKeys.length > 0) {
        changes.push(`Added fields: ${addedKeys.join(', ')}`);
      }
      
      // Check for removed keys
      const removedKeys = oldKeys.filter(key => !newKeys.includes(key));
      if (removedKeys.length > 0) {
        changes.push(`Removed fields: ${removedKeys.join(', ')}`);
      }
      
      // Check for modified values
      const commonKeys = oldKeys.filter(key => newKeys.includes(key));
      for (const key of commonKeys) {
        if (oldValue[key] !== newValue[key]) {
          changes.push(`Modified field: ${key}`);
        }
      }
    }

    return changes;
  }

  private static generateChangeSummary(changes: string[]): string {
    if (changes.length === 0) {
      return 'No changes detected';
    }
    
    if (changes.length === 1) {
      return changes[0];
    }
    
    return `${changes.length} changes: ${changes.slice(0, 2).join(', ')}${changes.length > 2 ? '...' : ''}`;
  }

  private static async cleanupOldVersions(pageType: string, field: string): Promise<void> {
    try {
      const versions = await this.getVersions(pageType, field, this.MAX_VERSIONS_PER_FIELD + 10);
      
      if (versions.length > this.MAX_VERSIONS_PER_FIELD) {
        const versionsToDelete = versions.slice(this.MAX_VERSIONS_PER_FIELD);
        
        // In a real implementation, you'd delete these versions
        // For now, we'll just log them
        console.log(`Would delete ${versionsToDelete.length} old versions for ${pageType}.${field}`);
      }
    } catch (error) {
      console.error('Error cleaning up old versions:', error);
    }
  }
} 