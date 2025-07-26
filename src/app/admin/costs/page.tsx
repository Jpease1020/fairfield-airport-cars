'use client';

import { useState, useEffect } from 'react';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import Link from 'next/link';
import { 
  AdminPageWrapper,
  GridSection, 
  StatCard, 
  InfoCard, 
  ActionGrid
} from '@/components/ui';
import { Button } from '@/components/ui/button';

const CostsPage = () => {
  const [costs, setCosts] = useState<RealCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setError(null);
      setLoading(true);
      const costsData = await realCostTrackingService.getCosts();
      setCosts(costsData);
      
      const summaryData = await realCostTrackingService.getRealCostSummary();
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load costs data. Please try again.');
      console.error('Error loading costs:', err);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AdminPageWrapper
      title="Cost Tracking"
      subtitle="Monitor and manage your business costs and expenses"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading cost data..."
      errorTitle="Cost Loading Error"
    >
      {/* Stats Overview */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Monthly Cost"
          icon="💰"
          statNumber={summary ? formatCurrency(summary.totalActualCost) : '$0'}
          statChange={summary && summary.totalProjectedCost > 0 
            ? `${((summary.totalActualCost / summary.totalProjectedCost - 1) * 100).toFixed(1)}% vs projected`
            : 'No projection'
          }
          changeType={summary && summary.totalActualCost > summary.totalProjectedCost ? 'negative' : 'positive'}
        />
        
        <StatCard
          title="Projected Monthly"
          icon="📊"
          statNumber={summary ? formatCurrency(summary.totalProjectedCost) : '$0'}
          statChange={`${costs.length} cost categories`}
          changeType="neutral"
        />
        
        <StatCard
          title="Over Budget Items"
          icon="⚠️"
          statNumber={costs.filter(c => c.actualMonthlyCost > c.projectedMonthlyCost).length.toString()}
          statChange={`${costs.filter(c => c.actualMonthlyCost === 0).length} pending`}
          changeType={costs.filter(c => c.actualMonthlyCost > c.projectedMonthlyCost).length > 0 ? 'negative' : 'positive'}
        />
        
        <StatCard
          title="Cost Categories"
          icon="📋"
          statNumber={costs.length.toString()}
          statChange="Active tracking"
          changeType="neutral"
        />
      </GridSection>

      {/* Cost Breakdown */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="💰 Cost Breakdown"
          description="Individual cost categories and their status"
        >
          {costs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">📊 No cost data available</p>
              <p className="text-sm mt-2">Add some manual cost entries to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {costs.map((cost, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStatusIcon(cost)}</span>
                    <div>
                      <h4 className="font-medium">{cost.category}</h4>
                      <p className="text-sm text-gray-600">{cost.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(cost.actualMonthlyCost)} / {formatCurrency(cost.projectedMonthlyCost)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Actual / Projected
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="⚡ Quick Actions"
          description="Manage your cost tracking and analysis"
        >
          <ActionGrid actions={quickActions} />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default CostsPage; 