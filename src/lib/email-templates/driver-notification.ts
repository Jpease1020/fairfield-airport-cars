interface DriverNotificationTemplateData {
  bookingId?: string;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  fare: number;
  tipAmount: number;
  totalFare: number;
  hasFlightInfo: boolean;
  airline?: string;
  flightNumber?: string;
  terminal?: string;
  arrivalTime?: string;
  bookedAt: string;
}

export function buildDriverNotificationEmailText({
  bookingId,
  pickupDate,
  pickupTime,
  pickupAddress,
  dropoffAddress,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  fare,
  tipAmount,
  totalFare,
  hasFlightInfo,
  airline,
  flightNumber,
  terminal,
  arrivalTime,
  bookedAt,
}: DriverNotificationTemplateData): string {
  return `
═══════════════════════════════════════════════════
          🚗 NEW BOOKING NOTIFICATION
═══════════════════════════════════════════════════

📅 PICKUP SCHEDULE
──────────────────────────────────────────────────
Date: ${pickupDate}
Pickup Time: ${pickupTime}

📍 ROUTE
──────────────────────────────────────────────────
PICKUP:  ${pickupAddress}
DROPOFF: ${dropoffAddress}

👤 CUSTOMER DETAILS
──────────────────────────────────────────────────
Name:  ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

${hasFlightInfo ? `✈️ FLIGHT INFO
──────────────────────────────────────────────────
Airline: ${airline || 'N/A'}
Flight#: ${flightNumber || 'N/A'}
Terminal: ${terminal || 'N/A'}
Flight Time (as provided): ${arrivalTime || 'N/A'}
` : ''}
${notes ? `📝 SPECIAL NOTES
──────────────────────────────────────────────────
${notes}
` : ''}
💰 PAYMENT
──────────────────────────────────────────────────
Fare: $${fare.toFixed(2)}
${tipAmount > 0 ? `Tip: $${tipAmount.toFixed(2)}` : ''}
TOTAL: $${totalFare.toFixed(2)}

═══════════════════════════════════════════════════
Booking ID: ${bookingId}
Booked at: ${bookedAt}
═══════════════════════════════════════════════════
`;
}

export function buildDriverNotificationEmailHtml({
  bookingId,
  pickupDate,
  pickupTime,
  pickupAddress,
  dropoffAddress,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  fare,
  tipAmount,
  totalFare,
  hasFlightInfo,
  airline,
  flightNumber,
  terminal,
  arrivalTime,
  bookedAt,
}: DriverNotificationTemplateData): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: var(--color-background-secondary);">
      <div style="background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚗 NEW BOOKING</h1>
        <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">${pickupDate} at ${pickupTime}</p>
      </div>

      <div style="background: white; padding: 20px; margin: 0; border-left: 4px solid var(--color-success);">
        <h2 style="color: var(--color-success); margin: 0 0 12px 0; font-size: 16px;">📍 ROUTE</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted); width: 80px;"><strong>PICKUP:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary); font-size: 15px;">${pickupAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted);"><strong>DROPOFF:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary); font-size: 15px;">${dropoffAddress}</td>
          </tr>
        </table>
      </div>

      <div style="background: var(--color-background-tertiary); padding: 20px; margin: 0; border-left: 4px solid var(--color-primary);">
        <h2 style="color: var(--color-primary-hover); margin: 0 0 12px 0; font-size: 16px;">👤 CUSTOMER</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted); width: 80px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary); font-size: 15px;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted);"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary); font-size: 15px;"><a href="tel:${customerPhone}" style="color: var(--color-primary); text-decoration: none;">${customerPhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted);"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary); font-size: 15px;"><a href="mailto:${customerEmail}" style="color: var(--color-primary); text-decoration: none;">${customerEmail}</a></td>
          </tr>
        </table>
      </div>

      ${hasFlightInfo ? `
      <div style="background: white; padding: 20px; margin: 0; border-left: 4px solid var(--color-warning);">
        <h2 style="color: var(--color-warning); margin: 0 0 12px 0; font-size: 16px;">✈️ FLIGHT INFO</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted); width: 80px;"><strong>Airline:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary);">${airline || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted);"><strong>Flight #:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary); font-weight: bold;">${flightNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted);"><strong>Terminal:</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary);">${terminal || 'N/A'}</td>
          </tr>
          ${arrivalTime ? `
          <tr>
            <td style="padding: 8px 0; color: var(--color-text-muted);"><strong>Flight Time (as provided):</strong></td>
            <td style="padding: 8px 0; color: var(--color-text-primary);">${arrivalTime}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      ` : ''}

      ${notes ? `
      <div style="background: var(--color-background-secondary); padding: 20px; margin: 0; border-left: 4px solid var(--color-warning);">
        <h2 style="color: var(--color-warning); margin: 0 0 12px 0; font-size: 16px;">📝 SPECIAL NOTES</h2>
        <p style="margin: 0; color: var(--color-text-secondary); font-size: 15px; white-space: pre-wrap;">${notes}</p>
      </div>
      ` : ''}

      <div style="background: var(--color-background-secondary); padding: 20px; margin: 0; border-left: 4px solid var(--color-success);">
        <h2 style="color: var(--color-success); margin: 0 0 12px 0; font-size: 16px;">💰 PAYMENT</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: var(--color-text-muted);">Fare:</td>
            <td style="padding: 4px 0; color: var(--color-text-primary); text-align: right;">$${fare.toFixed(2)}</td>
          </tr>
          ${tipAmount > 0 ? `
          <tr>
            <td style="padding: 4px 0; color: var(--color-text-muted);">Tip:</td>
            <td style="padding: 4px 0; color: var(--color-text-primary); text-align: right;">$${tipAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 2px solid var(--color-success);">
            <td style="padding: 12px 0 4px 0; color: var(--color-success); font-weight: bold; font-size: 18px;">TOTAL:</td>
            <td style="padding: 12px 0 4px 0; color: var(--color-success); font-weight: bold; font-size: 18px; text-align: right;">$${totalFare.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: var(--color-background-tertiary); color: var(--color-text-muted); padding: 16px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
        <p style="margin: 0;">Booking ID: <strong style="color: var(--color-text-primary);">${bookingId}</strong></p>
        <p style="margin: 8px 0 0 0;">Booked at ${bookedAt}</p>
      </div>
    </div>
  `;
}
