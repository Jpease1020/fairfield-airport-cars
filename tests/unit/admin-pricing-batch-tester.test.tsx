import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPricingPageClient from '@/app/(admin)/admin/pricing/AdminPricingPageClient';

const mockAuthFetch = vi.fn();

vi.mock('@/lib/utils/auth-fetch', () => ({
  authFetch: (...args: any[]) => mockAuthFetch(...args),
}));

vi.mock('@/design/components/base-components/forms/LocationInput', () => ({
  __esModule: true,
  LocationInput: ({ value, onChange, placeholder }: any) => (
    <input data-testid="location-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('@/utils/formatting', () => ({
  formatDateTimeNoSeconds: (v: string) => v,
}));

function jsonResponse(body: any, ok = true, status = 200) {
  return Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
}

const SAVED_PRICING = {
  baseFare: 15,
  perMile: 1.8,
  perMinute: 0.2,
  airportReturnMultiplier: 1.15,
  personalDiscountPercent: 10,
  minimumFare: 100,
  updatedAt: undefined,
  version: 1,
};

function makeTestQuoteResult(overrides: Partial<any> = {}) {
  return {
    fare: 66,
    distanceMiles: 28.2,
    durationMinutes: 33,
    durationTrafficMinutes: 33,
    breakdown: {
      baseFare: 15,
      mileageCharge: 50.76,
      timeCharge: 6.6,
      subtotalBeforeModifiers: 73,
      personalDiscount: 7.24,
      returnMultiplier: null,
      preMultiplierFare: null,
      minimumFare: 100,
      minimumFareApplied: false,
    },
    isAirportPickup: false,
    isAirportDropoff: true,
    fareType: 'personal',
    ...overrides,
  };
}

describe('AdminPricingPageClient — batch route tester', () => {
  beforeEach(() => {
    mockAuthFetch.mockReset();
    mockAuthFetch.mockImplementation((input: string) => {
      if (typeof input === 'string' && input.includes('/api/admin/pricing/test-quote')) {
        return jsonResponse(makeTestQuoteResult());
      }
      return jsonResponse(SAVED_PRICING);
    });
  });

  it('runs all 24 common routes (4 pickups x 6 airports) and renders a result row for each', async () => {
    render(<AdminPricingPageClient />);

    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => {
      const testQuoteCalls = mockAuthFetch.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('/api/admin/pricing/test-quote')
      );
      expect(testQuoteCalls).toHaveLength(24);
    });

    // Every pickup/airport pair should appear in the rendered table.
    await waitFor(() => {
      expect(screen.getAllByText('Fairfield (train station)').length).toBeGreaterThan(0);
      expect(screen.getAllByText('JFK').length).toBeGreaterThan(0);
      expect(screen.getAllByText('HPN').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Trumbull (town center)').length).toBeGreaterThan(0);
    });

    // Fares from the (mocked) results should render.
    await waitFor(() => {
      expect(screen.getAllByText('$66').length).toBe(24);
    });
  });

  it('sends the currently-edited (possibly unsaved) rates as pricingOverrides for every route, not the last-saved config', async () => {
    render(<AdminPricingPageClient />);
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());

    // baseFare loads as 15 (SAVED_PRICING) — locate its input by that displayed value.
    const baseFareInput = screen.getByDisplayValue('15') as HTMLInputElement;
    fireEvent.change(baseFareInput, { target: { value: '25' } });

    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => {
      const testQuoteCalls = mockAuthFetch.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('/api/admin/pricing/test-quote')
      );
      expect(testQuoteCalls.length).toBe(24);
    });

    const firstCallBody = JSON.parse(mockAuthFetch.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('/api/admin/pricing/test-quote')
    )![1].body);
    expect(firstCallBody.pricingOverrides.baseFare).toBe(25);
  });

  it('shows a per-row error without failing the rest of the batch when one route fails', async () => {
    let callCount = 0;
    mockAuthFetch.mockImplementation((input: string) => {
      if (typeof input === 'string' && input.includes('/api/admin/pricing/test-quote')) {
        callCount++;
        if (callCount === 1) {
          return jsonResponse({ error: 'Unable to calculate route' }, false, 400);
        }
        return jsonResponse(makeTestQuoteResult());
      }
      return jsonResponse(SAVED_PRICING);
    });

    render(<AdminPricingPageClient />);
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => {
      expect(screen.getByText('Unable to calculate route')).toBeInTheDocument();
    });
    // The other 23 routes still complete successfully.
    await waitFor(() => {
      expect(screen.getAllByText('$66').length).toBe(23);
    });
  });
});
