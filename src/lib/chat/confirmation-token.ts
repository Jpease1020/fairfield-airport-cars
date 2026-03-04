import crypto from 'crypto';
import type { BookingDraft, ConfirmationSummary, FareType } from '@/lib/chat/chat-types';

const DEFAULT_TTL_SECONDS = 5 * 60;

interface TokenPayload {
  summaryHash: string;
  exp: number;
  nonce: string;
}

function requireSecret(): string {
  const secret =
    process.env.CHAT_CONFIRMATION_SECRET ||
    process.env.AUTH_SESSION_SECRET ||
    process.env.AUTH_TOKEN_SECRET;

  if (!secret) {
    throw new Error('CHAT_CONFIRMATION_SECRET or AUTH_SESSION_SECRET is required');
  }

  return secret;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(input: string): string {
  return crypto.createHmac('sha256', requireSecret()).update(input).digest('base64url');
}

function normalizeFareType(value: unknown): FareType {
  return value === 'business' ? 'business' : 'personal';
}

export function buildConfirmationSummary(draft: BookingDraft): ConfirmationSummary | null {
  if (
    !draft.pickup?.address ||
    !draft.dropoff?.address ||
    !draft.pickupDateTime ||
    !draft.quote?.quoteId ||
    typeof draft.quote.fare !== 'number' ||
    !draft.customer?.name ||
    !draft.customer?.email ||
    !draft.customer?.phone
  ) {
    return null;
  }

  return {
    pickupAddress: draft.pickup.address.trim(),
    dropoffAddress: draft.dropoff.address.trim(),
    pickupDateTime: draft.pickupDateTime,
    fareType: normalizeFareType(draft.fareType),
    fare: draft.quote.fare,
    quoteId: draft.quote.quoteId,
    customerName: draft.customer.name.trim(),
    customerEmail: draft.customer.email.trim().toLowerCase(),
    customerPhone: draft.customer.phone.trim(),
  };
}

export function hashConfirmationSummary(summary: ConfirmationSummary): string {
  const canonical = JSON.stringify({
    pickupAddress: summary.pickupAddress,
    dropoffAddress: summary.dropoffAddress,
    pickupDateTime: summary.pickupDateTime,
    fareType: summary.fareType,
    fare: summary.fare,
    quoteId: summary.quoteId,
    customerName: summary.customerName,
    customerEmail: summary.customerEmail,
    customerPhone: summary.customerPhone,
  });

  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export function issueConfirmationToken(params: {
  summaryHash: string;
  now?: Date;
  ttlSeconds?: number;
}): { token: string; expiresAt: string } {
  const now = params.now ?? new Date();
  const ttlSeconds = params.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const exp = Math.floor(now.getTime() / 1000) + ttlSeconds;

  const payload: TokenPayload = {
    summaryHash: params.summaryHash,
    exp,
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

export function verifyConfirmationToken(params: {
  token: string;
  summaryHash: string;
  now?: Date;
}): { ok: boolean; reason?: string } {
  const [encodedPayload, providedSignature] = params.token.split('.');

  if (!encodedPayload || !providedSignature) {
    return { ok: false, reason: 'malformed_token' };
  }

  const expectedSignature = sign(encodedPayload);
  if (expectedSignature !== providedSignature) {
    return { ok: false, reason: 'invalid_signature' };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(fromBase64Url(encodedPayload)) as TokenPayload;
  } catch {
    return { ok: false, reason: 'invalid_payload' };
  }

  const nowSec = Math.floor((params.now ?? new Date()).getTime() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    return { ok: false, reason: 'expired' };
  }

  if (payload.summaryHash !== params.summaryHash) {
    return { ok: false, reason: 'summary_mismatch' };
  }

  return { ok: true };
}
