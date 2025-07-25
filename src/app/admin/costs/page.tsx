'use client';

import { useState, useEffect } from 'react';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import Link from 'next/link';
import { 
  PageHeader, 
  GridSection, 
  StatCard, 
  InfoCard, 
  ActionGrid
} from '@/components/ui';
import { Button } from '@/components/ui/button';

const CostsPage = () => {
  const [costs, setCosts] = useState<RealCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      const costsData = await realCostTrackingService.getCosts();
      setCosts(costsData);
      
      const summaryData = await realCostTrackingService.getRealCostSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const headerActions = [
    { 
      label: 'Refresh Data', 
      onClick: loadCosts, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Add Manual Cost', 
      href: '/admin/costs/manual-entry', 
      variant: 'primary' as const 
    }
  ];

  const quickActions = [
    {
      id: 1,
      icon: "📊",
      label: "Cost Analytics",
      onClick: () => alert('Analytics coming soon')
    },
    {
      id: 2,
      icon: "📋",
      label: "Export Report",
      onClick: () => alert('Export functionality coming soon')
    },
    {
      id: 3,
      icon: "⚙️",
      label: "Cost Settings",
      href: "/admin/cms/business"
    },
    {
      id: 4,
      icon: "📅",
      label: "Cost History",
      onClick: () => alert('History coming soon')
    }
  ];

  const getStatusIcon = (cost: RealCostItem) => {
    if (cost.actualMonthlyCost === 0) return '⏱️';
    if (cost.actualMonthlyCost > cost.projectedMonthlyCost) return '❌';
    return '✅';
  };

  const getDataSourceColor = (dataSource: string) => {
    switch (dataSource) {
      case 'api': return 'status-badge confirmed';
      case 'manual': return 'status-badge pending';
      case 'estimated': return 'badge';
      default: return 'badge';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <PageHeader
          title="Cost Tracking"
          subtitle="Loading cost data..."
        />
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Cost Tracking"
        subtitle="Monitor your business expenses and projected costs"
        actions={headerActions}
      />

      {summary && (
        <GridSection variant="stats" columns={4}>
          <StatCard
            title="Total Monthly"
            icon="💰"
            statNumber={`$${summary.totalActualMonthly.toFixed(2)}`}
            statChange="Current month expenses"
            changeType="neutral"
          />
          <StatCard
            title="Yearly Total"
            icon="📈"
            statNumber={`$${summary.totalYearly.toFixed(2)}`}
            statChange="Annual projection"
            changeType="neutral"
          />
          <StatCard
            title="Services"
            icon="🧾"
            statNumber={costs.length.toString()}
            statChange="Total cost items"
            changeType="neutral"
          />
          <StatCard
            title="Last Updated"
            icon="⏰"
            statNumber={new Date(summary.lastUpdated).toLocaleDateString()}
            statChange="Data refresh"
            changeType="neutral"
          />
        </GridSection>
      )}

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Cost Breakdown"
          description={`Showing ${costs.length} cost items tracked across your business`}
        >
          <div className="costs-list space-y-4">
            {costs.map((cost) => (
              <div key={cost.id} className="cost-item border border-gray-200 rounded-lg p-4">
                <div className="cost-header flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{cost.service}</h3>
                      <span className={getDataSourceColor(cost.dataSource)}>
                        {cost.dataSource}
                      </span>
                      <span className="text-xl">{getStatusIcon(cost)}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{cost.description}</p>
                  </div>
                </div>
                
                <div className="cost-details grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="detail-item">
                    <div className="text-sm font-medium text-gray-500">Provider</div>
                    <div className="text-base">{cost.provider}</div>
                  </div>
                  <div className="detail-item">
                    <div className="text-sm font-medium text-gray-500">Plan</div>
                    <div className="text-base">{cost.plan}</div>
                  </div>
                  <div className="detail-item">
                    <div className="text-sm font-medium text-gray-500">Billing Cycle</div>
                    <div className="text-base">{cost.billingCycle}</div>
                  </div>
                </div>
                
                {cost.notes && (
                  <div className="cost-notes mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm">{cost.notes}</p>
                  </div>
                )}
                
                <div className="cost-amounts grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="amount-item bg-blue-50 p-3 rounded">
                    <div className="text-sm font-medium text-blue-600">Actual Monthly Cost</div>
                    <div className="text-xl font-bold text-blue-800">
                      ${cost.actualMonthlyCost.toFixed(2)}
                    </div>
                  </div>
                  <div className="amount-item bg-green-50 p-3 rounded">
                    <div className="text-sm font-medium text-green-600">Projected Monthly Cost</div>
                    <div className="text-xl font-bold text-green-800">
                      ${cost.projectedMonthlyCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="Quick Actions"
          description="Common cost management tasks"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>
    </div>
  );
};

export default CostsPage; 