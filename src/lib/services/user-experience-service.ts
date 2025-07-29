import { listBookings } from './booking-service';

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

  private loadUserPreferences(): UserPreferences {
    if (typeof window === 'undefined') return this.getDefaultPreferences();

    try {
      const saved = localStorage.getItem('user-preferences');
      return saved ? { ...this.getDefaultPreferences(), ...JSON.parse(saved) } : this.getDefaultPreferences();
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

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
        push: true,
        reminderTime: 2,
      },
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private loadOfflineData(): OfflineData {
    if (typeof window === 'undefined') return this.getDefaultOfflineData();

    try {
      const saved = localStorage.getItem('offline-data');
      return saved ? JSON.parse(saved) : this.getDefaultOfflineData();
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return this.getDefaultOfflineData();
    }
  }

  private getDefaultOfflineData(): OfflineData {
    return {
      bookings: [],
      userPreferences: this.getDefaultPreferences(),
      cachedRoutes: {},
      pendingActions: [],
    };
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('Connection Lost', 'You are offline. Some features may be limited.', 'warning');
    });

    // Save data before page unload
    window.addEventListener('beforeunload', () => {
      this.saveOfflineData();
    });
  }

  private initializeAccessibility(): void {
    this.applyAccessibilitySettings();
    this.setupKeyboardNavigation();
    this.setupScreenReaderAnnouncements();
    this.enhanceScreenReaderSupport();
    this.addSkipLinks();
  }

  private applyAccessibilitySettings(): void {
    if (typeof document === 'undefined') return;

    const { accessibility } = this.userPreferences;

    // High contrast
    document.body.classList.toggle('high-contrast', accessibility.highContrast);

    // Reduce motion
    if (accessibility.reduceMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }

    // Font size
    document.body.classList.remove('font-normal', 'font-large', 'font-extra-large');
    document.body.classList.add(`font-${accessibility.fontSize}`);

    // Screen reader support
    if (accessibility.screenReader) {
      document.body.classList.add('screen-reader-friendly');
    }
  }

  private setupKeyboardNavigation(): void {
    if (typeof document === 'undefined') return;

    // Skip to main content
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && e.target === document.body) {
        const skipLink = document.getElementById('skip-to-main');
        if (skipLink) {
          skipLink.focus();
        }
      }
    });

    // Modal keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[aria-hidden="false"]') as HTMLElement;
        if (openModal) {
          this.closeModal(openModal);
        }
      }
    });
  }

  private closeModal(modal: HTMLElement): void {
    modal.setAttribute('aria-hidden', 'true');
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  private setupScreenReaderAnnouncements(): void {
    if (typeof document === 'undefined') return;

    // Create announcement region
    const announcementRegion = document.createElement('div');
    announcementRegion.id = 'screen-reader-announcements';
    announcementRegion.setAttribute('aria-live', 'polite');
    announcementRegion.setAttribute('aria-atomic', 'true');
    announcementRegion.className = 'sr-only';
    document.body.appendChild(announcementRegion);
  }

  private enhanceScreenReaderSupport(): void {
    if (typeof document === 'undefined') return;

    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach((button) => {
      if (!button.textContent?.trim()) {
        button.setAttribute('aria-label', 'Button');
      }
    });

    // Add role attributes
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.getAttribute('role')) {
      mainContent.setAttribute('role', 'main');
    }
  }

  private addSkipLinks(): void {
    if (typeof document === 'undefined') return;

    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-main';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  startTracking(bookingId: string): void {
    // Initialize tracking data
    this.trackingData.set(bookingId, {
      bookingId,
      status: 'confirmed',
      lastUpdated: new Date(),
    });

    // Try WebSocket connection first
    this.connectWebSocket(bookingId);

    // Fallback to polling
    this.startPolling(bookingId);

    // Start location updates
    this.startLocationUpdates(bookingId);
  }

  private connectWebSocket(bookingId: string): void {
    try {
      this.websocketConnection = new WebSocket(`ws://localhost:3000/api/ws/bookings/${bookingId}`);

      this.websocketConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.updateTrackingData(bookingId, data);
      };

      this.websocketConnection.onerror = () => {
        console.log('WebSocket connection failed, falling back to polling');
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private startPolling(bookingId: string): void {
    // Polling fallback for when WebSocket is not available
    setInterval(async () => {
      try {
        const response = await fetch(`/api/booking/get-booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          this.updateTrackingData(bookingId, data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 30000); // Poll every 30 seconds as fallback
  }

  // Start location updates for driver tracking
  private startLocationUpdates(bookingId: string): void {
    // TODO: Implement real driver location tracking with GPS
    console.log('Driver location tracking not yet implemented');
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
    // TODO: Integrate with Google Maps API
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