'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/data';
import { realCostTrackingService, type RealCostItem } from '@/lib/real-cost-tracking';
import { 
  DollarSign, 
  Edit, 
  Save, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

const ManualCostEntry = () => {
  const [costs, setCosts] = useState<RealCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    actualMonthlyCost: 0,
    projectedMonthlyCost: 0,
    notes: ''
  });

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    setLoading(true);
    try {
      const costsData = await realCostTrackingService.getCosts();
      setCosts(costsData);
    } catch (error) {
      console.error('Error loading costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cost: RealCostItem) => {
    setEditingId(cost.id);
    setEditForm({
      actualMonthlyCost: cost.actualMonthlyCost,
      projectedMonthlyCost: cost.projectedMonthlyCost,
      notes: cost.notes || ''
    });
  };

  const handleSave = async (costId: string) => {
    setSaving(true);
    try {
      await realCostTrackingService.updateCost(costId, {
        actualMonthlyCost: editForm.actualMonthlyCost,
        projectedMonthlyCost: editForm.projectedMonthlyCost,
        notes: editForm.notes
      });
      
      await loadCosts();
      setEditingId(null);
      setEditForm({ actualMonthlyCost: 0, projectedMonthlyCost: 0, notes: '' });
    } catch (error) {
      console.error('Error saving cost:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ actualMonthlyCost: 0, projectedMonthlyCost: 0, notes: '' });
  };

  const getDataSourceColor = (dataSource: string) => {
    switch (dataSource) {
      case 'api': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-warning text-warning-dark';
      case 'estimated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostStatus = (cost: RealCostItem) => {
    if (cost.actualMonthlyCost === 0) return 'needs-data';
    if (cost.actualMonthlyCost > cost.projectedMonthlyCost) return 'over-budget';
    return 'within-budget';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needs-data': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'over-budget': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'within-budget': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
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

  return (
    <PageContainer>
      <PageHeader 
        title="Manual Cost Entry" 
        subtitle="Enter real costs for services that don't have automatic billing APIs"
      />
      <PageContent>
        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How to Enter Real Costs</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Log into each service's dashboard (Vercel, GitHub, Namecheap, etc.)</li>
                  <li>Check your current monthly/annual billing amount</li>
                  <li>Enter the actual cost in the "Actual Monthly Cost" field</li>
                  <li>Add any notes about billing cycles or special pricing</li>
                  <li>Click "Save" to update the cost data</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost List */}
        <div className="space-y-4">
          {costs.map((cost) => {
            const status = getCostStatus(cost);
            const isEditing = editingId === cost.id;

            return (
              <Card key={cost.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{cost.service}</h3>
                        <Badge className={getDataSourceColor(cost.dataSource)}>
                          {cost.dataSource}
                        </Badge>
                        {getStatusIcon(status)}
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

                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Actual Monthly Cost ($)
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.actualMonthlyCost}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  actualMonthlyCost: parseFloat(e.target.value) || 0
                                })}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Projected Monthly Cost ($)
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.projectedMonthlyCost}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  projectedMonthlyCost: parseFloat(e.target.value) || 0
                                })}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Notes
                            </label>
                            <Textarea
                              value={editForm.notes}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                notes: e.target.value
                              })}
                              placeholder="Add notes about billing, special pricing, etc."
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSave(cost.id)}
                              disabled={saving}
                              className="flex items-center gap-2"
                            >
                              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancel}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </div>

                    {!isEditing && (
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cost)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Actual Monthly</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${costs.reduce((sum, cost) => sum + cost.actualMonthlyCost, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Services with Real Data</p>
                <p className="text-2xl font-bold text-gray-900">
                  {costs.filter(cost => cost.actualMonthlyCost > 0).length} / {costs.length}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Data Entry</p>
                <p className="text-2xl font-bold text-red-600">
                  {costs.filter(cost => cost.actualMonthlyCost === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default ManualCostEntry; 