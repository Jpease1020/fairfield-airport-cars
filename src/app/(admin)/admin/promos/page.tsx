'use client';

import { useEffect, useState } from 'react';
import { PromoCode } from '@/types/promo';
import { 
  GridSection, 
  DataTable,
  DataTableColumn,
  DataTableAction,
  ToastProvider,
  useToast,
  ActionButtonGroup,
  Container,
  Span,
  Card,
  Input,
  Label,
  Select,
  Stack,
  StatCard
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function PromosPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
      addToast('error', getCMSField(cmsData, 'admin.promos.messages.fillRequiredFields', 'Please fill in required fields'));
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
        addToast('success', getCMSField(cmsData, 'admin.promos.messages.promoCreated', 'Promo code created successfully!'));
      } else {
        throw new Error('Failed to create promo code');
      }
    } catch (err) {
      console.error('❌ Error creating promo:', err);
      addToast('error', getCMSField(cmsData, 'admin.promos.messages.createFailed', 'Failed to create promo code. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm(getCMSField(cmsData, 'admin.promos.confirmations.deletePromo', 'Are you sure you want to delete this promo code?'))) return;

    try {
      const res = await fetch(`/api/promos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPromos();
        addToast('success', getCMSField(cmsData, 'admin.promos.messages.promoDeleted', 'Promo code deleted successfully!'));
      } else {
        throw new Error('Failed to delete promo code');
      }
    } catch (err) {
      console.error('❌ Error deleting promo:', err);
      addToast('error', getCMSField(cmsData, 'admin.promos.messages.deleteFailed', 'Failed to delete promo code. Please try again.'));
    }
  };

  const formatPromoValue = (promo: PromoCode) => {
    return promo.type === 'percent' ? `${promo.value}%` : `$${promo.value}`;
  };

  const getPromoStatus = (promo: PromoCode) => {
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return getCMSField(cmsData, 'admin.promos.status.expired', 'Expired');
    if (promo.usageLimit && (promo.usageCount || 0) >= promo.usageLimit) return getCMSField(cmsData, 'admin.promos.status.limitReached', 'Limit Reached');
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return getCMSField(cmsData, 'admin.promos.status.expiringSoon', 'Expiring Soon');
    return getCMSField(cmsData, 'admin.promos.status.active', 'Active');
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
      label: getCMSField(cmsData, 'admin.promos.sections.header.refresh', 'Refresh'), 
      onClick: fetchPromos, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: getCMSField(cmsData, 'admin.promos.sections.header.exportReport', 'Export Report'), 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: getCMSField(cmsData, 'admin.promos.sections.header.analytics', 'Analytics'), 
      onClick: () => alert('Promo analytics dashboard coming soon'), 
      variant: 'primary' as const 
    }
  ];

  // Table columns
  const columns: DataTableColumn<PromoCode>[] = [
    {
      key: 'code',
      label: getCMSField(cmsData, 'admin.promos.sections.table.columns.code.label', 'Promo Code'),
      sortable: true,
      render: (value) => (
        <Span>
          {value}
        </Span>
      )
    },
    {
      key: 'type',
      label: getCMSField(cmsData, 'admin.promos.sections.table.columns.type.label', 'Type'),
      sortable: true,
      render: (value) => (
        <Span>
          {value === 'percent' ? getCMSField(cmsData, 'admin.promos.sections.table.columns.type.percentage', 'Percentage') : getCMSField(cmsData, 'admin.promos.sections.table.columns.type.fixedAmount', 'Fixed Amount')}
        </Span>
      )
    },
    {
      key: 'value',
      label: getCMSField(cmsData, 'admin.promos.sections.table.columns.discount.label', 'Discount'),
      sortable: true,
      render: (_, promo) => (
        <Span>
          {formatPromoValue(promo)}
        </Span>
      )
    },
    {
      key: 'expiresAt',
      label: getCMSField(cmsData, 'admin.promos.sections.table.columns.expiry.label', 'Expiry'),
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : getCMSField(cmsData, 'admin.promos.sections.table.columns.expiry.noExpiry', 'No expiry')
    },
    {
      key: 'usageCount',
      label: getCMSField(cmsData, 'admin.promos.sections.table.columns.usage.label', 'Usage'),
      sortable: true,
      render: (_, promo) => (
        <Container>
          <Span>
            {promo.usageCount || 0}
          </Span>
          <Span>
            /{promo.usageLimit || getCMSField(cmsData, 'admin.promos.sections.table.columns.usage.unlimited', '∞')}
          </Span>
        </Container>
      )
    },
    {
      key: 'actions',
      label: getCMSField(cmsData, 'admin.promos.sections.table.columns.status.label', 'Status'),
      sortable: false,
      render: (_, promo) => renderStatus(promo)
    }
  ];

  // Table actions
  const actions: DataTableAction<PromoCode>[] = [
    {
      label: getCMSField(cmsData, 'admin.promos.sections.table.actions.copyCode', 'Copy Code'),
      icon: '📋',
      onClick: (promo) => {
        navigator.clipboard.writeText(promo.code);
        alert(`${getCMSField(cmsData, 'admin.promos.messages.codeCopied', 'Promo code')} "${promo.code}" ${getCMSField(cmsData, 'admin.promos.messages.copiedToClipboard', 'copied to clipboard!')}`);
      },
      variant: 'outline'
    },
    {
      label: getCMSField(cmsData, 'admin.promos.sections.table.actions.viewUsage', 'View Usage'),
      icon: '📊',
      onClick: (promo) => alert(`${getCMSField(cmsData, 'admin.promos.messages.usageStats', 'Usage statistics for')} ${promo.code} ${getCMSField(cmsData, 'admin.promos.messages.comingSoon', 'coming soon')}`),
      variant: 'outline'
    },
    {
      label: getCMSField(cmsData, 'admin.promos.sections.table.actions.edit', 'Edit'),
      icon: '✏️',
      onClick: (promo) => alert(`${getCMSField(cmsData, 'admin.promos.messages.editFunctionality', 'Edit functionality for')} ${promo.code} ${getCMSField(cmsData, 'admin.promos.messages.comingSoon', 'coming soon')}`),
      variant: 'primary'
    },
    {
      label: getCMSField(cmsData, 'admin.promos.sections.table.actions.delete', 'Delete'),
      icon: '🗑️',
      onClick: (promo) => promo.id && deletePromo(promo.id),
      variant: 'outline'
    }
  ];

  // Calculate stats
  const activePromos = promos.filter(p => getPromoStatus(p) === getCMSField(cmsData, 'admin.promos.status.active', 'Active')).length;
  const totalUsage = promos.reduce((sum, p) => sum + (p.usageCount || 0), 0);
  const expiringPromos = promos.filter(p => getPromoStatus(p) === getCMSField(cmsData, 'admin.promos.status.expiringSoon', 'Expiring Soon')).length;

  return (
    <>
      {/* Promo Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title={getCMSField(cmsData, 'admin.promos.sections.stats.totalPromos.title', 'Total Promos')}
          icon="🎟️"
          statNumber={promos.length.toString()}
          statChange={getCMSField(cmsData, 'admin.promos.sections.stats.totalPromos.description', 'Created codes')}
          changeType="neutral"
        />
        <StatCard
          title={getCMSField(cmsData, 'admin.promos.sections.stats.activePromos.title', 'Active Promos')}
          icon="✅"
          statNumber={activePromos.toString()}
          statChange={getCMSField(cmsData, 'admin.promos.sections.stats.activePromos.description', 'Currently usable')}
          changeType="positive"
        />
        <StatCard
          title={getCMSField(cmsData, 'admin.promos.sections.stats.totalUsage.title', 'Total Usage')}
          icon="📊"
          statNumber={totalUsage.toString()}
          statChange={getCMSField(cmsData, 'admin.promos.sections.stats.totalUsage.description', 'Times used')}
          changeType="positive"
        />
        <StatCard
          title={getCMSField(cmsData, 'admin.promos.sections.stats.expiringSoon.title', 'Expiring Soon')}
          icon="⏰"
          statNumber={expiringPromos.toString()}
          statChange={getCMSField(cmsData, 'admin.promos.sections.stats.expiringSoon.description', 'Within 7 days')}
          changeType={expiringPromos > 0 ? 'negative' : 'neutral'}
        />
      </GridSection>

      {/* Add New Promo Form */}
      <GridSection variant="content" columns={1}>
        <Card
          title={getCMSField(cmsData, 'admin.promos.createPromoTitle', '🎟️ Create New Promo Code')}
          description={getCMSField(cmsData, 'admin.promos.createPromoDesc', 'Add a new promotional discount code for your customers')}
        >
          <Stack spacing="md">
            <Container>
              <Label>
                {getCMSField(cmsData, 'admin.promos.form.code', 'Code (uppercase) *')}
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
                {getCMSField(cmsData, 'admin.promos.form.type', 'Type *')}
              </Label>
              <Select 
                value={form.type} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}
                options={[
                  { value: 'percent', label: getCMSField(cmsData, 'admin.promos.form.type.percentage', 'Percentage %') },
                  { value: 'flat', label: getCMSField(cmsData, 'admin.promos.form.type.fixedAmount', 'Fixed Amount $') }
                ]}
              />
            </Container>
            
            <Container>
              <Label>
                {getCMSField(cmsData, 'admin.promos.form.value', 'Value *')}
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
                {getCMSField(cmsData, 'admin.promos.form.expiresAt', 'Expires At')}
              </Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({...form, expiresAt: e.target.value})}
              />
            </Container>
            
            <Container>
              <Label>
                {getCMSField(cmsData, 'admin.promos.form.usageLimit', 'Usage Limit')}
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
                id: 'create-promo-code',
                label: submitting ? getCMSField(cmsData, 'admin.promos.createPromoButton.submitting', 'Creating...') : getCMSField(cmsData, 'admin.promos.createPromoButton.label', 'Create Promo Code'),
                onClick: addPromo,
                variant: 'primary' as const,
                disabled: !form.code || !form.value || submitting,
                icon: '💳'
              }]}
            />
          </Container>
        </Card>
      </GridSection>

      {/* Promo Codes Table */}
      <GridSection variant="content" columns={1}>
        <Card
          title={getCMSField(cmsData, 'admin.promos.allPromosTitle', '🎟️ All Promo Codes')}
          description={getCMSField(cmsData, 'admin.promos.allPromosDesc', 'Search, sort, and manage your promotional discount codes')}
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

          />
        </Card>
      </GridSection>
    </>
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
