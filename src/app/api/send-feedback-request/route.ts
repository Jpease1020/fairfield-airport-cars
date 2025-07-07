import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/twilio-service';
import { getBooking } from '@/lib/booking-service';

export async function POST(request: Request) {
  const { bookingId } = await request.json();

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  try {
    const booking = await getBooking(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Construct the feedback URL
    const feedbackUrl = `${request.headers.get('origin')}/feedback/${bookingId}`;

    const messageBody = `Thank you for riding with Fairfield Airport Car Service! We'd love to hear your feedback. Please take a moment to leave a review: ${feedbackUrl}`;

    await sendSms({
      to: booking.phone,
      body: messageBody,
    });

    return NextResponse.json({ message: 'Feedback request sent successfully' });
  } catch (error) {
    console.error('Failed to send feedback request SMS:', error);
    return NextResponse.json({ error: 'Failed to send feedback request' }, { status: 500 });
  }
}
