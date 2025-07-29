'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Card,
  Button,
  Grid,
  GridItem,
  EditableText,
  ToastProvider
} from '@/components/ui';
import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '@/lib/design-system/tokens';

// Styled components for payment page
const PaymentCard = styled(Card)`
  text-align: center;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PaymentValue = styled.div`
  font-size: ${fontSize['4xl']};
  font-weight: ${fontWeight.bold};
  color: var(--primary-color, #0B1F3A);
  margin-bottom: ${spacing.sm};
`;

const PaymentIcon = styled.div`
  font-size: ${fontSize['3xl']};
  margin-bottom: ${spacing.md};
`;

const PaymentItem = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${spacing.sm};
  font-size: ${fontSize.sm};
  font-weight: ${fontWeight.medium};
  background-color: ${({ status }) => {
    switch (status) {
      case 'completed': return 'var(--success-light, #dcfce7)';
      case 'pending': return 'var(--warning-light, #fef3c7)';
      case 'failed': return 'var(--error-light, #fee2e2)';
      case 'refunded': return 'var(--info-light, #dbeafe)';
      default: return 'var(--muted-light, #f3f4f6)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'completed': return 'var(--success-dark, #166534)';
      case 'pending': return 'var(--warning-dark, #92400e)';
      case 'failed': return 'var(--error-dark, #991b1b)';
      case 'refunded': return 'var(--info-dark, #1e40af)';
      default: return 'var(--muted-dark, #374151)';
    }
  }};
`;

interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentType: 'deposit' | 'balance' | 'full';
  stripePaymentId: string;
  createdAt: Date;
  updatedAt: Date;
  refundAmount?: number;
  refundReason?: string;
}

function PaymentsPageContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Mock data for demonstration
  const mockPayments: Payment[] = [
    {
      id: 'pay_1',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      bookingId: 'book_123',
      amount: 75.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      paymentType: 'deposit',
      stripePaymentId: 'pi_1234567890',
      createdAt: new Date('2024-12-20T10:00:00Z'),
      updatedAt: new Date('2024-12-20T10:00:00Z')
    },
    {
      id: 'pay_2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      bookingId: 'book_124',
      amount: 120.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'card',
      paymentType: 'full',
      stripePaymentId: 'pi_1234567891',
      createdAt: new Date('2024-12-21T14:30:00Z'),
      updatedAt: new Date('2024-12-21T14:30:00Z')
    },
    {
      id: 'pay_3',
      customerName: 'Mike Davis',
      customerEmail: 'mike@example.com',
      bookingId: 'book_125',
      amount: 50.00,
      currency: 'USD',
      status: 'refunded',
      paymentMethod: 'card',
      paymentType: 'deposit',
      stripePaymentId: 'pi_1234567892',
      createdAt: new Date('2024-12-19T08:15:00Z'),
      updatedAt: new Date('2024-12-22T16:45:00Z'),
      refundAmount: 50.00,
      refundReason: 'Customer cancelled booking'
    },
    {
      id: 'pay_4',
      customerName: 'Emily Chen',
      customerEmail: 'emily@example.com',
      bookingId: 'book_126',
      amount: 90.00,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'card',
      paymentType: 'balance',
      stripePaymentId: 'pi_1234567893',
      createdAt: new Date('2024-12-22T11:20:00Z'),
      updatedAt: new Date('2024-12-22T11:20:00Z')
    }
  ];

  const fetchPayments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('💰 Fetching payments...');
      
      // TODO: Replace with actual Stripe API call
      // const response = await fetch('/api/admin/payments');
      // const data = await response.json();
      
      // For now, use mock data
      setPayments(mockPayments);
      console.log('✅ Payments loaded:', mockPayments.length);
    } catch (err) {
      console.error('❌ Error loading payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPaymentStats = () => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const completed = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const refunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount || 0), 0);

    return { total, completed, pending, refunded };
  };

  const handleRefund = async (payment: Payment) => {
    try {
      console.log('🔄 Processing refund for payment:', payment.id);
      // TODO: Implement Stripe refund API call
      // const response = await fetch(`/api/admin/payments/${payment.id}/refund`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: payment.amount })
      // });
      
      addToast('success', `Refund processed for ${payment.customerName}`);
      fetchPayments(); // Refresh payments
    } catch (err) {
      console.error('❌ Error processing refund:', err);
      addToast('error', 'Failed to process refund. Please try again.');
    }
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    // TODO: Implement toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const stats = getPaymentStats();

  const quickActions = [
    {
      icon: '💰',
      title: 'Process Refund',
      description: 'Issue refunds for cancelled bookings',
      onClick: () => console.log('Process refund'),
      color: 'var(--warning-base, #f59e0b)'
    },
    {
      icon: '📊',
      title: 'Payment Reports',
      description: 'Generate payment reports and analytics',
      onClick: () => console.log('Payment reports'),
      color: 'var(--info-base, #3b82f6)'
    },
    {
      icon: '🔍',
      title: 'Search Payments',
      description: 'Find specific payments by customer or booking',
      onClick: () => console.log('Search payments'),
      color: 'var(--success-base, #10b981)'
    },
    {
      icon: '⚙️',
      title: 'Payment Settings',
      description: 'Configure Stripe integration and webhooks',
      onClick: () => console.log('Payment settings'),
      color: 'var(--primary-base, #0B1F3A)'
    }
  ];

  const recentActivity = [
    {
      icon: '✅',
      message: 'Payment received from John Smith - $75.00 deposit',
      time: '2 hours ago'
    },
    {
      icon: '🔄',
      message: 'Refund processed for Mike Davis - $50.00',
      time: '1 day ago'
    },
    {
      icon: '❌',
      message: 'Payment failed for Emily Chen - $90.00 balance',
      time: '2 days ago'
    },
    {
      icon: '💰',
      message: 'Payment received from Sarah Johnson - $120.00 full payment',
      time: '3 days ago'
    }
  ];

  if (loading) {
    return (
      <Section variant="default" padding="lg">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <Text>Loading payments...</Text>
          </Stack>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section variant="default" padding="lg">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <Text color="error">{error}</Text>
            <Button onClick={fetchPayments} variant="primary">
              Try Again
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section variant="default" padding="lg">
      <Container maxWidth="2xl">
        <Stack spacing="2xl">
          {/* Header */}
          <Stack spacing="lg" align="center">
            <H1 align="center">
              <EditableText field="admin.payments.title" defaultValue="💰 Payment Management">
                💰 Payment Management
              </EditableText>
            </H1>
            <Text variant="lead" align="center">
              <EditableText field="admin.payments.subtitle" defaultValue="Track customer payments, deposits, and refunds">
                Track customer payments, deposits, and refunds
              </EditableText>
            </Text>
          </Stack>

          {/* Payment Statistics */}
          <Section variant="alternate" padding="lg">
            <Container maxWidth="2xl">
              <Stack spacing="lg" align="center" marginBottom="xl">
                <H2>
                  <EditableText field="admin.payments.statsTitle" defaultValue="📊 Payment Overview">
                    📊 Payment Overview
                  </EditableText>
                </H2>
                <Text variant="lead" align="center">
                  <EditableText field="admin.payments.statsSubtitle" defaultValue="Financial summary and key metrics">
                    Financial summary and key metrics
                  </EditableText>
                </Text>
              </Stack>
              
              <Grid cols={4} gap="lg" responsive>
                <GridItem>
                  <PaymentCard variant="elevated" padding="lg" hover>
                    <Stack spacing="md" align="center">
                      <PaymentIcon>
                        <EditableText field="admin.payments.totalIcon" defaultValue="💰">
                          💰
                        </EditableText>
                      </PaymentIcon>
                      <PaymentValue>
                        <EditableText field="admin.payments.totalValue" defaultValue={formatCurrency(stats.total)}>
                          {formatCurrency(stats.total)}
                        </EditableText>
                      </PaymentValue>
                      <H2 size="md">
                        <EditableText field="admin.payments.totalTitle" defaultValue="Total Revenue">
                          Total Revenue
                        </EditableText>
                      </H2>
                    </Stack>
                  </PaymentCard>
                </GridItem>

                <GridItem>
                  <PaymentCard variant="elevated" padding="lg" hover>
                    <Stack spacing="md" align="center">
                      <PaymentIcon>
                        <EditableText field="admin.payments.completedIcon" defaultValue="✅">
                          ✅
                        </EditableText>
                      </PaymentIcon>
                      <PaymentValue>
                        <EditableText field="admin.payments.completedValue" defaultValue={formatCurrency(stats.completed)}>
                          {formatCurrency(stats.completed)}
                        </EditableText>
                      </PaymentValue>
                      <H2 size="md">
                        <EditableText field="admin.payments.completedTitle" defaultValue="Completed">
                          Completed
                        </EditableText>
                      </H2>
                    </Stack>
                  </PaymentCard>
                </GridItem>

                <GridItem>
                  <PaymentCard variant="elevated" padding="lg" hover>
                    <Stack spacing="md" align="center">
                      <PaymentIcon>
                        <EditableText field="admin.payments.pendingIcon" defaultValue="⏳">
                          ⏳
                        </EditableText>
                      </PaymentIcon>
                      <PaymentValue>
                        <EditableText field="admin.payments.pendingValue" defaultValue={formatCurrency(stats.pending)}>
                          {formatCurrency(stats.pending)}
                        </EditableText>
                      </PaymentValue>
                      <H2 size="md">
                        <EditableText field="admin.payments.pendingTitle" defaultValue="Pending">
                          Pending
                        </EditableText>
                      </H2>
                    </Stack>
                  </PaymentCard>
                </GridItem>

                <GridItem>
                  <PaymentCard variant="elevated" padding="lg" hover>
                    <Stack spacing="md" align="center">
                      <PaymentIcon>
                        <EditableText field="admin.payments.refundedIcon" defaultValue="🔄">
                          🔄
                        </EditableText>
                      </PaymentIcon>
                      <PaymentValue>
                        <EditableText field="admin.payments.refundedValue" defaultValue={formatCurrency(stats.refunded)}>
                          {formatCurrency(stats.refunded)}
                        </EditableText>
                      </PaymentValue>
                      <H2 size="md">
                        <EditableText field="admin.payments.refundedTitle" defaultValue="Refunded">
                          Refunded
                        </EditableText>
                      </H2>
                    </Stack>
                  </PaymentCard>
                </GridItem>
              </Grid>
            </Container>
          </Section>

          {/* Quick Actions */}
          <Section variant="default" padding="lg">
            <Container maxWidth="2xl">
              <Stack spacing="lg" align="center" marginBottom="xl">
                <H2>
                  <EditableText field="admin.payments.quickActionsTitle" defaultValue="⚡ Quick Actions">
                    ⚡ Quick Actions
                  </EditableText>
                </H2>
                <Text variant="lead" align="center">
                  <EditableText field="admin.payments.quickActionsSubtitle" defaultValue="Common payment management tasks">
                    Common payment management tasks
                  </EditableText>
                </Text>
              </Stack>
              
              <Grid cols={2} gap="lg" responsive>
                {quickActions.map((action, index) => (
                  <GridItem key={index}>
                    <div onClick={action.onClick} style={{ cursor: 'pointer' }}>
                      <Card
                        variant="elevated"
                        padding="lg"
                        hover
                      >
                        <Stack spacing="md">
                          <Stack direction="horizontal" gap="md" align="center">
                            <div style={{ fontSize: fontSize['3xl'], color: action.color }}>
                              <EditableText field={`admin.payments.actionIcon${index}`} defaultValue={action.icon}>
                                {action.icon}
                              </EditableText>
                            </div>
                            <H2 size="lg">
                              <EditableText field={`admin.payments.actionTitle${index}`} defaultValue={action.title}>
                                {action.title}
                              </EditableText>
                            </H2>
                          </Stack>
                          <Text align="left">
                            <EditableText field={`admin.payments.actionDesc${index}`} defaultValue={action.description}>
                              {action.description}
                            </EditableText>
                          </Text>
                        </Stack>
                      </Card>
                    </div>
                  </GridItem>
                ))}
              </Grid>
            </Container>
          </Section>

          {/* Recent Payments */}
          <Section variant="alternate" padding="lg">
            <Container maxWidth="2xl">
              <Stack spacing="lg" align="center" marginBottom="xl">
                <H2>
                  <EditableText field="admin.payments.recentPaymentsTitle" defaultValue="📋 Recent Payments">
                    📋 Recent Payments
                  </EditableText>
                </H2>
                <Text variant="lead" align="center">
                  <EditableText field="admin.payments.recentPaymentsSubtitle" defaultValue="Latest payment transactions">
                    Latest payment transactions
                  </EditableText>
                </Text>
              </Stack>
              
              <Card variant="elevated" padding="lg">
                <Stack spacing="md">
                  {payments.map((payment) => (
                    <PaymentItem key={payment.id}>
                      <Stack direction="horizontal" spacing="md" align="center">
                        <div style={{ fontSize: fontSize.xl }}>
                          <EditableText field={`admin.payments.paymentIcon${payment.id}`} defaultValue="💳">
                            💳
                          </EditableText>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Stack spacing="xs">
                            <Stack direction="horizontal" spacing="md" align="center">
                              <Text>
                                <EditableText field={`admin.payments.customerName${payment.id}`} defaultValue={payment.customerName}>
                                  {payment.customerName}
                                </EditableText>
                              </Text>
                              <StatusBadge status={payment.status}>
                                <EditableText field={`admin.payments.status${payment.id}`} defaultValue={payment.status.toUpperCase()}>
                                  {payment.status.toUpperCase()}
                                </EditableText>
                              </StatusBadge>
                            </Stack>
                            <Stack direction="horizontal" spacing="md" align="center">
                              <Text size="sm" color="secondary">
                                <EditableText field={`admin.payments.amount${payment.id}`} defaultValue={formatCurrency(payment.amount)}>
                                  {formatCurrency(payment.amount)}
                                </EditableText>
                              </Text>
                              <Text size="sm" color="secondary">
                                <EditableText field={`admin.payments.paymentType${payment.id}`} defaultValue={payment.paymentType}>
                                  {payment.paymentType}
                                </EditableText>
                              </Text>
                              <Text size="sm" color="secondary">
                                <EditableText field={`admin.payments.bookingId${payment.id}`} defaultValue={`Booking: ${payment.bookingId}`}>
                                  Booking: {payment.bookingId}
                                </EditableText>
                              </Text>
                            </Stack>
                            {payment.refundAmount && (
                              <Text size="sm" color="error">
                                <EditableText field={`admin.payments.refundInfo${payment.id}`} defaultValue={`Refunded: ${formatCurrency(payment.refundAmount)}`}>
                                  Refunded: {formatCurrency(payment.refundAmount)}
                                </EditableText>
                              </Text>
                            )}
                          </Stack>
                        </div>
                        <Stack spacing="sm">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <EditableText field="admin.payments.viewDetails" defaultValue="View">
                              View
                            </EditableText>
                          </Button>
                          {payment.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRefund(payment)}
                            >
                              <EditableText field="admin.payments.refund" defaultValue="Refund">
                                Refund
                              </EditableText>
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </PaymentItem>
                  ))}
                </Stack>
              </Card>
            </Container>
          </Section>

          {/* Recent Activity */}
          <Section variant="default" padding="lg">
            <Container maxWidth="2xl">
              <Stack spacing="lg" align="center" marginBottom="xl">
                <H2>
                  <EditableText field="admin.payments.recentActivityTitle" defaultValue="📈 Recent Activity">
                    📈 Recent Activity
                  </EditableText>
                </H2>
                <Text variant="lead" align="center">
                  <EditableText field="admin.payments.recentActivitySubtitle" defaultValue="Latest payment events and updates">
                    Latest payment events and updates
                  </EditableText>
                </Text>
              </Stack>
              
              <Card variant="elevated" padding="lg">
                <Stack spacing="md">
                  {recentActivity.map((activity, index) => (
                    <PaymentItem key={index}>
                      <Stack direction="horizontal" spacing="md" align="center">
                        <div style={{ fontSize: fontSize.xl }}>
                          <EditableText field={`admin.payments.activityIcon${index}`} defaultValue={activity.icon}>
                            {activity.icon}
                          </EditableText>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Stack spacing="xs">
                            <Text>
                              <EditableText field={`admin.payments.activityMessage${index}`} defaultValue={activity.message}>
                                {activity.message}
                              </EditableText>
                            </Text>
                            <Text size="sm" color="secondary">
                              <EditableText field={`admin.payments.activityTime${index}`} defaultValue={activity.time}>
                                {activity.time}
                              </EditableText>
                            </Text>
                          </Stack>
                        </div>
                      </Stack>
                    </PaymentItem>
                  ))}
                </Stack>
              </Card>
            </Container>
          </Section>
        </Stack>
      </Container>
    </Section>
  );
}

const PaymentsPage: NextPage = () => {
  return (
    <ToastProvider>
      <PaymentsPageContent />
    </ToastProvider>
  );
};

export default PaymentsPage; 