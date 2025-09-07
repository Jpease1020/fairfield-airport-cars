'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking } from '@/types/booking';

interface BookingProviderType {
  // Current booking
  currentBooking: Booking | null;
  
  // Booking actions
  createBooking: (_data: Partial<Booking>) => Promise<Booking>;
  updateBooking: (_id: string, _data: Partial<Booking>) => Promise<Booking>;
  getBooking: (_id: string) => Promise<Booking | null>;
  deleteBooking: (_id: string) => Promise<void>;
  
  // Real-time updates
  subscribeToBooking: (_id: string) => void;
  unsubscribeFromBooking: (_id: string) => void;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Helper functions
  setCurrentBooking: (booking: Booking | null) => void;
  clearError: () => void;
}

const BookingContext = createContext<BookingProviderType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new booking
  const createBooking = async (data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing booking
  const updateBooking = async (id: string, data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      const booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a booking by ID
  const getBooking = async (id: string): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/booking/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }

      const booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a booking
  const deleteBooking = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      if (currentBooking?.id === id) {
        setCurrentBooking(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time booking updates
  const subscribeToBooking = (id: string) => {
    // TODO: Implement real-time subscription
    console.log(`Subscribing to booking ${id}`);
  };

  // Unsubscribe from booking updates
  const unsubscribeFromBooking = (id: string) => {
    // TODO: Implement real-time unsubscription
    console.log(`Unsubscribing from booking ${id}`);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value: BookingProviderType = {
    currentBooking,
    createBooking,
    updateBooking,
    getBooking,
    deleteBooking,
    subscribeToBooking,
    unsubscribeFromBooking,
    isLoading,
    error,
    setCurrentBooking,
    clearError,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingProviderType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
