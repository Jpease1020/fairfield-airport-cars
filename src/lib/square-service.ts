import { SquareClient, SquareEnvironment } from 'square';
import { v4 as uuidv4 } from 'uuid';

const {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID,
} = process.env;

// Initialize the Square client
const squareClient = new SquareClient({
  environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  token: SQUARE_ACCESS_TOKEN,
});

interface PaymentLinkPayload {
  bookingId: string;
  amount: number; // Amount in cents
  currency: string;
  description: string;
}

export const createPaymentLink = async ({ bookingId, amount, currency, description }: PaymentLinkPayload) => {
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    console.error('Square credentials are not configured in .env.local');
    throw new Error('Square service is not configured.');
  }

  try {
    // Create an order first
    const orderResponse = await squareClient.orders.create({
      idempotencyKey: uuidv4(),
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: description,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(amount),
              currency: currency as "USD" | "EUR" | "GBP" | "CAD",
            },
          },
        ],
        metadata: {
          bookingId,
        },
      },
    });

    // For now, return a mock payment link structure
    // This will need to be replaced with actual Square payment link creation
    return {
      id: orderResponse.order?.id || '',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/${bookingId}`,
      longUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/${bookingId}`,
      orderId: orderResponse.order?.id || '',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to create Square payment link:', error);
    throw new Error('Failed to create payment link.');
  }
};
