import { createContext, useContext } from 'react';
import { BookingProviderType } from '@/providers/booking/provider-types';

export const BookingContext = createContext<BookingProviderType | undefined>(undefined);

export const useBooking = (): BookingProviderType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
