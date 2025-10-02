import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/services/square-service';
import { createBookingAtomic } from '@/lib/services/booking-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { sendSms } from '@/lib/services/twilio-service';

export async function POST(request: Request) {
  try {
    const { paymentToken, amount, currency, bookingData, existingBookingId, tipAmount = 0 } = await request.json();

    if (!paymentToken || !amount || !currency) {
      return NextResponse.json({ 
        error: 'Missing required payment information' 
      }, { status: 400 });
    }

    // SECURITY: Process payment FIRST, then create booking
    // Amount is in cents, so we pass it directly to Square
    const paymentResult = await processPayment(
      paymentToken, 
      amount + tipAmount, // Include tip in total amount (both in cents)
      currency, 
      existingBookingId || 'temp-booking-id' // Use existing ID or temp for new bookings
    );

    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: 'Payment processing failed' 
      }, { status: 400 });
    }

    // Only create booking AFTER successful payment
    let bookingId = existingBookingId;
    
    if (!bookingId && bookingData) {
      // Create new booking with payment information
      const bookingResult = await createBookingAtomic({
        ...bookingData,
        squareOrderId: paymentResult.orderId,
        depositPaid: true,
        depositAmount: amount / 100, // Convert cents to dollars
        tipAmount: tipAmount > 0 ? tipAmount / 100 : 0, // Convert cents to dollars
        status: 'confirmed', // Mark as confirmed since payment succeeded
        balanceDue: 0, // No balance due since deposit is paid
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      bookingId = bookingResult.bookingId;
      
      // Send confirmation notifications after successful booking creation
      if (bookingData) {
        try {
          const booking = {
            ...bookingData,
            id: bookingId,
            pickupDateTime: new Date(bookingData.pickupDateTime), // Convert string to Date
            squareOrderId: paymentResult.orderId,
            depositPaid: true,
            depositAmount: amount / 100,
            tipAmount: tipAmount > 0 ? tipAmount / 100 : 0,
            status: 'confirmed',
            balanceDue: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Send both email and SMS notifications
          const smsMessage = `Thank you for booking with Fairfield Airport Car Service! Your ride from ${booking.pickupLocation} to ${booking.dropoffLocation} on ${booking.pickupDateTime.toLocaleString()} is confirmed. Booking ID: ${bookingId}`;
          
          await Promise.all([
            sendConfirmationEmail(booking),
            sendSms({
              to: booking.phone,
              body: smsMessage
            })
          ]);
        } catch (notificationError) {
          console.error('Failed to send confirmation notifications:', notificationError);
          // Don't fail the payment if notifications fail
        }
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      paymentId: paymentResult.paymentId,
      status: paymentResult.status,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
    });

  } catch (error) {
    console.error('Failed to process payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
