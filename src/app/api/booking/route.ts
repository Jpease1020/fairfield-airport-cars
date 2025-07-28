import { NextResponse } from 'next/server';
import { createBooking } from '@/lib/services/booking-service';

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'pickupLocation', 'dropoffLocation', 'pickupDateTime', 'passengers', 'fare'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Create the booking
    const bookingId = await createBooking({
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      pickupLocation: bookingData.pickupLocation,
      dropoffLocation: bookingData.dropoffLocation,
      pickupDateTime: new Date(bookingData.pickupDateTime),
      passengers: bookingData.passengers,
      flightNumber: bookingData.flightNumber || '',
      notes: bookingData.notes || '',
      fare: bookingData.fare,
      status: 'pending',
      depositPaid: false,
      balanceDue: bookingData.fare
    });

    return NextResponse.json({ 
      success: true, 
      bookingId: bookingId,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ 
      error: 'Failed to create booking. Please try again.' 
    }, { status: 500 });
  }
} 