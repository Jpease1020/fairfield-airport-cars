'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { getStaticCmsData } from '@/lib/services/cms-source';

interface CMSContextType {
  cmsData: any | null;
  isLoading: boolean;
}

export const CMSContext = createContext<CMSContextType | undefined>(undefined);

interface CMSDataProviderProps {
  children: ReactNode;
  initialCmsData?: any | null;
}

export const CMSDataProvider: React.FC<CMSDataProviderProps> = ({ 
  children, 
  initialCmsData = null 
}) => {
  const cmsData = initialCmsData ?? getStaticCmsData();

  return (
    <CMSContext.Provider value={{ cmsData, isLoading: false }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMSData = () => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMSData must be used within a CMSDataProvider');
  }
  return context;
};
