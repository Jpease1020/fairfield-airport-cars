export interface PaymentLinkPayload {
  bookingId: string;
  amount: number; // Amount in cents
  currency: string;
  description: string;
  buyerEmail?: string;
}

export interface PaymentLinkResponse {
  id: string;
  url: string;
  longUrl?: string;
  orderId: string;
  createdAt: string;
}

export interface PaymentData {
  sourceId: string;
  amountMoney: {
    amount: number; // Amount in cents
    currency: string;
  };
  idempotencyKey: string;
  note?: string;
  referenceId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export interface IPaymentService {
  createPaymentLink(payload: PaymentLinkPayload): Promise<PaymentLinkResponse>;
  createPayment(data: PaymentData): Promise<PaymentResult>;
  refundPayment(orderId: string, amount: number, currency: string): Promise<void>;
  verifyWebhook(signature: string, body: string): Promise<boolean>;
}
