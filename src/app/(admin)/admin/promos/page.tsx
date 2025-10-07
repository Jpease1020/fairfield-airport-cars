'use client';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

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
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

function PromosPageContent() {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
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

  const [submitting, setSubmitting] = useState(false);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      
      const res = await fetch('/api/promos');
      if (res.ok) {
        const promoData = await res.json();
        setPromos(promoData);
      } else {
        throw new Error('Failed to fetch promo codes');
      }
    } catch (err) {
      console.error('❌ Error loading promos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const addPromo = async () => {
    if (!form.code || !form.value) {
      addToast('error', cmsData?.['admin-promos-messages-fillRequiredFields'] || 'Please fill in required fields');
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
        addToast('success', cmsData?.['admin-promos-messages-promoCreated'] || 'Promo code created successfully!');
      } else {
        throw new Error('Failed to create promo code');
      }
    } catch (err) {
      console.error('❌ Error creating promo:', err);
      addToast('error', cmsData?.['admin-promos-messages-createFailed'] || 'Failed to create promo code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm(cmsData?.['admin-promos-confirmations-deletePromo'] || 'Are you sure you want to delete this promo code?')) return;

    try {
      const res = await fetch(`/api/promos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPromos();
        addToast('success', cmsData?.['admin-promos-messages-promoDeleted'] || 'Promo code deleted successfully!');
      } else {
        throw new Error('Failed to delete promo code');
      }
    } catch (err) {
      console.error('❌ Error deleting promo:', err);
      addToast('error', cmsData?.['admin-promos-messages-deleteFailed'] || 'Failed to delete promo code. Please try again.');
    }
  };

  const formatPromoValue = (promo: PromoCode) => {
    return promo.type === 'percent' ? `${promo.value}%` : `$${promo.value}`;
  };

  const getPromoStatus = (promo: PromoCode) => {
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return cmsData?.['admin-promos-status-expired'] || 'Expired';
    if (promo.usageLimit && (promo.usageCount || 0) >= promo.usageLimit) return cmsData?.['admin-promos-status-limitReached'] || 'Limit Reached';
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return cmsData?.['admin-promos-status-expiringSoon'] || 'Expiring Soon';
    return cmsData?.['admin-promos-status-active'] || 'Active';
  };

  const renderStatus = (promo: PromoCode) => {
    const status = getPromoStatus(promo);

    return (
      <Span cmsId={`promo-status-${promo.id}`}>
        {status}
      </Span>
    );
  };
  // Table columns
  const columns: DataTableColumn<PromoCode>[] = [
    {
      key: 'code',
      label: cmsData?.['admin-promos-sections-table-columns-code-label'] || 'Promo Code',
      sortable: true,
      render: (value) => (
        <Span cmsId={`promo-code-${value}`}>
          {value}
        </Span>
      )
    },
    {
      key: 'type',
      label: cmsData?.['admin-promos-sections-table-columns-type-label'] || 'Type',
      sortable: true,
      render: (value) => (
        <Span cmsId={`promo-type-${value}`}>
          {value === 'percent' ? cmsData?.['admin-promos-sections-table-columns-type-percentage'] || 'Percentage' : cmsData?.['admin-promos-sections-table-columns-type-fixedAmount'] || 'Fixed Amount'}
        </Span>
      )
    },
    {
      key: 'value',
      label: cmsData?.['admin-promos-sections-table-columns-discount-label'] || 'Discount',
      sortable: true,
      render: (_, promo) => (
        <Span cmsId={`promo-value-${promo.id}`}>
          {formatPromoValue(promo)}
        </Span>
      )
    },
    {
      key: 'expiresAt',
      label: cmsData?.['admin-promos-sections-table-columns-expiry-label'] || 'Expiry',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : cmsData?.['admin-promos-sections-table-columns-expiry-noExpiry'] || 'No expiry'
    },
    {
      key: 'usageCount',
      label: cmsData?.['admin-promos-sections-table-columns-usage-label'] || 'Usage',
      sortable: true,
      render: (_, promo) => (
        <Container>
          <Span cmsId={`promo-usage-count-${promo.id}`}>
            {String(promo.usageCount || 0)}
          </Span>
          <Span cmsId={`promo-usage-limit-${promo.id}`}>
            /{String(promo.usageLimit) || cmsData?.['admin-promos-sections-table-columns-usage-unlimited'] || '∞'}
          </Span>
        </Container>
      )
    },
    {
      key: 'actions',
      label: cmsData?.['admin-promos-sections-table-columns-status-label'] || 'Status',
      sortable: false,
      render: (_, promo) => renderStatus(promo)
    }
  ];

  // Table actions
  const actions: DataTableAction<PromoCode>[] = [
    {
      label: cmsData?.['admin-promos-sections-table-actions-copyCode'] || 'Copy Code',
      icon: '📋',
      onClick: (promo) => {
        navigator.clipboard.writeText(promo.code);
        alert(`${cmsData?.['admin-promos-messages-codeCopied'] || 'Promo code'} "${promo.code}" ${cmsData?.['admin-promos-messages-copiedToClipboard'] || 'copied to clipboard!'}`);
      },
      variant: 'outline'
    },
    {
      label: cmsData?.['admin-promos-sections-table-actions-viewUsage'] || 'View Usage',
      icon: '📊',
      onClick: (promo) => alert(`${cmsData?.['admin-promos-messages-usageStats'] || 'Usage statistics for'} ${promo.code} ${cmsData?.['admin-promos-messages-comingSoon'] || 'coming soon'}`),
      variant: 'outline'
    },
    {
      label: cmsData?.['admin-promos-sections-table-actions-edit'] || 'Edit',
      icon: '✏️',
      onClick: (promo) => alert(`${cmsData?.['admin-promos-messages-editFunctionality'] || 'Edit functionality for'} ${promo.code} ${cmsData?.['admin-promos-messages-comingSoon'] || 'coming soon'}`),
      variant: 'primary'
    },
    {
      label: cmsData?.['admin-promos-sections-table-actions-delete'] || 'Delete',
      icon: '🗑️',
      onClick: (promo) => promo.id && deletePromo(promo.id),
      variant: 'outline'
    }
  ];

  // Calculate stats
    const activePromos = promos.filter(p => getPromoStatus(p) === cmsData?.['admin-promos-status-active'] || 'Active').length;
  const totalUsage = promos.reduce((sum, p) => sum + (p.usageCount || 0), 0);
  const expiringPromos = promos.filter(p => getPromoStatus(p) === cmsData?.['admin-promos-status-expiringSoon'] || 'Expiring Soon').length;

  return (
    <>
      {/* Promo Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title={cmsData?.['admin-promos-sections-stats-totalPromos-title'] || 'Total Promos'}
          icon="🎟️"
          statNumber={promos.length.toString()}
          statChange={cmsData?.['admin-promos-sections-stats-totalPromos-description'] || 'Created codes'}   
          changeType="neutral"
        />
        <StatCard
          title={cmsData?.['admin-promos-sections-stats-activePromos-title'] || 'Active Promos'}
          icon="✅"
          statNumber={activePromos.toString()}
          statChange={cmsData?.['admin-promos-sections-stats-activePromos-description'] || 'Currently usable'}
          changeType="positive"
        />
        <StatCard
          title={cmsData?.['admin-promos-sections-stats-totalUsage-title'] || 'Total Usage'}
          icon="📊"
          statNumber={totalUsage.toString()}
          statChange={cmsData?.['admin-promos-sections-stats-totalUsage-description'] || 'Times used'}
          changeType="positive"
        />
        <StatCard
          title={cmsData?.['admin-promos-sections-stats-expiringSoon-title'] || 'Expiring Soon'}
          icon="⏰"
          statNumber={expiringPromos.toString()}
          statChange={cmsData?.['admin-promos-sections-stats-expiringSoon-description'] || 'Within 7 days'}
          changeType={expiringPromos > 0 ? 'negative' : 'neutral'}
        />
      </GridSection>

      {/* Add New Promo Form */}
      <GridSection variant="content" columns={1}>
        <Card
          title={cmsData?.['admin-promos-createPromoTitle'] || '🎟️ Create New Promo Code'}
          description={cmsData?.['admin-promos-createPromoDesc'] || 'Add a new promotional discount code for your customers'}
        >
          <Stack spacing="md">
            <Container>
              <Label>
                {cmsData?.['admin-promos-form-code'] || 'Code (uppercase) *'}
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
                {cmsData?.['admin-promos-form-type'] || 'Type *'}
              </Label>
              <Select 
                value={form.type} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}
                options={[
                  { value: 'percent', label: cmsData?.['admin-promos-form-type-percentage'] || 'Percentage %' },
                  { value: 'flat', label: cmsData?.['admin-promos-form-type-fixedAmount'] || 'Fixed Amount $' }
                ]}
              />
            </Container>
            
            <Container>
              <Label>
                {cmsData?.['admin-promos-form-value'] || 'Value *'}
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
                {cmsData?.['admin-promos-form-expiresAt'] || 'Expires At'}
              </Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({...form, expiresAt: e.target.value})}
              />
            </Container>
            
            <Container>
              <Label>
                {cmsData?.['admin-promos-form-usageLimit'] || 'Usage Limit'}
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
                label: submitting ? cmsData?.['admin-promos-createPromoButton-submitting'] || 'Creating...' : cmsData?.['admin-promos-createPromoButton-label'] || 'Create Promo Code',
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
          title={cmsData?.['admin-promos-allPromosTitle'] || '🎟️ All Promo Codes'}
          description={cmsData?.['admin-promos-allPromosDesc'] || 'Search, sort, and manage your promotional discount codes'}
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
