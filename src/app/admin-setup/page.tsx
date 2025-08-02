'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Text, 
  Button, 
  Stack, 
  Box,
  useToast
} from '@/ui';

export default function AdminSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSetup = async () => {
    setLoading(true);
    try {
      // Simulate setup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      addToast('success', 'Admin setup completed successfully!');
      router.push('/admin');
    } catch (error) {
      addToast('error', 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container variant="default" padding="lg">
      <Stack direction="vertical" spacing="xl" align="center">
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="lead" size="xl" weight="bold">
            Admin Setup
          </Text>
          <Text variant="body" color="muted" align="center">
            Configure your admin dashboard and initial settings
          </Text>
        </Stack>

        <Box variant="outlined" padding="lg" rounded="lg">
          <Stack direction="vertical" spacing="md" align="center">
            <Text variant="lead" weight="bold">
              Step {step} of 3
            </Text>
            <Text variant="body" align="center">
              {step === 1 && 'Initializing admin configuration...'}
              {step === 2 && 'Setting up database connections...'}
              {step === 3 && 'Configuring user permissions...'}
            </Text>
          </Stack>
        </Box>

        <Button 
          onClick={handleSetup}
          disabled={loading}
          variant="primary"
          size="lg"
        >
          {loading ? 'Setting up...' : 'Start Setup'}
        </Button>
      </Stack>
    </Container>
  );
} 