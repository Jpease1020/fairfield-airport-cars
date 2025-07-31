'use client';

import { useState, useMemo } from 'react';
import { 
  AdminPageWrapper,
  ActionButtonGroup,
  StatusMessage,
  ToastProvider,
  useToast,
  GridSection,
  Container,
  Box,
  Text,
  H3,
  H4,
} from '@/ui';
import { Stack } from '@/ui';
import { Input } from '@/ui';
import { Label } from '@/ui';


interface CostEntry {
  date: string;
  category: string;
  description: string;
  amount: number;
  notes?: string;
}

function ManualCostEntryPageContent() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<CostEntry>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);





  const handleInputChange = (field: keyof CostEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cost category help cards
  const costCategories = useMemo(() => [
    {
      icon: '🚙',
      title: 'Vehicle Costs',
      description: 'Fuel, Maintenance & Repairs, Insurance, Registration & Licensing, Vehicle Purchase/Lease'
    },
    {
      icon: '⚙️',
      title: 'Operational Costs',
      description: 'Driver Wages, Office Rent, Utilities, Software & Technology, Marketing & Advertising'
    },
    {
      icon: '📊',
      title: 'Administrative',
      description: 'Legal Fees, Accounting, Business License, Professional Services, Banking Fees'
    },
    {
      icon: '🛡️',
      title: 'Safety & Compliance',
      description: 'Safety Equipment, Training, Compliance Audits, Background Checks, Drug Testing'
    }
  ], []);

  return (
    <AdminPageWrapper
      title="Manual Cost Entry"
      subtitle="Add new operational costs to track your business expenses"
    >
      {/* Error Message */}
      {error && (
        <StatusMessage 
          type="error" 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      <GridSection variant="content" columns={1}>
        <Container>
          {/* Cost Entry Form */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">Add New Cost Entry</Text>
                <Text variant="muted" size="sm">Enter details for your business expense</Text>
              </Stack>
              <Container>
                <Label htmlFor="cost-date">Date</Label>
                <Input
                  id="cost-date"
                  type="date"
                  value={formData.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('date', e.target.value)}
                />
                <Text size="sm" color="secondary">When this cost was incurred</Text>
              </Container>
              
              <Container>
                <Label htmlFor="cost-category">Category *</Label>
                <Input
                  id="cost-category"
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Fuel, Maintenance, Insurance"
                />
                <Text size="sm" color="secondary">Type of expense (e.g., Fuel, Maintenance)</Text>
              </Container>

              <Container>
                <Label htmlFor="cost-description">Description *</Label>
                <Input
                  id="cost-description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the cost"
                />
                <Text size="sm" color="secondary">Brief description of the expense</Text>
              </Container>

              <Container>
                <Label htmlFor="cost-amount">Amount ($) *</Label>
                <Input
                  id="cost-amount"
                  type="number"
                  value={formData.amount.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <Text size="sm" color="secondary">Cost amount in dollars</Text>
              </Container>

              <Container>
                <Label htmlFor="cost-notes">Notes (Optional)</Label>
                <Input
                  id="cost-notes"
                  value={formData.notes || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or details"
                />
                <Text size="sm" color="secondary">Additional details or context</Text>
              </Container>
            </Stack>
          </Box>

          {/* Cost Categories Guide */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">Cost Categories</Text>
                <Text variant="muted" size="sm">Common expense categories to help organize your costs</Text>
              </Stack>
              {costCategories.map((category, index) => (
                <Box key={index} variant="elevated" padding="lg">
                  <Stack spacing="sm">
                    <Text variant="lead" size="md" weight="semibold">{category.title}</Text>
                    <Text variant="muted" size="sm">{category.description}</Text>
                                      <Container>
                      <Text size="lg">{category.icon}</Text>
                      <H4>{category.title}</H4>
                      <Text size="sm" color="secondary">{category.description}</Text>
                    </Container>
                  </Stack>
                </Box>
                ))}
              </Stack>
            </Box>

          {/* Quick Add Actions */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">Quick Actions</Text>
                <Text variant="muted" size="sm">Common cost entry shortcuts</Text>
              </Stack>
              <Container>
                <ActionButtonGroup
                  buttons={[
                    {
                      label: 'Add Fuel Cost',
                      onClick: () => {
                        setFormData(prev => ({ ...prev, category: 'Fuel', description: 'Vehicle fuel expense' }));
                        addToast('info', 'Fuel cost template applied');
                      },
                      variant: 'outline',
                      size: 'sm'
                    },
                    {
                      label: 'Add Maintenance',
                      onClick: () => {
                        setFormData(prev => ({ ...prev, category: 'Maintenance', description: 'Vehicle maintenance and repairs' }));
                        addToast('info', 'Maintenance template applied');
                      },
                      variant: 'outline',
                      size: 'sm'
                    },
                    {
                      label: 'Add Insurance',
                      onClick: () => {
                        setFormData(prev => ({ ...prev, category: 'Insurance', description: 'Vehicle insurance payment' }));
                        addToast('info', 'Insurance template applied');
                      },
                      variant: 'outline',
                      size: 'sm'
                    }
                  ]}
                  orientation="horizontal"
                  spacing="sm"
                />
              </Container>
            </Stack>
          </Box>
        </Container>
      </GridSection>
    </AdminPageWrapper>
  );
}

const ManualCostEntryPage = () => {
  return (
    <ToastProvider>
      <ManualCostEntryPageContent />
    </ToastProvider>
  );
};

export default ManualCostEntryPage; 