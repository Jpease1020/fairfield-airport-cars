'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface CMSContextType {
  cmsData: any | null;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

interface CMSDataProviderProps {
  children: ReactNode;
  cmsData: any | null;
}

export const CMSDataProvider: React.FC<CMSDataProviderProps> = ({ children, cmsData }) => {
  return (
    <CMSContext.Provider value={{ cmsData }}>
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
