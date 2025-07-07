'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { createBooking, updateBooking } from '@/lib/booking-service';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const libraries: ('places')[] = ['places'];

interface BookingFormProps {
  booking?: Booking;
}

export default function BookingForm({ booking }: BookingFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [flightNumber, setFlightNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [fare, setFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
    libraries,
  });

  const isEditMode = booking !== undefined;

  useEffect(() => {
    if (isEditMode && booking) {
      setName(booking.name);
      setEmail(booking.email);
      setPhone(booking.phone);
      setPickupLocation(booking.pickupLocation);
      setDropoffLocation(booking.dropoffLocation);
      const date = new Date(booking.pickupDateTime);
      const formattedDate = date.toISOString().slice(0, 16);
      setPickupDateTime(formattedDate);
      setPassengers(booking.passengers);
      setFlightNumber(booking.flightNumber || '');
      setNotes(booking.notes || '');
      setFare(booking.fare);
    }
  }, [isEditMode, booking]);

  const handleCalculateFare = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert("Please enter both pickup and drop-off locations.");
      return;
    }
    setIsCalculating(true);
    const response = await fetch('/api/estimate-fare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: pickupLocation, destination: dropoffLocation }),
    });

    if (response.ok) {
      const data = await response.json();
      setFare(data.fare);
    } else {
      alert("Could not calculate fare. Please check the addresses.");
      setFare(null);
    }
    setIsCalculating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fare) {
      alert("Please calculate the fare before booking.");
      return;
    }

    const bookingData = {
      name,
      email,
      phone,
      pickupLocation,
      dropoffLocation,
      pickupDateTime: new Date(pickupDateTime),
      passengers,
      flightNumber,
      notes,
      fare,
    };

    try {
      if (isEditMode && booking.id) {
        await updateBooking(booking.id, bookingData);
        setSuccess('Booking updated successfully!');
        router.push(`/booking/${booking.id}`);
      } else {
        const finalBookingData = { ...bookingData, status: 'pending' as const };
        const bookingId = await createBooking(finalBookingData);
        setSuccess('Booking created successfully! Sending confirmation...');
        try {
          await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
          });
        } catch (smsError) {
          console.error('Failed to send SMS confirmation:', smsError);
        }
        router.push(`/booking/${bookingId}`);
      }
    } catch {
      setError(isEditMode ? 'Failed to update booking.' : 'Failed to create booking.');
    }
  };

  if (loadError) return <div>Could not load locations. Please try again later.</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pickupLocation">Pickup Location</Label>
        <Autocomplete
          onLoad={(autocomplete) => (pickupRef.current = autocomplete as any)}
          onPlaceChanged={() => {
            if (pickupRef.current) {
              setPickupLocation((pickupRef.current as any).value);
            }
          }}
        >
          <Input id="pickupLocation" type="text" required defaultValue={pickupLocation} />
        </Autocomplete>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dropoffLocation">Dropoff Location</Label>
        <Autocomplete
          onLoad={(autocomplete) => (dropoffRef.current = autocomplete as any)}
          onPlaceChanged={() => {
            if (dropoffRef.current) {
              setDropoffLocation((dropoffRef.current as any).value);
            }
          }}
        >
          <Input id="dropoffLocation" type="text" required defaultValue={dropoffLocation} />
        </Autocomplete>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pickupDateTime">Pickup Date and Time</Label>
        <Input id="pickupDateTime" type="datetime-local" value={pickupDateTime} onChange={(e) => setPickupDateTime(e.target.value)} required placeholder="MM/DD/YYYY, HH:MM AM/PM" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="passengers">Passengers</Label>
        <Input id="passengers" type="number" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} min="1" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
        <Input id="flightNumber" type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>
      <Button type="button" variant="secondary" onClick={handleCalculateFare} disabled={isCalculating}>
        {isCalculating ? 'Recalculating...' : 'Recalculate Fare'}
      </Button>
      {fare && (
        <div className="text-center my-4 p-4 bg-gray-50 rounded-md">
          <p className="text-lg font-semibold">Estimated Fare: <span className="text-indigo-600">${fare}</span></p>
        </div>
      )}
      <Button type="submit" disabled={!fare} className="w-full">
        {isEditMode ? 'Update Booking' : 'Book Now'}
      </Button>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4">{success}</p>}
    </form>
  );
}
