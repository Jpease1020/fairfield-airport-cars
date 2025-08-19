import { setupDemoMSW, stopDemoMSW } from './demo-msw-setup';
import { isDemoModeEnabled as isFeatureFlagEnabled } from '@/lib/config/feature-flags';

// Demo mode configuration
export interface DemoModeConfig {
  enabled: boolean;
  mockDriverLocation: {
    latitude: number;
    longitude: number;
  };
  mockPickupLocation: string;
  mockDropoffLocation: string;
  mockFare: number;
  mockDriverInfo: {
    name: string;
    phone: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
      color: string;
      licensePlate: string;
    };
  };
}

// Default demo configuration
export const defaultDemoConfig: DemoModeConfig = {
  enabled: false,
  mockDriverLocation: { latitude: 41.1403, longitude: -73.2637 }, // Fairfield, CT
  mockPickupLocation: 'Fairfield Station, Fairfield, CT',
  mockDropoffLocation: 'JFK Airport, Queens, NY',
  mockFare: 125.00,
  mockDriverInfo: {
    name: 'John Smith',
    phone: '+1 (203) 555-0123',
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      licensePlate: 'CT-12345'
    }
  }
};

// Demo mode service
export class DemoModeService {
  private config: DemoModeConfig;
  private driverLocationInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.config = this.loadConfig();
    this.initialize();
  }

  // Initialize the service
  private initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Always start with a clean state on page refresh
      if (typeof window !== 'undefined') {
        // Check if demo mode is even enabled via feature flag
        const featureFlagEnabled = isFeatureFlagEnabled();
        
        if (!featureFlagEnabled) {
          // Demo mode is disabled via feature flag, force reset
          console.log('🚫 Demo mode disabled via feature flag, forcing reset');
          this.config.enabled = false;
          this.saveConfig();
          this.cleanupSync();
        } else {
          // Check if we're coming from a page refresh
          const isRefresh = this.detectPageRefresh();
          
          if (isRefresh && this.config.enabled) {
            // On refresh, always start fresh - don't auto-enable demo mode
            console.log('🔄 Page refresh detected, resetting demo mode state');
            this.config.enabled = false;
            this.saveConfig();
            // Clean up any existing demo mode state
            this.cleanupSync();
          }
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize demo mode service:', error);
      this.isInitialized = true;
    }
  }

  // Detect page refresh using multiple methods
  private detectPageRefresh(): boolean {
    try {
      // Method 1: Check navigation type
      if (window.performance && window.performance.getEntriesByType) {
        const navigationEntries = window.performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
          if (navEntry.type === 'reload') {
            return true;
          }
        }
      }

      // Method 2: Check if we have a refresh marker in session storage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const refreshDetected = window.sessionStorage.getItem('demoModeRefreshDetected');
        if (refreshDetected) {
          return true;
        }
        
        // Set the marker for next time
        window.sessionStorage.setItem('demoModeRefreshDetected', 'true');
      }

      // Method 3: Check if this is the first load (no previous state)
      if (typeof window !== 'undefined' && window.localStorage) {
        const hasPreviousState = window.localStorage.getItem('demoModeConfig');
        if (!hasPreviousState) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error detecting page refresh:', error);
      return false;
    }
  }

  // Load configuration from localStorage
  private loadConfig(): DemoModeConfig {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('demoModeConfig');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Ensure the enabled state is correctly parsed
          if (typeof parsed.enabled === 'boolean') {
            return { ...defaultDemoConfig, ...parsed };
          }
        }
      }
    } catch (error) {
      console.error('Failed to load demo mode config:', error);
    }
    
    return { ...defaultDemoConfig };
  }

  // Save configuration to localStorage
  private saveConfig(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('demoModeConfig', JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('Failed to save demo mode config:', error);
    }
  }

  // Toggle demo mode on/off
  async toggleDemoMode(enabled: boolean): Promise<void> {
    try {
      console.log('🎭 Toggling demo mode:', enabled);
      
      if (enabled) {
        // Enable demo mode
        this.config.enabled = true;
        this.saveConfig();
        
        // Start MSW for mock API responses
        await setupDemoMSW();
        
        // Start driver location simulation
        this.startDriverLocationSimulation();
        
        console.log('✅ Demo mode enabled');
      } else {
        // Disable demo mode
        this.config.enabled = false;
        this.saveConfig();
        
        // Stop MSW
        await stopDemoMSW();
        
        // Stop driver location simulation
        this.stopDriverLocationSimulation();
        
        console.log('✅ Demo mode disabled');
      }
      
      // Dispatch custom event for other components to listen to
      if (typeof window !== 'undefined') {
        const event = new window.CustomEvent('demoModeChanged', {
          detail: { enabled: this.config.enabled }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to toggle demo mode:', error);
      throw error;
    }
  }

  // Check if demo mode is enabled
  isDemoModeEnabled(): boolean {
    return this.config.enabled;
  }

  // Get demo configuration
  getDemoConfig(): DemoModeConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<DemoModeConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  // Start driver location simulation
  private startDriverLocationSimulation(): void {
    if (this.driverLocationInterval) {
      this.stopDriverLocationSimulation();
    }
    
    console.log('🚗 Starting driver location simulation');
    
    // Simulate driver movement every 2 seconds
    this.driverLocationInterval = setInterval(() => {
      // Simulate small movements around the current location
      const latChange = (Math.random() - 0.5) * 0.001; // Small latitude change
      const lonChange = (Math.random() - 0.5) * 0.001; // Small longitude change
      
      this.config.mockDriverLocation.latitude += latChange;
      this.config.mockDriverLocation.longitude += lonChange;
      
      // Add timestamp for tracking
      (this.config.mockDriverLocation as any).timestamp = new Date().toISOString();
    }, 2000);
  }

  // Stop driver tracking
  private stopDriverLocationSimulation(): void {
    if (this.driverLocationInterval) {
      console.log('🚗 Stopping driver location simulation');
      clearInterval(this.driverLocationInterval);
      this.driverLocationInterval = null;
    }
  }

  // Get current driver location
  getCurrentDriverLocation() {
    return {
      ...this.config.mockDriverLocation,
      timestamp: new Date().toISOString()
    };
  }

  // Clean up demo data (synchronous version for initialization)
  private cleanupSync(): void {
    console.log('🧹 Cleaning up demo mode (sync)');
    this.stopDriverLocationSimulation();
    // Don't call stopDemoMSW here as it's async and we're in a sync context
  }

  // Clean up demo data (async version for user actions)
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up demo mode (async)');
    
    try {
      this.stopDriverLocationSimulation();
      await stopDemoMSW();
      this.config = { ...defaultDemoConfig };
      this.saveConfig();
      console.log('✅ Demo mode cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup demo mode:', error);
    }
  }

  // Force reset demo mode (useful for debugging)
  async forceReset(): Promise<void> {
    console.log('🔄 Force resetting demo mode');
    await this.cleanup();
    this.config = { ...defaultDemoConfig };
    this.saveConfig();
  }

  // Nuclear option: completely clear all demo mode data
  async nuclearReset(): Promise<void> {
    console.log('☢️ Nuclear reset of demo mode');
    
    try {
      // Stop everything
      this.stopDriverLocationSimulation();
      await stopDemoMSW();
      
      // Clear all stored data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('demoModeConfig');
        sessionStorage.removeItem('demoModeRefreshDetected');
      }
      
      // Reset to defaults
      this.config = { ...defaultDemoConfig };
      this.isInitialized = false;
      
      console.log('✅ Nuclear reset completed');
    } catch (error) {
      console.error('Failed to perform nuclear reset:', error);
    }
  }
}

export const demoModeService = new DemoModeService();

// Convenience functions
export const isDemoMode = () => demoModeService.isDemoModeEnabled();
export const toggleDemoMode = (enabled: boolean) => demoModeService.toggleDemoMode(enabled);
export const getDemoConfig = () => demoModeService.getDemoConfig();
export const cleanupDemoMode = () => demoModeService.cleanup();
export const forceResetDemoMode = () => demoModeService.forceReset();
export const nuclearResetDemoMode = () => demoModeService.nuclearReset();
