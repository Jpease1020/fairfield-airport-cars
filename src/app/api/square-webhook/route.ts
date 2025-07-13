import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateBooking } from '@/lib/booking-service';

const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

/**
 * Verifies Square HMAC-SHA256 signature.
 * https://developer.squareup.com/docs/webhooks/step3-validate-signature#nodejs-example
 */
function isValidSignature(signatureHeader: string | null, body: string, url: string): boolean {
  if (!signatureKey || !signatureHeader) return false;
  const hmac = crypto.createHmac('sha256', signatureKey);
  hmac.update(url + body);
  const hash = hmac.digest('base64');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
}

export async function POST(req: Request) {
  const rawBody = await req.text(); // need raw string for signature validation
  const signatureHeader = req.headers.get('x-square-hmacsha256-signature');

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/square-webhook`;

  if (!isValidSignature(signatureHeader, rawBody, url)) {
    console.error('Invalid Square webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    data: { object: { payment: { order_id?: string; status: string } } };
  };

  if (event.type !== 'payment.updated' && event.type !== 'payment.created') {
    return NextResponse.json({ message: 'Event ignored' });
  }

  const payment = event.data.object.payment;
  if (!payment || payment.status !== 'COMPLETED' || !payment.order_id) {
    return NextResponse.json({ message: 'Payment not completed or missing order id' });
  }

  try {
    // order_id was stored in Square order.metadata.bookingId
    // For simplicity, assume bookingId === order_id for now (can store metadata retrieval later)
    const bookingId = payment.order_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tipCents = (payment as any).tipMoney?.amount || (payment as any).tip_money?.amount || 0;
    await updateBooking(bookingId, {
      status: 'confirmed',
      depositPaid: true,
      balanceDue: 0,
      tipAmount: tipCents ? tipCents / 100 : undefined,
      updatedAt: new Date(),
    });
    return NextResponse.json({ message: 'Booking confirmed' });
  } catch (err) {
    console.error('Failed to update booking from Square webhook', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 