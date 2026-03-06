import { beforeEach, describe, expect, it, vi } from 'vitest';

const createEvent = vi.fn((_event, callback) => {
  callback(undefined, 'BEGIN:VCALENDAR\nEND:VCALENDAR');
});

vi.mock('ics', () => ({
  createEvent,
}));

describe('calendar attachment timezone handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('serializes booking pickup time to UTC for ICS attachments', async () => {
    const { buildCalendarAttachment } = await import('@/lib/services/email-service-utils');

    await buildCalendarAttachment(
      {
        id: 'HHQFAB',
        trip: {
          pickupDateTime: '2026-03-29T03:56:00.000Z',
        },
      } as any,
      '30 Shut Rd, Newtown, CT 06470, USA',
      'John F. Kennedy International Airport',
      'Fairfield Airport Car Service'
    );

    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        start: [2026, 3, 29, 3, 56],
        startInputType: 'utc',
        startOutputType: 'utc',
      }),
      expect.any(Function)
    );
  });
});
