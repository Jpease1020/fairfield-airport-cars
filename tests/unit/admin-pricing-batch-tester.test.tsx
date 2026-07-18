import React from 'react';
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

// 4 pickups x 6 airports (outbound) + 6 airports x 1 home base (return) = 30.
const TOTAL_BATCH_ROUTES = 30;

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

function getTestQuoteCalls() {
  return mockAuthFetch.mock.calls.filter(
    (call) => typeof call[0] === 'string' && call[0].includes('/api/admin/pricing/test-quote')
  );
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

  it('runs every outbound (pickup x airport) route plus a return leg per airport, rendering a result row for each', async () => {
    render(<AdminPricingPageClient />);

    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => {
      expect(getTestQuoteCalls()).toHaveLength(TOTAL_BATCH_ROUTES);
    });

    // Every pickup/airport label should appear (as origin for outbound rows, or as origin for the
    // return row in the airport's case / destination for the home base in the return row's case).
    await waitFor(() => {
      expect(screen.getAllByText('Fairfield, CT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('JFK').length).toBeGreaterThan(0);
      expect(screen.getAllByText('HPN').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Trumbull, CT').length).toBeGreaterThan(0);
    });

    // Fares from the (mocked) results should render for every route.
    await waitFor(() => {
      expect(screen.getAllByText('$66').length).toBe(TOTAL_BATCH_ROUTES);
    });
  });

  it('sends a route with the airport as the origin for the return legs, so the return-multiplier path is actually exercised', async () => {
    render(<AdminPricingPageClient />);
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => expect(getTestQuoteCalls()).toHaveLength(TOTAL_BATCH_ROUTES));

    const bodies = getTestQuoteCalls().map((call) => JSON.parse(call[1].body));
    const returnLegs = bodies.filter((b) => b.origin === 'John F. Kennedy International Airport, Queens, NY');
    // Exactly one JFK->home return leg; JFK never appears as a destination-side origin otherwise.
    expect(returnLegs).toHaveLength(1);
    expect(returnLegs[0].destination).toBe('Fairfield, CT');
  });

  it('sends the currently-edited (possibly unsaved) rates as pricingOverrides for every route, not the last-saved config', async () => {
    render(<AdminPricingPageClient />);
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());

    // baseFare loads as 15 (SAVED_PRICING) — locate its input by that displayed value.
    const baseFareInput = screen.getByDisplayValue('15') as HTMLInputElement;
    fireEvent.change(baseFareInput, { target: { value: '25' } });

    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => {
      expect(getTestQuoteCalls().length).toBe(TOTAL_BATCH_ROUTES);
    });

    const firstCallBody = JSON.parse(getTestQuoteCalls()[0][1].body);
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
    // The other routes still complete successfully.
    await waitFor(() => {
      expect(screen.getAllByText('$66').length).toBe(TOTAL_BATCH_ROUTES - 1);
    });
  });

  it('ignores a second click while a run is already in progress (regression: no re-entrancy guard let a double-click fire two overlapping runs, doubling in-flight requests and defeating the concurrency cap)', async () => {
    let resolveFirst: (() => void) | null = null;
    mockAuthFetch.mockImplementation((input: string) => {
      if (typeof input === 'string' && input.includes('/api/admin/pricing/test-quote')) {
        return new Promise((resolve) => {
          if (!resolveFirst) resolveFirst = () => resolve(jsonResponse(makeTestQuoteResult()) as any);
        });
      }
      return jsonResponse(SAVED_PRICING);
    });

    render(<AdminPricingPageClient />);
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());

    const button = screen.getByText('Run all routes');
    fireEvent.click(button);
    fireEvent.click(button); // second click while the first run's requests are still pending
    fireEvent.click(button); // and a third, for good measure

    await waitFor(() => {
      // Concurrency cap is 6 — a re-entrant second/third run would push this well past 6.
      expect(getTestQuoteCalls().length).toBe(6);
    });
  });

  it('still completes a batch run under React.StrictMode (regression: StrictMode double-invokes effects in dev — mount, cleanup, remount — and the mounted-ref guard was not reset on the second setup, so it stayed permanently false and every row/patch silently no-op\'d after the first render cycle)', async () => {
    render(
      <React.StrictMode>
        <AdminPricingPageClient />
      </React.StrictMode>
    );
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => expect(getTestQuoteCalls()).toHaveLength(TOTAL_BATCH_ROUTES));
    await waitFor(() => expect(screen.getAllByText('$66').length).toBe(TOTAL_BATCH_ROUTES));
    await waitFor(() => expect(screen.getByText('Run all routes')).not.toBeDisabled());
  });

  it('re-enables the Run all routes button after all requests settle', async () => {
    render(<AdminPricingPageClient />);
    await waitFor(() => expect(screen.getByText('Run all routes')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Run all routes'));

    await waitFor(() => expect(getTestQuoteCalls()).toHaveLength(TOTAL_BATCH_ROUTES));
    await waitFor(() => expect(screen.getByText('Run all routes')).not.toBeDisabled());
  });
});
