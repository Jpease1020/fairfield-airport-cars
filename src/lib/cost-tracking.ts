// Cost tracking service for business transparency
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface CostItem {
  id: string;
  service: string;
  category: string;
  description: string;
  monthlyCost: number;
  usage: string;
  status: 'active' | 'inactive' | 'warning';
  lastUpdated: string;
  billingCycle: 'monthly' | 'yearly' | 'usage';
  provider: string;
  accountId?: string;
  plan?: string;
  actualUsage?: string;
  projectedCost?: number;
  lastBillingDate?: string;
  nextBillingDate?: string;
}

interface CostSummary {
  totalMonthly: number;
  totalYearly: number;
  byCategory: Record<string, number>;
  byProvider: Record<string, number>;
  projectedAnnual: number;
  lastUpdated: string;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  savingsOpportunities: string[];
}

class CostTrackingService {
  private db: any;
  private costsCollection = 'costs';
  private summaryCollection = 'cost_summary';

  constructor() {
    // Initialize Firebase if not already done
    if (typeof window !== 'undefined') {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };
      
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
    }
  }

  // Get all costs
  async getCosts(): Promise<CostItem[]> {
    try {
      // For now, return mock data
      // In production, this would fetch from Firebase or billing APIs
      return this.getMockCosts();
    } catch (error) {
      console.error('Error fetching costs:', error);
      return [];
    }
  }

  // Get cost summary
  async getCostSummary(): Promise<CostSummary | null> {
    try {
      const costs = await this.getCosts();
      return this.calculateSummary(costs);
    } catch (error) {
      console.error('Error calculating cost summary:', error);
      return null;
    }
  }

  // Update cost item
  async updateCost(costId: string, updates: Partial<CostItem>): Promise<void> {
    try {
      if (this.db) {
        const costRef = doc(this.db, this.costsCollection, costId);
        await updateDoc(costRef, {
          ...updates,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating cost:', error);
    }
  }

  // Add new cost item
  async addCost(cost: Omit<CostItem, 'id' | 'lastUpdated'>): Promise<void> {
    try {
      if (this.db) {
        const costRef = doc(this.db, this.costsCollection);
        await setDoc(costRef, {
          ...cost,
          id: costRef.id,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error adding cost:', error);
    }
  }

  // Fetch real-time usage from providers
  async fetchRealTimeUsage(): Promise<void> {
    try {
      // This would integrate with actual billing APIs
      // For now, we'll simulate with mock data
      console.log('Fetching real-time usage data...');
      
      // Example integrations:
      // - Google Cloud Billing API
      // - Twilio Usage API
      // - SendGrid Stats API
      // - Square Reports API
      // - OpenAI Usage API
      
    } catch (error) {
      console.error('Error fetching real-time usage:', error);
    }
  }

  // Calculate cost savings opportunities
  calculateSavingsOpportunities(costs: CostItem[]): string[] {
    const opportunities: string[] = [];
    
    // Analyze high-cost services
    const highCostServices = costs.filter(cost => cost.monthlyCost > 50);
    if (highCostServices.length > 0) {
      opportunities.push(`Consider annual billing for ${highCostServices.length} high-cost services`);
    }

    // Check for unused services
    const inactiveServices = costs.filter(cost => cost.status === 'inactive');
    if (inactiveServices.length > 0) {
      opportunities.push(`Cancel ${inactiveServices.length} unused services`);
    }

    // Check for over-usage
    const usageBasedServices = costs.filter(cost => cost.billingCycle === 'usage');
    if (usageBasedServices.length > 0) {
      opportunities.push('Optimize API calls to reduce usage-based costs');
    }

    return opportunities;
  }

  // Get cost trends
  getCostTrend(costs: CostItem[]): 'increasing' | 'decreasing' | 'stable' {
    // This would compare current costs with historical data
    // For now, return stable
    return 'stable';
  }

  private calculateSummary(costs: CostItem[]): CostSummary {
    const totalMonthly = costs.reduce((sum, cost) => sum + cost.monthlyCost, 0);
    const totalYearly = totalMonthly * 12;
    
    const byCategory: Record<string, number> = {};
    const byProvider: Record<string, number> = {};
    
    costs.forEach(cost => {
      byCategory[cost.category] = (byCategory[cost.category] || 0) + cost.monthlyCost;
      byProvider[cost.provider] = (byProvider[cost.provider] || 0) + cost.monthlyCost;
    });

    return {
      totalMonthly,
      totalYearly,
      byCategory,
      byProvider,
      projectedAnnual: totalYearly,
      lastUpdated: new Date().toISOString(),
      costTrend: this.getCostTrend(costs),
      savingsOpportunities: this.calculateSavingsOpportunities(costs)
    };
  }

  private getMockCosts(): CostItem[] {
    return [
      // Firebase Services
      {
        id: 'firebase-hosting',
        service: 'Firebase Hosting',
        category: 'Hosting & Infrastructure',
        description: 'Web application hosting and CDN',
        monthlyCost: 25.00,
        usage: '25GB bandwidth, 10GB storage',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'Google Cloud',
        plan: 'Blaze Plan',
        actualUsage: '22GB bandwidth, 8GB storage',
        projectedCost: 23.50,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'firebase-firestore',
        service: 'Firebase Firestore',
        category: 'Database',
        description: 'NoSQL cloud database for bookings and user data',
        monthlyCost: 15.50,
        usage: '50,000 reads, 25,000 writes, 5GB storage',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        plan: 'Pay as you go',
        actualUsage: '45,000 reads, 22,000 writes, 4.8GB storage',
        projectedCost: 14.20,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'firebase-auth',
        service: 'Firebase Authentication',
        category: 'Security & Auth',
        description: 'User authentication and management',
        monthlyCost: 0.00,
        usage: '10,000 authentications',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        plan: 'Free tier',
        actualUsage: '8,500 authentications',
        projectedCost: 0.00,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'firebase-storage',
        service: 'Firebase Storage',
        category: 'Storage',
        description: 'File storage for images and documents',
        monthlyCost: 8.75,
        usage: '2GB storage, 5GB downloads',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        plan: 'Pay as you go',
        actualUsage: '1.8GB storage, 4.2GB downloads',
        projectedCost: 7.80,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },

      // Communication Services
      {
        id: 'twilio-sms',
        service: 'Twilio SMS',
        category: 'Communication',
        description: 'SMS notifications and reminders',
        monthlyCost: 45.00,
        usage: '1,500 SMS messages',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Twilio',
        accountId: 'AC1234567890',
        plan: 'Pay per message',
        actualUsage: '1,320 SMS messages',
        projectedCost: 39.60,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'twilio-phone',
        service: 'Twilio Phone Number',
        category: 'Communication',
        description: 'Business phone number for calls',
        monthlyCost: 1.00,
        usage: '1 phone number',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'Twilio',
        accountId: 'AC1234567890',
        plan: 'Basic',
        actualUsage: '1 phone number',
        projectedCost: 1.00,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'sendgrid-email',
        service: 'SendGrid Email',
        category: 'Communication',
        description: 'Email delivery service for confirmations',
        monthlyCost: 14.95,
        usage: '50,000 emails per month',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'SendGrid',
        plan: 'Essentials',
        actualUsage: '42,000 emails sent',
        projectedCost: 14.95,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },

      // Google Services
      {
        id: 'google-maps',
        service: 'Google Maps Platform',
        category: 'Maps & Location',
        description: 'Maps, geocoding, and distance calculation',
        monthlyCost: 35.00,
        usage: '10,000 map loads, 5,000 geocoding requests',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        plan: 'Pay as you go',
        actualUsage: '9,200 map loads, 4,800 geocoding requests',
        projectedCost: 32.20,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'google-places',
        service: 'Google Places API',
        category: 'Maps & Location',
        description: 'Location autocomplete and place details',
        monthlyCost: 12.50,
        usage: '2,000 place autocomplete requests',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        plan: 'Pay as you go',
        actualUsage: '1,850 place autocomplete requests',
        projectedCost: 11.56,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },

      // Payment Processing
      {
        id: 'square-payments',
        service: 'Square Payments',
        category: 'Payment Processing',
        description: 'Credit card processing and payment links',
        monthlyCost: 0.00,
        usage: '2.9% + 30¢ per transaction',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'Square',
        accountId: 'sq-1234567890',
        plan: 'Standard',
        actualUsage: '15 transactions this month',
        projectedCost: 0.00, // Transaction fees are separate
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },

      // AI & Analytics
      {
        id: 'openai-api',
        service: 'OpenAI API',
        category: 'AI Services',
        description: 'AI assistant and chat functionality',
        monthlyCost: 28.50,
        usage: '1,000 API calls, GPT-4 usage',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'usage',
        provider: 'OpenAI',
        plan: 'Pay per token',
        actualUsage: '920 API calls, 45,000 tokens',
        projectedCost: 26.22,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'vercel-analytics',
        service: 'Vercel Analytics',
        category: 'Analytics',
        description: 'Website analytics and performance monitoring',
        monthlyCost: 20.00,
        usage: '100,000 page views',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'Vercel',
        plan: 'Pro',
        actualUsage: '85,000 page views',
        projectedCost: 20.00,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },

      // Domain & SSL
      {
        id: 'domain-registration',
        service: 'Domain Registration',
        category: 'Domain & SSL',
        description: 'fairfieldairportcar.com domain',
        monthlyCost: 1.67,
        usage: 'Annual renewal',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'yearly',
        provider: 'Namecheap',
        plan: 'Basic',
        actualUsage: 'Domain active until 2025-12-01',
        projectedCost: 1.67,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-12-01'
      },
      {
        id: 'ssl-certificate',
        service: 'SSL Certificate',
        category: 'Domain & SSL',
        description: 'HTTPS security certificate',
        monthlyCost: 0.00,
        usage: 'Free with hosting',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'Vercel',
        plan: 'Included',
        actualUsage: 'SSL certificate valid',
        projectedCost: 0.00,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },

      // Development & Tools
      {
        id: 'github-pro',
        service: 'GitHub Pro',
        category: 'Development',
        description: 'Code repository and collaboration',
        monthlyCost: 4.00,
        usage: 'Private repositories',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'GitHub',
        plan: 'Pro',
        actualUsage: '3 private repositories',
        projectedCost: 4.00,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      },
      {
        id: 'playwright-cloud',
        service: 'Playwright Cloud',
        category: 'Testing',
        description: 'Automated testing and visual regression',
        monthlyCost: 15.00,
        usage: '1,000 test runs',
        status: 'active',
        lastUpdated: '2024-12-20',
        billingCycle: 'monthly',
        provider: 'Microsoft',
        plan: 'Team',
        actualUsage: '850 test runs',
        projectedCost: 15.00,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01'
      }
    ];
  }
}

export const costTrackingService = new CostTrackingService();
export type { CostItem, CostSummary }; 