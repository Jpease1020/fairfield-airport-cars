'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface CMSContextType {
  cmsData: any | null;
  isLoading: boolean;
}

const DEFAULT_CMS_CONTEXT: CMSContextType = {
  cmsData: {},
  isLoading: false,
};

export const CMSContext = createContext<CMSContextType>(DEFAULT_CMS_CONTEXT);

interface CMSDataProviderProps {
  children: ReactNode;
}

export const CMSDataProvider: React.FC<CMSDataProviderProps> = ({ 
  children
}) => {
  // CMS editing runtime has been removed; keep provider for compatibility.
  return <>{children}</>;
};

export const useCMSData = () => {
  return useContext(CMSContext);
};
