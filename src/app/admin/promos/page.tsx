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
  Option
} from '@/components/ui';

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
      <span className="status-badge">
        {status}
      </span>
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
        <span className="promo-code">
          {value}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="promo-type">
          {value === 'percent' ? 'Percentage' : 'Fixed Amount'}
        </span>
      )
    },
    {
      key: 'value',
      label: 'Discount',
      sortable: true,
      render: (_, promo) => (
        <span className="promo-value">
          {formatPromoValue(promo)}
        </span>
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
        <div className="usage-display">
          <span className="usage-count">
            {promo.usageCount || 0}
          </span>
          <span className="usage-limit">
            /{promo.usageLimit || '∞'}
          </span>
        </div>
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
      variant: 'destructive'
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
          title="Total Promos"
          icon="🎟️"
          statNumber={promos.length.toString()}
          statChange="Created codes"
          changeType="neutral"
        />
        <StatCard
          title="Active Promos"
          icon="✅"
          statNumber={activePromos.toString()}
          statChange="Currently usable"
          changeType="positive"
        />
        <StatCard
          title="Total Usage"
          icon="📊"
          statNumber={totalUsage.toString()}
          statChange="Times used"
          changeType="positive"
        />
        <StatCard
          title="Expiring Soon"
          icon="⏰"
          statNumber={expiringPromos.toString()}
          statChange="Within 7 days"
          changeType={expiringPromos > 0 ? 'negative' : 'neutral'}
        />
      </GridSection>

      {/* Add New Promo Form */}
      <GridSection variant="content" columns={1}>
        <FormSection
          title="🎟️ Create New Promo Code"
          description="Add a new promotional discount code for your customers"
          icon="🎟️"
        >
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">
                Code (uppercase) *
              </label>
              <input
                className="form-input"
                type="text"
                value={form.code}
                onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="SAVE20"
                required
              />
            </div>
            
            <div className="form-field">
              <Label className="form-label">
                Type *
              </Label>
              <Select 
                className="form-input"
                value={form.type} 
                onChange={(e) => setForm({...form, type: e.target.value})}
              >
                <Option value="percent">Percentage %</Option>
                <Option value="flat">Fixed Amount $</Option>
              </Select>
            </div>
            
            <div className="form-field">
              <Label className="form-label">
                Value *
              </Label>
              <Input
                className="form-input"
                type="number"
                value={form.value}
                onChange={(e) => setForm({...form, value: e.target.value})}
                placeholder="20"
                required
              />
            </div>
            
            <div className="form-field">
              <Label className="form-label">
                Expires At
              </Label>
              <Input
                className="form-input"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({...form, expiresAt: e.target.value})}
              />
            </div>
            
            <div className="form-field">
              <Label className="form-label">
                Usage Limit
              </Label>
              <Input
                className="form-input"
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({...form, usageLimit: e.target.value})}
                placeholder="100"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <ActionButtonGroup
              buttons={[{
                label: submitting ? 'Creating...' : 'Create Promo Code',
                onClick: addPromo,
                variant: 'primary' as const,
                disabled: !form.code || !form.value || submitting,
                icon: '💳'
              }]}
            />
          </div>
        </FormSection>
      </GridSection>

      {/* Promo Codes Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎟️ All Promo Codes"
          description="Search, sort, and manage your promotional discount codes"
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
