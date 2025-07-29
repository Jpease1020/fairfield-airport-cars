import { NextResponse } from 'next/server';
import { createReview, hasBookingBeenReviewed } from '@/lib/services/review-service';
import { getBooking } from '@/lib/services/booking-service';

export async function POST(request: Request) {
  try {
    const { bookingId, rating, comment } = await request.json();

    // Validate required fields
    if (!bookingId || !rating) {
      return NextResponse.json({ 
        error: 'Missing required fields: bookingId and rating' 
      }, { status: 400 });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 });
    }

    // Check if booking has already been reviewed
    const alreadyReviewed = await hasBookingBeenReviewed(bookingId);
    if (alreadyReviewed) {
      return NextResponse.json({ 
        error: 'This booking has already been reviewed' 
      }, { status: 400 });
    }

    // Get booking details
    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    // Create the review
    const reviewId = await createReview({
      bookingId,
      customerName: booking.name,
      customerEmail: booking.email,
      rating,
      comment: comment || '',
      driverId: booking.driverId || 'gregg-main-driver',
      driverName: booking.driverName || 'Gregg',
      rideDate: booking.pickupDateTime,
    });

    return NextResponse.json({ 
      success: true, 
      reviewId,
      message: 'Review submitted successfully. Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json({ 
      error: 'Failed to submit review. Please try again.' 
    }, { status: 500 });
  }
} 