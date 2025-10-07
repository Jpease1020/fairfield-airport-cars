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
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
  
  
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
        cmsId="table-actions-refund"
        
        text={cmsData?.['table-actions-refund'] || 'Refund'}
      />
    ) : null
  }));

  return (
    <Container>
      <Stack spacing="xl">    
        <Stack spacing="md">
          <H1 cmsId="title" >
            {cmsData?.['title'] || 'Payment Management'}
          </H1>
          <Text variant="body" color="secondary" cmsId="subtitle" >
            {cmsData?.['subtitle'] || 'Track all payment transactions and manage refunds'}
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
              { key: 'actions', label: cmsData?.['table-columns-actions'] || 'Actions' }
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