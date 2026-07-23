import { describe, expect, it } from 'vitest';
import { buildContactDirectory, buildSmsCampaignPreflight } from '@/lib/services/sms-campaign-service';

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

  it('does not let an older opted-in booking resurrect consent after a newer booking opts out (regression)', () => {
    // Newest-created booking processed first (matches production query order: createdAt desc).
    const bookingsNewestFirst = [
      { customer: { name: 'Jane', phone: '+12035551234', smsOptIn: false }, createdAt: '2026-03-03T12:00:00.000Z' },
      { customer: { name: 'Jane', phone: '+12035551234', smsOptIn: true }, createdAt: '2026-01-01T12:00:00.000Z' },
    ];
    expect(buildSmsCampaignPreflight(bookingsNewestFirst).optedInContacts).toBe(0);
    expect(buildContactDirectory(bookingsNewestFirst).contacts[0]).toMatchObject({ optedIn: false });

    // Same data, opposite array order — result must not depend on processing order.
    const bookingsOldestFirst = [...bookingsNewestFirst].reverse();
    expect(buildSmsCampaignPreflight(bookingsOldestFirst).optedInContacts).toBe(0);
    expect(buildContactDirectory(bookingsOldestFirst).contacts[0]).toMatchObject({ optedIn: false });
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

describe('buildContactDirectory', () => {
  it('includes every deduplicated contact regardless of opt-in status', () => {
    const bookings = [
      { customer: { name: 'Opted In', phone: '(203) 555-1234', smsOptIn: true }, createdAt: '2026-03-03T12:00:00.000Z' },
      { customer: { name: 'Not Opted In', phone: '+12035550000', smsOptIn: false }, createdAt: '2026-03-02T12:00:00.000Z' },
    ];

    const { contacts, scannedBookings } = buildContactDirectory(bookings);

    expect(scannedBookings).toBe(2);
    expect(contacts).toHaveLength(2);
    expect(contacts.find((c) => c.phone === '+12035551234')).toMatchObject({ name: 'Opted In', optedIn: true });
    expect(contacts.find((c) => c.phone === '+12035550000')).toMatchObject({ name: 'Not Opted In', optedIn: false });
  });

  it('excludes contacts with missing or invalid phone numbers, and sorts by most recent booking', () => {
    const bookings = [
      { customer: { name: 'No Phone', phone: '', smsOptIn: true }, createdAt: '2026-03-03T12:00:00.000Z' },
      { customer: { name: 'Bad Phone', phone: 'abc', smsOptIn: true }, createdAt: '2026-03-03T12:00:00.000Z' },
      { customer: { name: 'Older', phone: '+12035551111', smsOptIn: false }, createdAt: '2026-01-01T12:00:00.000Z' },
      { customer: { name: 'Newer', phone: '+12035552222', smsOptIn: false }, createdAt: '2026-03-03T12:00:00.000Z' },
    ];

    const { contacts } = buildContactDirectory(bookings);

    expect(contacts).toHaveLength(2);
    expect(contacts[0].name).toBe('Newer');
    expect(contacts[1].name).toBe('Older');
  });
});
