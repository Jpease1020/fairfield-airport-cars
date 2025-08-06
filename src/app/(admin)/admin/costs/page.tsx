'use client';

import React, { useState, useEffect } from 'react';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import { 
  GridSection, 
  Box, 
  ActionGrid,
  DataTable,
  DataTableColumn,
  DataTableAction,
  ToastProvider,
  useToast,
  Container,
  Span,
  Text,
  Stack,
  EditableText
} from '@/ui';
import { AdminPageWrapper } from '@/components/app';
import withAuth from '../withAuth';

function CostsPageContent() {
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

  const getStatusText = (cost: RealCostItem) => {
    const variance = getVariance(cost.actualMonthlyCost, cost.projectedMonthlyCost);
    
    if (cost.actualMonthlyCost === 0) {
      return 'Pending';
    } else if (variance > 10) {
      return 'Over Budget';
    } else if (variance > 0) {
      return 'Slightly Over';
    } else {
      return 'On Track';
    }
  };

  const renderStatus = (cost: RealCostItem) => {
    const icon = getStatusIcon(cost);
    const statusText = getStatusText(cost);
    
    return (
      <Span>
        {icon} {statusText}
      </Span>
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
      onClick: () => window.location.href = '/admin/costs/manual-entry', 
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
        <Container>
          <EditableText field="admin.costs.category" defaultValue={cost.category}>
            {cost.category}
          </EditableText>
        </Container>
      )
    },
    {
      key: 'projectedMonthlyCost',
      label: 'Projected',
      sortable: true,
      render: (value) => (
        <EditableText field="admin.costs.projectedCost" defaultValue={`$${(value || 0).toFixed(2)}`}>
          ${(value || 0).toFixed(2)}
        </EditableText>
      )
    },
    {
      key: 'actualMonthlyCost',
      label: 'Actual',
      sortable: true,
      render: (value) => (
        <EditableText field="admin.costs.actualCost" defaultValue={`$${(value || 0).toFixed(2)}`}>
          ${(value || 0).toFixed(2)}
        </EditableText>
      )
    },
    {
      key: 'actions',
      label: 'Variance',
      sortable: false,
      render: (_, cost) => {
        const variance = getVariance(cost.actualMonthlyCost, cost.projectedMonthlyCost);
        const isPositive = variance >= 0;
        
        // let varianceClass = 'cost-variance-neutral';
        // if (cost.actualMonthlyCost === 0) {
        //   varianceClass = 'cost-variance-pending';
        // } else if (variance > 10) {
        //   varianceClass = 'cost-variance-over';
        // } else if (variance > 0) {
        //   varianceClass = 'cost-variance-slightly-over';
        // } else {
        //   varianceClass = 'cost-variance-under';
        // }
        
        return (
          <Container>
            {cost.actualMonthlyCost === 0 ? 'N/A' : 
             `${isPositive ? '+' : ''}${variance.toFixed(1)}%`}
          </Container>
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
    >
      {/* Stats Overview */}
      <GridSection variant="stats" columns={4}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Total Monthly Cost</Text>
            <Text size="xl" weight="bold">{summary ? formatCurrency(summary.totalActualCost) : '$0'}</Text>
            <Text variant="muted" size="sm">
              {summary && summary.totalProjectedCost > 0 
                ? `${((summary.totalActualCost / summary.totalProjectedCost - 1) * 100).toFixed(1)}% vs projected`
                : 'No projection'
              }
            </Text>
            <EditableText field="admin.costs.totalMonthlyCost" defaultValue="Total monthly cost tracking">
              Total monthly cost tracking
            </EditableText>
          </Stack>
        </Box>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Projected Monthly</Text>
            <Text size="xl" weight="bold">{summary ? formatCurrency(summary.totalProjectedCost) : '$0'}</Text>
            <Text variant="muted" size="sm">{costs.length} cost categories</Text>
            <EditableText field="admin.costs.projectedMonthly" defaultValue="Projected monthly costs">
              Projected monthly costs
            </EditableText>
          </Stack>
        </Box>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Over Budget Items</Text>
            <Text size="xl" weight="bold">{overBudgetItems.toString()}</Text>
            <Text variant="muted" size="sm">{pendingItems} pending updates</Text>
            <EditableText field="admin.costs.overBudgetItems" defaultValue="Items over budget">
              Items over budget
            </EditableText>
          </Stack>
        </Box>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Cost Categories</Text>
            <Text size="xl" weight="bold">{costs.length.toString()}</Text>
            <Text variant="muted" size="sm">Active tracking</Text>
            <EditableText field="admin.costs.costCategories" defaultValue="Active cost categories">
              Active cost categories
            </EditableText>
          </Stack>
        </Box>
      </GridSection>

      {/* Cost Breakdown Table */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">💰 Cost Breakdown</Text>
              <Text variant="muted" size="sm">Search, sort, and manage your business cost categories</Text>
            </Stack>
          <DataTable
            data={costs}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by cost category or description..."
            emptyMessage="No cost data available. Add some manual cost entries to get started."
            emptyIcon="💰"
            pageSize={15}
          />
          </Stack>
        </Box>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">⚡ Quick Actions</Text>
              <Text variant="muted" size="sm">Manage your cost tracking and generate reports</Text>
            </Stack>
            <ActionGrid actions={quickActions} columns={4} />
          </Stack>
        </Box>
      </GridSection>
    </AdminPageWrapper>
  );
}

function CostsPage() {
  return (
    <ToastProvider>
      <CostsPageContent />
    </ToastProvider>
  );
}

export default withAuth(CostsPage);
