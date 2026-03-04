import type { Booking } from '@/types/booking';

interface BookingVerificationTemplateData {
  booking: Booking;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  confirmationUrl: string;
  pickupDateTime: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
}

export function buildBookingVerificationEmailText({
  booking,
  customerName,
  pickupAddress,
  dropoffAddress,
  confirmationUrl,
  pickupDateTime,
  businessName,
  businessPhone,
}: BookingVerificationTemplateData): string {
  return `Hi ${customerName},

One more step to secure your ride from ${pickupAddress} to ${dropoffAddress}.

Please confirm your booking by opening the link below:
${confirmationUrl}

Once you confirm, we'll finalize your driver assignment and send you the full itinerary.

Booking summary:
- Booking ID: ${booking.id}
- Date & Time: ${pickupDateTime}
- Pickup: ${pickupAddress}
- Dropoff: ${dropoffAddress}

Need help? Text or call us at ${businessPhone}.

Thank you,
${businessName} Team`;
}

export function buildBookingVerificationEmailHtml({
  booking,
  customerName,
  pickupAddress,
  dropoffAddress,
  confirmationUrl,
  pickupDateTime,
  businessName,
  businessPhone,
  businessEmail,
}: BookingVerificationTemplateData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: var(--color-primary-600);">Hi ${customerName},</h2>
      <p>One more step to secure your ride from <strong>${pickupAddress}</strong> to <strong>${dropoffAddress}</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${confirmationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Confirm My Booking
        </a>
      </p>
      <p>Once you confirm, we’ll finalize your driver assignment and send you the full itinerary.</p>

      <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 Booking Summary</h3>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Date & Time:</strong> ${pickupDateTime}</p>
        <p><strong>Pickup:</strong> ${pickupAddress}</p>
        <p><strong>Dropoff:</strong> ${dropoffAddress}</p>
      </div>

      <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a16207; margin-top: 0;">💬 Need help?</h3>
        <p>Text or call us at ${businessPhone} or email ${businessEmail}.</p>
      </div>

      <p>Thank you for choosing <strong>${businessName}</strong>!</p>
    </div>
  `;
}
