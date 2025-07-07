
import { NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/square-service';

export async function POST(request: Request) {
  const { bookingId, amount, currency, description } = await request.json();

  if (!bookingId || !amount || !currency || !description) {
    return NextResponse.json({ error: 'Missing required payment information' }, { status: 400 });
  }

  try {
    const paymentLink = await createPaymentLink({
      bookingId,
      amount,
      currency,
      description,
    });

    return NextResponse.json({ paymentLinkUrl: paymentLink.url });
  } catch (error) {
    console.error('Failed to create Square checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
