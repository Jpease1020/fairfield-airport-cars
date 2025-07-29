import { NextResponse } from 'next/server';
import { createBooking, getBooking } from '@/lib/services/booking-service';
import { createPaymentLink } from '@/lib/services/square-service';

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

    // Create the booking with driver assignment and payment
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

    // Get the created booking to return payment info
    const booking = await getBooking(bookingId);
    
    // Create payment link for deposit
    let paymentLinkUrl = null;
    try {
      const depositAmount = Math.round(bookingData.fare * 0.2 * 100) / 100;
      const paymentLink = await createPaymentLink({
        bookingId,
        amount: Math.round(depositAmount * 100), // Convert to cents
        currency: 'USD',
        description: `Deposit for ride from ${bookingData.pickupLocation} to ${bookingData.dropoffLocation}`,
        buyerEmail: bookingData.email,
      });
      paymentLinkUrl = paymentLink.url;
    } catch (paymentError) {
      console.error('Failed to create payment link:', paymentError);
      // Continue without payment link for now
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: bookingId,
      paymentLinkUrl,
      driverName: 'Gregg',
      driverPhone: '(203) 555-0123',
      message: 'Booking created successfully. Please complete your deposit payment to confirm your ride.'
    });

  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ 
      error: 'Failed to create booking. Please try again.' 
    }, { status: 500 });
  }
} 