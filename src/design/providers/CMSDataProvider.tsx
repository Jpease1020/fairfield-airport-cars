'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
  const [cmsData, setCmsData] = useState(initialCmsData);
  const [isLoading, setIsLoading] = useState(!initialCmsData);

  // Client-side hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && !cmsData) {
      // Only fetch on client if no initial data provided
      setIsLoading(true);
      // You could add client-side fetching here if needed
      setIsLoading(false);
    }
  }, [cmsData]);

  return (
    <CMSContext.Provider value={{ cmsData, isLoading }}>
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
