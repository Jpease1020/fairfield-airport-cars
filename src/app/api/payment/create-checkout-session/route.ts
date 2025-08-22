
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { bookingId, amount, currency, description } = await request.json();

  if (!bookingId || !amount || !currency || !description) {
    return NextResponse.json({ error: 'Missing required payment information' }, { status: 400 });
  }

  // Redirect to the new payment form instead of creating deprecated payment links
  const paymentFormUrl = `/payments/pay-balance/${bookingId}`;
  
  return NextResponse.json({ 
    redirectUrl: paymentFormUrl,
    message: 'Please complete payment using the new payment form'
  });
}
