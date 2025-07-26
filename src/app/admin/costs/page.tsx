'use client';

import { useState, useEffect } from 'react';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import { 
  AdminPageWrapper,
  GridSection, 
  StatCard, 
  InfoCard, 
  ActionGrid,
  DataTable,
  DataTableColumn,
  DataTableAction,
  ToastProvider,
  useToast
} from '@/components/ui';


  const { addToast } = useToast();
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
      console.log('💰 Loading costs data...');
      
      const costsData = await realCostTrackingService.getCosts();
      setCosts(costsData);
      
      const summaryData = await realCostTrackingService.getRealCostSummary();
      setSummary(summaryData);
      
      console.log('✅ Costs loaded:', costsData.length, 'categories');
    } catch (err) {
      console.error('❌ Error loading costs:', err);
      setError('Failed to load costs data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (cost: RealCostItem) => {
    if (cost.actualMonthlyCost === 0) return '⏱️';
    if (cost.actualMonthlyCost > cost.projectedMonthlyCost) return '❌';
    return '✅';
  };

  const getVariance = (actual: number, projected: number) => {
    if (projected === 0) return 0;
    return ((actual - projected) / projected) * 100;
  };

  const renderStatus = (cost: RealCostItem) => {
    const variance = getVariance(cost.actualMonthlyCost, cost.projectedMonthlyCost);
    const icon = getStatusIcon(cost);
    
    let statusText = 'On Track';
    let statusStyle = {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #4ade80'
    };

    if (cost.actualMonthlyCost === 0) {
      statusText = 'Pending';
      statusStyle = {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d'
      };
    } else if (variance > 10) {
      statusText = 'Over Budget';
      statusStyle = {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #f87171'
      };
    } else if (variance > 0) {
      statusText = 'Slightly Over';
      statusStyle = {
        backgroundColor: '#fed7aa',
        color: '#c2410c',
        border: '1px solid #fb923c'
      };
    }

    return (
      <span
        style={{
          ...statusStyle,
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)'
        }}
      >
        {icon} {statusText}
      </span>
    );
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadCosts, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Export Report', 
      onClick: () => addToast('info', 'Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Add Cost', 
      href: '/admin/costs/manual-entry', 
      variant: 'primary' as const 
    }
  ];

  // Table columns
  const columns: DataTableColumn<RealCostItem>[] = [
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (_, cost) => (
        <div>
          <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
            {cost.category}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            {cost.description}
          </div>
        </div>
      )
    },
    {
      key: 'projectedMonthlyCost',
      label: 'Projected',
      sortable: true,
      render: (value) => (
        <div style={{ fontWeight: '500' }}>
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'actualMonthlyCost',
      label: 'Actual',
      sortable: true,
      render: (value) => (
        <div style={{ fontWeight: '500' }}>
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Variance',
      sortable: false,
      render: (_, cost) => {
        const variance = getVariance(cost.actualMonthlyCost, cost.projectedMonthlyCost);
        const isPositive = variance >= 0;
        
        return (
          <div style={{ 
            fontWeight: '500',
            color: cost.actualMonthlyCost === 0 ? 'var(--text-secondary)' : 
                   variance > 10 ? '#dc2626' : 
                   variance > 0 ? '#c2410c' : '#166534'
          }}>
            {cost.actualMonthlyCost === 0 ? 'N/A' : 
             `${isPositive ? '+' : ''}${variance.toFixed(1)}%`}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Status',
      sortable: false,
      render: (_, cost) => renderStatus(cost)
    }
  ];

  // Table actions
  const actions: DataTableAction<RealCostItem>[] = [
    {
      label: 'View Details',
      icon: '👁️',
      onClick: (cost) => addToast('info', `Detailed cost breakdown for ${cost.category} coming soon`),
      variant: 'outline'
    },
    {
      label: 'Update Cost',
      icon: '✏️',
      onClick: (cost) => addToast('info', `Cost updating for ${cost.category} coming soon`),
      variant: 'primary'
    },
    {
      label: 'View History',
      icon: '📊',
      onClick: (cost) => addToast('info', `Cost history for ${cost.category} coming soon`),
      variant: 'outline'
    }
  ];

  const quickActions = [
    {
      id: 1,
      icon: "📊",
      label: "Cost Analytics",
      onClick: () => addToast('info', 'Analytics dashboard coming soon')
    },
    {
      id: 2,
      icon: "📋",
      label: "Export Report",
      onClick: () => addToast('info', 'Export functionality coming soon')
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
      label: "Monthly Reports",
      onClick: () => addToast('info', 'Monthly reports coming soon')
    }
  ];

  const overBudgetItems = costs.filter(c => c.actualMonthlyCost > c.projectedMonthlyCost).length;
  const pendingItems = costs.filter(c => c.actualMonthlyCost === 0).length;

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
          statNumber={overBudgetItems.toString()}
          statChange={`${pendingItems} pending updates`}
          changeType={overBudgetItems > 0 ? 'negative' : 'positive'}
        />
        
        <StatCard
          title="Cost Categories"
          icon="📋"
          statNumber={costs.length.toString()}
          statChange="Active tracking"
          changeType="neutral"
        />
      </GridSection>

      {/* Cost Breakdown Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="💰 Cost Breakdown"
          description="Search, sort, and manage your business cost categories"
        >
          <DataTable
            data={costs}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by cost category or description..."
            emptyMessage="No cost data available. Add some manual cost entries to get started."
            emptyIcon="💰"
            pageSize={15}
            rowClassName={(cost) => 
              cost.actualMonthlyCost > cost.projectedMonthlyCost ? 'border-l-4 border-red-500' : 
              cost.actualMonthlyCost === 0 ? 'opacity-75' : ''
            }
            onRowClick={(cost) => console.log('Clicked cost category:', cost.category)}
          />
        </InfoCard>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="⚡ Quick Actions"
          description="Manage your cost tracking and generate reports"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

const CostsPage = () => {
  return (
    <ToastProvider>
      <CostsPageContent />
    </ToastProvider>
  );
