import type { Booking } from '@/types/booking';

interface ConfirmationTemplateData {
  booking: Booking;
  customerName: string;
  pickupDateTime: string;
  pickupAddress: string;
  dropoffAddress: string;
  trackingUrl: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
}

export function buildConfirmationEmailText({
  booking,
  customerName,
  pickupDateTime,
  pickupAddress,
  dropoffAddress,
  trackingUrl,
  businessName,
  businessPhone,
  businessEmail,
}: ConfirmationTemplateData): string {
  return `Hi ${customerName},

Your ride has been confirmed! Here are your booking details:

📋 BOOKING DETAILS
==================
Booking ID: ${booking.id}
Pickup Time: ${pickupDateTime}
Pickup Location: ${pickupAddress}
Drop-off Location: ${dropoffAddress}
${booking.flightInfo?.airline ? `Airline: ${booking.flightInfo.airline}` : ''}
${booking.flightInfo?.flightNumber ? `Flight Number: ${booking.flightInfo.flightNumber}` : ''}
${booking.flightInfo?.terminal ? `Terminal: ${booking.flightInfo.terminal}` : ''}
${booking.flightInfo?.arrivalTime ? `Flight Time (as provided): ${booking.flightInfo.arrivalTime}` : ''}
${booking.notes ? `Special Instructions: ${booking.notes}` : ''}

💰 FARE INFORMATION
===================
${booking.tipAmount && booking.tipAmount > 0 ? `Tip: $${booking.tipAmount?.toFixed(2)}\n` : ''}Total Amount: $${((booking.fare || 0) + (booking.tipAmount || 0)).toFixed(2)}

🔗 TRACK YOUR RIDE
==================
Track your driver in real-time: ${trackingUrl}

💬 CONTACT INFORMATION
======================
If you have any questions or need to make changes, please contact us:
Text or call: ${businessPhone}
Email: ${businessEmail}

Thank you for choosing ${businessName}!

Best regards,
The ${businessName} Team`;
}

export function buildConfirmationEmailHtml({
  booking,
  customerName,
  pickupDateTime,
  pickupAddress,
  dropoffAddress,
  trackingUrl,
  businessName,
  businessPhone,
  businessEmail,
}: ConfirmationTemplateData): string {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: var(--color-primary-600);">Hi ${customerName},</h2>

        <p>Your ride has been confirmed! Here are your booking details:</p>

        <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 BOOKING DETAILS</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Pickup Time:</strong> ${pickupDateTime}</p>
          <p><strong>Pickup Location:</strong> ${pickupAddress}</p>
          <p><strong>Drop-off Location:</strong> ${dropoffAddress}</p>
          ${booking.flightInfo?.airline ? `<p><strong>Airline:</strong> ${booking.flightInfo.airline}</p>` : ''}
          ${booking.flightInfo?.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.flightInfo.flightNumber}</p>` : ''}
          ${booking.flightInfo?.terminal ? `<p><strong>Terminal:</strong> ${booking.flightInfo.terminal}</p>` : ''}
          ${booking.flightInfo?.arrivalTime ? `<p><strong>Flight Time (as provided):</strong> ${booking.flightInfo.arrivalTime}</p>` : ''}
          ${booking.notes ? `<p><strong>Special Instructions:</strong> ${booking.notes}</p>` : ''}
        </div>

        <div style="background-color: var(--color-background-secondary); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-success); margin-top: 0;">💰 FARE INFORMATION</h3>
          ${booking.tipAmount && booking.tipAmount > 0 ? `<p><strong>Tip:</strong> $${booking.tipAmount?.toFixed(2)}</p>` : ''}
          <p><strong>Total Amount:</strong> $${((booking.fare || 0) + (booking.tipAmount || 0)).toFixed(2)}</p>
        </div>

        <div style="background-color: var(--color-background-tertiary); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: var(--color-primary-hover); margin-top: 0;">🔗 TRACK YOUR RIDE</h3>
          <p>Track your driver in real-time:</p>
          <a href="${trackingUrl}" style="display: inline-block; background-color: var(--color-primary); color: var(--color-background-primary); padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Live Tracking</a>
        </div>

        <div style="background-color: var(--color-background-secondary); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-warning); margin-top: 0;">💬 CONTACT INFORMATION</h3>
        <p>If you have any questions or need to make changes, please contact us:</p>
        <p><strong>Text or call:</strong> ${businessPhone}</p>
          <p><strong>Email:</strong> ${businessEmail}</p>
        </div>

        <p>Thank you for choosing <strong>${businessName}</strong>!</p>

        <p>Best regards,<br>
        The ${businessName} Team</p>
      </div>
    `;
}
