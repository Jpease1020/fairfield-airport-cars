import { listBookings } from './booking-service';
import { getSettings } from '../business/settings-service';

export interface BackupData {
  timestamp: Date;
  version: string;
  bookings: any[];
  settings: any;
  customers: any[];
  analytics: any[];
  metadata: {
    totalBookings: number;
    totalCustomers: number;
    backupSize: number;
    checksum: string;
  };
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeAnalytics: boolean;
  includeSettings: boolean;
  compression: boolean;
}

export class BackupService {
  private static instance: BackupService;
  private config: BackupConfig = {
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    includeAnalytics: true,
    includeSettings: true,
    compression: true
  };

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(): Promise<BackupData> {
    console.log('Starting automated backup...');
    
    try {
      // Collect all data
      const bookings = await listBookings();
      const settings = await getSettings();
      
      // Get customers (unique from bookings)
      const customers = this.extractUniqueCustomers(bookings);
      
      // Get analytics data (if enabled)
      const analytics = this.config.includeAnalytics ? await this.getAnalyticsData() : [];
      
      // Create backup object
      const backupData: BackupData = {
        timestamp: new Date(),
        version: '1.0.0',
        bookings,
        settings: this.config.includeSettings ? settings : {},
        customers,
        analytics,
        metadata: {
          totalBookings: bookings.length,
          totalCustomers: customers.length,
          backupSize: 0, // Will be calculated
          checksum: '' // Will be calculated
        }
      };

      // Calculate metadata
      const backupString = JSON.stringify(backupData);
      backupData.metadata.backupSize = new Blob([backupString]).size;
      backupData.metadata.checksum = await this.calculateChecksum(backupString);

      // Store backup (mock for now)
      await this.storeBackup(backupData);

      console.log(`Backup completed successfully. Size: ${backupData.metadata.backupSize} bytes`);
      return backupData;

    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error(`Backup failed: ${error}`);
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    console.log(`Restoring backup: ${backupId}`);
    
    try {
      // Get backup data (mock for now)
      const backupData = await this.getBackupData();
      if (!backupData) {
        throw new Error('Backup not found');
      }

      // Validate backup
      await this.validateBackup(backupData);

      // Restore data (mock for now)
      await this.restoreBookings(backupData.bookings);
      if (this.config.includeSettings) {
        await this.restoreSettings();
      }

      console.log('Backup restored successfully');

    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error(`Restore failed: ${error}`);
    }
  }

  async listBackups(): Promise<{ id: string; timestamp: Date; size: number; status: string }[]> {
    try {
      // Mock backup list for now
      return [
        {
          id: 'backup-1',
          timestamp: new Date(),
          size: 1024,
          status: 'completed'
        }
      ];

    } catch (error) {
      console.error('Failed to list backups:', error);
      throw new Error(`Failed to list backups: ${error}`);
    }
  }

  async cleanupOldBackups(): Promise<number> {
    try {
      console.log('Cleaning up old backups...');
      return 0; // Mock cleanup

    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      throw new Error(`Failed to cleanup old backups: ${error}`);
    }
  }

  async scheduleBackup(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Backup scheduling is disabled');
      return;
    }

    console.log(`Backup scheduled for frequency: ${this.config.frequency}`);
  }

  private extractUniqueCustomers(bookings: any[]): any[] {
    const customerMap = new Map();
    
    bookings.forEach(booking => {
      const customerKey = `${booking.email}-${booking.phone}`;
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, {
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          totalRides: 1,
          totalSpent: booking.fare || 0,
          firstRide: booking.createdAt,
          lastRide: booking.createdAt
        });
      } else {
        const customer = customerMap.get(customerKey);
        customer.totalRides += 1;
        customer.totalSpent += booking.fare || 0;
        customer.lastRide = booking.createdAt;
      }
    });

    return Array.from(customerMap.values());
  }

  private async getAnalyticsData(): Promise<any[]> {
    try {
      // Mock analytics data
      return [];

    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return [];
    }
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Simple checksum - in production, use a proper hashing algorithm
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private async storeBackup(backupData: BackupData): Promise<void> {
    // Mock storage - in production, store to Firestore or cloud storage
    console.log('Storing backup:', backupData.metadata);
  }

  private async getBackupData(): Promise<BackupData | null> {
    // Mock backup retrieval
    return null;
  }

  private async validateBackup(backupData: BackupData): Promise<void> {
    // Validate backup structure
    if (!backupData.bookings || !backupData.metadata) {
      throw new Error('Invalid backup structure');
    }

    // Validate checksum
    const backupString = JSON.stringify(backupData);
    const expectedChecksum = await this.calculateChecksum(backupString);
    if (backupData.metadata.checksum !== expectedChecksum) {
      throw new Error('Backup checksum validation failed');
    }

    console.log('Backup validation passed');
  }

  private async restoreBookings(bookings: any[]): Promise<void> {
    // Mock restore - in production, restore to database
    console.log(`Restored ${bookings.length} bookings`);
  }

  private async restoreSettings(): Promise<void> {
    // Mock restore - in production, restore to database
    console.log('Settings restored');
  }

  // Configuration methods
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Backup configuration updated:', this.config);
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance(); 