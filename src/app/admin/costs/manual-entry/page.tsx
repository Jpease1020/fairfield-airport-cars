'use client';

import { useState } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { realCostTrackingService } from '@/lib/business/real-cost-tracking';

interface CostEntry {
  date: string;
  category: string;
  description: string;
  amount: number;
  notes?: string;
}

const ManualCostEntryPage = () => {
  const [formData, setFormData] = useState<CostEntry>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await realCostTrackingService.addCost({
        service: formData.category,
        category: formData.category,
        description: formData.description,
        actualMonthlyCost: formData.amount,
        projectedMonthlyCost: formData.amount,
        lastBillingDate: formData.date,
        nextBillingDate: formData.date,
        billingCycle: 'monthly',
        provider: 'Manual Entry',
        accountId: 'manual',
        plan: 'Manual',
        dataSource: 'manual',
        notes: formData.notes || undefined
      });

      setMessage('Cost entry added successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding cost entry:', error);
      setMessage('Failed to add cost entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CostEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PageContainer>
      <PageHeader title="Manual Cost Entry" />
      <PageContent>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New Cost Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="e.g., Fuel, Maintenance, Insurance"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the cost"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or details"
                    rows={3}
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-md ${
                    message.includes('successfully') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Cost Entry'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        category: '',
                        description: '',
                        amount: 0,
                        notes: ''
                      });
                      setMessage('');
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Cost Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Vehicle Costs</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Fuel</li>
                    <li>• Maintenance & Repairs</li>
                    <li>• Insurance</li>
                    <li>• Registration & Licensing</li>
                    <li>• Vehicle Purchase/Lease</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Operational Costs</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Driver Wages</li>
                    <li>• Office Rent</li>
                    <li>• Utilities</li>
                    <li>• Software & Technology</li>
                    <li>• Marketing & Advertising</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ManualCostEntryPage; 