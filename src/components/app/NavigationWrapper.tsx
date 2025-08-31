'use client';

import React from 'react';
import { NavigationManager } from './NavigationManager';

interface NavigationWrapperProps {
  cmsData?: any;
}

export function NavigationWrapper({ cmsData }: NavigationWrapperProps) {
  return <NavigationManager cmsData={cmsData} />;
}
