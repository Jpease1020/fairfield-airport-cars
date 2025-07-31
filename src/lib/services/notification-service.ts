// Notification service for alerting administrators about issues
// Supports multiple notification channels (email, SMS, webhook)
import { cmsService } from './cms-service';
import { colors } from '@/design/system/tokens/tokens';

interface NotificationConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    smtpConfig?: any;
  };
  sms?: {
    enabled: boolean;
    recipients: string[];
    twilioConfig?: any;
  };
  webhook?: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
  };
  slack?: {
    enabled: boolean;
    webhookUrl: string;
    channel?: string;
  };
}

interface NotificationEvent {
  type: 'error' | 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

class NotificationService {
  private config: NotificationConfig;
  private isInitialized = false;

  constructor(config: NotificationConfig = {}) {
    this.config = {
      email: {
        enabled: false,
        recipients: ['admin@fairfieldairportcars.com']
      },
      sms: {
        enabled: false,
        recipients: []
      },
      webhook: {
        enabled: false,
        url: process.env.NOTIFICATION_WEBHOOK_URL || ''
      },
      slack: {
        enabled: false,
        webhookUrl: process.env.SLACK_WEBHOOK_URL || ''
      },
      ...config
    };
  }

  // Initialize the notification service
  async init() {
    if (this.isInitialized) return;

    // Test notification channels
    if (process.env.NODE_ENV === 'production') {
      await this.testChannels();
    }

    this.isInitialized = true;
    console.log('🔔 Notification service initialized');
  }

  // Send a notification
  async sendNotification(event: Omit<NotificationEvent, 'timestamp'>) {
    const notification: NotificationEvent = {
      ...event,
      timestamp: new Date()
    };

    // Log the notification
    console.log('🔔 Notification:', notification);

    // Send to all enabled channels
    const promises: Promise<any>[] = [];

    if (this.config.email?.enabled) {
      promises.push(this.sendEmail(notification));
    }

    if (this.config.sms?.enabled) {
      promises.push(this.sendSMS(notification));
    }

    if (this.config.webhook?.enabled) {
      promises.push(this.sendWebhook(notification));
    }

    if (this.config.slack?.enabled) {
      promises.push(this.sendSlack(notification));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  }

  // Send critical error notification
  async sendCriticalError(error: any, context?: Record<string, any>) {
    await this.sendNotification({
      type: 'critical',
      title: '🚨 Critical Error Detected',
      message: error.message || 'An unknown error occurred',
      context: {
        stack: error.stack,
        ...context
      },
      priority: 'critical'
    });
  }

  // Send high error rate notification
  async sendHighErrorRate(errorRate: number, totalInteractions: number) {
    await this.sendNotification({
      type: 'warning',
      title: '⚠️ High Error Rate Detected',
      message: `Error rate is ${errorRate.toFixed(2)}% (${totalInteractions} total interactions)`,
      context: {
        errorRate,
        totalInteractions
      },
      priority: 'high'
    });
  }

  // Send broken feature notification
  async sendBrokenFeature(feature: string, error: any) {
    await this.sendNotification({
      type: 'error',
      title: '🔧 Feature Broken',
      message: `The ${feature} feature is not working properly`,
      context: {
        feature,
        error: error.message,
        stack: error.stack
      },
      priority: 'high'
    });
  }

  // Send email notification
  private async sendEmail(notification: NotificationEvent) {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.config.email?.recipients,
          subject: notification.title,
          message: notification.message,
          context: notification.context
        })
      });

      if (!response.ok) {
        throw new Error(`Email notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Send SMS notification
  private async sendSMS(notification: NotificationEvent) {
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.config.sms?.recipients,
          message: `${notification.title}: ${notification.message}`
        })
      });

      if (!response.ok) {
        throw new Error(`SMS notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  // Send webhook notification
  private async sendWebhook(notification: NotificationEvent) {
    try {
      const response = await fetch(this.config.webhook?.url || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.webhook?.headers
        },
        body: JSON.stringify({
          notification,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  // Send Slack notification
  private async sendSlack(notification: NotificationEvent) {
    const businessSettings = await cmsService.getBusinessSettings();
    try {
      const color = this.getPriorityColor(notification.priority);
      const payload = {
        channel: this.config.slack?.channel || '#alerts',
        attachments: [{
          color,
          title: notification.title,
          text: notification.message,
          fields: notification.context ? Object.entries(notification.context).map(([key, value]) => ({
            title: key,
            value: String(value).substring(0, 100),
            short: true
          })) : [],
          footer: businessSettings?.company?.name || 'Fairfield Airport Cars',
          ts: Math.floor(notification.timestamp.getTime() / 1000)
        }]
      };

      const response = await fetch(this.config.slack?.webhookUrl || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  // Get priority color for Slack
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return colors.danger[600];
      case 'high': return colors.warning[600];
      case 'medium': return colors.primary[600];
      case 'low': return colors.success[600];
      default: return colors.gray[400];
    }
  }

  // Test notification channels
  private async testChannels() {
    try {
      await this.sendNotification({
        type: 'info',
        title: '🔔 Notification System Test',
        message: 'The notification system is now active and monitoring for issues.',
        priority: 'low'
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): NotificationConfig {
    return this.config;
  }
}

// Global notification service instance
export const notificationService = new NotificationService();

// Initialize in production
if (process.env.NODE_ENV === 'production') {
  notificationService.init();
}

// Export helper functions
export const sendCriticalError = (error: any, context?: Record<string, any>) => {
  return notificationService.sendCriticalError(error, context);
};

export const sendHighErrorRate = (errorRate: number, totalInteractions: number) => {
  return notificationService.sendHighErrorRate(errorRate, totalInteractions);
};

export const sendBrokenFeature = (feature: string, error: any) => {
  return notificationService.sendBrokenFeature(feature, error);
}; 