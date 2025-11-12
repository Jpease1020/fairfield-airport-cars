import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBookingAvailability } from '@/hooks/useBookingAvailability';

describe('useBookingAvailability', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('surfaces a clear fallback message when the calendar cannot be reached', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useBookingAvailability());

    await act(async () => {
      await result.current.checkAvailability('2025-12-01', '10:00', '12:00');
    });

    expect(result.current.error).toContain('We can’t reach our scheduling calendar right now');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});



