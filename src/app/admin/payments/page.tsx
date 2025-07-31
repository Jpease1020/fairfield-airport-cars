'use client';

import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import withAuth from '../withAuth';
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
} from '@/design/components';

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
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text variant="body">Loading payments from database...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <Alert variant="error" title="Error Loading Payments">
            {error}
          </Alert>
          <Button onClick={fetchPayments} variant="primary">
            Try Again
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
      >
        Refund
      </Button>
    ) : null
  }));

  return (
    <Container>
      <Stack spacing="xl">
        <Stack spacing="md">
          <H1>Payment Management</H1>
          <Text variant="body" color="secondary">
            Track all payment transactions and manage refunds
          </Text>
        </Stack>

        {/* Status Filter */}
        <Stack spacing="sm">
          <Text variant="small" weight="medium">Filter by Status</Text>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </Stack>

        {/* Stats */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">💰</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Total Payments</Text>
                <Text size="xl" weight="bold">{stats.totalPayments}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">✅</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Completed</Text>
                <Text size="xl" weight="bold">{stats.completedPayments}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">📊</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Total Revenue</Text>
                <Text size="xl" weight="bold">{formatCurrency(stats.totalAmount)}</Text>
              </Stack>
            </Stack>
          </Box>
          
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <Text size="xl">🔄</Text>
              <Stack spacing="xs">
                <Text variant="small" color="secondary">Net Revenue</Text>
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
              <Text size="lg" weight="medium">No Payments Found</Text>
              <Text variant="body" color="secondary">
                No payments match your current filter criteria.
              </Text>
            </Stack>
          </Box>
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'email', label: 'Email' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Date' },
              { key: 'actions', label: 'Actions' }
            ]}
          />
        )}
      </Stack>
    </Container>
  );
}

const PaymentsPage: NextPage = () => {
  return <PaymentsPageContent />;
};

export default withAuth(PaymentsPage); 