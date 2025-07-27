// User Experience Service
// Handles real-time tracking, offline capabilities, accessibility, and mobile optimization

import { performanceOptimizer } from './performance-optimizer';

interface UserPreferences {
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    fontSize: 'normal' | 'large' | 'extra-large';
    screenReader: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    reminderTime: number; // hours before pickup
  };
  language: string;
  timezone: string;
}

interface TrackingData {
  bookingId: string;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading: number;
    speed: number;
  };
  estimatedArrival?: Date;
  status: 'confirmed' | 'driver-assigned' | 'en-route' | 'arrived' | 'completed';
  lastUpdated: Date;
}

interface OfflineData {
  bookings: any[];
  userPreferences: UserPreferences;
  cachedRoutes: Record<string, any>;
  pendingActions: Array<{
    type: 'booking' | 'payment' | 'feedback';
    data: any;
    timestamp: Date;
  }>;
}

class UserExperienceService {
  private userPreferences: UserPreferences;
  private trackingData: Map<string, TrackingData> = new Map();
  private offlineData: OfflineData;
  private websocketConnection?: WebSocket;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.userPreferences = this.loadUserPreferences();
    this.offlineData = this.loadOfflineData();
    this.setupEventListeners();
    this.initializeAccessibility();
  }

  // Load user preferences from localStorage
  private loadUserPreferences(): UserPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences();
    }

    const stored = localStorage.getItem('user-preferences');
    if (stored) {
      try {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    }

    return this.getDefaultPreferences();
  }

  // Get default user preferences
  private getDefaultPreferences(): UserPreferences {
    return {
      accessibility: {
        highContrast: false,
        reduceMotion: false,
        fontSize: 'normal',
        screenReader: false,
      },
      notifications: {
        email: true,
        sms: true,
        push: false,
        reminderTime: 24,
      },
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  // Load offline data from localStorage
  private loadOfflineData(): OfflineData {
    if (typeof window === 'undefined') {
      return this.getDefaultOfflineData();
    }

    const stored = localStorage.getItem('offline-data');
    if (stored) {
      try {
        return { ...this.getDefaultOfflineData(), ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }

    return this.getDefaultOfflineData();
  }

  // Get default offline data
  private getDefaultOfflineData(): OfflineData {
    return {
      bookings: [],
      userPreferences: this.getDefaultPreferences(),
      cachedRoutes: {},
      pendingActions: [],
    };
  }

  // Setup event listeners for online/offline status
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.showNotification('Connection restored', 'You are back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('Connection lost', 'You are offline. Some features may be limited.');
    });

    // Before unload - save current state
    window.addEventListener('beforeunload', () => {
      this.saveOfflineData();
    });

    // Service worker for offline functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }

  // Initialize accessibility features
  private initializeAccessibility(): void {
    if (typeof window === 'undefined') return;

    // Apply accessibility settings
    this.applyAccessibilitySettings();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Setup screen reader announcements
    this.setupScreenReaderAnnouncements();
  }

  // Apply accessibility settings to the page
  private applyAccessibilitySettings(): void {
    const root = document.documentElement;
    const settings = this.userPreferences.accessibility;

    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);

    // Reduced motion
    root.classList.toggle('reduce-motion', settings.reduceMotion);

    // Font size
    root.classList.remove('font-large', 'font-extra-large');
    if (settings.fontSize === 'large') {
      root.classList.add('font-large');
    } else if (settings.fontSize === 'extra-large') {
      root.classList.add('font-extra-large');
    }

    // Screen reader support
    if (settings.screenReader) {
      this.enhanceScreenReaderSupport();
    }
  }

  // Setup keyboard navigation
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Skip to main content
      if (event.key === 'Tab' && event.altKey) {
        event.preventDefault();
        const mainContent = document.querySelector('main');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
        }
      }

      // Escape key to close modals
      if (event.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          if (modal.classList.contains('open')) {
            this.closeModal(modal as HTMLElement);
          }
        });
      }
    });
  }

  // Setup screen reader announcements
  private setupScreenReaderAnnouncements(): void {
    // Create live region for announcements
    const announcementRegion = document.createElement('div');
    announcementRegion.setAttribute('aria-live', 'polite');
    announcementRegion.setAttribute('aria-atomic', 'true');
    announcementRegion.style.position = 'absolute';
    announcementRegion.style.left = '-10000px';
    announcementRegion.style.width = '1px';
    announcementRegion.style.height = '1px';
    announcementRegion.style.overflow = 'hidden';
    announcementRegion.id = 'screen-reader-announcements';
    
    document.body.appendChild(announcementRegion);
  }

  // Enhance screen reader support
  private enhanceScreenReaderSupport(): void {
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      const text = button.textContent?.trim();
      if (text) {
        button.setAttribute('aria-label', text);
      }
    });

    // Add skip links
    this.addSkipLinks();
  }

  // Add skip links for keyboard navigation
  private addSkipLinks(): void {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#booking-form', text: 'Skip to booking form' },
    ];

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipLinksContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }

  // Close modal
  private closeModal(modal: HTMLElement): void {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    
    // Return focus to trigger element
    const trigger = document.querySelector(`[data-modal="${modal.id}"]`);
    if (trigger) {
      (trigger as HTMLElement).focus();
    }
  }

  // Start real-time tracking for a booking
  startTracking(bookingId: string): void {
    if (!this.isOnline) {
      console.warn('Cannot start tracking while offline');
      return;
    }

    // Initialize tracking data
    this.trackingData.set(bookingId, {
      bookingId,
      status: 'confirmed',
      lastUpdated: new Date(),
    });

    // Connect to WebSocket for real-time updates
    this.connectWebSocket(bookingId);

    // Start periodic location updates
    this.startLocationUpdates(bookingId);
  }

  // Connect to WebSocket for real-time updates
  private connectWebSocket(bookingId: string): void {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/tracking/${bookingId}`;
    
    this.websocketConnection = new WebSocket(wsUrl);

    this.websocketConnection.onopen = () => {
      console.log('WebSocket connected for tracking');
    };

    this.websocketConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.updateTrackingData(bookingId, data);
    };

    this.websocketConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Fallback to polling
      this.startPolling(bookingId);
    };

    this.websocketConnection.onclose = () => {
      console.log('WebSocket disconnected');
      // Fallback to polling
      this.startPolling(bookingId);
    };
  }

  // Start polling as fallback for WebSocket
  private startPolling(bookingId: string): void {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}/status`);
        const data = await response.json();
        this.updateTrackingData(bookingId, data);
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
      }
    }, 10000); // Poll every 10 seconds
  }

  // Start location updates for driver tracking
  private startLocationUpdates(bookingId: string): void {
    // This would integrate with driver's GPS
    // For now, simulate location updates
    const locationInterval = setInterval(() => {
      // Simulate driver location updates
      const mockLocation = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date(),
        heading: Math.random() * 360,
        speed: 30 + Math.random() * 20,
      };

      this.updateTrackingData(bookingId, { driverLocation: mockLocation });
    }, 30000); // Update every 30 seconds
  }

  // Update tracking data
  private updateTrackingData(bookingId: string, data: Partial<TrackingData>): void {
    const currentData = this.trackingData.get(bookingId);
    if (!currentData) return;

    const updatedData = { ...currentData, ...data, lastUpdated: new Date() };
    this.trackingData.set(bookingId, updatedData);

    // Update UI
    this.updateTrackingUI(bookingId, updatedData);

    // Announce to screen reader
    this.announceToScreenReader(this.getTrackingAnnouncement(updatedData));
  }

  // Update tracking UI
  private updateTrackingUI(bookingId: string, data: TrackingData): void {
    // Update status display
    const statusElement = document.querySelector(`[data-booking-id="${bookingId}"] .status`);
    if (statusElement) {
      statusElement.textContent = data.status;
      statusElement.className = `status status-${data.status}`;
    }

    // Update map if available
    if (data.driverLocation) {
      this.updateMap(bookingId, data.driverLocation);
    }

    // Update estimated arrival
    if (data.estimatedArrival) {
      this.updateEstimatedArrival(bookingId, data.estimatedArrival);
    }
  }

  // Update map with driver location
  private updateMap(bookingId: string, location: TrackingData['driverLocation']): void {
    // This would integrate with Google Maps API
    // For now, just log the location
    console.log(`Driver location for booking ${bookingId}:`, location);
  }

  // Update estimated arrival time
  private updateEstimatedArrival(bookingId: string, estimatedArrival: Date): void {
    const etaElement = document.querySelector(`[data-booking-id="${bookingId}"] .eta`);
    if (etaElement) {
      const minutes = Math.round((estimatedArrival.getTime() - Date.now()) / 60000);
      etaElement.textContent = `${minutes} minutes`;
    }
  }

  // Get tracking announcement for screen reader
  private getTrackingAnnouncement(data: TrackingData): string {
    if (data.status === 'en-route' && data.driverLocation) {
      return 'Driver is on the way to your location';
    } else if (data.status === 'arrived') {
      return 'Driver has arrived at your location';
    } else if (data.status === 'completed') {
      return 'Your ride has been completed';
    }
    return '';
  }

  // Announce to screen reader
  private announceToScreenReader(message: string): void {
    if (!message) return;

    const announcementRegion = document.getElementById('screen-reader-announcements');
    if (announcementRegion) {
      announcementRegion.textContent = message;
      setTimeout(() => {
        announcementRegion.textContent = '';
      }, 1000);
    }
  }

  // Show notification to user
  showNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }

    // Show in-app notification
    this.showInAppNotification(title, message, type);
  }

  // Show in-app notification
  private showInAppNotification(title: string, message: string, type: string): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <h4>${title}</h4>
        <button class="notification-close" aria-label="Close notification">×</button>
      </div>
      <p>${message}</p>
    `;

    // Add to notification container
    const container = document.getElementById('notification-container') || this.createNotificationContainer();
    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => notification.remove());
    }
  }

  // Create notification container
  private createNotificationContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
  }

  // Save offline data
  private saveOfflineData(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('offline-data', JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Sync offline data when back online
  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline) return;

    // Process pending actions
    for (const action of this.offlineData.pendingActions) {
      try {
        await this.processPendingAction(action);
      } catch (error) {
        console.error('Failed to process pending action:', error);
      }
    }

    // Clear pending actions
    this.offlineData.pendingActions = [];
    this.saveOfflineData();
  }

  // Process pending action
  private async processPendingAction(action: OfflineData['pendingActions'][0]): Promise<void> {
    switch (action.type) {
      case 'booking':
        await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
      case 'payment':
        await fetch('/api/payment/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
      case 'feedback':
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
    }
  }

  // Add pending action for offline processing
  addPendingAction(type: OfflineData['pendingActions'][0]['type'], data: any): void {
    this.offlineData.pendingActions.push({
      type,
      data,
      timestamp: new Date(),
    });
    this.saveOfflineData();
  }

  // Update user preferences
  updateUserPreferences(preferences: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.applyAccessibilitySettings();
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-preferences', JSON.stringify(this.userPreferences));
    }
  }

  // Get current user preferences
  getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  // Check if user is online
  isUserOnline(): boolean {
    return this.isOnline;
  }

  // Get tracking data for a booking
  getTrackingData(bookingId: string): TrackingData | undefined {
    return this.trackingData.get(bookingId);
  }

  // Stop tracking for a booking
  stopTracking(bookingId: string): void {
    this.trackingData.delete(bookingId);
    
    if (this.websocketConnection) {
      this.websocketConnection.close();
    }
  }
}

// Export singleton instance
export const userExperienceService = new UserExperienceService();

// Export types
export type { UserPreferences, TrackingData, OfflineData }; 