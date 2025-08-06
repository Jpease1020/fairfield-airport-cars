'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, getCustomerProfile } from '@/lib/services/auth-service';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/lib/services/auth-service';
import { 
  Container,
  Stack,
  Text,
  Button,
  LoadingSpinner,
  EditableText,
  Alert,
  Badge,
  Box,
  H1,
  ContentCard,
  Grid
} from '@/ui';
import { AdminPageWrapper } from '@/components/app';
import { BalanceSummary } from '@/components/business/BalanceTracker';

interface Payment {
  id: string;
  bookingId: string;
  type: 'deposit' | 'balance' | 'tip' | 'full';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  isDefault: boolean;
  expiryDate?: string;
}

function CustomerPaymentsPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadCustomerProfile(firebaseUser.uid);
        await loadPaymentHistory(firebaseUser.uid);
        await loadPaymentMethods(firebaseUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  const loadCustomerProfile = async (uid: string) => {
    try {
      const customerProfile = await getCustomerProfile(uid);
      if (!customerProfile) {
        setError('Profile not found');
        return;
      }
      setProfile(customerProfile);
    } catch (error) {
      console.error('Error loading customer profile:', error);
      setError('Failed to load profile');
    }
  };

  const loadPaymentHistory = async (_uid: string) => {
    try {
      // Mock payment history - replace with actual API call
      const mockPayments: Payment[] = [
        {
          id: '1',
          bookingId: '1',
          type: 'deposit',
          amount: 25.00,
          status: 'completed',
          date: '2024-01-15T10:00:00Z',
          description: 'Deposit for Airport Transfer',
          paymentMethod: 'Visa ending in 1234',
          transactionId: 'txn_123456789'
        },
        {
          id: '2',
          bookingId: '1',
          type: 'balance',
          amount: 20.00,
          status: 'completed',
          date: '2024-01-15T14:30:00Z',
          description: 'Remaining balance for Airport Transfer',
          paymentMethod: 'Visa ending in 1234',
          transactionId: 'txn_123456790'
        },
        {
          id: '3',
          bookingId: '1',
          type: 'tip',
          amount: 5.00,
          status: 'completed',
          date: '2024-01-15T15:00:00Z',
          description: 'Tip for driver',
          paymentMethod: 'Visa ending in 1234',
          transactionId: 'txn_123456791'
        },
        {
          id: '4',
          bookingId: '2',
          type: 'full',
          amount: 50.00,
          status: 'pending',
          date: '2024-01-20T09:00:00Z',
          description: 'Full payment for Airport Transfer',
          paymentMethod: 'Visa ending in 1234',
          transactionId: 'txn_123456792'
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
      setError('Failed to load payment history');
    }
  };

  const loadPaymentMethods = async (_uid: string) => {
    try {
      // Mock payment methods - replace with actual API call
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '1234',
          brand: 'Visa',
          isDefault: true,
          expiryDate: '12/25'
        },
        {
          id: '2',
          type: 'card',
          last4: '5678',
          brand: 'Mastercard',
          isDefault: false,
          expiryDate: '08/26'
        }
      ];
      
      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'balance': return '💳';
      case 'tip': return '💝';
      case 'full': return '💵';
      default: return '💳';
    }
  };

  const handleAddPaymentMethod = () => {
    // TODO: Implement payment method addition
    router.push('/payments/add-method');
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const handlePayBalance = (payment: Payment) => {
    router.push(`/payments/pay-balance/${payment.bookingId}`);
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Initializing payments...</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading your payment information...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">Please log in to view your payments.</Text>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Error Loading Payments"
        subtitle={error}
      >
        <Container>
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        </Container>
      </AdminPageWrapper>
    );
  }

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <AdminPageWrapper
      title="My Payments"
      subtitle="Manage your payment methods and view transaction history"
    >
      <Stack spacing="xl">
        {/* Header */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="sm">
            <H1>
              <EditableText field="customer.payments.title" defaultValue="My Payments">
                My Payments
              </EditableText>
            </H1>
            <Text variant="muted">
              <EditableText field="customer.payments.subtitle" defaultValue="Manage your payment methods and view transaction history">
                Manage your payment methods and view transaction history
              </EditableText>
            </Text>
          </Stack>
          <Button onClick={handleAddPaymentMethod} variant="primary">
            <EditableText field="customer.payments.add_payment_method" defaultValue="Add Payment Method">
              Add Payment Method
            </EditableText>
          </Button>
        </Stack>

        {/* Payment Summary */}
        <BalanceSummary 
          bookings={payments.map(payment => ({
            id: payment.bookingId,
            totalFare: payment.amount,
            depositAmount: payment.type === 'deposit' ? payment.amount : 0,
            balanceDue: payment.type === 'balance' ? payment.amount : 0,
            status: 'confirmed' // This would come from actual booking data
          }))}
        />

        {/* Payment Methods */}
        <ContentCard
          title="Payment Methods"
          content={
            <Stack spacing="lg">
              {paymentMethods.length === 0 ? (
                <Stack spacing="md" align="center">
                  <Text variant="muted" align="center">
                    <EditableText field="customer.payments.no_payment_methods" defaultValue="No payment methods saved yet.">
                      No payment methods saved yet.
                    </EditableText>
                  </Text>
                  <Button onClick={handleAddPaymentMethod} variant="primary">
                    <EditableText field="customer.payments.add_first_method" defaultValue="Add Payment Method">
                      Add Payment Method
                    </EditableText>
                  </Button>
                </Stack>
              ) : (
                <Stack spacing="md">
                  {paymentMethods.map((method) => (
                    <Box key={method.id} variant="outlined" padding="md">
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Stack spacing="sm">
                          <Stack direction="horizontal" align="center" spacing="sm">
                            <Text weight="bold">
                              {method.brand} •••• {method.last4}
                            </Text>
                            {method.isDefault && (
                              <Badge variant="success" size="sm">Default</Badge>
                            )}
                          </Stack>
                          {method.expiryDate && (
                            <Text variant="muted" size="sm">
                              Expires {method.expiryDate}
                            </Text>
                          )}
                        </Stack>
                        <Stack direction="horizontal" spacing="sm">
                          <Button variant="outline" size="sm">
                            <EditableText field="customer.payments.edit_method" defaultValue="Edit">
                              Edit
                            </EditableText>
                          </Button>
                          {!method.isDefault && (
                            <Button variant="outline" size="sm">
                              <EditableText field="customer.payments.set_default" defaultValue="Set Default">
                                Set Default
                              </EditableText>
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          }
          variant="elevated"
        />

        {/* Payment History */}
        <ContentCard
          title="Payment History"
          content={
            <Stack spacing="lg">
              {payments.length === 0 ? (
                <Stack spacing="md" align="center">
                  <Text variant="muted" align="center">
                    <EditableText field="customer.payments.no_payments" defaultValue="No payment history yet.">
                      No payment history yet.
                    </EditableText>
                  </Text>
                </Stack>
              ) : (
                <Stack spacing="md">
                  {payments.map((payment) => (
                    <Box key={payment.id} variant="outlined" padding="md">
                      <Stack spacing="md">
                        <Stack direction="horizontal" justify="space-between" align="center">
                          <Stack direction="horizontal" align="center" spacing="sm">
                            <Text size="lg">{getPaymentTypeIcon(payment.type)}</Text>
                            <Stack spacing="xs">
                              <Text weight="bold">{payment.description}</Text>
                              <Text variant="muted" size="sm">
                                {new Date(payment.date).toLocaleDateString()} at {new Date(payment.date).toLocaleTimeString()}
                              </Text>
                            </Stack>
                          </Stack>
                          <Stack align="flex-end" spacing="sm">
                            <Text weight="bold" size="lg">
                              ${payment.amount.toFixed(2)}
                            </Text>
                            <Badge variant={getPaymentStatusColor(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </Stack>
                        </Stack>
                        
                        <Stack direction="horizontal" justify="space-between" align="center">
                          <Stack spacing="xs">
                            {payment.paymentMethod && (
                              <Text variant="muted" size="sm">
                                <EditableText field="customer.payments.payment_method" defaultValue="Payment Method:">
                                  Payment Method:
                                </EditableText> {payment.paymentMethod}
                              </Text>
                            )}
                            {payment.transactionId && (
                              <Text variant="muted" size="sm">
                                <EditableText field="customer.payments.transaction_id" defaultValue="Transaction ID:">
                                  Transaction ID:
                                </EditableText> {payment.transactionId}
                              </Text>
                            )}
                          </Stack>
                          
                          <Stack direction="horizontal" spacing="sm">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewBooking(payment.bookingId)}
                            >
                              <EditableText field="customer.payments.view_booking" defaultValue="View Booking">
                                View Booking
                              </EditableText>
                            </Button>
                            {payment.status === 'pending' && payment.type === 'balance' && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => handlePayBalance(payment)}
                              >
                                <EditableText field="customer.payments.pay_balance" defaultValue="Pay Balance">
                                  Pay Balance
                                </EditableText>
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          }
          variant="elevated"
        />
      </Stack>
    </AdminPageWrapper>
  );
}

export default CustomerPaymentsPage; 