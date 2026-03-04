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

📅 DATE & TIME
──────────────────────────────────────────────────
Date: ${pickupDate}
Time: ${pickupTime}

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
Arrival: ${arrivalTime || 'N/A'}
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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚗 NEW BOOKING</h1>
        <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">${pickupDate} at ${pickupTime}</p>
      </div>

      <div style="background: white; padding: 20px; margin: 0; border-left: 4px solid #10b981;">
        <h2 style="color: #059669; margin: 0 0 12px 0; font-size: 16px;">📍 ROUTE</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>PICKUP:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px;">${pickupAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>DROPOFF:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px;">${dropoffAddress}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f1f5f9; padding: 20px; margin: 0; border-left: 4px solid #3b82f6;">
        <h2 style="color: #1d4ed8; margin: 0 0 12px 0; font-size: 16px;">👤 CUSTOMER</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px;"><a href="tel:${customerPhone}" style="color: #2563eb; text-decoration: none;">${customerPhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px;"><a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a></td>
          </tr>
        </table>
      </div>

      ${hasFlightInfo ? `
      <div style="background: white; padding: 20px; margin: 0; border-left: 4px solid #f59e0b;">
        <h2 style="color: #d97706; margin: 0 0 12px 0; font-size: 16px;">✈️ FLIGHT INFO</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>Airline:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${airline || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Flight #:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">${flightNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Terminal:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${terminal || 'N/A'}</td>
          </tr>
          ${arrivalTime ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Arrival:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${arrivalTime}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      ` : ''}

      ${notes ? `
      <div style="background: #fef3c7; padding: 20px; margin: 0; border-left: 4px solid #f59e0b;">
        <h2 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">📝 SPECIAL NOTES</h2>
        <p style="margin: 0; color: #78350f; font-size: 15px; white-space: pre-wrap;">${notes}</p>
      </div>
      ` : ''}

      <div style="background: #ecfdf5; padding: 20px; margin: 0; border-left: 4px solid #10b981;">
        <h2 style="color: #059669; margin: 0 0 12px 0; font-size: 16px;">💰 PAYMENT</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Fare:</td>
            <td style="padding: 4px 0; color: #111827; text-align: right;">$${fare.toFixed(2)}</td>
          </tr>
          ${tipAmount > 0 ? `
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Tip:</td>
            <td style="padding: 4px 0; color: #111827; text-align: right;">$${tipAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 2px solid #10b981;">
            <td style="padding: 12px 0 4px 0; color: #059669; font-weight: bold; font-size: 18px;">TOTAL:</td>
            <td style="padding: 12px 0 4px 0; color: #059669; font-weight: bold; font-size: 18px; text-align: right;">$${totalFare.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #1e293b; color: #94a3b8; padding: 16px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
        <p style="margin: 0;">Booking ID: <strong style="color: #e2e8f0;">${bookingId}</strong></p>
        <p style="margin: 8px 0 0 0;">Booked at ${bookedAt}</p>
      </div>
    </div>
  `;
}
