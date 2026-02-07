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
    
    console.log('🔍 Square client initialization:', {
      hasAccessToken: !!accessToken,
      hasLocationId: !!locationId,
      accessTokenLength: accessToken?.length,
      locationId,
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!accessToken || !locationId) {
      console.warn('Square credentials not available in server environment');
      return null;
    }
    
    squareCredentials = { accessToken, locationId };
    
    squareClient = new SquareClient({
      environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      token: accessToken,
    });
    
    console.log('✅ Square client initialized successfully');
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

  // Debug logging
  console.log('Square client:', client);
  console.log('Client keys:', Object.keys(client));
  console.log('Client payments:', (client as any).payments);
  console.log('Square credentials:', { 
    hasAccessToken: !!squareCredentials?.accessToken, 
    hasLocationId: !!squareCredentials?.locationId 
  });

  try {
    // Amount is already in cents (integer)
    const paymentResponse = await client.payments.create({
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

    if (!payment.amountMoney) {
      throw new Error('Payment amount information missing');
    }

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      amount: Number(payment.amountMoney.amount),
      currency: payment.amountMoney.currency,
      orderId: payment.orderId,
    };
  } catch (error) {
    console.error('Square payment error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Create order for tracking purposes
export const createOrder = async (bookingId: string, amount: number, currency: string, description: string) => {
  const client = initializeSquareClient();
  if (!client || !squareCredentials?.accessToken || !squareCredentials?.locationId) {
    throw new Error('Square service is not available in this environment.');
  }

  try {
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

    const order = orderResponse.order;
    if (!order?.id) {
      throw new Error('Unable to create Square order');
    }

    return {
      orderId: order.id,
      status: order.state,
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

export async function refundPayment(paymentId: string, amount: number, currency: string, reason?: string) {
  const client = initializeSquareClient();
  if (!client) {
    throw new Error('Square service is not available in this environment.');
  }

  try {
    // Square SDK v43 uses refundPayment method
    const refundResponse = await client.refunds.refundPayment({
      idempotencyKey: uuidv4(),
      paymentId: paymentId,
      amountMoney: {
        amount: BigInt(amount),
        currency: currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
      },
      reason: reason || 'Customer requested cancellation',
    });

    const refund = refundResponse.refund;
    if (!refund) {
      throw new Error('Failed to create refund');
    }

    console.log('✅ Square refund processed:', {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amountMoney?.amount?.toString(),
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amountMoney ? Number(refund.amountMoney.amount) : 0,
      currency: refund.amountMoney?.currency,
    };
  } catch (error) {
    console.error('Square refund error:', error);
    throw new Error(`Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const response = await client.payments.create({
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

    if (!payment.amountMoney) {
      throw new Error('Payment amount information missing');
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
