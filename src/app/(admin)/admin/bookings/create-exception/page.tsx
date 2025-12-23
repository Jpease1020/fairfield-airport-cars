'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Text,
  Button,
  Box,
  Input,
  Textarea,
  Select,
  DateTimePicker,
  Alert,
  LoadingSpinner,
} from '@/design/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { Coordinates } from '@/types/booking';

interface ExceptionBookingFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  trip: {
    pickup: {
      address: string;
      coordinates: Coordinates | null;
    };
    dropoff: {
      address: string;
      coordinates: Coordinates | null;
    };
    pickupDateTime: string;
    fareType: 'personal' | 'business';
    fare: number;
  };
  flightInfo: {
    hasFlight: boolean;
    airline: string;
    flightNumber: string;
    arrivalTime: string;
    terminal: string;
  };
  exceptionReason: string;
  exceptionCode: string;
}

export default function CreateExceptionBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExceptionBookingFormData>({
    customer: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
    trip: {
      pickup: {
        address: '',
        coordinates: null,
      },
      dropoff: {
        address: '',
        coordinates: null,
      },
      pickupDateTime: '',
      fareType: 'personal',
      fare: 0,
    },
    flightInfo: {
      hasFlight: false,
      airline: '',
      flightNumber: '',
      arrivalTime: '',
      terminal: '',
    },
    exceptionReason: '',
    exceptionCode: '', // Admin must enter manually - never expose secret in client
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.customer.name || !formData.customer.email || !formData.customer.phone) {
        throw new Error('Please fill in all customer information');
      }
      if (!formData.trip.pickup.address || !formData.trip.dropoff.address) {
        throw new Error('Please provide both pickup and dropoff locations');
      }
      if (!formData.trip.pickupDateTime) {
        throw new Error('Please select a pickup date and time');
      }
      if (!formData.trip.fare || formData.trip.fare <= 0) {
        throw new Error('Please enter a valid fare amount');
      }
      if (!formData.exceptionCode) {
        throw new Error('Exception code is required');
      }

      const response = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exceptionCode: formData.exceptionCode,
          fare: formData.trip.fare,
          customer: formData.customer,
          trip: {
            pickup: formData.trip.pickup,
            dropoff: formData.trip.dropoff,
            pickupDateTime: new Date(formData.trip.pickupDateTime).toISOString(),
            fareType: formData.trip.fareType,
            flightInfo: formData.flightInfo.hasFlight ? formData.flightInfo : undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create exception booking');
      }

      const result = await response.json();
      setSuccess(`Exception booking created successfully! Booking ID: ${result.bookingId}`);
      
      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        router.push('/admin/bookings?status=requires_approval');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exception booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="sm">
          <Text size="2xl" weight="bold">
            Create Exception Booking
          </Text>
          <Text color="secondary">
            Create a booking that bypasses service area restrictions. This booking will require approval.
          </Text>
        </Stack>

        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <Text>{success}</Text>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="xl">
            {/* Customer Information */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Customer Information
                </Text>
                <Stack spacing="md">
                  <Input
                    label="Name"
                    value={formData.customer.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, name: e.target.value },
                      })
                    }
                    required
                    fullWidth
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, email: e.target.value },
                      })
                    }
                    required
                    fullWidth
                  />
                  <Input
                    label="Phone"
                    value={formData.customer.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, phone: e.target.value },
                      })
                    }
                    required
                    fullWidth
                  />
                  <Textarea
                    label="Notes"
                    value={formData.customer.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, notes: e.target.value },
                      })
                    }
                    rows={3}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Trip Details */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Trip Details
                </Text>
                <Stack spacing="md">
                  <Stack spacing="xs">
                    <Text variant="small" weight="medium">Pickup Location</Text>
                    <LocationInput
                      id="pickup-location"
                      placeholder="Enter pickup address"
                      value={formData.trip.pickup.address}
                      onChange={(address) =>
                        setFormData({
                          ...formData,
                          trip: {
                            ...formData.trip,
                            pickup: { ...formData.trip.pickup, address },
                          },
                        })
                      }
                      onLocationSelect={(address, coordinates) =>
                        setFormData({
                          ...formData,
                          trip: {
                            ...formData.trip,
                            pickup: { address, coordinates },
                          },
                        })
                      }
                      coords={formData.trip.pickup.coordinates}
                      fullWidth
                    />
                  </Stack>
                  <Stack spacing="xs">
                    <Text variant="small" weight="medium">Dropoff Location</Text>
                    <LocationInput
                      id="dropoff-location"
                      placeholder="Enter dropoff address"
                      value={formData.trip.dropoff.address}
                      onChange={(address) =>
                        setFormData({
                          ...formData,
                          trip: {
                            ...formData.trip,
                            dropoff: { ...formData.trip.dropoff, address },
                          },
                        })
                      }
                      onLocationSelect={(address, coordinates) =>
                        setFormData({
                          ...formData,
                          trip: {
                            ...formData.trip,
                            dropoff: { address, coordinates },
                          },
                        })
                      }
                      coords={formData.trip.dropoff.coordinates}
                      fullWidth
                    />
                  </Stack>
                  <DateTimePicker
                    id="pickup-datetime"
                    label="Pickup Date & Time"
                    value={formData.trip.pickupDateTime}
                    onChange={(dateTime) =>
                      setFormData({
                        ...formData,
                        trip: { ...formData.trip, pickupDateTime: dateTime },
                      })
                    }
                    required
                    fullWidth
                  />
                  <Select
                    id="fare-type"
                    label="Fare Type"
                    value={formData.trip.fareType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trip: {
                          ...formData.trip,
                          fareType: e.target.value as 'personal' | 'business',
                        },
                      })
                    }
                    options={[
                      { value: 'personal', label: 'Personal' },
                      { value: 'business', label: 'Business' },
                    ]}
                    fullWidth
                  />
                  <Input
                    label="Fare Amount ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.trip.fare > 0 ? formData.trip.fare.toString() : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trip: {
                          ...formData.trip,
                          fare: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    required
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Flight Information (Optional) */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Flight Information (Optional)
                </Text>
                <Stack spacing="md">
                  <Select
                    id="has-flight"
                    label="Has Flight?"
                    value={formData.flightInfo.hasFlight ? 'yes' : 'no'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        flightInfo: {
                          ...formData.flightInfo,
                          hasFlight: e.target.value === 'yes',
                        },
                      })
                    }
                    options={[
                      { value: 'no', label: 'No' },
                      { value: 'yes', label: 'Yes' },
                    ]}
                    fullWidth
                  />
                  {formData.flightInfo.hasFlight && (
                    <>
                      <Input
                        label="Airline"
                        value={formData.flightInfo.airline}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flightInfo: {
                              ...formData.flightInfo,
                              airline: e.target.value,
                            },
                          })
                        }
                        fullWidth
                      />
                      <Input
                        label="Flight Number"
                        value={formData.flightInfo.flightNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flightInfo: {
                              ...formData.flightInfo,
                              flightNumber: e.target.value,
                            },
                          })
                        }
                        fullWidth
                      />
                      <Input
                        label="Arrival Time"
                        type="time"
                        value={formData.flightInfo.arrivalTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flightInfo: {
                              ...formData.flightInfo,
                              arrivalTime: e.target.value,
                            },
                          })
                        }
                        fullWidth
                      />
                      <Input
                        label="Terminal"
                        value={formData.flightInfo.terminal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flightInfo: {
                              ...formData.flightInfo,
                              terminal: e.target.value,
                            },
                          })
                        }
                        fullWidth
                      />
                    </>
                  )}
                </Stack>
              </Stack>
            </Box>

            {/* Exception Details */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Exception Details
                </Text>
                <Stack spacing="md">
                  <Textarea
                    label="Exception Reason"
                    value={formData.exceptionReason}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exceptionReason: e.target.value,
                      })
                    }
                    placeholder="Explain why this booking requires an exception..."
                    rows={4}
                    fullWidth
                  />
                  <Input
                    label="Exception Code"
                    type="password"
                    value={formData.exceptionCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exceptionCode: e.target.value,
                      })
                    }
                    required
                    fullWidth
                    placeholder="Enter exception code"
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Submit Button */}
            <Stack direction="horizontal" spacing="md" justify="flex-end">
              <Button
                variant="secondary"
                onClick={() => router.push('/admin/bookings')}
                disabled={loading}
                text="Cancel"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                text={loading ? 'Creating...' : 'Create Exception Booking'}
              />
            </Stack>
          </Stack>
        </form>

        {loading && (
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <LoadingSpinner />
              <Text>Creating exception booking...</Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}

