import nodemailer from 'nodemailer';
import { createEvent } from 'ics';
import { Booking } from '@/types/booking';
import { cmsFlattenedService } from './cms-service';
import { EMAIL_CONFIG } from '@/utils/constants';
import {
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
  getCustomerNotes,
  getPickupAddress,
  getDropoffAddress,
  getPickupDateTime,
  getFare,
  getTipAmount,
  getFlightInfo,
  parseBookingDate,
} from '@/utils/booking-helpers';
import {
  formatBusinessDate,
  formatBusinessDateTime,
  formatBusinessTime,
  getBusinessDateTimeParts,
} from '@/lib/utils/booking-date-time';

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

// Use verified sender from constants (must match SendGrid verified sender)
const VERIFIED_EMAIL_FROM = EMAIL_CONFIG.verifiedSender;

console.log('🔧 Email service environment check:');
  console.log(`   EMAIL_HOST: ${EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_PORT: ${EMAIL_PORT ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_USER: ${EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_PASS: ${EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`   VERIFIED_FROM: ${VERIFIED_EMAIL_FROM}`);

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
  console.warn('Email environment variables are not fully configured. Confirmation emails will not be sent.');
}

// Create transporter lazily - only when email credentials are available
const getTransporter = () => {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service not configured. Missing required environment variables.');
  }
  
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465, // true for 465, false for others
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // Add connection timeout and retry logic
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // For Gmail specifically, add these options
    ...(EMAIL_HOST === 'smtp.gmail.com' && {
      service: 'gmail',
      tls: {
        rejectUnauthorized: false, // Gmail sometimes has cert issues
      },
    }),
    // For SendGrid specifically, ensure TLS is enabled
    ...(EMAIL_HOST === 'smtp.sendgrid.net' && {
      requireTLS: true,
      tls: {
        // Use modern TLS settings for SendGrid
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    }),
  });
};

export async function sendConfirmationEmail(booking: Booking) {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('❌ [EMAIL SERVICE] Cannot send confirmation email - credentials not configured');
    return;
  }
  
  const transporter = getTransporter();

  const businessSettings = await cmsFlattenedService.getBusinessSettings();

  // Use centralized date parsing from booking-helpers
  const pickupDate = parseBookingDate(getPickupDateTime(booking)) || new Date();

  // Use centralized helpers for booking data access
  const pickupAddress = getPickupAddress(booking) || 'Pickup location not specified';
  const dropoffAddress = getDropoffAddress(booking) || 'Dropoff location not specified';
  const customerName = getCustomerName(booking) || 'Valued Customer';

  const pickupDateTimeParts = getBusinessDateTimeParts(pickupDate);
  const event = {
    start: pickupDateTimeParts
      ? [
          pickupDateTimeParts.year,
          pickupDateTimeParts.month,
          pickupDateTimeParts.day,
          pickupDateTimeParts.hour,
          pickupDateTimeParts.minute,
        ]
      : [
          pickupDate.getUTCFullYear(),
          pickupDate.getUTCMonth() + 1,
          pickupDate.getUTCDate(),
          pickupDate.getUTCHours(),
          pickupDate.getUTCMinutes(),
        ],
    duration: { hours: 2, minutes: 0 }, // rough default
    title: 'Airport Car Service',
    description: `Ride from ${pickupAddress} to ${dropoffAddress}`,
    location: pickupAddress,
    organizer: { name: businessSettings?.company?.name || 'Fairfield Airport Cars', email: VERIFIED_EMAIL_FROM },
  };

  // Check if user has already added calendar event
  // If they have, don't include the .ics attachment in the email
  const calendarAddedByUser = (booking as any).calendarAddedByUser === true;
  
  let icsValue = '';
  if (!calendarAddedByUser) {
    // Only generate .ics file if user hasn't already added it
    const { value } = await new Promise<{ value: string }>((resolve) => {
      createEvent(event, (error: Error | null, value: string) => {
        if (error || !value) resolve({ value: '' });
        else resolve({ value });
      });
    });
    icsValue = value;
  }

  // Create tracking URL and base URL for PWA install link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  const trackingUrl = (booking as any)?.trackingToken
    ? `${baseUrl}/tracking/${booking.id}?token=${(booking as any).trackingToken}`
    : `${baseUrl}/tracking/${booking.id}`;

  // Enhanced email content
  const emailText = `Hi ${customerName},

Your ride has been confirmed! Here are your booking details:

📋 BOOKING DETAILS
==================
Booking ID: ${booking.id}
Date & Time: ${formatBusinessDateTime(pickupDate)}
Pickup Location: ${pickupAddress}
Drop-off Location: ${dropoffAddress}
${booking.flightInfo?.airline ? `Airline: ${booking.flightInfo.airline}` : ''}
${booking.flightInfo?.flightNumber ? `Flight Number: ${booking.flightInfo.flightNumber}` : ''}
${booking.flightInfo?.terminal ? `Terminal: ${booking.flightInfo.terminal}` : ''}
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
Text or call: ${businessSettings?.company?.phone || '(646) 221-6370'}
Email: ${businessSettings?.company?.email || 'rides@fairfieldairportcar.com'}

Thank you for choosing ${businessSettings?.company?.name || 'Fairfield Airport Cars'}!

Best regards,
The ${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team`;

  // Get customer email using centralized helper
  const customerEmail = getCustomerEmail(booking);

  const mailOptions = {
    from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${VERIFIED_EMAIL_FROM}>`,
    to: customerEmail,
    bcc: EMAIL_CONFIG.bccRecipients,
    subject: `Your Ride Confirmation - ${booking.id}`,
    text: emailText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: var(--color-primary-600);">Hi ${customerName},</h2>
        
        <p>Your ride has been confirmed! Here are your booking details:</p>
        
        <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 BOOKING DETAILS</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Date & Time:</strong> ${formatBusinessDateTime(pickupDate)}</p>
          <p><strong>Pickup Location:</strong> ${pickupAddress}</p>
          <p><strong>Drop-off Location:</strong> ${dropoffAddress}</p>
          ${booking.flightInfo?.airline ? `<p><strong>Airline:</strong> ${booking.flightInfo.airline}</p>` : ''}
          ${booking.flightInfo?.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.flightInfo.flightNumber}</p>` : ''}
          ${booking.flightInfo?.terminal ? `<p><strong>Terminal:</strong> ${booking.flightInfo.terminal}</p>` : ''}
          ${booking.notes ? `<p><strong>Special Instructions:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">💰 FARE INFORMATION</h3>
          ${booking.tipAmount && booking.tipAmount > 0 ? `<p><strong>Tip:</strong> $${booking.tipAmount?.toFixed(2)}</p>` : ''}
          <p><strong>Total Amount:</strong> $${((booking.fare || 0) + (booking.tipAmount || 0)).toFixed(2)}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #1d4ed8; margin-top: 0;">🔗 TRACK YOUR RIDE</h3>
          <p>Track your driver in real-time:</p>
          <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Live Tracking</a>
        </div>
        
        <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #a16207; margin-top: 0;">💬 CONTACT INFORMATION</h3>
        <p>If you have any questions or need to make changes, please contact us:</p>
        <p><strong>Text or call:</strong> ${businessSettings?.company?.phone || '(646) 221-6370'}</p>
          <p><strong>Email:</strong> ${businessSettings?.company?.email || 'rides@fairfieldairportcar.com'}</p>
        </div>
        
        <p>Thank you for choosing <strong>${businessSettings?.company?.name || 'Fairfield Airport Cars'}</strong>!</p>
        
        <p>Best regards,<br>
        The ${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team</p>
      </div>
    `,
    attachments: icsValue ? [
      {
        filename: 'ride.ics',
        content: icsValue,
        contentType: 'text/calendar',
      },
    ] : [],
  };

  await transporter.sendMail(mailOptions);
} 

export async function sendTestEmail(to: string, subject = 'Test Email', text = 'This is a test email from Fairfield Airport Cars.') {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    return false;
  }
  const transporter = getTransporter();
  const mailOptions = {
    from: VERIFIED_EMAIL_FROM,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
  return true;
}

export async function sendBookingVerificationEmail(booking: Booking, confirmationUrl: string) {
  // Use centralized helpers for booking data access
  const customerName = getCustomerName(booking) || 'Valued Customer';
  const customerEmail = getCustomerEmail(booking);
  const pickupAddress = getPickupAddress(booking) || 'Pickup location not specified';
  const dropoffAddress = getDropoffAddress(booking) || 'Dropoff location not specified';

  console.log('📧 [EMAIL SERVICE] Attempting to send booking verification email...');
  console.log(`   To: ${customerEmail}`);
  console.log(`   Booking ID: ${booking.id}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'unknown'}`);
  
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ [EMAIL SERVICE] Email credentials not configured');
    console.error(`   EMAIL_HOST: ${EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
    console.error(`   EMAIL_PORT: ${EMAIL_PORT ? '✅ Set' : '❌ Missing'}`);
    console.error(`   EMAIL_USER: ${EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
    console.error(`   EMAIL_PASS: ${EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
    console.error('   ⚠️ Email will not be sent. Check Vercel environment variables.');
    throw new Error('Email service not configured. Missing required environment variables.');
  }

  // Get transporter (will throw if not configured)
  const transporter = getTransporter();
  
  const businessSettings = await cmsFlattenedService.getBusinessSettings();

  // Use centralized date parsing from booking-helpers
  const pickupDate = parseBookingDate(getPickupDateTime(booking)) || new Date();
  console.log('📅 [EMAIL SERVICE] Parsed pickupDateTime:', pickupDate.toISOString());

  if (!customerEmail) {
    console.error('❌ [EMAIL SERVICE] Cannot send verification email - customer email is missing');
    throw new Error('Customer email is required to send verification email');
  }

  const emailText = `Hi ${customerName},

One more step to secure your ride from ${pickupAddress} to ${dropoffAddress}.

Please confirm your booking by opening the link below:
${confirmationUrl}

Once you confirm, we'll finalize your driver assignment and send you the full itinerary.

Booking summary:
- Booking ID: ${booking.id}
- Date & Time: ${formatBusinessDateTime(pickupDate)}
- Pickup: ${pickupAddress}
- Dropoff: ${dropoffAddress}

Need help? Text or call us at ${businessSettings?.company?.phone || '(646) 221-6370'}.

Thank you,
${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team`;

  const html = `
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
        <p><strong>Date & Time:</strong> ${formatBusinessDateTime(pickupDate)}</p>
        <p><strong>Pickup:</strong> ${pickupAddress}</p>
        <p><strong>Dropoff:</strong> ${dropoffAddress}</p>
      </div>

      <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a16207; margin-top: 0;">💬 Need help?</h3>
        <p>Text or call us at ${businessSettings?.company?.phone || '(646) 221-6370'} or email ${businessSettings?.company?.email || 'rides@fairfieldairportcar.com'}.</p>
      </div>

      <p>Thank you for choosing <strong>${businessSettings?.company?.name || 'Fairfield Airport Cars'}</strong>!</p>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${VERIFIED_EMAIL_FROM}>`,
      to: customerEmail,
      bcc: EMAIL_CONFIG.bccRecipients,
      subject: `Action Required: Confirm your booking (${booking.id})`,
      text: emailText,
      html
    });
    
    console.log('✅ [EMAIL SERVICE] Booking verification email sent successfully');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${customerEmail}`);
    console.log(`   Response: ${result.response}`);
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Failed to send booking verification email');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   To: ${customerEmail}`);
    console.error(`   Booking ID: ${booking.id}`);
    throw error; // Re-throw so caller knows email failed
  }
}

/**
 * Send a driver notification email to Gregg with all booking details
 * This is a separate email from the customer confirmation, formatted for driver use
 */
export async function sendDriverNotificationEmail(booking: Booking) {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('❌ [EMAIL SERVICE] Cannot send driver notification email - credentials not configured');
    return;
  }

  const transporter = getTransporter();
  const businessSettings = await cmsFlattenedService.getBusinessSettings();

  // Use centralized date parsing from booking-helpers
  const pickupDate = parseBookingDate(getPickupDateTime(booking)) || new Date();

  // Use centralized helpers for booking data access
  const pickupAddress = getPickupAddress(booking) || 'Not specified';
  const dropoffAddress = getDropoffAddress(booking) || 'Not specified';
  const customerName = getCustomerName(booking) || 'Not provided';
  const customerEmail = getCustomerEmail(booking) || 'Not provided';
  const customerPhone = getCustomerPhone(booking) || 'Not provided';
  const notes = getCustomerNotes(booking);
  const fare = getFare(booking);
  const tipAmount = getTipAmount(booking);
  const totalFare = fare + tipAmount;

  // Flight info
  const flightInfo = getFlightInfo(booking);
  const hasFlightInfo = flightInfo.hasFlight;

  // Driver email (Gregg)
  const driverEmail = EMAIL_CONFIG.verifiedSender; // rides@fairfieldairportcar.com

  const emailSubject = `🚗 NEW RIDE: ${formatBusinessDate(pickupDate)} at ${formatBusinessTime(pickupDate)}`;

  const emailText = `
═══════════════════════════════════════════════════
          🚗 NEW BOOKING NOTIFICATION
═══════════════════════════════════════════════════

📅 DATE & TIME
──────────────────────────────────────────────────
Date: ${formatBusinessDate(pickupDate)}
Time: ${formatBusinessTime(pickupDate)}

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
Airline: ${flightInfo?.airline || 'N/A'}
Flight#: ${flightInfo?.flightNumber || 'N/A'}
Terminal: ${flightInfo?.terminal || 'N/A'}
Arrival: ${flightInfo?.arrivalTime || 'N/A'}
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
Booking ID: ${booking.id}
Booked at: ${formatBusinessDateTime(new Date())}
═══════════════════════════════════════════════════
`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚗 NEW BOOKING</h1>
        <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">${formatBusinessDate(pickupDate)} at ${formatBusinessTime(pickupDate)}</p>
      </div>

      <!-- Route Section -->
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

      <!-- Customer Section -->
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
      <!-- Flight Info Section -->
      <div style="background: white; padding: 20px; margin: 0; border-left: 4px solid #f59e0b;">
        <h2 style="color: #d97706; margin: 0 0 12px 0; font-size: 16px;">✈️ FLIGHT INFO</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>Airline:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${flightInfo?.airline || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Flight #:</strong></td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">${flightInfo?.flightNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Terminal:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${flightInfo?.terminal || 'N/A'}</td>
          </tr>
          ${flightInfo?.arrivalTime ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Arrival:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${flightInfo.arrivalTime}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      ` : ''}

      ${notes ? `
      <!-- Notes Section -->
      <div style="background: #fef3c7; padding: 20px; margin: 0; border-left: 4px solid #f59e0b;">
        <h2 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">📝 SPECIAL NOTES</h2>
        <p style="margin: 0; color: #78350f; font-size: 15px; white-space: pre-wrap;">${notes}</p>
      </div>
      ` : ''}

      <!-- Payment Section -->
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

      <!-- Footer -->
      <div style="background: #1e293b; color: #94a3b8; padding: 16px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
        <p style="margin: 0;">Booking ID: <strong style="color: #e2e8f0;">${booking.id}</strong></p>
        <p style="margin: 8px 0 0 0;">Booked at ${formatBusinessDateTime(new Date())}</p>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${VERIFIED_EMAIL_FROM}>`,
      to: driverEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    console.log('✅ [EMAIL SERVICE] Driver notification email sent successfully');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${driverEmail}`);
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Failed to send driver notification email');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    // Don't throw - driver notification is non-critical
  }
}

export async function sendEnhancedTestEmail(to: string, bookingId: string) {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.log('⚠️ Email service not configured, logging test email instead');
    console.log('📧 TEST EMAIL (not actually sent):');
    console.log(`   To: ${to}`);
    console.log(`   Subject: Your Ride Confirmation - ${bookingId}`);
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   Pickup: Fairfield Station, Fairfield, CT`);
    console.log(`   Dropoff: JFK Airport, Queens, NY`);
    console.log(`   Fare: $150.00`);
    console.log(`   Tracking URL: http://localhost:3000/tracking/${bookingId}`);
    return false;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/tracking/${bookingId}`;
  
  const emailText = `Hi E2E Test User,

Your ride has been confirmed! Here are your booking details:

📋 BOOKING DETAILS
==================
Booking ID: ${bookingId}
Date & Time: ${formatBusinessDateTime(new Date())}
Pickup Location: Fairfield Station, Fairfield, CT
Drop-off Location: JFK Airport, Queens, NY
Special Instructions: E2E Test Booking - Extra luggage

💰 FARE INFORMATION
===================
Base Fare: $150.00
Total Amount: $150.00

🔗 TRACK YOUR RIDE
==================
Track your driver in real-time: ${trackingUrl}

💬 CONTACT INFORMATION
======================
If you have any questions or need to make changes, please contact us:
Text: (646) 221-6370
Email: rides@fairfieldairportcar.com

Thank you for choosing Fairfield Airport Cars!

Best regards,
The Fairfield Airport Cars Team`;

  const mailOptions = {
    from: `Fairfield Airport Cars <${VERIFIED_EMAIL_FROM}>`,
    to,
    subject: `Your Ride Confirmation - ${bookingId}`,
    text: emailText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: var(--color-primary-600);">Hi E2E Test User,</h2>
        
        <p>Your ride has been confirmed! Here are your booking details:</p>
        
        <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 BOOKING DETAILS</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Date & Time:</strong> ${formatBusinessDateTime(new Date())}</p>
          <p><strong>Pickup Location:</strong> Fairfield Station, Fairfield, CT</p>
          <p><strong>Drop-off Location:</strong> JFK Airport, Queens, NY</p>
          <p><strong>Special Instructions:</strong> E2E Test Booking - Extra luggage</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">💰 FARE INFORMATION</h3>
          <p><strong>Base Fare:</strong> $150.00</p>
          <p><strong>Total Amount:</strong> $150.00</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #1d4ed8; margin-top: 0;">🔗 TRACK YOUR RIDE</h3>
          <p>Track your driver in real-time:</p>
          <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Live Tracking</a>
        </div>
        
        <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #a16207; margin-top: 0;">💬 CONTACT INFORMATION</h3>
          <p>If you have any questions or need to make changes, please contact us:</p>
          <p><strong>Text:</strong> (646) 221-6370</p>
          <p><strong>Email:</strong> rides@fairfieldairportcar.com</p>
        </div>
        
        <p>Thank you for choosing <strong>Fairfield Airport Cars</strong>!</p>
        
        <p>Best regards,<br>
        The Fairfield Airport Cars Team</p>
      </div>
    `,
  };
  
  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`📧 Enhanced test email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send enhanced test email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function sendMagicLinkEmail(email: string, magicLinkUrl: string) {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ [EMAIL SERVICE] Email credentials not configured for magic link');
    throw new Error('Email service not configured.');
  }

  const transporter = getTransporter();
  const businessSettings = await cmsFlattenedService.getBusinessSettings();
  const companyName = businessSettings?.company?.name || 'Fairfield Airport Cars';
  const supportEmail = businessSettings?.company?.email || 'rides@fairfieldairportcar.com';

  const subject = `Your booking access link`;
  const text = `Use this secure link to access your bookings:\n${magicLinkUrl}\n\nThis link expires in 15 minutes. If you did not request it, you can ignore this email.\n\nNeed help? Reply to this email or contact ${supportEmail}.\n\n${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Access your bookings</h2>
      <p>Click the button below to securely access your bookings. This link expires in 15 minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${magicLinkUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View My Bookings
        </a>
      </p>
      <p>If you did not request this link, you can ignore this email.</p>
      <p>Need help? Contact us at ${supportEmail}.</p>
      <p>${companyName}</p>
    </div>
  `;

  const mailOptions = {
    from: VERIFIED_EMAIL_FROM,
    to: email,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
}
