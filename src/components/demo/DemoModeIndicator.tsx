'use client';

import React, { useState } from 'react';
import { Box, Text, Stack, Button } from '@/ui';
import { useDemoMode } from '@/design/providers/DemoModeProvider';

export function DemoModeIndicator() {
  const { isDemoMode, toggleDemoMode, forceReset } = useDemoMode();
  const [isDisabling, setIsDisabling] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isDemoMode) {
    return null;
  }

  const handleExitDemoMode = async () => {
    setIsDisabling(true);
    try {
      await toggleDemoMode(false);
      console.log('✅ Demo mode disabled successfully');
    } catch (error) {
      console.error('Failed to disable demo mode:', error);
      // Show error to user
      alert('Failed to exit demo mode. Try refreshing the page or use the force reset button.');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleForceReset = async () => {
    if (!confirm('Are you sure you want to force reset demo mode? This will clear all demo data.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      await forceReset();
      console.log('✅ Demo mode force reset completed');
    } catch (error) {
      console.error('Failed to force reset demo mode:', error);
      alert('Failed to force reset demo mode. Please refresh the page.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleNuclearReset = async () => {
    if (!confirm('⚠️ NUCLEAR RESET: This will completely clear ALL demo mode data and force a page refresh. Are you absolutely sure?')) {
      return;
    }
    
    try {
      // Import the nuclear reset function directly
      const { nuclearResetDemoMode } = await import('@/lib/services/demo-mode-service');
      await nuclearResetDemoMode();
      
      // Force a page refresh after nuclear reset
      window.location.reload();
    } catch (error) {
      console.error('Nuclear reset failed:', error);
      alert('Nuclear reset failed. Please manually refresh the page.');
    }
  };

  return (
    <Box 
      variant="filled" 
      padding="sm"
    >
      <Stack direction="horizontal" justify="space-between" align="center">
        <Stack direction="horizontal" align="center" spacing="sm">
          <Text weight="bold">
            🎭 DEMO MODE ACTIVE
          </Text>
          <Text size="sm">
            Testing with mock data - no real bookings or payments
          </Text>
        </Stack>
        
        <Stack direction="horizontal" spacing="sm">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExitDemoMode}
            disabled={isDisabling}
          >
            {isDisabling ? 'Exiting...' : 'Exit Demo Mode'}
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleForceReset}
            disabled={isResetting}
          >
            {isResetting ? 'Resetting...' : 'Force Reset'}
          </Button>
          
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleNuclearReset}
          >
            ☢️ Nuclear Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
