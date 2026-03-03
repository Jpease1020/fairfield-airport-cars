'use client';

import React from 'react';

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  return <>{children}</>;
}
