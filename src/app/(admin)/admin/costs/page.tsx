'use client';

import React, { useState, useEffect } from 'react';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import { costAPIIntegrationService } from '@/lib/services/cost-api-integration';
import { CostOptimizationPanel } from '@/components/business/CostOptimizationPanel';
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
  Badge,
  LoadingSpinner
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function CostsPageContent() {
  const { cmsData } = useCMSData();
  const { addToast } = useToast();
  const [costs, setCosts] = useState<RealCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showOptimization, setShowOptimization] = useState(false);
  const [apiIntegrationLoading, setApiIntegrationLoading] = useState(false);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);

  useEffect(() => {
    loadCosts();
    loadServiceProviders();
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

  const loadServiceProviders = () => {
    const providers = costAPIIntegrationService.getServiceProviderStatus();
    setServiceProviders(providers);
  };

  const updateCostsWithAPI = async () => {
    try {
      setApiIntegrationLoading(true);
      await costAPIIntegrationService.updateCostsWithAPIData();
      await loadCosts(); // Reload costs after API update
      addToast('success', 'Cost data updated with real API information');
    } catch (err) {
      console.error('❌ Error updating costs with API:', err);
      addToast('error', 'Failed to update costs with API data');
    } finally {
      setApiIntegrationLoading(false);
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
      label: 'Update with API', 
      onClick: updateCostsWithAPI, 
      variant: 'outline' as const,
      disabled: apiIntegrationLoading
    },
    { 
      label: 'Cost Optimization', 
      onClick: () => setShowOptimization(!showOptimization), 
      variant: 'primary' as const 
    },
    { 
      label: 'Add Cost', 
      onClick: () => window.location.href = '/admin/costs/manual-entry', 
      variant: 'outline' as const 
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
          {getCMSField(cmsData, 'admin.costs.category', cost.category)}
        </Container>
      )
    },
    {
      key: 'projectedMonthlyCost',
      label: 'Projected',
      sortable: true,
      render: (value) => (
        <Container>
          {getCMSField(cmsData, 'admin.costs.projectedCost', `$${(value || 0).toFixed(2)}`)}
        </Container>
      )
    },
    {
      key: 'actualMonthlyCost',
      label: 'Actual',
      sortable: true,
      render: (value) => (
        <Container>
          {getCMSField(cmsData, 'admin.costs.actualCost', `$${(value || 0).toFixed(2)}`)}
        </Container>
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
      icon: "💡",
      label: "Cost Optimization",
      onClick: () => setShowOptimization(!showOptimization)
    },
    {
      id: 2,
      icon: "🔄",
      label: "Update with API",
      onClick: updateCostsWithAPI
    },
    {
      id: 3,
      icon: "📊",
      label: "Cost Analytics",
      onClick: () => addToast('info', 'Analytics dashboard coming soon')
    },
    {
      id: 4,
      icon: "⚙️",
      label: "Cost Settings",
      href: "/admin/cms/business"
    }
  ];

  const overBudgetItems = costs.filter(c => c.actualMonthlyCost > c.projectedMonthlyCost).length;
  const pendingItems = costs.filter(c => c.actualMonthlyCost === 0).length;
  const apiConnectedProviders = serviceProviders.filter(p => p.enabled).length;

  return (
    <>
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
            {getCMSField(cmsData, 'admin.costs.totalMonthlyCost', 'Total monthly cost tracking')}
          </Stack>
        </Box>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Projected Monthly</Text>
            <Text size="xl" weight="bold">{summary ? formatCurrency(summary.totalProjectedCost) : '$0'}</Text>
            <Text variant="muted" size="sm">{costs.length} cost categories</Text>
            {getCMSField(cmsData, 'admin.costs.projectedMonthly', 'Projected monthly costs')}
          </Stack>
        </Box>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Over Budget Items</Text>
            <Text size="xl" weight="bold">{overBudgetItems.toString()}</Text>
            <Text variant="muted" size="sm">{pendingItems} pending updates</Text>
            {getCMSField(cmsData, 'admin.costs.overBudgetItems', 'Items over budget')}
          </Stack>
        </Box>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">API Connected</Text>
            <Text size="xl" weight="bold">{apiConnectedProviders.toString()}</Text>
            <Text variant="muted" size="sm">Service providers</Text>
            {getCMSField(cmsData, 'admin.costs.apiConnected', 'Connected service providers')}
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

      {/* Cost Optimization Panel */}
      {showOptimization && (
        <GridSection variant="content" columns={1}>
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">💡 Cost Optimization</Text>
                <Text variant="muted" size="sm">AI-powered recommendations to reduce your business costs</Text>
              </Stack>
              <CostOptimizationPanel 
                onOptimizationApplied={(optimizationId) => {
                  addToast('success', `Optimization applied: ${optimizationId}`);
                  loadCosts(); // Reload costs after optimization
                }}
                onRefresh={loadCosts}
              />
            </Stack>
          </Box>
        </GridSection>
      )}

      {/* Service Provider Status */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">🔗 Service Provider Status</Text>
              <Text variant="muted" size="sm">Real-time API connections for cost data</Text>
            </Stack>
            
            <Stack spacing="md">
              {serviceProviders.map((provider) => (
                <Stack key={provider.id} direction="horizontal" justify="space-between" align="center">
                  <Stack spacing="xs">
                    <Text weight="bold">{provider.name}</Text>
                    <Text variant="muted" size="sm">
                      {provider.enabled ? 'Connected' : 'Not configured'}
                    </Text>
                  </Stack>
                  
                  <Stack direction="horizontal" align="center" spacing="sm">
                    <Badge 
                      variant={provider.enabled ? 'success' : 'warning'}
                      size="sm"
                    >
                      {provider.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    {provider.lastUpdate && (
                      <Text variant="muted" size="sm">
                        Updated: {provider.lastUpdate.toLocaleTimeString()}
                      </Text>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>

            {apiIntegrationLoading && (
              <Stack direction="horizontal" align="center" spacing="sm">
                <LoadingSpinner size="sm" />
                <Text size="sm">Updating cost data with API...</Text>
              </Stack>
            )}
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
    </>
  );
}

function CostsPage() {
  return (
    <ToastProvider>
      <CostsPageContent />
    </ToastProvider>
  );
}

export default CostsPage; 