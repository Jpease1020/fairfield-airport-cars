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
      return;
    }

    // Process refund for each payment
    for (const paymentId of paymentIds) {
      await (squareClient as any).refundsApi.refundPayment({
        paymentId,
        idempotencyKey: uuidv4(),
        amountMoney: {
          amount: BigInt(amount),
          currency: currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
        },
      });
    }
  } catch (error) {
    console.error('Square refund error:', error);
    throw new Error('Failed to process refund.');
  }
}

interface CreatePaymentPayload {
  sourceId: string;
  amountMoney: {
    amount: number;
    currency: string;
  };
  idempotencyKey: string;
  note?: string;
  referenceId?: string;
}

export async function createPayment(payload: CreatePaymentPayload) {
  try {
    const response = await (squareClient as any).paymentsApi.createPayment({
      sourceId: payload.sourceId,
      amountMoney: {
        amount: BigInt(payload.amountMoney.amount),
        currency: payload.amountMoney.currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
      },
      idempotencyKey: payload.idempotencyKey,
      note: payload.note,
      referenceId: payload.referenceId,
    });

    const payment = response.payment;
    
    if (!payment) {
      throw new Error('Failed to create payment');
    }

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amountMoney.amount,
      currency: payment.amountMoney.currency,
    };
  } catch (error) {
    console.error('Square payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}
