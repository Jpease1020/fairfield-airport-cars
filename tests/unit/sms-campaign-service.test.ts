import { describe, expect, it } from 'vitest';
import { buildSmsCampaignPreflight } from '@/lib/services/sms-campaign-service';

describe('sms-campaign-service', () => {
  it('includes only smsOptIn recipients and deduplicates by phone', () => {
    const now = new Date('2026-03-03T12:00:00.000Z');
    const bookings = [
      {
        customer: { name: 'Opted In New', phone: '(203) 555-1234', smsOptIn: true },
        createdAt: now.toISOString(),
      },
      {
        customer: { name: 'Opted Out Old', phone: '+12035551234', smsOptIn: false },
        createdAt: '2026-01-01T12:00:00.000Z',
      },
      {
        customer: { name: 'No Consent', phone: '+12035550000', smsOptIn: false },
        createdAt: now.toISOString(),
      },
    ];

    const result = buildSmsCampaignPreflight(bookings);

    expect(result.uniqueContacts).toBe(2);
    expect(result.optedInContacts).toBe(1);
    expect(result.excludedOptedOut).toBe(1);
    expect(result.recipients).toHaveLength(1);
    expect(result.recipients[0]?.phone).toBe('+12035551234');
    expect(result.recipients[0]?.name).toBe('Opted In New');
  });

  it('counts invalid and missing phones in preflight', () => {
    const bookings = [
      { customer: { name: 'Missing Phone', phone: '', smsOptIn: true }, createdAt: '2026-03-03T12:00:00.000Z' },
      { customer: { name: 'Bad Phone', phone: 'abc123', smsOptIn: true }, createdAt: '2026-03-03T12:00:00.000Z' },
      { customer: { name: 'Good Phone', phone: '2035559999', smsOptIn: true }, createdAt: '2026-03-03T12:00:00.000Z' },
    ];

    const result = buildSmsCampaignPreflight(bookings);

    expect(result.excludedNoPhone).toBe(1);
    expect(result.invalidPhoneContacts).toBe(1);
    expect(result.optedInContacts).toBe(1);
    expect(result.recipients[0]?.phone).toBe('+12035559999');
  });

  it('applies activeWithinDays filter', () => {
    const recent = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const old = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const bookings = [
      { customer: { name: 'Recent', phone: '+12035551111', smsOptIn: true }, createdAt: recent },
      { customer: { name: 'Old', phone: '+12035552222', smsOptIn: true }, createdAt: old },
    ];

    const result = buildSmsCampaignPreflight(bookings, { activeWithinDays: 30 });
    expect(result.optedInContacts).toBe(1);
    expect(result.recipients[0]?.name).toBe('Recent');
  });
});
