/**
 * Driver Notification Email Unit Tests
 *
 * Tests the driver notification email service that sends booking details to Gregg.
 * This is HIGH VALUE because if the driver email fails, Gregg won't get notified about new bookings.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions before mocking modules
const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id', response: '250 OK' });
const mockCreateTransport = vi.fn(() => ({
  sendMail: mockSendMail,
}));

// Mock nodemailer BEFORE importing the module
vi.mock('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport,
  },
}));

// Mock CMS service
vi.mock('@/lib/services/cms-service', () => ({
  cmsFlattenedService: {
    getBusinessSettings: vi.fn().mockResolvedValue({
      company: {
        name: 'Fairfield Airport Cars',
        phone: '(646) 221-6370',
        email: 'rides@fairfieldairportcar.com',
      },
    }),
  },
}));

// Mock ics for calendar event creation
vi.mock('ics', () => ({
  createEvent: vi.fn((event, callback) => {
    callback(null, 'mock-ics-content');
  }),
}));

describe('Driver Notification Email Service', () => {
  // Store original env values
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id', response: '250 OK' });

    // Set up environment variables directly on process.env
    process.env.EMAIL_HOST = 'smtp.sendgrid.net';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'apikey';
    process.env.EMAIL_PASS = 'test-api-key';
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  const createMockBooking = (overrides: Record<string, unknown> = {}) => ({
    id: 'booking-123',
    trip: {
      pickup: { address: '123 Main St, Fairfield, CT', coordinates: { lat: 41.14, lng: -73.26 } },
      dropoff: { address: 'JFK Airport, Queens, NY', coordinates: { lat: 40.64, lng: -73.77 } },
      pickupDateTime: new Date('2024-03-15T10:00:00Z'),
      fareType: 'personal' as const,
      flightInfo: {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
      fare: 150,
    },
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(203) 555-1234',
      notes: '',
      saveInfoForFuture: false,
    },
    fare: 150,
    ...overrides,
  });

  it('should send driver notification email with correct booking details', async () => {
    // Re-import to get fresh module with env vars
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    const booking = createMockBooking();

    await sendDriverNotificationEmail(booking as any);

    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const emailCall = mockSendMail.mock.calls[0][0];

    // Check email recipient (driver email)
    expect(emailCall.to).toBe('rides@fairfieldairportcar.com');

    // Check subject includes date and time
    expect(emailCall.subject).toContain('🚗 NEW RIDE:');

    // Check text body includes booking details
    expect(emailCall.text).toContain('123 Main St, Fairfield, CT');
    expect(emailCall.text).toContain('JFK Airport, Queens, NY');
    expect(emailCall.text).toContain('John Doe');
    expect(emailCall.text).toContain('(203) 555-1234');
    expect(emailCall.text).toContain('$150.00');
    expect(emailCall.text).toContain('booking-123');

    // Check HTML body exists
    expect(emailCall.html).toBeDefined();
    expect(emailCall.html).toContain('John Doe');
  });

  it('should include flight info when provided', async () => {
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    const booking = createMockBooking({
      trip: {
        pickup: { address: 'JFK Airport, Queens, NY', coordinates: { lat: 40.64, lng: -73.77 } },
        dropoff: { address: '123 Main St, Fairfield, CT', coordinates: { lat: 41.14, lng: -73.26 } },
        pickupDateTime: new Date('2024-03-15T14:30:00Z'),
        fareType: 'personal' as const,
        flightInfo: {
          hasFlight: true,
          airline: 'Delta',
          flightNumber: 'DL1234',
          arrivalTime: '2:00 PM',
          terminal: 'Terminal 4',
        },
        fare: 150,
      },
      flightInfo: {
        airline: 'Delta',
        flightNumber: 'DL1234',
        arrivalTime: '2:00 PM',
        terminal: 'Terminal 4',
      },
    });

    await sendDriverNotificationEmail(booking as any);

    const emailCall = mockSendMail.mock.calls[0][0];

    // Check flight info is included
    expect(emailCall.text).toContain('FLIGHT INFO');
    expect(emailCall.text).toContain('Delta');
    expect(emailCall.text).toContain('DL1234');
    expect(emailCall.text).toContain('Terminal 4');
  });

  it('should include special notes when provided', async () => {
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    const booking = createMockBooking({
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(203) 555-1234',
        notes: 'Extra luggage, 2 large suitcases',
        saveInfoForFuture: false,
      },
    });

    await sendDriverNotificationEmail(booking as any);

    const emailCall = mockSendMail.mock.calls[0][0];

    // Check notes are included
    expect(emailCall.text).toContain('SPECIAL NOTES');
    expect(emailCall.text).toContain('Extra luggage, 2 large suitcases');
  });

  it('should include tip amount when provided', async () => {
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    const booking = createMockBooking({
      fare: 150,
      tipAmount: 25,
    });

    await sendDriverNotificationEmail(booking as any);

    const emailCall = mockSendMail.mock.calls[0][0];

    // Check tip is included
    expect(emailCall.text).toContain('$150.00');
    expect(emailCall.text).toContain('$25.00');
    expect(emailCall.text).toContain('$175.00'); // Total
  });

  it('should handle missing email credentials gracefully', async () => {
    // Clear env vars to simulate missing credentials
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    vi.resetModules();
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const booking = createMockBooking();

    // Should not throw
    await expect(sendDriverNotificationEmail(booking as any)).resolves.not.toThrow();

    // Should not attempt to send email
    expect(mockSendMail).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle email sending errors gracefully without throwing', async () => {
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const booking = createMockBooking();

    // Should not throw - driver notification is non-critical
    await expect(sendDriverNotificationEmail(booking as any)).resolves.not.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send driver notification email')
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle various date formats for pickupDateTime', async () => {
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    // Test with ISO string
    const bookingWithString = createMockBooking({
      trip: {
        pickup: { address: '123 Main St', coordinates: null },
        dropoff: { address: 'JFK Airport', coordinates: null },
        pickupDateTime: '2024-03-15T10:00:00Z',
        fareType: 'personal' as const,
        flightInfo: { hasFlight: false, airline: '', flightNumber: '', arrivalTime: '', terminal: '' },
        fare: 150,
      },
    });

    await sendDriverNotificationEmail(bookingWithString as any);

    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const emailCall = mockSendMail.mock.calls[0][0];
    expect(emailCall.subject).toContain('🚗 NEW RIDE:');
  });

  it('should use fallback values for missing booking data', async () => {
    const { sendDriverNotificationEmail } = await import('@/lib/services/email-service');

    // Minimal booking with missing optional fields - ensures driver email never breaks
    const minimalBooking = {
      id: 'booking-456',
      trip: {
        pickup: { address: '', coordinates: null },
        dropoff: { address: '', coordinates: null },
        pickupDateTime: new Date(),
        fareType: 'personal' as const,
        flightInfo: { hasFlight: false, airline: '', flightNumber: '', arrivalTime: '', terminal: '' },
      },
      customer: {
        name: '',
        email: '',
        phone: '',
        notes: '',
        saveInfoForFuture: false,
      },
    };

    await sendDriverNotificationEmail(minimalBooking as any);

    const emailCall = mockSendMail.mock.calls[0][0];

    // Service uses "Not specified" / "Not provided" for missing data - email must still send
    expect(emailCall.text).toContain('Not specified');
    expect(emailCall.text).toContain('Not provided');
    expect(emailCall.subject).toMatch(/NEW (RIDE|BOOKING)/i);
  });
});
