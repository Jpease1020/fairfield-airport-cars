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
- Pickup Time: ${pickupDateTime}
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
    <div style="margin:0; padding:32px 16px; background-color:#f3f5f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; color:#172033;">
      <div style="max-width:640px; margin:0 auto; background-color:#ffffff; border:1px solid #d7dee7; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(23,32,51,0.06);">
        <div style="padding:20px 28px; background:linear-gradient(135deg,#0f2e57 0%,#17457f 100%); color:#ffffff;">
          <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.82; margin-bottom:10px;">Action required</div>
          <div style="font-size:30px; line-height:1.2; font-weight:700; margin:0;">Confirm your booking</div>
          <div style="font-size:14px; opacity:0.88; margin-top:10px;">Booking ID: ${booking.id}</div>
        </div>

        <div style="padding:32px 28px 12px 28px;">
          <div style="font-size:18px; font-weight:700; margin-bottom:18px;">Hi ${customerName},</div>
          <div style="font-size:17px; line-height:1.65; color:#25324a; margin-bottom:24px;">
            One more step to secure your ride from <strong>${pickupAddress}</strong> to <strong>${dropoffAddress}</strong>.
          </div>

          <div style="padding:22px; border-radius:16px; background-color:#f6f8fb; border:1px solid #d7dee7; text-align:center; margin-bottom:24px;">
            <div style="font-size:14px; color:#4c5a71; margin-bottom:16px;">Tap below to finalize your driver assignment and itinerary.</div>
            <a href="${confirmationUrl}" style="display:inline-block; background-color:#0f2e57; color:#ffffff; text-decoration:none; font-weight:700; font-size:17px; line-height:1; padding:16px 28px; border-radius:999px; box-shadow:0 6px 18px rgba(15,46,87,0.22);">
              Confirm My Booking
            </a>
            <div style="font-size:12px; line-height:1.6; color:#6a768b; margin-top:16px;">
              If the button does not open, copy and paste this link into your browser:<br />
              <a href="${confirmationUrl}" style="color:#17457f; text-decoration:underline; word-break:break-all;">${confirmationUrl}</a>
            </div>
          </div>

          <div style="border:1px solid #d7dee7; border-radius:16px; overflow:hidden; margin-bottom:24px;">
            <div style="padding:16px 20px; background-color:#f8fafc; border-bottom:1px solid #d7dee7; font-size:20px; font-weight:700; color:#172033;">
              Booking Summary
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
                  <td style="padding:0; font-size:14px; color:#6a768b; vertical-align:top;">Dropoff</td>
                  <td style="padding:0 0 0 16px; font-size:16px; color:#172033; text-align:right;">${dropoffAddress}</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="padding:18px 20px; border-radius:16px; background-color:#fff8ea; border:1px solid #f3d8a4; color:#5a430f; margin-bottom:24px;">
            <div style="font-size:16px; font-weight:700; margin-bottom:6px;">Need help?</div>
            <div style="font-size:15px; line-height:1.6;">
              Text or call <a href="tel:${businessPhone.replace(/[^+\d]/g, '')}" style="color:#5a430f; font-weight:700; text-decoration:underline;">${businessPhone}</a>
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
