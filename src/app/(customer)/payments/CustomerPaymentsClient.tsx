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
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

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

export default function CustomerPaymentsClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.['customer-payments'] || {};
  
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
        router.push('/auth/login');
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
      // TODO: Replace with actual API call to get real payment history
      setPayments([]);
    } catch (error) {
      console.error('Error loading payment history:', error);
      setError('Failed to load payment history');
    }
  };

  const loadPaymentMethods = async (_uid: string) => {
    try {
      // TODO: Replace with actual API call to get real payment methods
      setPaymentMethods([]);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
    }
  };

  const handleAddPaymentMethod = () => {
    // TODO: Implement payment method addition
    router.push('/payments/add-method');
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{cmsData?.['initializing'] || 'Initializing payments...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{cmsData?.['loading_info'] || 'Loading your payment information...'}</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">{cmsData?.['login_required'] || 'Please log in to view your payments.'}</Text>
          <Button onClick={() => router.push('/auth/login')}  text={cmsData?.['go_to_login'] || 'Go to Login'}/>          
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

  return (
    <>
      <Stack spacing="xl">
        {/* Header */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack spacing="sm">
            <H1 

              
            >
              {cmsData?.['title'] || 'My Payments'}
            </H1>
            <Text 
              variant="muted"

              
            >
              {cmsData?.['subtitle'] || 'Manage your payment methods and view transaction history'}
            </Text>
          </Stack>
          <Button 
            onClick={handleAddPaymentMethod} 
            variant="primary"

            
          >
            {cmsData?.['add-payment-method'] || 'Add Payment Method'}
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
          cmsData={cmsData}
        />

        {/* Payment Methods */}
        <ContentCard
          title={cmsData?.['section-methods'] || 'Payment Methods'} 
          content={
            <Stack spacing="md">
              {paymentMethods.length === 0 ? (
                <Text variant="muted" align="center" >
                  {cmsData?.['message'] || 'No payment methods added yet'}
                </Text>
              ) : (
                paymentMethods.map((method) => (
                  <Box key={method.id} variant="outlined" padding="md">
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="sm">
                        <Text weight="bold">
                          {method.type === 'card' ? 'Credit Card' : 'Bank Account'}
                        </Text>
                        <Text variant="muted" size="sm">
                          {method.type === 'card' ? `**** **** **** ${method.last4}` : `****${method.last4}`}
                        </Text>
                      </Stack>
                      <Stack spacing="sm" align="flex-end">
                        <Text size="lg">
                          {method.type === 'card' ? '💳' : '🏦'}
                        </Text>
                        <Text variant="muted" size="sm">
                          {method.isDefault ? 'Default' : ''}
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
          title={cmsData?.['section-history'] || 'Payment History'}
          content={
            <Stack spacing="md">
              {payments.length === 0 ? (
                <Text variant="muted" align="center" >
                  {cmsData?.['message'] || 'No payment history available'}
                </Text>
              ) : (
                payments.map((payment) => (
                  <Box key={payment.id} variant="outlined" padding="md">
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="sm">
                        <Text size="lg">
                          {payment.type === 'deposit' ? '💰' : payment.type === 'balance' ? '💳' : payment.type === 'tip' ? '💝' : '💵'}
                        </Text>
                        <Text weight="bold">
                          {payment.description}
                        </Text>
                        <Text variant="muted" size="sm">
                          {new Date(payment.date).toLocaleDateString()}
                        </Text>
                      </Stack>
                      <Stack spacing="sm" align="flex-end">
                        <Text weight="bold" size="lg">
                          ${payment.amount.toFixed(2)}
                        </Text>
                        <Text variant="muted" size="sm">
                          {payment.status}
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
