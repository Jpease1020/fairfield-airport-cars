'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container,
  Stack,
  Text,
  Box,
  Badge,
  Button,
  LoadingSpinner,
  Alert,
  GridSection
} from '@/ui';
import { colors } from '@/design/foundation/tokens/tokens';
import styled from 'styled-components';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';

// Styled components for optimization panel
const OptimizationCard = styled.div<{ $priority: 'high' | 'medium' | 'low' }>`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${props => {
    switch (props.$priority) {
      case 'high': return colors.danger[200];
      case 'medium': return colors.warning[200];
      case 'low': return colors.success[200];
      default: return colors.gray[200];
    }
  }};
  background: ${props => {
    switch (props.$priority) {
      case 'high': return colors.danger[50];
      case 'medium': return colors.warning[50];
      case 'low': return colors.success[50];
      default: return colors.gray[50];
    }
  }};
`;

const SavingsIndicator = styled.div<{ $savings: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => {
    if (props.$savings > 100) return colors.success[600];
    if (props.$savings > 50) return colors.warning[600];
    return colors.danger[600];
  }};
`;

interface CostOptimizationPanelProps {
  onOptimizationApplied?: (optimizationId: string) => void;
  onRefresh?: () => void;
}

interface OptimizationOpportunity {
  id: string;
  category: string;
  service: string;
  currentCost: number;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  estimatedTimeframe: string;
  confidence: number;
}

export function CostOptimizationPanel({
  onOptimizationApplied,
  onRefresh
}: CostOptimizationPanelProps) {
  const [optimizations, setOptimizations] = useState<OptimizationOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingOptimization, setApplyingOptimization] = useState<string | null>(null);

  // Load optimization opportunities
  useEffect(() => {
    loadOptimizations();
  }, []);

  const loadOptimizations = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💡 Loading cost optimization opportunities...');
      
      const costs = await realCostTrackingService.getCosts();
      const summary = await realCostTrackingService.getRealCostSummary();
      
      // Generate optimization opportunities based on cost data
      const opportunities = generateOptimizationOpportunities(costs, summary);
      setOptimizations(opportunities);
      
      console.log('✅ Optimization opportunities loaded:', opportunities.length);
    } catch (err) {
      console.error('❌ Error loading optimizations:', err);
      setError('Failed to load optimization opportunities');
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizationOpportunities = (
    costs: RealCostItem[], 
    summary: any
  ): OptimizationOpportunity[] => {
    const opportunities: OptimizationOpportunity[] = [];

    // Analyze each cost category for optimization opportunities
    costs.forEach((cost) => {
      const variance = cost.projectedMonthlyCost > 0 
        ? ((cost.actualMonthlyCost - cost.projectedMonthlyCost) / cost.projectedMonthlyCost) * 100
        : 0;

      // High variance indicates optimization opportunity
      if (variance > 20) {
        opportunities.push({
          id: `opt-${cost.id}`,
          category: cost.category,
          service: cost.service,
          currentCost: cost.actualMonthlyCost,
          potentialSavings: Math.round(cost.actualMonthlyCost * 0.15), // 15% savings estimate
          priority: variance > 50 ? 'high' : variance > 30 ? 'medium' : 'low',
          description: `${cost.service} costs are ${variance.toFixed(1)}% over projected budget`,
          action: 'Review service usage and consider downgrading or switching providers',
          estimatedTimeframe: '1-2 months',
          confidence: Math.max(0.6, 1 - (variance / 100))
        });
      }

      // Check for unused services
      if (cost.actualMonthlyCost > 0 && cost.usageMetrics) {
        const usage = cost.usageMetrics;
        if (usage.apiCalls && usage.apiCalls < 1000) {
          opportunities.push({
            id: `unused-${cost.id}`,
            category: cost.category,
            service: cost.service,
            currentCost: cost.actualMonthlyCost,
            potentialSavings: Math.round(cost.actualMonthlyCost * 0.8), // 80% savings for unused service
            priority: 'high',
            description: `${cost.service} appears to be underutilized (${usage.apiCalls} API calls)`,
            action: 'Consider downgrading to a lower tier or switching to pay-per-use',
            estimatedTimeframe: 'Immediate',
            confidence: 0.9
          });
        }
      }
    });

    // Add general optimization opportunities
    if (summary?.totalActualMonthly > summary?.totalProjectedMonthly) {
      opportunities.push({
        id: 'general-optimization',
        category: 'General',
        service: 'Overall Costs',
        currentCost: summary.totalActualMonthly,
        potentialSavings: Math.round((summary.totalActualMonthly - summary.totalProjectedMonthly) * 0.3),
        priority: 'medium',
        description: 'Overall costs are over projected budget',
        action: 'Review all services and implement cost controls',
        estimatedTimeframe: '2-3 months',
        confidence: 0.7
      });
    }

    return opportunities.sort((a, b) => {
      // Sort by priority (high first) then by potential savings
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.potentialSavings - a.potentialSavings;
    });
  };

  const applyOptimization = async (optimizationId: string) => {
    try {
      setApplyingOptimization(optimizationId);
      
      // Simulate optimization application
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove the applied optimization
      setOptimizations(prev => prev.filter(opt => opt.id !== optimizationId));
      
      if (onOptimizationApplied) {
        onOptimizationApplied(optimizationId);
      }
      
      console.log('✅ Optimization applied:', optimizationId);
    } catch (err) {
      console.error('❌ Error applying optimization:', err);
    } finally {
      setApplyingOptimization(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Good';
    if (confidence >= 0.6) return 'Fair';
    return 'Low';
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Analyzing cost optimization opportunities...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  if (optimizations.length === 0) {
    return (
      <Container>
        <Box variant="outlined" padding="lg">
          <Stack spacing="md" align="center">
            <Text weight="bold" size="lg">🎉 Great Job!</Text>
            <Text variant="muted">
              No cost optimization opportunities found. Your costs are well-managed!
            </Text>
            <Button 
              variant="outline" 
              onClick={loadOptimizations}
            >
              Re-analyze
            </Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
  const highPriorityCount = optimizations.filter(opt => opt.priority === 'high').length;

  return (
    <Container>
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack spacing="xs">
              <Text weight="bold" size="xl">💡 Cost Optimization Opportunities</Text>
              <Text variant="muted">
                AI-powered recommendations to reduce your business costs
              </Text>
            </Stack>
            <Button 
              variant="outline" 
              onClick={loadOptimizations}
              disabled={loading}
            >
              Refresh Analysis
            </Button>
          </Stack>
          
          <GridSection variant="stats" columns={3}>
            <Box variant="elevated" padding="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">Total Potential Savings</Text>
                <Text size="xl" weight="bold" color="success">
                  {formatCurrency(totalPotentialSavings)}
                </Text>
                <Text variant="muted" size="sm">Monthly savings</Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">High Priority Items</Text>
                <Text size="xl" weight="bold" color="error">
                  {highPriorityCount}
                </Text>
                <Text variant="muted" size="sm">Need immediate attention</Text>
              </Stack>
            </Box>
            
            <Box variant="elevated" padding="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">Opportunities</Text>
                <Text size="xl" weight="bold">
                  {optimizations.length}
                </Text>
                <Text variant="muted" size="sm">Optimization recommendations</Text>
              </Stack>
            </Box>
          </GridSection>
        </Stack>

        {/* Optimization Opportunities */}
        <Stack spacing="lg">
          {optimizations.map((optimization) => (
            <OptimizationCard key={optimization.id} $priority={optimization.priority}>
              <Stack spacing="md">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Stack spacing="xs">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <Text size="lg">{getPriorityIcon(optimization.priority)}</Text>
                      <Text weight="bold" size="lg">{optimization.service}</Text>
                      <Badge 
                        variant={
                          optimization.priority === 'high' ? 'error' :
                          optimization.priority === 'medium' ? 'warning' : 'success'
                        }
                        size="sm"
                      >
                        {optimization.priority.toUpperCase()}
                      </Badge>
                    </Stack>
                    <Text variant="muted" size="sm">{optimization.category}</Text>
                  </Stack>
                  
                  <SavingsIndicator $savings={optimization.potentialSavings}>
                    <Text weight="bold" size="lg">
                      +{formatCurrency(optimization.potentialSavings)}
                    </Text>
                    <Text size="sm">/month</Text>
                  </SavingsIndicator>
                </Stack>

                <Stack spacing="sm">
                  <Text weight="bold">Issue</Text>
                  <Text>{optimization.description}</Text>
                </Stack>

                <Stack spacing="sm">
                  <Text weight="bold">Recommended Action</Text>
                  <Text>{optimization.action}</Text>
                </Stack>

                <GridSection variant="content" columns={3}>
                  <Stack spacing="xs">
                    <Text variant="muted" size="sm">Current Cost</Text>
                    <Text weight="bold">{formatCurrency(optimization.currentCost)}</Text>
                  </Stack>
                  
                  <Stack spacing="xs">
                    <Text variant="muted" size="sm">Timeframe</Text>
                    <Text weight="bold">{optimization.estimatedTimeframe}</Text>
                  </Stack>
                  
                  <Stack spacing="xs">
                    <Text variant="muted" size="sm">Confidence</Text>
                    <Text weight="bold">{getConfidenceText(optimization.confidence)}</Text>
                  </Stack>
                </GridSection>

                <Stack direction="horizontal" spacing="md">
                  <Button 
                    variant="primary"
                    onClick={() => applyOptimization(optimization.id)}
                    disabled={applyingOptimization === optimization.id}
                    fullWidth
                  >
                    {applyingOptimization === optimization.id ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Applying...
                      </>
                    ) : (
                      'Apply Optimization'
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => console.log('View details for:', optimization.id)}
                    fullWidth
                  >
                    View Details
                  </Button>
                </Stack>
              </Stack>
            </OptimizationCard>
          ))}
        </Stack>

        {/* Summary */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text weight="bold" size="lg">📊 Optimization Summary</Text>
            
            <GridSection variant="content" columns={2}>
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Total Opportunities</Text>
                <Text weight="bold">{optimizations.length}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Total Potential Savings</Text>
                <Text weight="bold" color="success">{formatCurrency(totalPotentialSavings)}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">High Priority</Text>
                <Text weight="bold" color="error">{highPriorityCount}</Text>
              </Stack>
              
              <Stack spacing="sm">
                <Text variant="muted" size="sm">Implementation Time</Text>
                <Text weight="bold">2-3 months</Text>
              </Stack>
            </GridSection>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
} 