/**
 * Regression test: TrackingPageClient must not enter an infinite fetch loop.
 *
 * Bug (fixed): the booking-load useEffect depended on `cmsData` (recreated as a new
 * `{}` on every render via `allCmsData?.tracking || {}`) and on `trackingActive`
 * (set inside the effect). Both caused the effect to re-fire on every render, firing
 * an unbounded stream of `/api/booking/:id` fetches and pinning the page on the
 * "Loading enhanced tracking information..." state.
 *
 * This test renders the component with CMS data that has NO `tracking` key — the
 * exact condition that triggered the `|| {}` instability — and asserts the booking
 * endpoint is hit exactly once and the page escapes the loading state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

// CMS data WITHOUT a `tracking` key — forces the component down the fallback path
// that previously minted a new object every render. Module-level constant so the
// reference is stable across renders (mirrors a real, stable provider value).
const CMS_DATA_NO_TRACKING = { someOtherPage: { title: 'x' } };

vi.mock('@/design/providers/CMSDataProvider', () => ({
  useCMSData: () => ({ cmsData: CMS_DATA_NO_TRACKING }),
}));

// The map and ETA widgets pull in Google Maps; stub them — they are irrelevant to
// the fetch-loop behavior under test.
vi.mock('@/components/business/TrackingMap', () => ({
  TrackingMap: () => <div data-testid="tracking-map" />,
}));
vi.mock('@/components/business/TrafficETA', () => ({
  TrafficETA: () => <div data-testid="traffic-eta" />,
}));
vi.mock('@/components/business/AddToCalendarButton', () => ({
  AddToCalendarButton: () => <div data-testid="add-to-calendar" />,
}));

// Stub the tracking service so initialization resolves without loading Google Maps.
// Spies are created via vi.hoisted so they exist when the hoisted vi.mock factory runs.
const { initializeTracking, stopTracking } = vi.hoisted(() => ({
  initializeTracking: vi.fn().mockResolvedValue(undefined),
  stopTracking: vi.fn(),
}));
vi.mock('@/lib/services/firebase-tracking-service', () => ({
  firebaseTrackingService: {
    initializeTracking,
    stopTracking,
    onLocationUpdate: vi.fn(),
    onETAUpdate: vi.fn(),
    calculateAdvancedETA: vi.fn().mockResolvedValue(undefined),
  },
}));

import TrackingPageClient from '@/app/(public)/tracking/[bookingId]/TrackingPageClient';

const BOOKING_ID = 'A3NUUQ';

describe('TrackingPageClient — no infinite fetch loop', () => {
  let bookingFetchCount = 0;

  beforeEach(() => {
    bookingFetchCount = 0;
    initializeTracking.mockClear();
    server.use(
      http.get('/api/booking/:bookingId', ({ params }) => {
        bookingFetchCount += 1;
        return HttpResponse.json({
          id: params.bookingId,
          status: 'pending',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station, Fairfield, CT',
          dropoffLocation: 'JFK Airport, Queens, NY',
          pickupDateTime: '2026-07-01T10:00:00.000Z',
          fare: 95.5,
        });
      }),
    );
  });

  it('fetches the booking exactly once and escapes the loading state', async () => {
    render(<TrackingPageClient bookingId={BOOKING_ID} />);

    // Page must leave the "Loading enhanced tracking information..." state and render
    // the booking details (booking id is shown in the details panel).
    await waitFor(
      () => {
        expect(screen.getByText(BOOKING_ID)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    // Give any runaway effect a chance to fire again before asserting the count.
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(bookingFetchCount).toBe(1);
    expect(initializeTracking).toHaveBeenCalledTimes(1);
  });
});
