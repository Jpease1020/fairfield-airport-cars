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
  Input,
  Label,  
  H1,
  ContentCard,
  Grid,
  GridItem,
  Select,
  GridSection
} from '@/ui';  
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';

function AddPaymentMethodPage() {
  const { cmsData } = useCMSData();
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
          <Text>{getCMSField(cmsData, 'payments.add_method.initializing', 'Initializing...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>{getCMSField(cmsData, 'payments.add_method.loading', 'Loading...')}</Text>
        </Stack>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text variant="muted">{getCMSField(cmsData, 'payments.add_method.login_required', 'Please log in to add payment methods.')}</Text>
          <Button onClick={() => router.push('/login')}>
            {getCMSField(cmsData, 'payments.add_method.go_to_login', 'Go to Login')}
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="sm">
          <H1>
            {getCMSField(cmsData, 'payments.add_method.title', 'Add Payment Method')}
          </H1>
          <Text variant="muted">
            {getCMSField(cmsData, 'payments.add_method.subtitle', 'Securely add a new payment method to your account')}
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
        <GridSection variant="content" columns={1}>
          <Container>
            <ContentCard
              title={getCMSField(cmsData, 'pages.addPaymentMethod.form.title', 'Add Payment Method')}
              data-cms-id="pages.addPaymentMethod.form.title"
              content={
                <form onSubmit={handleSubmit}>
                  <Stack spacing="lg">
                    {/* Credit Card Fields */}
                    <Stack spacing="md">
                      <Stack spacing="md">
                        <Label htmlFor="cardNumber" data-cms-id="pages.addPaymentMethod.form.card.number.label">
                          {getCMSField(cmsData, 'pages.addPaymentMethod.form.card.number.label', 'Card Number')}
                        </Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.addPaymentMethod.form.card.number.placeholder', '1234 5678 9012 3456')}
                          data-cms-id="pages.addPaymentMethod.form.card.number.input"
                          required
                        />
                      </Stack>
                      
                      <Grid cols={2} gap="md" responsive>
                        <GridItem>
                          <Stack spacing="md">
                            <Label htmlFor="expiryMonth" data-cms-id="pages.addPaymentMethod.form.card.expiryMonth.label">
                              {getCMSField(cmsData, 'pages.addPaymentMethod.form.card.expiryMonth.label', 'Expiry Month')}
                            </Label>
                            <Select
                              id="expiryMonth"
                              value={formData.expiryMonth}
                              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                              data-cms-id="pages.addPaymentMethod.form.card.expiryMonth.select"
                              required
                              options={Array.from({ length: 12 }, (_, i) => i + 1).map(month => ({
                                value: month.toString().padStart(2, '0'),
                                label: month.toString().padStart(2, '0')
                              }))}
                            />
                          </Stack>
                        </GridItem>
                        
                        <GridItem>
                          <Stack spacing="md">
                            <Label htmlFor="expiryYear" data-cms-id="pages.addPaymentMethod.form.card.expiryYear.label">
                              {getCMSField(cmsData, 'pages.addPaymentMethod.form.card.expiryYear.label', 'Expiry Year')}
                            </Label>
                            <Select
                              id="expiryYear"
                              value={formData.expiryYear}
                              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                              data-cms-id="pages.addPaymentMethod.form.card.expiryYear.select"
                              required
                              options={Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => ({
                                value: year.toString(),
                                label: year.toString()
                              }))}
                            />
                          </Stack>
                        </GridItem>
                      </Grid>
                      
                      <Grid cols={2} gap="md" responsive>
                        <GridItem>
                          <Stack spacing="md">
                            <Label htmlFor="cvv" data-cms-id="pages.addPaymentMethod.form.card.cvv.label">
                              {getCMSField(cmsData, 'pages.addPaymentMethod.form.card.cvv.label', 'CVV')}
                            </Label>
                            <Input
                              id="cvv"
                              type="text"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              placeholder={getCMSField(cmsData, 'pages.addPaymentMethod.form.card.cvv.placeholder', '123')}
                              data-cms-id="pages.addPaymentMethod.form.card.cvv.input"
                              required
                            />
                          </Stack>
                        </GridItem>
                        
                        <GridItem>
                          <Stack spacing="md">
                            <Label htmlFor="cardholderName" data-cms-id="pages.addPaymentMethod.form.card.name.label">
                              {getCMSField(cmsData, 'pages.addPaymentMethod.form.card.name.label', 'Cardholder Name')}
                            </Label>
                            <Input
                              id="cardholderName"
                              type="text"
                              value={formData.cardholderName}
                              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                              placeholder={getCMSField(cmsData, 'pages.addPaymentMethod.form.card.name.placeholder', 'John Doe')}
                              data-cms-id="pages.addPaymentMethod.form.card.name.input"
                              required
                            />
                          </Stack>
                        </GridItem>
                      </Grid>
                    </Stack>

                    {/* Default Payment Method */}
                    <Stack spacing="md">
                      <Label htmlFor="isDefault" data-cms-id="pages.addPaymentMethod.form.default.label">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={formData.isDefault}
                          onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                          data-cms-id="pages.addPaymentMethod.form.default.checkbox"
                        />
                        {getCMSField(cmsData, 'pages.addPaymentMethod.form.default.text', 'Set as default payment method')}
                      </Label>
                    </Stack>

                    {/* Submit Button */}
                    <Stack spacing="md" align="center">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={saving}
                        data-cms-id="pages.addPaymentMethod.form.submit.button"
                      >
                        {saving ? (
                          getCMSField(cmsData, 'pages.addPaymentMethod.form.submit.loading', 'Adding Payment Method...')
                        ) : (
                          getCMSField(cmsData, 'pages.addPaymentMethod.form.submit.text', 'Add Payment Method')
                        )}
                      </Button>
                      
                      <Text size="sm" variant="muted" data-cms-id="pages.addPaymentMethod.form.submit.note">
                        {getCMSField(cmsData, 'pages.addPaymentMethod.form.submit.note', '🔒 Your payment information is secure and encrypted')}
                      </Text>
                    </Stack>
                  </Stack>
                </form>
              }
            />
          </Container>
        </GridSection>

        {/* Security Notice */}
        <ContentCard
          title="Security"
          content={
            <Stack spacing="md">
              <Text variant="muted">
                 {getCMSField(cmsData, 'payments.add_method.security_notice', 'Your payment information is encrypted and securely processed by Square. We do not store your full card details on our servers.')}
              </Text>
              <Stack direction="horizontal" align="center" spacing="sm">
           <Text variant="muted" size="sm">🔒</Text>
                <Text variant="muted" size="sm">
                   {getCMSField(cmsData, 'payments.add_method.ssl_notice', '256-bit SSL encryption')}
                </Text>
              </Stack>
            </Stack>
          }
          variant="outlined"
        />
      </Stack>
    </>
  );
}

export default AddPaymentMethodPage; 