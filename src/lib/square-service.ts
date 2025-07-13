/* eslint-disable @typescript-eslint/no-explicit-any */
import { SquareClient, SquareEnvironment } from 'square';
import { v4 as uuidv4 } from 'uuid';

const {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID,
  // SQUARE_WEBHOOK_SIGNATURE_KEY will be consumed in the webhook handler, not here
} = process.env;

// Initialize the Square client
const squareClient = new SquareClient({
  environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  token: SQUARE_ACCESS_TOKEN,
});

interface PaymentLinkPayload {
  bookingId: string;
  amount: number; // Amount in cents (e.g., 1999 for $19.99)
  currency: string; // ISO currency code, e.g., 'USD'
  description: string;
  buyerEmail?: string;
}

export const createPaymentLink = async ({ bookingId, amount, currency, description, buyerEmail }: PaymentLinkPayload) => {
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    console.error('Square credentials are not configured in environment variables');
    throw new Error('Square service is not configured.');
  }

  try {
    // 1) Create an order that stores the bookingId in metadata.
    const orderResponse = await squareClient.orders.create({
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: description,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(amount),
              currency: currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
            },
          },
        ],
        metadata: {
          bookingId,
        },
      },
      idempotencyKey: uuidv4(),
    });

    const orderId = (orderResponse as any).order?.id;
    if (!orderId) {
      throw new Error('Unable to create Square order.');
    }

    // 2) Generate a hosted checkout/payment link for that order.
    // Use checkoutApi; Type definitions in v43 may not include createPaymentLink, so we cast to any.
    const paymentLinkResponse = await (squareClient as any).checkoutApi.createPaymentLink({
      idempotencyKey: uuidv4(),
      orderId,
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?bookingId=${bookingId}`,
        tipSettings: {
          allowTipping: true,
          separateTipScreen: false,
          defaultTipPercentage: 20,
        },
      },
      prePopulatedData: buyerEmail ? { buyerEmail } : undefined,
    });

    const paymentLink = (paymentLinkResponse as any).paymentLink ?? (paymentLinkResponse as any).result?.paymentLink;

    if (!paymentLink?.url) {
      throw new Error('Failed to create payment link.');
    }

    return {
      id: paymentLink.id,
      url: paymentLink.url,
      longUrl: paymentLink.longUrl ?? paymentLink.url,
      orderId,
      createdAt: paymentLink.createdAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('Square SDK error:', error);
    throw new Error('Failed to create payment link.');
  }
};

export async function refundPayment(orderId: string, amount: number, currency: string) {
  try {
    // Fetch order to get paymentId (tender)
    const orderResp = await (squareClient as any).ordersApi.retrieveOrder(orderId);
    const paymentIds: string[] = (orderResp as any).order?.tenders?.map((t: any) => t.paymentId).filter(Boolean) || [];
    if (paymentIds.length === 0) {
      console.log('No payment found on order; maybe deposit not paid yet.');
      return;
    }

    const paymentId = paymentIds[0];

    const body = {
      idempotencyKey: uuidv4(),
      amountMoney: {
        amount: BigInt(amount),
        currency,
      },
      paymentId,
    } as any;

    await (squareClient as any).refundsApi.refundPayment(body);
    console.log(`[Square] Refund executed for payment ${paymentId}: ${amount} ${currency}`);
  } catch (err) {
    console.error('Square refund error:', err);
    throw err;
  }
}
