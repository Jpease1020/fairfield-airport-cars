'use client';

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
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: Date;
  customerEmail: string;
  customerName: string;
}

function PaymentsPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

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

  const handleRefund = async (payment: Payment) => {
    try {
      const response = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      if (response.ok) {
        // Refresh payments
        fetchPayments();
      } else {
        throw new Error('Failed to process refund');
      }
    } catch (err) {
      console.error('Refund error:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      setError(getCMSField(cmsData, 'error-fetchFailed', 'Failed to fetch payments'));
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
          <Text variant="body" data-cms-id="loading-loading-payments" mode={mode}>
            {getCMSField(cmsData, 'loading-loadingPayments', 'Loading payments from database...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <Alert variant="error" title={getCMSField(cmsData, 'error-title', 'Error Loading Payments')}>
            {error}
          </Alert>
          <Button onClick={fetchPayments} variant="primary" data-cms-id="error-try-again" interactionMode={mode}>
            {getCMSField(cmsData, 'error-tryAgain', 'Try Again')}
          </Button>
        </Stack>
      </Container>
    );
  }

  const stats = getPaymentStats();
  const filteredPayments = selectedStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === selectedStatus);

  const tableData = filteredPayments.map(payment => ({
    id: payment.id,
    customer: payment.customerName,
    email: payment.customerEmail,
    amount: formatCurrency(payment.amount, payment.currency),
    status: payment.status,
    date: formatDate(payment.createdAt),
    actions: payment.status === 'completed' ? (
      <Button 
        size="sm" 
        variant="secondary" 
        onClick={() => handleRefund(payment)}
        data-cms-id="table-actions-refund"
        interactionMode={mode}
      >
        {getCMSField(cmsData, 'table-actions-refund', 'Refund')}
      </Button>
    ) : null
  }));

  return (
    <Container>
      <Stack spacing="xl">
        <Stack spacing="md">
          <H1 data-cms-id="title" mode={mode}>
            {getCMSField(cmsData, 'title', 'Payment Management')}
          </H1>
          <Text variant="body" color="secondary" data-cms-id="subtitle" mode={mode}>
            {getCMSField(cmsData, 'subtitle', 'Track all payment transactions and manage refunds')}
          </Text>
        </Stack>

        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium" data-cms-id="filter-title" mode={mode}>
            {getCMSField(cmsData, 'filter-title', 'Filter by Status')}
          </Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all" data-cms-id="filter-all-payments">{getCMSField(cmsData, 'filter-all-payments', 'All Payments')}</option>
            <option value="completed" data-cms-id="filter-completed">{getCMSField(cmsData, 'filter-completed', 'Completed')}</option>
            <option value="pending" data-cms-id="filter-pending">{getCMSField(cmsData, 'filter-pending', 'Pending')}</option>
            <option value="failed" data-cms-id="filter-failed">{getCMSField(cmsData, 'filter-failed', 'Failed')}</option>
            <option value="refunded" data-cms-id="filter-refunded">{getCMSField(cmsData, 'filter-refunded', 'Refunded')}</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">💰</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="stats-total-payments" mode={mode}>
                  {getCMSField(cmsData, 'stats-totalPayments', 'Total Payments')}
                </Text>
                <Text size="xl" weight="bold">{stats.totalPayments}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="stats-completed" mode={mode}>
                  {getCMSField(cmsData, 'stats-completed', 'Completed')}
                </Text>
                <Text size="xl" weight="bold">{stats.completedPayments}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">📊</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="stats-total-revenue" mode={mode}>
                  {getCMSField(cmsData, 'stats-totalRevenue', 'Total Revenue')}
                </Text>
                <Text size="xl" weight="bold">{formatCurrency(stats.totalAmount)}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🔄</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary" data-cms-id="stats-net-revenue" mode={mode}>
                  {getCMSField(cmsData, 'stats-netRevenue', 'Net Revenue')}
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
              <Text size="lg" weight="medium" data-cms-id="table-no-payments-title" mode={mode}>
                {getCMSField(cmsData, 'table-noPayments-title', 'No Payments Found')}
              </Text>
              <Text variant="body" color="secondary" data-cms-id="table-no-payments-description" mode={mode}>
                {getCMSField(cmsData, 'table-noPayments-description', 'No payments match your current filter criteria.')}
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'customer', label: getCMSField(cmsData, 'table-columns-customer', 'Customer') },
              { key: 'email', label: getCMSField(cmsData, 'table-columns-email', 'Email') },
              { key: 'amount', label: getCMSField(cmsData, 'table-columns-amount', 'Amount') },
              { key: 'status', label: getCMSField(cmsData, 'table-columns-status', 'Status') },
              { key: 'date', label: getCMSField(cmsData, 'table-columns-date', 'Date') },
              { key: 'actions', label: getCMSField(cmsData, 'table-columns-actions', 'Actions') }
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