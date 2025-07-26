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
  ActionButtonGroup
} from '@/components/ui';


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
        alert('Promo code deleted successfully!');
      } else {
        throw new Error('Failed to delete promo code');
      }
    } catch (err) {
      console.error('❌ Error deleting promo:', err);
      alert('Failed to delete promo code. Please try again.');
    }
  };

  const formatPromoValue = (promo: PromoCode) => {
    return promo.type === 'percent' ? `${promo.value}%` : `$${promo.value}`;
  };

  const getPromoStatus = (promo: PromoCode) => {
    const now = new Date();
    const expires = promo.expiresAt ? new Date(promo.expiresAt) : null;
    
    if (expires && now > expires) return 'Expired';
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return 'Limit Reached';
    if (expires && expires.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'Expiring Soon';
    return 'Active';
  };

  const renderStatus = (promo: PromoCode) => {
    const status = getPromoStatus(promo);
    let statusStyle = {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #4ade80'
    };

    switch (status) {
      case 'Expired':
      case 'Limit Reached':
        statusStyle = {
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #f87171'
        };
        break;
      case 'Expiring Soon':
        statusStyle = {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fcd34d'
        };
        break;
    }

    return (
      <span
        style={{
          ...statusStyle,
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: '500'
        }}
      >
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
        <span style={{
          fontFamily: 'monospace',
          fontWeight: '600',
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-sm)'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span style={{ 
          textTransform: 'capitalize',
          fontWeight: '500'
        }}>
          {value === 'percent' ? 'Percentage' : 'Fixed Amount'}
        </span>
      )
    },
    {
      key: 'value',
      label: 'Discount',
      sortable: true,
      render: (_, promo) => (
        <span style={{ 
          fontWeight: '500',
          color: 'var(--primary-color)'
        }}>
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
        <div>
          <span style={{ fontWeight: '500' }}>
            {promo.usageCount || 0}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-xs)',
                fontWeight: '500',
                fontSize: 'var(--font-size-sm)'
              }}>
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
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-xs)',
                fontWeight: '500',
                fontSize: 'var(--font-size-sm)'
              }}>
                Type *
              </label>
              <select 
                className="form-input"
                value={form.type} 
                onChange={(e) => setForm({...form, type: e.target.value})}
              >
                <option value="percent">Percentage %</option>
                <option value="flat">Fixed Amount $</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-xs)',
                fontWeight: '500',
                fontSize: 'var(--font-size-sm)'
              }}>
                Value *
              </label>
              <input
                className="form-input"
                type="number"
                value={form.value}
                onChange={(e) => setForm({...form, value: e.target.value})}
                placeholder="20"
                required
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-xs)',
                fontWeight: '500',
                fontSize: 'var(--font-size-sm)'
              }}>
                Expires At
              </label>
              <input
                className="form-input"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({...form, expiresAt: e.target.value})}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-xs)',
                fontWeight: '500',
                fontSize: 'var(--font-size-sm)'
              }}>
                Usage Limit
              </label>
              <input
                className="form-input"
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({...form, usageLimit: e.target.value})}
                placeholder="100"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
