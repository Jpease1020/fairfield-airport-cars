import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildConfirmationSummary,
  hashConfirmationSummary,
  issueConfirmationToken,
  verifyConfirmationToken,
} from '@/lib/chat/confirmation-token';

describe('chat confirmation gate', () => {
  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = 'test-secret';
  });

  it('buildConfirmationSummary returns null when draft is incomplete', () => {
    const summary = buildConfirmationSummary({});
    expect(summary).toBeNull();
  });

  it('issues and verifies token for matching summary hash', () => {
    const summary = buildConfirmationSummary({
      pickup: { address: '44 Elm St, Westport, CT', coordinates: { lat: 41.1, lng: -73.2 } },
      dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6, lng: -73.7 } },
      pickupDateTime: '2026-03-12T12:00:00.000Z',
      fareType: 'personal',
      customer: { name: 'Justin', email: 'justin@example.com', phone: '2035550101' },
      quote: {
        quoteId: 'q1',
        fare: 145,
        distanceMiles: 32,
        durationMinutes: 55,
        expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      },
    });

    expect(summary).not.toBeNull();
    const summaryHash = hashConfirmationSummary(summary!);
    const token = issueConfirmationToken({ summaryHash, now: new Date('2026-03-04T12:00:00Z'), ttlSeconds: 60 });

    const verified = verifyConfirmationToken({
      token: token.token,
      summaryHash,
      now: new Date('2026-03-04T12:00:30Z'),
    });

    expect(verified.ok).toBe(true);
  });

  it('rejects token for mismatched summary hash', () => {
    const token = issueConfirmationToken({ summaryHash: 'abc', now: new Date('2026-03-04T12:00:00Z'), ttlSeconds: 60 });

    const verified = verifyConfirmationToken({
      token: token.token,
      summaryHash: 'different',
      now: new Date('2026-03-04T12:00:10Z'),
    });

    expect(verified.ok).toBe(false);
    if (!verified.ok) {
      expect(verified.reason).toBe('summary_mismatch');
    }
  });

  it('rejects expired token', () => {
    const token = issueConfirmationToken({ summaryHash: 'abc', now: new Date('2026-03-04T12:00:00Z'), ttlSeconds: 5 });

    const verified = verifyConfirmationToken({
      token: token.token,
      summaryHash: 'abc',
      now: new Date('2026-03-04T12:00:10Z'),
    });

    expect(verified.ok).toBe(false);
    if (!verified.ok) {
      expect(verified.reason).toBe('expired');
    }
  });
});
