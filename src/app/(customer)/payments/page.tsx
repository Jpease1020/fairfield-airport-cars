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
  Alert,
  Box,
  H1,
  ContentCard
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
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
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
          <Text>{getCMSField(cmsData, 'pages.payments.loading.initializing', 'Initializing payments...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{getCMSField(cmsData, 'pages.payments.loading.loading_info', 'Loading your payment information...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">{getCMSField(cmsData, 'pages.payments.login_required', 'Please log in to view your payments.')}</Text>
          <Button onClick={() => router.push('/login')}>
            {getCMSField(cmsData, 'pages.payments.go_to_login', 'Go to Login')}
          </Button>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      
        <Container>
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        </Container>
      
    );
  }

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <>
      <Stack spacing="xl">
        {/* Header */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="sm">
            <H1 
              data-cms-id="pages.payments.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.payments.title', 'My Payments')}
            </H1>
            <Text 
              variant="muted"
              data-cms-id="pages.payments.subtitle"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.payments.subtitle', 'Manage your payment methods and view transaction history')}
            </Text>
          </Stack>
          <Button 
            onClick={handleAddPaymentMethod} 
            variant="primary"
            data-cms-id="pages.payments.add_payment_method"
            interactionMode={mode}
          >
            {getCMSField(cmsData, 'pages.payments.add_payment_method', 'Add Payment Method')}
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
          title={getCMSField(cmsData, 'pages.payments.section_methods', 'Payment Methods')}
          data-cms-id="pages.payments.section_methods"
          content={
            <Stack spacing="md">
              {paymentMethods.length === 0 ? (
                <Text variant="muted" align="center" data-cms-id="pages.payments.noMethods.message" mode={mode}>
                  {getCMSField(cmsData, 'pages.payments.noMethods.message', 'No payment methods added yet')}
                </Text>
              ) : (
                paymentMethods.map((method) => (
                  <Box key={method.id} variant="outlined" padding="md" data-cms-id={`pages.payments.method.${method.id}`}>
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="sm">
                        <Text weight="bold" data-cms-id={`pages.payments.method.${method.id}.type`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.method.${method.id}.type`, method.type === 'card' ? 'Credit Card' : 'Bank Account')}
                        </Text>
                        <Text variant="muted" size="sm" data-cms-id={`pages.payments.method.${method.id}.details`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.method.${method.id}.details`, method.type === 'card' ? `**** **** **** ${method.last4}` : `****${method.last4}`)}
                        </Text>
                      </Stack>
                      <Stack spacing="sm" align="flex-end">
                        <Text size="lg" data-cms-id={`pages.payments.method.${method.id}.icon`} mode={mode}>
                          {method.type === 'card' ? '💳' : '🏦'}
                        </Text>
                        <Text variant="muted" size="sm" data-cms-id={`pages.payments.method.${method.id}.status`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.method.${method.id}.status`, method.isDefault ? 'Default' : '')}
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          }
        />

        {/* Payment History */}
        <ContentCard
          title={getCMSField(cmsData, 'pages.payments.section_history', 'Payment History')}
          data-cms-id="pages.payments.section_history"
          content={
            <Stack spacing="md">
              {payments.length === 0 ? (
                <Text variant="muted" align="center" data-cms-id="pages.payments.noHistory.message" mode={mode}>
                  {getCMSField(cmsData, 'pages.payments.noHistory.message', 'No payment history available')}
                </Text>
              ) : (
                payments.map((payment) => (
                  <Box key={payment.id} variant="outlined" padding="md" data-cms-id={`pages.payments.history.${payment.id}`}>
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="sm">
                        <Text size="lg" data-cms-id={`pages.payments.history.${payment.id}.icon`} mode={mode}>
                          {payment.type === 'deposit' ? '💰' : payment.type === 'balance' ? '💳' : payment.type === 'tip' ? '💝' : '💵'}
                        </Text>
                        <Text weight="bold" data-cms-id={`pages.payments.history.${payment.id}.description`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.history.${payment.id}.description`, payment.description)}
                        </Text>
                        <Text variant="muted" size="sm" data-cms-id={`pages.payments.history.${payment.id}.date`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.history.${payment.id}.date`, new Date(payment.date).toLocaleDateString())}
                        </Text>
                      </Stack>
                      <Stack spacing="sm" align="flex-end">
                        <Text weight="bold" size="lg" data-cms-id={`pages.payments.history.${payment.id}.amount`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.history.${payment.id}.amount`, `$${payment.amount.toFixed(2)}`)}
                        </Text>
                        <Text variant="muted" size="sm" data-cms-id={`pages.payments.history.${payment.id}.status`} mode={mode}>
                          {getCMSField(cmsData, `pages.payments.history.${payment.id}.status`, payment.status)}
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          }
        />
      </Stack>
    </>
  );
}

export default CustomerPaymentsPage; 