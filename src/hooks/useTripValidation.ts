'use client';

import { useMemo } from 'react';
import { Coordinates } from '@/types/booking';

interface UseTripValidationProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  pickupDateTime: string;
  fare: number | null;
  isCalculating: boolean;
}

export const useTripValidation = ({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  pickupDateTime,
  fare,
  isCalculating
}: UseTripValidationProps) => {
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!pickupLocation.trim()) {
      errors.push('Pickup location is required');
    }

    if (!dropoffLocation.trim()) {
      errors.push('Dropoff location is required');
    }

    if (!pickupDateTime) {
      errors.push('Pickup date and time is required');
    }

    // Coordinate validation
    if (pickupLocation && !pickupCoords) {
      warnings.push('Pickup location coordinates not found - please select from suggestions');
    }

    if (dropoffLocation && !dropoffCoords) {
      warnings.push('Dropoff location coordinates not found - please select from suggestions');
    }

    // Date validation
    if (pickupDateTime) {
      const pickupDate = new Date(pickupDateTime);
      const now = new Date();
      
      if (pickupDate < now) {
        errors.push('Pickup time cannot be in the past');
      }

      // Check if pickup is more than 30 days in the future
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (pickupDate > thirtyDaysFromNow) {
        warnings.push('Pickup time is more than 30 days in the future');
      }
    }

    // Fare validation
    if (fare === null && !isCalculating) {
      warnings.push('Unable to calculate fare - please check your locations');
    }

    // Location similarity check
    if (pickupLocation && dropoffLocation && 
        pickupLocation.toLowerCase().trim() === dropoffLocation.toLowerCase().trim()) {
      errors.push('Pickup and dropoff locations cannot be the same');
    }

    return {
      errors,
      warnings,
      isValid: errors.length === 0 && !isCalculating
    };
  }, [
    pickupLocation,
    dropoffLocation,
    pickupCoords,
    dropoffCoords,
    pickupDateTime,
    fare,
    isCalculating
  ]);

  return validation;
};
