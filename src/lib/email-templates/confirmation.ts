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
  const totalAmount = ((booking.fare || 0) + (booking.tipAmount || 0)).toFixed(2);
  const cleanPhone = businessPhone.replace(/[^+\d]/g, '');

  return `
    <div style="margin:0; padding:32px 16px; background-color:#f3f5f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; color:#172033;">
      <div style="max-width:640px; margin:0 auto; background-color:#ffffff; border:1px solid #d7dee7; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(23,32,51,0.06);">
        <div style="padding:20px 28px; background:linear-gradient(135deg,#0f2e57 0%,#17457f 100%); color:#ffffff;">
          <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.82; margin-bottom:10px;">Ride confirmed</div>
          <div style="font-size:30px; line-height:1.2; font-weight:700; margin:0;">Your booking is set</div>
          <div style="font-size:14px; opacity:0.88; margin-top:10px;">Booking ID: ${booking.id}</div>
        </div>

        <div style="padding:32px 28px 12px 28px;">
          <div style="font-size:18px; font-weight:700; margin-bottom:18px;">Hi ${customerName},</div>
          <div style="font-size:17px; line-height:1.65; color:#25324a; margin-bottom:24px;">
            Your ride has been confirmed. Here is your final itinerary and your live tracking link.
          </div>

          <div style="border:1px solid #d7dee7; border-radius:16px; overflow:hidden; margin-bottom:24px;">
            <div style="padding:16px 20px; background-color:#f8fafc; border-bottom:1px solid #d7dee7; font-size:20px; font-weight:700; color:#172033;">
              Booking Details
            </div>
            <div style="padding:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b;">Pickup Time</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; font-weight:600; text-align:right;">${pickupDateTime}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b; vertical-align:top;">Pickup</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; text-align:right;">${pickupAddress}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b; vertical-align:top;">Dropoff</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; text-align:right;">${dropoffAddress}</td>
                </tr>
                ${booking.flightInfo?.airline ? `
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b;">Airline</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; text-align:right;">${booking.flightInfo.airline}</td>
                </tr>` : ''}
                ${booking.flightInfo?.flightNumber ? `
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b;">Flight Number</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; text-align:right;">${booking.flightInfo.flightNumber}</td>
                </tr>` : ''}
                ${booking.flightInfo?.terminal ? `
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b;">Terminal</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; text-align:right;">${booking.flightInfo.terminal}</td>
                </tr>` : ''}
                ${booking.flightInfo?.arrivalTime ? `
                <tr>
                  <td style="padding:0 0 12px 0; font-size:14px; color:#6a768b;">Flight Time</td>
                  <td style="padding:0 0 12px 16px; font-size:16px; color:#172033; text-align:right;">${booking.flightInfo.arrivalTime}</td>
                </tr>` : ''}
                ${booking.notes ? `
                <tr>
                  <td style="padding:0; font-size:14px; color:#6a768b; vertical-align:top;">Notes</td>
                  <td style="padding:0 0 0 16px; font-size:16px; color:#172033; text-align:right;">${booking.notes}</td>
                </tr>` : ''}
              </table>
            </div>
          </div>

          <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            <div style="flex:1 1 220px; padding:20px; border-radius:16px; background-color:#f6f8fb; border:1px solid #d7dee7;">
              <div style="font-size:18px; font-weight:700; color:#172033; margin-bottom:12px;">Fare Summary</div>
              ${booking.tipAmount && booking.tipAmount > 0 ? `<div style="font-size:15px; color:#4c5a71; margin-bottom:8px;">Tip: $${booking.tipAmount.toFixed(2)}</div>` : ''}
              <div style="font-size:26px; font-weight:800; color:#0f2e57;">$${totalAmount}</div>
              <div style="font-size:13px; color:#6a768b; margin-top:8px;">Includes the confirmed trip total.</div>
            </div>

            <div style="flex:1 1 220px; padding:20px; border-radius:16px; background-color:#eef6ff; border:1px solid #c8dcf5; text-align:center;">
              <div style="font-size:18px; font-weight:700; color:#172033; margin-bottom:10px;">Track Your Ride</div>
              <div style="font-size:15px; line-height:1.6; color:#4c5a71; margin-bottom:16px;">Open live tracking when your driver is on the way.</div>
              <a href="${trackingUrl}" style="display:inline-block; background-color:#0f2e57; color:#ffffff; text-decoration:none; font-weight:700; font-size:16px; line-height:1; padding:14px 24px; border-radius:999px; box-shadow:0 6px 18px rgba(15,46,87,0.18);">
                View Live Tracking
              </a>
            </div>
          </div>

          <div style="padding:18px 20px; border-radius:16px; background-color:#fff8ea; border:1px solid #f3d8a4; color:#5a430f; margin-bottom:24px;">
            <div style="font-size:16px; font-weight:700; margin-bottom:6px;">Need help?</div>
            <div style="font-size:15px; line-height:1.6;">
              Text or call <a href="tel:${cleanPhone}" style="color:#5a430f; font-weight:700; text-decoration:underline;">${businessPhone}</a>
              <br />
              Email <a href="mailto:${businessEmail}" style="color:#5a430f; font-weight:700; text-decoration:underline;">${businessEmail}</a>
            </div>
          </div>

          <div style="font-size:15px; line-height:1.7; color:#4c5a71; padding-bottom:28px;">
            Thank you for choosing <strong style="color:#172033;">${businessName}</strong>.
          </div>
        </div>
      </div>
    </div>
  `;
}
