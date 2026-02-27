'use client';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Box, 
  DataTable,
  Alert,
  LoadingSpinner,
  H1
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { authFetch } from '@/lib/utils/auth-fetch';

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: Date;
  customerEmail: string;
  customerName: string;
  reconciliationNotes?: string;
}

function PaymentsPageContent() {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
  
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string | undefined>>({});

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const netRevenue = totalAmount * 0.85; // Assuming 15% platform fee

    return {
      totalPayments,
      completedPayments,
      totalAmount,
      netRevenue,
    };
  };

  const saveReconciliationNote = async (paymentId: string, notes: string) => {
    setSavingNoteId(paymentId);
    try {
      const res = await authFetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reconciliationNotes: notes }),
      });
      if (res.ok) {
        setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, reconciliationNotes: notes } : p)));
        setNoteDrafts((d) => ({ ...d, [paymentId]: '' }));
      }
    } finally {
      setSavingNoteId(null);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authFetch('/api/admin/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (_err) {
      setError(cmsData?.['error-fetchFailed'] || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [cmsData]);

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text variant="body" cmsId="loading-loading-payments" >
            {cmsData?.['loading-loadingPayments'] || 'Loading payments from database...'}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <Alert variant="error" title={cmsData?.['error-title'] || 'Error Loading Payments'}>
            {error}
          </Alert>
          <Button onClick={fetchPayments} variant="primary" cmsId="error-try-again"  text={cmsData?.['error-tryAgain'] || 'Try Again'} />         
        </Stack>
      </Container>
    );
  }

  const stats = getPaymentStats();
  const filteredPayments = selectedStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === selectedStatus);

  const tableData = filteredPayments.map(payment => {
    const note = noteDrafts[payment.id] ?? payment.reconciliationNotes ?? '';
    return {
      id: payment.id,
      customer: payment.customerName,
      email: payment.customerEmail,
      amount: formatCurrency(payment.amount, payment.currency),
      status: payment.status,
      date: formatDate(payment.createdAt),
      notes: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Reconciliation note"
            value={note}
            onChange={(e) => setNoteDrafts((d) => ({ ...d, [payment.id]: e.target.value }))}
            onBlur={() => {
              const v = (noteDrafts[payment.id] ?? payment.reconciliationNotes ?? '').trim();
              if (v !== (payment.reconciliationNotes ?? '')) saveReconciliationNote(payment.id, v);
            }}
            style={{ padding: '6px 8px', fontSize: 13, maxWidth: 200, border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          {savingNoteId === payment.id && <span style={{ fontSize: 12, color: '#6b7280' }}>Saving…</span>}
        </div>
      ),
      bookingLink: payment.bookingId ? (
        <a href={`/booking/${payment.bookingId}`} style={{ fontSize: 13 }}>View booking</a>
      ) : null,
    };
  });

  return (
    <Container>
      <Stack spacing="xl">    
        <Stack spacing="md">
          <H1 cmsId="title" >
            {cmsData?.['title'] || 'Payment Management'}
          </H1>
          <Text variant="body" color="secondary" cmsId="subtitle" >
            {cmsData?.['subtitle'] || 'Track all payment transactions. To refund a booking, use Bookings → Cancel (refunds follow business rules).'}
          </Text>
        </Stack>

        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium" cmsId="filter-title" >
            {cmsData?.['filter-title'] || 'Filter by Status'}
          </Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
                <option value="all">{cmsData?.['filter-all-payments'] || 'All Payments'}</option>
                <option value="completed">{cmsData?.['filter-completed'] || 'Completed'}</option>
                <option value="pending">{cmsData?.['filter-pending'] || 'Pending'}</option>
                <option value="failed">{cmsData?.['filter-failed'] || 'Failed'}</option>
                <option value="refunded">{cmsData?.['filter-refunded'] || 'Refunded'}</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">💰</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-total-payments" >
                  {cmsData?.['stats-totalPayments'] || 'Total Payments'}
                </Text>
                <Text size="xl" weight="bold">{stats.totalPayments}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-completed" >
                  {cmsData?.['stats-completed'] || 'Completed'}
                </Text>
                <Text size="xl" weight="bold">{stats.completedPayments}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">📊</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-total-revenue" >
                  {cmsData?.['stats-totalRevenue'] || 'Total Revenue'}
                </Text>
                <Text size="xl" weight="bold">{formatCurrency(stats.totalAmount)}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🔄</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" cmsId="stats-net-revenue" >
                  {cmsData?.['stats-netRevenue'] || 'Net Revenue'}
                </Text>
                <Text size="xl" weight="bold">{formatCurrency(stats.netRevenue)}</Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <Box>
            <Stack spacing="md" align="center">
              <Text size="xl">💳</Text>
              <Text size="lg" weight="medium" cmsId="table-no-payments-title" >
                {cmsData?.['table-noPayments-title'] || 'No Payments Found'}
              </Text>
              <Text variant="body" color="secondary" cmsId="table-no-payments-description" >
                {cmsData?.['table-noPayments-description'] || 'No payments match your current filter criteria.'}
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'customer', label: cmsData?.['table-columns-customer'] || 'Customer' },
              { key: 'email', label: cmsData?.['table-columns-email'] || 'Email' },
              { key: 'amount', label: cmsData?.['table-columns-amount'] || 'Amount' },
              { key: 'status', label: cmsData?.['table-columns-status'] || 'Status' },
              { key: 'date', label: cmsData?.['table-columns-date'] || 'Date' },
              { key: 'notes', label: 'Notes' },
              { key: 'bookingLink', label: 'Booking' },
            ]}
          />
        )}
      </Stack>
    </Container>
  );
}

const PaymentsPage = () => {
  return <PaymentsPageContent />;
};

export default PaymentsPage; 
