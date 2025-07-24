'use client';

import { useState } from 'react';
import { createBooking, getBooking } from '@/lib/services/booking-service';

export default function TestSimpleBooking() {
  const [bookingId, setBookingId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreateBooking = async () => {
    setLoading(true);
    try {
      const bookingData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '555-1234',
        pickupLocation: 'Fairfield, CT',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        passengers: 1,
        status: 'pending' as const,
        fare: 150,
        depositPaid: false,
        balanceDue: 150
      };

      const id = await createBooking(bookingData);
      setBookingId(id);
      setResult({ success: true, bookingId: id, message: 'Booking created successfully' });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetBooking = async () => {
    if (!bookingId) return;
    
    setLoading(true);
    try {
      const booking = await getBooking(bookingId);
      setResult({ success: true, booking });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Simple Booking Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testCreateBooking}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test Booking'}
        </button>

        {bookingId && (
          <button
            onClick={testGetBooking}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Retrieving...' : 'Get Booking'}
          </button>
        )}

        {result && (
          <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-bold">{result.success ? 'Success' : 'Error'}</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {bookingId && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Booking ID:</h3>
            <p className="font-mono text-sm">{bookingId}</p>
          </div>
        )}
      </div>
    </div>
  );
} 