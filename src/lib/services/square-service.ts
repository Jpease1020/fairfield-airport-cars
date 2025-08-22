// Client-side Square service - credentials loaded lazily
import { SquareClient, SquareEnvironment } from 'square';
import { v4 as uuidv4 } from 'uuid';

// Initialize Square client lazily for client-side usage
let squareClient: SquareClient | null = null;
let squareCredentials: any = null;

const initializeSquareClient = (): SquareClient | null => {
  if (squareClient) return squareClient;
  
  try {
    // Get credentials from environment variables for server-side
    const accessToken = process.env.SQUARE_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    
    if (!accessToken || !locationId) {
      console.warn('Square credentials not available in server environment');
      return null;
    }
    
    squareCredentials = { accessToken, locationId };
    
    squareClient = new SquareClient({
      environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      token: accessToken,
    });
    
    return squareClient;
  } catch (error) {
    console.warn('Square service not available in server environment:', error);
    return null;
  }
};

interface PaymentLinkPayload {
  bookingId: string;
  amount: number; // Amount in cents (e.g., 1999 for $19.99)
  currency: string; // ISO currency code, e.g., 'USD'
  description: string;
  buyerEmail?: string;
}

export const createPaymentLink = async ({ bookingId, amount, currency, description, buyerEmail }: PaymentLinkPayload) => {
  const client = initializeSquareClient();
  if (!client || !squareCredentials?.accessToken || !squareCredentials?.locationId) {
    throw new Error('Square service is not available in this environment. Please use the API route instead.');
  }

  try {
    // 1) Create an order that stores the bookingId in metadata.
    const orderResponse = await client.orders.create({
      order: {
        locationId: squareCredentials.locationId,
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
    const paymentLinkResponse = await (client as any).checkoutApi.createPaymentLink({
      idempotencyKey: uuidv4(),
      orderId,
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?source=square&bookingId=${bookingId}`,
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
  const client = initializeSquareClient();
  if (!client) {
    throw new Error('Square service is not available in this environment. Please use the API route instead.');
  }
  
  try {
    // Fetch order to get paymentId (tender)
    const orderResp = await (client as any).ordersApi.retrieveOrder(orderId);
    const paymentIds: string[] = (orderResp as any).order?.tenders?.map((t: any) => t.paymentId).filter(Boolean) || [];
    if (paymentIds.length === 0) {
      return;
    }

    // Process refund for each payment
    for (const paymentId of paymentIds) {
      await (client as any).refundsApi.refundPayment({
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
  const client = initializeSquareClient();
  if (!client) {
    throw new Error('Square service is not available in this environment. Please use the API route instead.');
  }
  
  try {
    const response = await (client as any).paymentsApi.createPayment({
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
