// Modern Square service using Web Payments SDK + Payments API
import { SquareClient, SquareEnvironment } from 'square';
import { v4 as uuidv4 } from 'uuid';

// Initialize Square client for server-side usage
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

// Process payment using payment token from Web Payments SDK
export const processPayment = async (paymentToken: string, amount: number, currency: string, bookingId: string) => {
  const client = initializeSquareClient();
  if (!client || !squareCredentials?.accessToken || !squareCredentials?.locationId) {
    throw new Error('Square service is not available in this environment.');
  }

  try {
    // Create payment using the payment token - using the correct v43 API
    const paymentResponse = await (client as any).paymentsApi.createPayment({
      sourceId: paymentToken,
      amountMoney: {
        amount: BigInt(amount),
        currency: currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
      },
      idempotencyKey: uuidv4(),
      note: `Payment for booking ${bookingId}`,
      referenceId: bookingId,
      locationId: squareCredentials.locationId,
    });

    const payment = paymentResponse.payment;
    if (!payment) {
      throw new Error('Failed to create payment');
    }

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amountMoney.amount,
      currency: payment.amountMoney.currency,
      orderId: payment.orderId,
    };
  } catch (error) {
    console.error('Square payment error:', error);
    throw new Error('Failed to process payment');
  }
};

// Create order for tracking purposes
export const createOrder = async (bookingId: string, amount: number, currency: string, description: string) => {
  const client = initializeSquareClient();
  if (!client || !squareCredentials?.accessToken || !squareCredentials?.locationId) {
    throw new Error('Square service is not available in this environment.');
  }

  try {
    const orderResponse = await (client as any).ordersApi.createOrder({
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

    const order = orderResponse.order;
    if (!order?.id) {
      throw new Error('Unable to create Square order');
    }

    return {
      orderId: order.id,
      status: order.status,
    };
  } catch (error) {
    console.error('Square order creation error:', error);
    throw new Error('Failed to create order');
  }
};

// Legacy function for backward compatibility - now redirects to modern approach
export const createPaymentLink = async ({ bookingId, amount, currency, description, buyerEmail }: {
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  buyerEmail?: string;
}) => {
  // This function is deprecated - use the Web Payments SDK frontend + processPayment backend instead
  throw new Error('createPaymentLink is deprecated. Use the Web Payments SDK frontend with processPayment backend instead.');
};

export async function refundPayment(orderId: string, amount: number, currency: string) {
  const client = initializeSquareClient();
  if (!client) {
    throw new Error('Square service is not available in this environment.');
  }
  
  try {
    // Fetch order to get paymentId (tender)
    const orderResp = await (client as any).ordersApi.retrieveOrder(orderId);
    const paymentIds: string[] = orderResp.order?.tenders?.map((t: any) => t.paymentId).filter(Boolean) || [];
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
    throw new Error('Failed to process refund');
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
    throw new Error('Square service is not available in this environment.');
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
      locationId: squareCredentials?.locationId,
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
