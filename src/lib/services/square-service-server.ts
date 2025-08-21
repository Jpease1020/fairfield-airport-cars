// Server-safe Square service using direct API calls
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

// Get environment-specific Square credentials
const getSquareCredentials = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Use sandbox credentials in development
    return {
      accessToken: process.env.SANDBOX_SQUARE_ACCESS_TOKEN || '',
      locationId: process.env.SANDBOX_SQUARE_LOCATION_ID || '',
      applicationId: process.env.SANDBOX_SQUARE_APPLICATION_ID || '',
      environment: 'sandbox' as const
    };
  } else {
    // Use production credentials in production
    return {
      accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
      locationId: process.env.SQUARE_LOCATION_ID || '',
      applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '',
      environment: 'production' as const
    };
  }
};

// Validate Square configuration
const validateSquareConfig = () => {
  const credentials = getSquareCredentials();
  const errors: string[] = [];

  if (!credentials.accessToken) {
    errors.push('Square access token is missing');
  }
  if (!credentials.locationId) {
    errors.push('Square location ID is missing');
  }
  if (!credentials.applicationId) {
    errors.push('Square application ID is missing');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get Square credentials
const squareCredentials = getSquareCredentials();

// Validate configuration on service initialization
const configValidation = validateSquareConfig();
if (!configValidation.isValid) {
  console.error('Square configuration validation failed:', configValidation.errors);
}

// Use direct Square API calls instead of the problematic SDK
const squareApiBase = squareCredentials.environment === 'production' 
  ? 'https://connect.squareup.com/v2'
  : 'https://connect.squareupsandbox.com/v2';

const squareHeaders = {
  'Authorization': `Bearer ${squareCredentials.accessToken}`,
  'Square-Version': '2024-01-17',
  'Content-Type': 'application/json'
};

interface PaymentLinkPayload {
  bookingId: string;
  amount: number; // Amount in cents (e.g., 1999 for $19.99)
  currency: string; // ISO currency code, e.g., 'USD'
  description: string;
  buyerEmail?: string;
}

export const createPaymentLink = async ({ bookingId, amount, currency, description, buyerEmail }: PaymentLinkPayload) => {
  // Get fresh credentials in case environment variables weren't loaded
  const isDevelopment = process.env.NODE_ENV === 'development';
  const accessToken = isDevelopment ? process.env.SANDBOX_SQUARE_ACCESS_TOKEN : process.env.SQUARE_ACCESS_TOKEN;
  const locationId = isDevelopment ? process.env.SANDBOX_SQUARE_LOCATION_ID : process.env.SQUARE_LOCATION_ID;
  
  if (!accessToken || !locationId) {
    console.error('Square credentials not found:', { accessToken: !!accessToken, locationId: !!locationId });
    throw new Error('Square service is not configured.');
  }
  
  console.log('Using credentials:', { 
    environment: isDevelopment ? 'sandbox' : 'production',
    locationId: locationId,
    accessTokenLength: accessToken.length 
  });

  try {
    // Set up API configuration with fresh credentials
    const squareApiBase = isDevelopment 
      ? 'https://connect.squareupsandbox.com/v2'
      : 'https://connect.squareup.com/v2';
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Square-Version': '2024-01-17',
      'Content-Type': 'application/json'
    };
    
    // 1) Create an order that stores the bookingId in metadata.
    const orderResponse = await fetch(`${squareApiBase}/orders`, {
      method: 'POST',
      headers: headers,
              body: JSON.stringify({
          order: {
            locationId: locationId,
          lineItems: [
            {
              name: description,
              quantity: '1',
              basePriceMoney: {
                amount: amount,
                currency: currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
              },
            },
          ],
          metadata: {
            bookingId,
          },
        },
        idempotencyKey: uuidv4(),
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      throw new Error(`Failed to create order: ${orderResponse.status} - ${errorData}`);
    }

    const orderData = await orderResponse.json();

    const orderId = orderData.order?.id;
    if (!orderId) {
      throw new Error('Unable to create Square order.');
    }

    // 2) Generate a hosted checkout/payment link for that order.
    // Note: Square doesn't have a direct payment link API, we need to use checkout sessions
    const paymentLinkResponse = await fetch(`${squareApiBase}/checkout-sessions`, {
      method: 'POST',
      headers: squareHeaders,
      body: JSON.stringify({
        idempotencyKey: uuidv4(),
        orderId,
        checkoutOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?bookingId=${bookingId}`,
          tipSettings: {
            allowTipping: true,
            separateTipScreen: false,
            defaultTipPercentage: 20,
          },
        },
        prePopulatedData: buyerEmail ? { buyerEmail } : undefined,
      })
    });

    if (!paymentLinkResponse.ok) {
      const errorData = await paymentLinkResponse.text();
      throw new Error(`Failed to create payment link: ${paymentLinkResponse.status} - ${errorData}`);
    }

    const paymentLinkData = await paymentLinkResponse.json();

    const paymentLink = paymentLinkData.paymentLink ?? paymentLinkData.result?.paymentLink;

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
    const orderResp = await fetch(`${squareApiBase}/orders/${orderId}`, {
      method: 'GET',
      headers: squareHeaders
    });

    if (!orderResp.ok) {
      throw new Error(`Failed to retrieve order: ${orderResp.status}`);
    }

    const orderData = await orderResp.json();
    const paymentIds: string[] = orderData.order?.tenders?.map((t: any) => t.paymentId).filter(Boolean) || [];
    
    if (paymentIds.length === 0) {
      throw new Error('No payment found for this order.');
    }

    // Process refund for each payment
    const refundPromises = paymentIds.map(async (paymentId) => {
      const refundResponse = await fetch(`${squareApiBase}/refunds`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          paymentId,
          idempotencyKey: uuidv4(),
          amountMoney: {
            amount: amount,
            currency: currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
          },
        })
      });
      return refundResponse;
    });

    const refundResults = await Promise.all(refundPromises);
    return refundResults;
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
    console.log('💳 Creating Square payment with payload:', payload);
    
    const response = await fetch(`${squareApiBase}/payments`, {
      method: 'POST',
      headers: squareHeaders,
      body: JSON.stringify({
        source_id: payload.sourceId,
        amount_money: {
          amount: payload.amountMoney.amount,
          currency: payload.amountMoney.currency as 'USD' | 'EUR' | 'GBP' | 'CAD',
        },
        idempotency_key: payload.idempotencyKey,
        note: payload.note,
        reference_id: payload.referenceId,
      })
    });

    console.log('📡 Square API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Square API error:', errorData);
      throw new Error(`Payment failed: ${response.status} - ${errorData}`);
    }

    const paymentData = await response.json();
    console.log('✅ Square payment response:', paymentData);
    
    const payment = paymentData.payment;

    if (!payment || payment.status !== 'COMPLETED') {
      throw new Error(`Payment not completed. Status: ${payment?.status}`);
    }

    return {
      success: true,
      paymentId: payment.id,
      amount: payment.amount_money.amount,
      currency: payment.amount_money.currency,
      status: payment.status,
      createdAt: payment.created_at
    };
  } catch (error) {
    console.error('Square payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    };
  }
}
