'use client';

import { useState, useMemo } from 'react';
import { 
  AdminPageWrapper,
  SettingSection,
  SettingInput,
  ActionButtonGroup,
  StatusMessage,
  ToastProvider,
  useToast,
  GridSection,
  HelpCard,
  Container,
} from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';


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
      icon: '🚗',
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
      error={error}
      errorTitle="Cost Entry Error"
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
          <SettingSection
            title="Add New Cost Entry"
            description="Enter details for your business expense"
            icon="💰"
          >
            <Stack spacing="md">
              <SettingInput
              id="cost-date"
              label="Date"
              description="When this cost was incurred"
              type="text"
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
              icon="📅"
            />
            
            <SettingInput
              id="cost-category"
              label="Category *"
              description="Type of expense (e.g., Fuel, Maintenance)"
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              placeholder="e.g., Fuel, Maintenance, Insurance"
              icon="🏷️"
            />
          </Stack>

          <SettingInput
            id="cost-description"
            label="Description *"
            description="Brief description of the expense"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Brief description of the cost"
            icon="📝"
          />

          <SettingInput
            id="cost-amount"
            label="Amount ($) *"
            description="Cost amount in dollars"
            type="number"
            value={formData.amount.toString()}
            onChange={(value) => handleInputChange('amount', parseFloat(value) || 0)}
            placeholder="0.00"
            icon="💲"
          />

          <SettingInput
            id="cost-notes"
            label="Notes (Optional)"
            description="Additional details or context"
            type="text"
            value={formData.notes || ''}
            onChange={(value) => handleInputChange('notes', value)}
            placeholder="Additional notes or details"
            icon="📋"
          />
          </SettingSection>

          {/* Cost Categories Guide */}
          <SettingSection
            title="Cost Categories"
            description="Common expense categories to help organize your costs"
            icon="📊"
          >
            <Stack spacing="md">
              {costCategories.map((category, index) => (
                <HelpCard
                  key={index}
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                />
              ))}
            </Stack>
          </SettingSection>

          {/* Quick Add Actions */}
          <SettingSection
            title="Quick Actions"
            description="Common cost entry shortcuts"
            icon="⚡"
          >
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
          </SettingSection>
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