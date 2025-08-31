'use client';

import React from 'react';
import styled from 'styled-components';

const StickyNavigation = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
`;

interface StickyNavigationWrapperProps {
  children: React.ReactNode;
}

export function StickyNavigationWrapper({ children }: StickyNavigationWrapperProps) {
  return <StickyNavigation>{children}</StickyNavigation>;
}
