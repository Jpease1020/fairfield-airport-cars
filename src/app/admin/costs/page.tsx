'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { costTrackingService, type CostItem, type CostSummary } from '@/lib/cost-tracking';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Cloud,
  MessageSquare,
  Mail,
  Database,
  Globe,
  Smartphone,
  CreditCard,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const CostsPage = () => {
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Load costs from service
  useEffect(() => {
    const loadCosts = async () => {
      try {
        const costsData = await costTrackingService.getCosts();
        const summaryData = await costTrackingService.getCostSummary();
        
        setCosts(costsData);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error loading costs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCosts();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading cost breakdown..." />
        </div>
      </PageContainer>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hosting & Infrastructure':
        return <Cloud className="h-4 w-4" />;
      case 'Database':
        return <Database className="h-4 w-4" />;
      case 'Communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'Maps & Location':
        return <Globe className="h-4 w-4" />;
      case 'Payment Processing':
        return <CreditCard className="h-4 w-4" />;
      case 'AI Services':
        return <BarChart3 className="h-4 w-4" />;
      case 'Analytics':
        return <TrendingUp className="h-4 w-4" />;
      case 'Domain & SSL':
        return <Shield className="h-4 w-4" />;
      case 'Development':
        return <Settings className="h-4 w-4" />;
      case 'Testing':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Cost Breakdown" 
        subtitle="Complete transparency into all business costs and expenses"
      />
      <PageContent>
        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                  <p className="text-2xl font-bold text-gray-900">${summary?.totalMonthly.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Annual Projected</p>
                  <p className="text-2xl font-bold text-gray-900">${summary?.totalYearly.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold text-gray-900">{costs.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(summary?.byProvider || {}).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Costs by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary?.byCategory || {}).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                    </div>
                    <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Costs by Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary?.byProvider || {}).map(([provider, amount]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{provider}</span>
                    <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cost Breakdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Cost Breakdown</h2>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('yearly')}
              >
                Yearly
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedPeriod === 'monthly' ? 'Monthly Cost' : 'Yearly Cost'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {costs.map((cost) => (
                      <tr key={cost.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{cost.service}</div>
                            <div className="text-sm text-gray-500">{cost.description}</div>
                            {cost.plan && (
                              <div className="text-xs text-gray-400">Plan: {cost.plan}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(cost.category)}
                            <span className="text-sm text-gray-900">{cost.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cost.provider}</div>
                          {cost.accountId && (
                            <div className="text-xs text-gray-500">ID: {cost.accountId}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cost.usage}</div>
                          <div className="text-xs text-gray-500">{cost.billingCycle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            ${selectedPeriod === 'monthly' ? cost.monthlyCost.toFixed(2) : (cost.monthlyCost * 12).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(cost.status)}
                            <span className="text-sm text-gray-900 capitalize">{cost.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Optimization Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Cost Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">High-Cost Services</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Twilio SMS: Consider bulk messaging discounts</li>
                  <li>• Google Maps: Optimize API calls with caching</li>
                  <li>• OpenAI: Monitor token usage and implement rate limiting</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Potential Savings</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Switch to annual billing for 10-20% savings</li>
                  <li>• Negotiate volume discounts with providers</li>
                  <li>• Monitor usage and optimize API calls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry Link */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Need to Enter Real Costs?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The costs shown above are estimates. To see your actual costs, enter real billing data from each service.
                </p>
              </div>
              <Link href="/admin/costs/manual-entry">
                <Button>
                  Enter Real Costs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default CostsPage; 