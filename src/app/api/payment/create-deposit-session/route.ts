import { NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/services/square-service';
import { updateBooking } from '@/lib/services/booking-service';
import { cmsService } from '@/lib/services/cms-service';

export async function POST(request: Request) {
  const { bookingId, totalAmount, currency, description } = await request.json();

  if (!bookingId || !totalAmount || !currency || !description) {
    return NextResponse.json({ error: 'Missing required payment information' }, { status: 400 });
  }

  try {
    // Get pricing settings to determine deposit percentage
    const pricingSettings = await cmsService.getPricingSettings();
    const depositPercent = pricingSettings?.depositPercent || 50;
    
    // Calculate deposit amount (in cents)
    const depositAmount = Math.round((totalAmount * depositPercent) / 100);
    const balanceAmount = totalAmount - depositAmount;

    // Create payment link for deposit only
    const paymentLink = await createPaymentLink({
      bookingId,
      amount: depositAmount,
      currency,
      description: `${description} - Deposit (${depositPercent}%)`,
    });

    // Update booking with deposit information
    await updateBooking(bookingId, {
      squareOrderId: paymentLink.orderId,
      depositAmount: depositAmount / 100,
      balanceDue: balanceAmount / 100,
      depositPaid: false, // Will be set to true when payment is completed
    });

    return NextResponse.json({ 
      paymentLinkUrl: paymentLink.url,
      depositAmount: depositAmount / 100,
      balanceAmount: balanceAmount / 100,
      depositPercent
    });
  } catch (error) {
    console.error('Failed to create deposit payment session:', error);
    return NextResponse.json({ error: 'Failed to create deposit payment session' }, { status: 500 });
  }
} 