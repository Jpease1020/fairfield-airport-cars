'use client';

import { useEffect, useState } from 'react';
import { PromoCode } from '@/types/promo';
import { 
  AdminPageWrapper,
  GridSection, 
  InfoCard,
  StatCard,
  DataTable,
  DataTableColumn,
  DataTableAction,
  FormSection,
  ToastProvider,
  useToast,
  ActionButtonGroup,
  Input,
  Label,
  Select,
  Option,
  Container,
  Span,
  EditableText
} from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

function PromosPageContent() {
  const { addToast } = useToast();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [form, setForm] = useState({ 
    code: '', 
    type: 'percent', 
    value: '', 
    expiresAt: '', 
    usageLimit: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPromos = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🎟️ Loading promo codes...');
      
      const res = await fetch('/api/promos');
      if (res.ok) {
        const promoData = await res.json();
        console.log('✅ Promos loaded:', promoData.length, 'codes');
        setPromos(promoData);
      } else {
        throw new Error('Failed to fetch promo codes');
      }
    } catch (err) {
      console.error('❌ Error loading promos:', err);
      setError('Failed to load promo codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const addPromo = async () => {
    if (!form.code || !form.value) {
      addToast('error', 'Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      const body = { 
        ...form, 
        value: Number(form.value), 
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined 
      };
      
      const res = await fetch('/api/promos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });

      if (res.ok) {
        setForm({ code: '', type: 'percent', value: '', expiresAt: '', usageLimit: '' });
        await fetchPromos();
        addToast('success', 'Promo code created successfully!');
      } else {
        throw new Error('Failed to create promo code');
      }
    } catch (err) {
      console.error('❌ Error creating promo:', err);
      addToast('error', 'Failed to create promo code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const res = await fetch(`/api/promos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPromos();
        addToast('success', 'Promo code deleted successfully!');
      } else {
        throw new Error('Failed to delete promo code');
      }
    } catch (err) {
      console.error('❌ Error deleting promo:', err);
      addToast('error', 'Failed to delete promo code. Please try again.');
    }
  };

  const formatPromoValue = (promo: PromoCode) => {
    return promo.type === 'percent' ? `${promo.value}%` : `$${promo.value}`;
  };

  const getPromoStatus = (promo: PromoCode) => {
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return 'Expired';
    if (promo.usageLimit && (promo.usageCount || 0) >= promo.usageLimit) return 'Limit Reached';
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return 'Expiring Soon';
    return 'Active';
  };

  const renderStatus = (promo: PromoCode) => {
    const status = getPromoStatus(promo);

    return (
      <Span>
        {status}
      </Span>
    );
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: fetchPromos, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Export Report', 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Analytics', 
      onClick: () => alert('Promo analytics dashboard coming soon'), 
      variant: 'primary' as const 
    }
  ];

  // Table columns
  const columns: DataTableColumn<PromoCode>[] = [
    {
      key: 'code',
      label: 'Promo Code',
      sortable: true,
      render: (value) => (
        <Span>
          {value}
        </Span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <Span>
          {value === 'percent' ? 'Percentage' : 'Fixed Amount'}
        </Span>
      )
    },
    {
      key: 'value',
      label: 'Discount',
      sortable: true,
      render: (_, promo) => (
        <Span>
          {formatPromoValue(promo)}
        </Span>
      )
    },
    {
      key: 'expiresAt',
      label: 'Expiry',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No expiry'
    },
    {
      key: 'usageCount',
      label: 'Usage',
      sortable: true,
      render: (_, promo) => (
        <Container>
          <Span>
            {promo.usageCount || 0}
          </Span>
          <Span>
            /{promo.usageLimit || '∞'}
          </Span>
        </Container>
      )
    },
    {
      key: 'actions',
      label: 'Status',
      sortable: false,
      render: (_, promo) => renderStatus(promo)
    }
  ];

  // Table actions
  const actions: DataTableAction<PromoCode>[] = [
    {
      label: 'Copy Code',
      icon: '📋',
      onClick: (promo) => {
        navigator.clipboard.writeText(promo.code);
        alert(`Promo code "${promo.code}" copied to clipboard!`);
      },
      variant: 'outline'
    },
    {
      label: 'View Usage',
      icon: '📊',
      onClick: (promo) => alert(`Usage statistics for ${promo.code} coming soon`),
      variant: 'outline'
    },
    {
      label: 'Edit',
      icon: '✏️',
      onClick: (promo) => alert(`Edit functionality for ${promo.code} coming soon`),
      variant: 'primary'
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: (promo) => promo.id && deletePromo(promo.id),
      variant: 'outline'
    }
  ];

  // Calculate stats
  const activePromos = promos.filter(p => getPromoStatus(p) === 'Active').length;
  const totalUsage = promos.reduce((sum, p) => sum + (p.usageCount || 0), 0);
  const expiringPromos = promos.filter(p => getPromoStatus(p) === 'Expiring Soon').length;

  return (
    <AdminPageWrapper
      title="Promo Codes"
      subtitle="Create and manage promotional discount codes"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading promo codes..."
      errorTitle="Promo Load Error"
    >
      {/* Promo Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title={<EditableText field="admin.promos.totalPromosTitle" defaultValue="Total Promos">Total Promos</EditableText>}
          icon="🎟️"
          statNumber={promos.length.toString()}
          statChange={<EditableText field="admin.promos.createdCodesChange" defaultValue="Created codes">Created codes</EditableText>}
          changeType="neutral"
        />
        <StatCard
          title={<EditableText field="admin.promos.activePromosTitle" defaultValue="Active Promos">Active Promos</EditableText>}
          icon="✅"
          statNumber={activePromos.toString()}
          statChange={<EditableText field="admin.promos.currentlyUsableChange" defaultValue="Currently usable">Currently usable</EditableText>}
          changeType="positive"
        />
        <StatCard
          title={<EditableText field="admin.promos.totalUsageTitle" defaultValue="Total Usage">Total Usage</EditableText>}
          icon="📊"
          statNumber={totalUsage.toString()}
          statChange={<EditableText field="admin.promos.timesUsedChange" defaultValue="Times used">Times used</EditableText>}
          changeType="positive"
        />
        <StatCard
          title={<EditableText field="admin.promos.expiringSoonTitle" defaultValue="Expiring Soon">Expiring Soon</EditableText>}
          icon="⏰"
          statNumber={expiringPromos.toString()}
          statChange={<EditableText field="admin.promos.within7DaysChange" defaultValue="Within 7 days">Within 7 days</EditableText>}
          changeType={expiringPromos > 0 ? 'negative' : 'neutral'}
        />
      </GridSection>

      {/* Add New Promo Form */}
      <GridSection variant="content" columns={1}>
        <FormSection
          title={<EditableText field="admin.promos.createPromoTitle" defaultValue="🎟️ Create New Promo Code">🎟️ Create New Promo Code</EditableText>}
          description={<EditableText field="admin.promos.createPromoDesc" defaultValue="Add a new promotional discount code for your customers">Add a new promotional discount code for your customers</EditableText>}
          icon="🎟️"
        >
          <Stack spacing="md">
            <Container>
              <Label>
                <EditableText field="admin.promos.form.code" defaultValue="Code (uppercase) *">Code (uppercase) *</EditableText>
              </Label>
              <Input
                type="text"
                value={form.code}
                onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="SAVE20"
                required
              />
            </Container>
            
            <Container>
              <Label>
                <EditableText field="admin.promos.form.type" defaultValue="Type *">Type *</EditableText>
              </Label>
              <Select 
                value={form.type} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}
              >
                <Option value="percent">Percentage %</Option>
                <Option value="flat">Fixed Amount $</Option>
              </Select>
            </Container>
            
            <Container>
              <Label>
                <EditableText field="admin.promos.form.value" defaultValue="Value *">Value *</EditableText>
              </Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({...form, value: e.target.value})}
                placeholder="20"
                required
              />
            </Container>
            
            <Container>
              <Label>
                <EditableText field="admin.promos.form.expiresAt" defaultValue="Expires At">Expires At</EditableText>
              </Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({...form, expiresAt: e.target.value})}
              />
            </Container>
            
            <Container>
              <Label>
                <EditableText field="admin.promos.form.usageLimit" defaultValue="Usage Limit">Usage Limit</EditableText>
              </Label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({...form, usageLimit: e.target.value})}
                placeholder="100"
              />
            </Container>
          </Stack>
          
          <Container>
            <ActionButtonGroup
              buttons={[{
                label: submitting ? 'Creating...' : 'Create Promo Code',
                onClick: addPromo,
                variant: 'primary' as const,
                disabled: !form.code || !form.value || submitting,
                icon: '💳'
              }]}
            />
          </Container>
        </FormSection>
      </GridSection>

      {/* Promo Codes Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={<EditableText field="admin.promos.allPromosTitle" defaultValue="🎟️ All Promo Codes">🎟️ All Promo Codes</EditableText>}
          description={<EditableText field="admin.promos.allPromosDesc" defaultValue="Search, sort, and manage your promotional discount codes">Search, sort, and manage your promotional discount codes</EditableText>}
        >
          <DataTable
            data={promos}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by promo code or type..."
            emptyMessage="No promo codes created yet. Create your first promotional discount code above."
            emptyIcon="🎟️"
            pageSize={10}
            rowClassName={(promo) => 
              getPromoStatus(promo) === 'Expired' || getPromoStatus(promo) === 'Limit Reached' 
                ? 'opacity-60' : 
              getPromoStatus(promo) === 'Expiring Soon' 
                ? 'border-l-4 border-yellow-500' : ''
            }
            onRowClick={(promo) => console.log('Clicked promo:', promo.code)}
          />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

const PromosPage = () => {
  return (
    <ToastProvider>
      <PromosPageContent />
    </ToastProvider>
  );
};

export default PromosPage;
