import { useContext } from 'react';
import { DemoModeContext } from '@/design/providers/DemoModeProvider';

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
