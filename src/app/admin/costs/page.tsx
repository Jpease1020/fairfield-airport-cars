'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { realCostTrackingService, type RealCostItem } from '@/lib/business/real-cost-tracking';
import { 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Receipt
} from 'lucide-react';
import Link from 'next/link';

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

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading cost data..." />
        </div>
      </PageContainer>
    );
  }

  const getStatusIcon = (cost: RealCostItem) => {
    if (cost.actualMonthlyCost === 0) return <Clock className="h-4 w-4 text-gray-500" />;
    if (cost.actualMonthlyCost > cost.projectedMonthlyCost) return <XCircle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getDataSourceColor = (dataSource: string) => {
    switch (dataSource) {
      case 'api': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-yellow-100 text-yellow-800';
      case 'estimated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Cost Tracking" />
      <PageContent>
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Monthly</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${summary.totalActualMonthly.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Yearly Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${summary.totalYearly.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Services</p>
                    <p className="text-2xl font-bold text-gray-900">{costs.length}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {new Date(summary.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex gap-4">
            <Link href="/admin/costs/manual-entry">
              <Button>
                Add Manual Cost
              </Button>
            </Link>
            <Button variant="outline" onClick={loadCosts}>
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Cost List */}
        <div className="space-y-4">
          {costs.map((cost) => (
            <Card key={cost.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{cost.service}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDataSourceColor(cost.dataSource)}`}>
                        {cost.dataSource}
                      </span>
                      {getStatusIcon(cost)}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{cost.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Provider</label>
                        <p className="text-sm text-gray-600">{cost.provider}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Plan</label>
                        <p className="text-sm text-gray-600">{cost.plan}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
                        <p className="text-sm text-gray-600 capitalize">{cost.billingCycle}</p>
                      </div>
                    </div>
                    
                    {cost.notes && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">{cost.notes}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Actual Monthly Cost</label>
                        <p className="text-lg font-semibold text-gray-900">
                          ${cost.actualMonthlyCost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Projected Monthly Cost</label>
                        <p className="text-lg font-semibold text-gray-900">
                          ${cost.projectedMonthlyCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default CostsPage; 