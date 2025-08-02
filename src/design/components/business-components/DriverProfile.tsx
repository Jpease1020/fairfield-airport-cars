'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box, 
  Grid, 
  GridItem,
  Badge,
  Button,
  LoadingSpinner,
  useToast
} from '@/ui';
import { Star, Phone, MessageSquare, Car, MapPin, Clock } from 'lucide-react';
import { driverAssignmentService } from '@/lib/services/driver-assignment-service';

interface DriverProfileProps {
  bookingId: string;
  variant?: 'compact' | 'detailed';
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  };
  rating: number;
  totalRides: number;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  photo?: string;
}

export function DriverProfile({ bookingId, variant = 'detailed' }: DriverProfileProps) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        setLoading(true);
        // First get the booking to find the driver ID
        const bookingResponse = await fetch(`/api/booking/${bookingId}`);
        if (!bookingResponse.ok) {
          throw new Error('Booking not found');
        }
        
        const booking = await bookingResponse.json();
        if (!booking.driverId) {
          throw new Error('No driver assigned yet');
        }

        // Get driver profile
        const driverProfile = await driverAssignmentService.getDriverProfile(booking.driverId);
        if (!driverProfile) {
          throw new Error('Driver profile not found');
        }

        setDriver(driverProfile);
      } catch (error) {
        // Error fetching driver info
        setError(error instanceof Error ? error.message : 'Failed to load driver information');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverInfo();
  }, [bookingId]);

  const renderStars = (rating: number) => {
    return (
      <Stack direction="horizontal" spacing="xs">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? 'var(--color-yellow-500)' : 'var(--color-gray-300)'}
            color={star <= rating ? 'var(--color-yellow-500)' : 'var(--color-gray-300)'}
          />
        ))}
      </Stack>
    );
  };

  const handleCallDriver = () => {
    if (driver) {
      window.location.href = `tel:${driver.phone}`;
    }
  };

  const handleTextDriver = () => {
    if (driver) {
      window.location.href = `sms:${driver.phone}`;
    }
  };

  if (loading) {
    return (
      <Box variant="outlined" padding="md">
        <Stack align="center" spacing="sm">
          <LoadingSpinner size="sm" />
          <Text size="sm">Loading driver information...</Text>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box variant="outlined" padding="md">
        <Stack align="center" spacing="sm">
          <Text size="sm" variant="muted">{error}</Text>
        </Stack>
      </Box>
    );
  }

  if (!driver) {
    return (
      <Box variant="outlined" padding="md">
        <Stack align="center" spacing="sm">
          <Text size="sm" variant="muted">Driver information not available</Text>
        </Stack>
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Box variant="elevated" padding="md">
        <Stack spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text weight="bold">{driver.name}</Text>
            <Badge variant="success" size="sm">
              <Car size={12} />
              Assigned
            </Badge>
          </Stack>
          
          <Stack direction="horizontal" align="center" spacing="sm">
            {renderStars(driver.rating)}
            <Text size="sm" variant="muted">
              {driver.rating}/5 ({driver.totalRides} rides)
            </Text>
          </Stack>
          
          <Text size="sm">
            {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color})
          </Text>
          
          <Stack direction="horizontal" spacing="sm">
            <Button size="sm" variant="outline" onClick={handleCallDriver}>
              <Phone size={14} />
              Call
            </Button>
            <Button size="sm" variant="outline" onClick={handleTextDriver}>
              <MessageSquare size={14} />
              Text
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box variant="elevated" padding="lg">
      <Stack spacing="lg">
                 <Stack direction="horizontal" justify="space-between" align="center">
           <Text size="lg" weight="bold">Your Driver - Gregg</Text>
           <Badge variant="success" size="sm">
             <Car size={12} />
             Assigned
           </Badge>
         </Stack>

        <Grid cols={2} gap="lg">
          <GridItem>
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text weight="bold" size="lg">{driver.name}</Text>
                <Stack direction="horizontal" align="center" spacing="sm">
                  {renderStars(driver.rating)}
                  <Text size="sm" variant="muted">
                    {driver.rating}/5 rating
                  </Text>
                </Stack>
                <Text size="sm" variant="muted">
                  {driver.totalRides} completed rides
                </Text>
              </Stack>

              <Stack spacing="sm">
                <Text weight="bold" size="sm">Vehicle Information</Text>
                <Stack spacing="xs">
                  <Text size="sm">
                    <Car size={14} /> {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
                  </Text>
                  <Text size="sm" variant="muted">
                    Color: {driver.vehicle.color}
                  </Text>
                  <Text size="sm" variant="muted">
                    License: {driver.vehicle.licensePlate}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </GridItem>

          <GridItem>
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text weight="bold" size="sm">Contact Information</Text>
                <Text size="sm">{driver.phone}</Text>
                <Text size="sm" variant="muted">{driver.email}</Text>
              </Stack>

              <Stack spacing="sm">
                <Text weight="bold" size="sm">Actions</Text>
                <Stack direction="horizontal" spacing="sm">
                  <Button size="sm" variant="primary" onClick={handleCallDriver}>
                    <Phone size={14} />
                    Call Driver
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleTextDriver}>
                    <MessageSquare size={14} />
                    Text Driver
                  </Button>
                </Stack>
              </Stack>

              {driver.currentLocation && (
                <Stack spacing="sm">
                  <Text weight="bold" size="sm">Current Location</Text>
                  <Text size="sm" variant="muted">
                    <MapPin size={14} /> Driver is en route
                  </Text>
                </Stack>
              )}
            </Stack>
          </GridItem>
        </Grid>

        <Box variant="outlined" padding="md">
                       <Stack spacing="sm">
               <Text weight="bold" size="sm">Pickup Instructions</Text>
               <Text size="sm">
                 • Gregg will arrive 30 minutes before pickup time
               </Text>
               <Text size="sm">
                 • Please have your ID ready for verification
               </Text>
               <Text size="sm">
                 • Look for Gregg's silver Toyota Camry with our company logo
               </Text>
               <Text size="sm">
                 • Gregg will call you when he arrives
               </Text>
             </Stack>
        </Box>
      </Stack>
    </Box>
  );
} 