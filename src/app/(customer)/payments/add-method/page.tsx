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
  Input,
  Label,  
  H1,
  ContentCard,
  Grid,
  GridItem
} from '@/ui';
import { AdminPageWrapper } from '@/components/app';

function AddPaymentMethodPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadCustomerProfile(firebaseUser.uid);
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      setError('Please enter card expiry date');
      return false;
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      setError('Please enter a valid CVV');
      return false;
    }
    if (!formData.cardholderName.trim()) {
      setError('Please enter cardholder name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // TODO: Implement actual payment method addition with Square
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Payment method added successfully!');
      
      // Redirect back to payments page after a short delay
      setTimeout(() => {
        router.push('/payments');
      }, 1500);
    } catch (error) {
      setError(`Failed to add payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/payments');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (!isClient) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Initializing...</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">Please log in to add payment methods.</Text>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <AdminPageWrapper
      title="Add Payment Method"
      subtitle="Securely add a new payment method to your account"
    >
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="sm">
          <H1>
            <EditableText field="customer.payments.add_method.title" defaultValue="Add Payment Method">
              Add Payment Method
            </EditableText>
          </H1>
          <Text variant="muted">
            <EditableText field="customer.payments.add_method.subtitle" defaultValue="Securely add a new payment method to your account">
              Securely add a new payment method to your account
            </EditableText>
          </Text>
        </Stack>

        {/* Success/Error Messages */}
        {success && (
          <Alert variant="success">
            <Text>{success}</Text>
          </Alert>
        )}
        
        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Payment Method Form */}
        <ContentCard
          title="Card Information"
          content={
            <form onSubmit={handleSubmit}>
              <Stack spacing="lg">
                <Stack spacing="md">
                  <Stack spacing="sm">
                    <Label htmlFor="cardNumber">
                      <EditableText field="customer.payments.add_method.card_number" defaultValue="Card Number">
                        Card Number
                      </EditableText>
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      fullWidth
                    />
                  </Stack>

                  <Stack spacing="sm">
                    <Label htmlFor="cardholderName">
                      <EditableText field="customer.payments.add_method.cardholder_name" defaultValue="Cardholder Name">
                        Cardholder Name
                      </EditableText>
                    </Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="John Doe"
                      required
                      fullWidth
                    />
                  </Stack>

                  <Grid cols={3} gap="md">
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="expiryMonth">
                          <EditableText field="customer.payments.add_method.expiry_month" defaultValue="Expiry Month">
                            Expiry Month
                          </EditableText>
                        </Label>
                                              <select
                        id="expiryMonth"
                        value={formData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                        required
                      >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </Stack>
                    </GridItem>

                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="expiryYear">
                          <EditableText field="customer.payments.add_method.expiry_year" defaultValue="Expiry Year">
                            Expiry Year
                          </EditableText>
                        </Label>
                                              <select
                        id="expiryYear"
                        value={formData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                        required
                      >
                          <option value="">Year</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </Stack>
                    </GridItem>

                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="cvv">
                          <EditableText field="customer.payments.add_method.cvv" defaultValue="CVV">
                            CVV
                          </EditableText>
                        </Label>
                        <Input
                          id="cvv"
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={4}
                          required
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                  </Grid>

                  <Stack direction="horizontal" align="center" spacing="sm">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    />
                    <Label htmlFor="isDefault">
                      <EditableText field="customer.payments.add_method.set_default" defaultValue="Set as default payment method">
                        Set as default payment method
                      </EditableText>
                    </Label>
                  </Stack>
                </Stack>

                <Stack direction="horizontal" spacing="md">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={saving}
                    fullWidth
                  >
                    <EditableText field="customer.payments.add_method.save_button" defaultValue={saving ? 'Adding...' : 'Add Payment Method'}>
                      {saving ? 'Adding...' : 'Add Payment Method'}
                    </EditableText>
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    fullWidth
                  >
                    <EditableText field="customer.payments.add_method.cancel_button" defaultValue="Cancel">
                      Cancel
                    </EditableText>
                  </Button>
                </Stack>
              </Stack>
            </form>
          }
          variant="elevated"
        />

        {/* Security Notice */}
        <ContentCard
          title="Security"
          content={
            <Stack spacing="md">
              <Text variant="muted">
                <EditableText field="customer.payments.add_method.security_notice" defaultValue="Your payment information is encrypted and securely processed by Square. We do not store your full card details on our servers.">
                  Your payment information is encrypted and securely processed by Square. We do not store your full card details on our servers.
                </EditableText>
              </Text>
              <Stack direction="horizontal" align="center" spacing="sm">
                <Text variant="muted" size="sm">🔒</Text>
                <Text variant="muted" size="sm">
                  <EditableText field="customer.payments.add_method.ssl_notice" defaultValue="256-bit SSL encryption">
                    256-bit SSL encryption
                  </EditableText>
                </Text>
              </Stack>
            </Stack>
          }
          variant="outlined"
        />
      </Stack>
    </AdminPageWrapper>
  );
}

export default AddPaymentMethodPage; 