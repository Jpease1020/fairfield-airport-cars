// Cost tracking service for business transparency
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';

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
    // TODO: Implement real cost tracking from Firebase
    // For now, return empty array as placeholder
    return [];
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
  getCostTrend(): 'increasing' | 'decreasing' | 'stable' {
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
      costTrend: this.getCostTrend(),
      savingsOpportunities: this.calculateSavingsOpportunities(costs)
    };
  }
}

export const costTrackingService = new CostTrackingService();
export type { CostItem, CostSummary }; 