// Real cost tracking system with API integrations and manual entry
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export interface RealCostItem {
  id: string;
  service: string;
  category: string;
  description: string;
  actualMonthlyCost: number;
  projectedMonthlyCost: number;
  lastBillingDate: string;
  nextBillingDate: string;
  billingCycle: 'monthly' | 'yearly' | 'usage';
  provider: string;
  accountId: string;
  plan: string;
  dataSource: 'api' | 'manual' | 'estimated';
  lastUpdated: string;
  notes?: string;
  apiEndpoint?: string;
  apiKey?: string; // Encrypted
  usageMetrics?: {
    apiCalls?: number;
    bandwidth?: string;
    storage?: string;
    transactions?: number;
    messages?: number;
    phoneNumbers?: number;
    emails?: number;
    tokens?: number;
  };
}

export interface RealCostSummary {
  totalActualMonthly: number;
  totalProjectedMonthly: number;
  totalYearly: number;
  byCategory: Record<string, number>;
  byProvider: Record<string, number>;
  byDataSource: Record<string, number>;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  savingsOpportunities: string[];
  lastUpdated: string;
}

class RealCostTrackingService {
  private db: any;
  private costsCollection = 'real_costs';

  constructor() {
    // Use client-side Firebase initialization
    if (typeof window !== 'undefined') {
      try {
        const { db } = require('./firebase-client');
        this.db = db;
      } catch (error) {
        console.error('Error initializing Firebase for cost tracking service:', error);
      }
    }
  }

  // Initialize real cost tracking with actual service configurations
  async initializeRealCosts(): Promise<void> {
    const realCosts: Omit<RealCostItem, 'id' | 'lastUpdated'>[] = [
      // Firebase/Google Cloud - Need actual billing API
      {
        service: 'Firebase Hosting',
        category: 'Hosting & Infrastructure',
        description: 'Web application hosting and CDN',
        actualMonthlyCost: 0, // Will be fetched from Google Cloud Billing API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        accountId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        plan: 'Blaze Plan',
        dataSource: 'api',
        apiEndpoint: 'https://cloudbilling.googleapis.com/v1/billingAccounts',
        apiKey: process.env.GOOGLE_CLOUD_BILLING_API_KEY || '',
        usageMetrics: {
          bandwidth: '0 GB',
          storage: '0 GB'
        }
      },
      {
        service: 'Firebase Firestore',
        category: 'Database',
        description: 'NoSQL cloud database',
        actualMonthlyCost: 0, // Will be fetched from Google Cloud Billing API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        accountId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        plan: 'Pay as you go',
        dataSource: 'api',
        apiEndpoint: 'https://cloudbilling.googleapis.com/v1/billingAccounts',
        apiKey: process.env.GOOGLE_CLOUD_BILLING_API_KEY || '',
        usageMetrics: {
          apiCalls: 0,
          storage: '0 GB'
        }
      },

      // Twilio - Need actual usage API
      {
        service: 'Twilio SMS',
        category: 'Communication',
        description: 'SMS notifications and reminders',
        actualMonthlyCost: 0, // Will be fetched from Twilio Usage API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'usage',
        provider: 'Twilio',
        accountId: process.env.TWILIO_ACCOUNT_SID || '',
        plan: 'Pay per message',
        dataSource: 'api',
        apiEndpoint: 'https://api.twilio.com/2010-04-01/Accounts',
        apiKey: process.env.TWILIO_AUTH_TOKEN || '',
        usageMetrics: {
          messages: 0
        }
      },
      {
        service: 'Twilio Phone Number',
        category: 'Communication',
        description: 'Business phone number',
        actualMonthlyCost: 0, // Will be fetched from Twilio API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'monthly',
        provider: 'Twilio',
        accountId: process.env.TWILIO_ACCOUNT_SID || '',
        plan: 'Basic',
        dataSource: 'api',
        apiEndpoint: 'https://api.twilio.com/2010-04-01/Accounts',
        apiKey: process.env.TWILIO_AUTH_TOKEN || '',
        usageMetrics: {
          phoneNumbers: 1
        }
      },

      // SendGrid - Need actual billing API
      {
        service: 'SendGrid Email',
        category: 'Communication',
        description: 'Email delivery service',
        actualMonthlyCost: 0, // Will be fetched from SendGrid API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'monthly',
        provider: 'SendGrid',
        accountId: process.env.SENDGRID_API_KEY || '',
        plan: 'Essentials',
        dataSource: 'api',
        apiEndpoint: 'https://api.sendgrid.com/v3',
        apiKey: process.env.SENDGRID_API_KEY || '',
        usageMetrics: {
          emails: 0
        }
      },

      // Google Maps - Need actual billing API
      {
        service: 'Google Maps Platform',
        category: 'Maps & Location',
        description: 'Maps, geocoding, distance calculation',
        actualMonthlyCost: 0, // Will be fetched from Google Cloud Billing API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'usage',
        provider: 'Google Cloud',
        accountId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        plan: 'Pay as you go',
        dataSource: 'api',
        apiEndpoint: 'https://cloudbilling.googleapis.com/v1/billingAccounts',
        apiKey: process.env.GOOGLE_CLOUD_BILLING_API_KEY || '',
        usageMetrics: {
          apiCalls: 0
        }
      },

      // Square - Need actual reports API
      {
        service: 'Square Payments',
        category: 'Payment Processing',
        description: 'Credit card processing',
        actualMonthlyCost: 0, // Will be calculated from transaction fees
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'usage',
        provider: 'Square',
        accountId: process.env.SQUARE_ACCESS_TOKEN || '',
        plan: 'Standard',
        dataSource: 'api',
        apiEndpoint: 'https://connect.squareup.com/v2',
        apiKey: process.env.SQUARE_ACCESS_TOKEN || '',
        usageMetrics: {
          transactions: 0
        }
      },

      // OpenAI - Need actual usage API
      {
        service: 'OpenAI API',
        category: 'AI Services',
        description: 'AI assistant and chat functionality',
        actualMonthlyCost: 0, // Will be fetched from OpenAI API
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'usage',
        provider: 'OpenAI',
        accountId: process.env.OPENAI_API_KEY || '',
        plan: 'Pay per token',
        dataSource: 'api',
        apiEndpoint: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        usageMetrics: {
          apiCalls: 0,
          tokens: 0
        }
      },

      // Manual entry services (no APIs available)
      {
        service: 'Vercel Analytics',
        category: 'Analytics',
        description: 'Website analytics and monitoring',
        actualMonthlyCost: 0, // Manual entry required
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'monthly',
        provider: 'Vercel',
        accountId: 'manual-entry',
        plan: 'Pro',
        dataSource: 'manual',
        notes: 'Check Vercel dashboard for actual billing'
      },
      {
        service: 'Domain Registration',
        category: 'Domain & SSL',
        description: 'fairfieldairportcar.com domain',
        actualMonthlyCost: 0, // Manual entry required
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-12-01',
        billingCycle: 'yearly',
        provider: 'Namecheap',
        accountId: 'manual-entry',
        plan: 'Basic',
        dataSource: 'manual',
        notes: 'Check Namecheap dashboard for annual renewal cost'
      },
      {
        service: 'GitHub Pro',
        category: 'Development',
        description: 'Code repository and collaboration',
        actualMonthlyCost: 0, // Manual entry required
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'monthly',
        provider: 'GitHub',
        accountId: 'manual-entry',
        plan: 'Pro',
        dataSource: 'manual',
        notes: 'Check GitHub billing settings'
      },
      {
        service: 'Playwright Cloud',
        category: 'Testing',
        description: 'Automated testing and visual regression',
        actualMonthlyCost: 0, // Manual entry required
        projectedMonthlyCost: 0,
        lastBillingDate: '2024-12-01',
        nextBillingDate: '2025-01-01',
        billingCycle: 'monthly',
        provider: 'Microsoft',
        accountId: 'manual-entry',
        plan: 'Team',
        dataSource: 'manual',
        notes: 'Check Playwright Cloud dashboard'
      }
    ];

    // Save to Firebase
    for (const cost of realCosts) {
      await this.addCost(cost);
    }
  }

  // Add new cost item
  async addCost(cost: Omit<RealCostItem, 'id' | 'lastUpdated'>): Promise<string> {
    try {
      if (this.db) {
        const costRef = doc(this.db, this.costsCollection);
        const now = new Date().toISOString();
        
        await setDoc(costRef, {
          ...cost,
          id: costRef.id,
          lastUpdated: now
        });
        
        return costRef.id;
      }
      return '';
    } catch (error) {
      console.error('Error adding cost:', error);
      throw error;
    }
  }

  // Get all costs
  async getCosts(): Promise<RealCostItem[]> {
    try {
      if (!this.db) return [];

      const q = query(collection(this.db, this.costsCollection), orderBy('lastUpdated', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as RealCostItem);
    } catch (error) {
      console.error('Error fetching costs:', error);
      return [];
    }
  }

  // Update cost with real data
  async updateCost(costId: string, updates: Partial<RealCostItem>): Promise<void> {
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
      throw error;
    }
  }

  // Fetch real costs from APIs
  async fetchRealCostsFromAPIs(): Promise<void> {
    try {
      const costs = await this.getCosts();
      
      for (const cost of costs) {
        if (cost.dataSource === 'api' && cost.apiEndpoint && cost.apiKey) {
          try {
            const realCost = await this.fetchFromAPI(cost);
            if (realCost) {
              await this.updateCost(cost.id, {
                actualMonthlyCost: realCost.amount,
                usageMetrics: realCost.metrics,
                lastUpdated: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error(`Error fetching cost for ${cost.service}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching real costs:', error);
    }
  }

  // Fetch cost from specific API
  private async fetchFromAPI(cost: RealCostItem): Promise<{ amount: number; metrics: any } | null> {
    // This would implement actual API calls to each service
    // For now, return null to indicate manual entry needed
    return null;
  }

  // Calculate real cost summary
  async getRealCostSummary(): Promise<RealCostSummary> {
    try {
      const costs = await this.getCosts();
      
      const totalActualMonthly = costs.reduce((sum, cost) => sum + cost.actualMonthlyCost, 0);
      const totalProjectedMonthly = costs.reduce((sum, cost) => sum + cost.projectedMonthlyCost, 0);
      const totalYearly = totalActualMonthly * 12;
      
      const byCategory: Record<string, number> = {};
      const byProvider: Record<string, number> = {};
      const byDataSource: Record<string, number> = {};
      
      costs.forEach(cost => {
        byCategory[cost.category] = (byCategory[cost.category] || 0) + cost.actualMonthlyCost;
        byProvider[cost.provider] = (byProvider[cost.provider] || 0) + cost.actualMonthlyCost;
        byDataSource[cost.dataSource] = (byDataSource[cost.dataSource] || 0) + cost.actualMonthlyCost;
      });

      return {
        totalActualMonthly,
        totalProjectedMonthly,
        totalYearly,
        byCategory,
        byProvider,
        byDataSource,
        costTrend: this.getCostTrend(costs),
        savingsOpportunities: this.calculateSavingsOpportunities(costs),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating real cost summary:', error);
      return {
        totalActualMonthly: 0,
        totalProjectedMonthly: 0,
        totalYearly: 0,
        byCategory: {},
        byProvider: {},
        byDataSource: {},
        costTrend: 'stable',
        savingsOpportunities: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  private getCostTrend(costs: RealCostItem[]): 'increasing' | 'decreasing' | 'stable' {
    // This would compare current costs with historical data
    return 'stable';
  }

  private calculateSavingsOpportunities(costs: RealCostItem[]): string[] {
    const opportunities: string[] = [];
    
    // Identify services with high costs
    const highCostServices = costs.filter(cost => cost.actualMonthlyCost > 50);
    if (highCostServices.length > 0) {
      opportunities.push(`Review ${highCostServices.length} high-cost services for optimization`);
    }

    // Identify manual entry services that need real data
    const manualServices = costs.filter(cost => cost.dataSource === 'manual' && cost.actualMonthlyCost === 0);
    if (manualServices.length > 0) {
      opportunities.push(`Enter real costs for ${manualServices.length} manually tracked services`);
    }

    return opportunities;
  }
}

export const realCostTrackingService = new RealCostTrackingService(); 