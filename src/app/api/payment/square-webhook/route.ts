import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateBooking, getBookingIdBySquarePaymentId } from '@/lib/services/booking-service';
import { getAdminDb } from '@/lib/utils/firebase-admin';

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
  const hashBuffer = Buffer.from(hash);
  const signatureBuffer = Buffer.from(signatureHeader);
  // timingSafeEqual requires equal length buffers
  if (hashBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
}

export async function POST(req: Request) {
  const rawBody = await req.text(); // need raw string for signature validation
  const signatureHeader = req.headers.get('x-square-hmacsha256-signature');

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/square-webhook`;

  if (!isValidSignature(signatureHeader, rawBody, url)) {
    // Log the URL (not the signature/secret) so a misconfigured NEXT_PUBLIC_BASE_URL — the most
    // common cause of every webhook silently 401ing — is actually debuggable from logs.
    console.error('Invalid Square webhook signature; signature computed against URL:', url);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event_id?: string;
    type: string;
    data: { object: { payment: { id?: string; order_id?: string; status: string } } };
  };

  if (event.type !== 'payment.updated' && event.type !== 'payment.created') {
    return NextResponse.json({ message: 'Event ignored' });
  }

  const payment = event.data.object.payment;
  if (!payment || payment.status !== 'COMPLETED' || !payment.id) {
    return NextResponse.json({ message: 'Payment not completed or missing payment id' });
  }

  try {
    const db = getAdminDb();

    // Dedup: Square retries undelivered/slow-acked webhooks, and can also send both
    // payment.created and payment.updated for the same completed payment. Without this, a
    // retried or duplicate delivery would re-run the confirm logic (harmless here since it's
    // idempotent, but wasteful and a foothold for future non-idempotent side effects).
    const eventId = event.event_id ?? `payment:${payment.id}:${payment.status}`;
    const processedRef = db.collection('processedSquareWebhookEvents').doc(eventId);
    if ((await processedRef.get()).exists) {
      return NextResponse.json({ message: 'Already processed' });
    }

    // Square events are keyed by payment.id, not by our booking ID — createPaymentAtomic never
    // tells Square what our booking ID is, so payment.order_id is Square's own internal order,
    // unrelated to our Firestore document ID. Look the booking up by the squarePaymentId field
    // we stored on it when the charge was originally made.
    const bookingId = await getBookingIdBySquarePaymentId(payment.id);
    if (!bookingId) {
      // Square can deliver this webhook before /api/payment/process-payment finishes writing
      // squarePaymentId onto the booking (payment capture and our own booking-creation write are
      // two independent races). A 200 here tells Square delivery succeeded, so it never retries —
      // permanently stranding that booking in 'pending' even though it (will have) paid. A non-2xx
      // makes Square redeliver on its own retry schedule, by which point the booking should exist.
      console.error('Square webhook: no booking found yet for payment', payment.id, '- requesting retry');
      return NextResponse.json({ message: 'No matching booking for this payment yet' }, { status: 404 });
    }

    const tipCents = (payment as any).tip_money?.amount ?? (payment as any).tipMoney?.amount ?? 0;
    await updateBooking(bookingId, {
      status: 'confirmed',
      depositPaid: true,
      balanceDue: 0,
      // Firestore's Admin SDK rejects `undefined` field values outright — only include this key
      // when there's an actual tip, instead of setting it to `undefined` on every zero-tip payment.
      ...(tipCents > 0 ? { tipAmount: tipCents / 100 } : {}),
      updatedAt: new Date(),
    });

    await processedRef.set({ paymentId: payment.id, processedAt: new Date().toISOString() });

    return NextResponse.json({ message: 'Booking confirmed' });
  } catch (err) {
    console.error('Square webhook processing error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}