import nodemailer from 'nodemailer';
import { createEvent } from 'ics';
import { Booking } from '@/types/booking';
import { cmsFlattenedService } from './cms-service';

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM = 'no-reply@fairfieldairportcars.com',
} = process.env;

// Override EMAIL_FROM to use the verified address
const VERIFIED_EMAIL_FROM = 'no-reply@fairfieldairportcar.com';

console.log('🔧 Email service environment check:');
  console.log(`   EMAIL_HOST: ${EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_PORT: ${EMAIL_PORT ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_USER: ${EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_PASS: ${EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`   EMAIL_FROM: ${EMAIL_FROM}`);

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
        ciphers: 'SSLv3',
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

  // Generate iCalendar event
  const pickupDate = new Date(booking.trip.pickupDateTime);
  const event = {
    start: [
      pickupDate.getFullYear(),
      pickupDate.getMonth() + 1,
      pickupDate.getDate(),
      pickupDate.getHours(),
      pickupDate.getMinutes(),
    ],
    duration: { hours: 2, minutes: 0 }, // rough default
    title: 'Airport Car Service',
    description: `Ride from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
    location: booking.pickupLocation,
    organizer: { name: businessSettings?.company?.name || 'Fairfield Airport Cars', email: EMAIL_FROM },
  };

  const { value: icsValue } = await new Promise<{ value: string }>((resolve) => {
    createEvent(event, (error: Error | null, value: string) => {
      if (error || !value) resolve({ value: '' });
      else resolve({ value });
    });
  });

  // Create tracking URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/tracking/${booking.id}`;

  // Enhanced email content
  const emailText = `Hi ${booking.customer.name},

Your ride has been confirmed! Here are your booking details:

📋 BOOKING DETAILS
==================
Booking ID: ${booking.id}
Date & Time: ${pickupDate.toLocaleString()}
Pickup Location: ${booking.pickupLocation}
Drop-off Location: ${booking.dropoffLocation}
${booking.flightInfo?.airline ? `Airline: ${booking.flightInfo.airline}` : ''}
${booking.flightInfo?.flightNumber ? `Flight Number: ${booking.flightInfo.flightNumber}` : ''}
${booking.flightInfo?.terminal ? `Terminal: ${booking.flightInfo.terminal}` : ''}
${booking.notes ? `Special Instructions: ${booking.notes}` : ''}

💰 FARE INFORMATION
===================
Base Fare: $${booking.fare?.toFixed(2) || '0.00'}
${booking.tipAmount && booking.tipAmount > 0 ? `Tip: $${booking.tipAmount?.toFixed(2)}` : ''}
Total Amount: $${((booking.fare || 0) + (booking.tipAmount || 0)).toFixed(2)}

🔗 TRACK YOUR RIDE
==================
Track your driver in real-time: ${trackingUrl}

💬 CONTACT INFORMATION
======================
If you have any questions or need to make changes, please contact us:
Text: ${businessSettings?.company?.phone || '(646) 221-6370'}
Email: ${businessSettings?.company?.email || 'rides@fairfieldairportcars.com'}

Thank you for choosing ${businessSettings?.company?.name || 'Fairfield Airport Cars'}!

Best regards,
The ${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team`;

  const mailOptions = {
    from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${VERIFIED_EMAIL_FROM}>`,
    to: booking.customer.email,
    bcc: ['rides@fairfieldairportcar.com', 'justinpease2@gmail.com'],
    subject: `Your Ride Confirmation - ${booking.id}`,
    text: emailText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: var(--color-primary-600);">Hi ${booking.customer.name},</h2>
        
        <p>Your ride has been confirmed! Here are your booking details:</p>
        
        <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 BOOKING DETAILS</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Date & Time:</strong> ${pickupDate.toLocaleString()}</p>
          <p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>
          <p><strong>Drop-off Location:</strong> ${booking.dropoffLocation}</p>
          ${booking.flightInfo?.airline ? `<p><strong>Airline:</strong> ${booking.flightInfo.airline}</p>` : ''}
          ${booking.flightInfo?.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.flightInfo.flightNumber}</p>` : ''}
          ${booking.flightInfo?.terminal ? `<p><strong>Terminal:</strong> ${booking.flightInfo.terminal}</p>` : ''}
          ${booking.notes ? `<p><strong>Special Instructions:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">💰 FARE INFORMATION</h3>
          <p><strong>Base Fare:</strong> $${booking.fare?.toFixed(2) || '0.00'}</p>
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
        <p><strong>Text:</strong> ${businessSettings?.company?.phone || '(646) 221-6370'}</p>
          <p><strong>Email:</strong> ${businessSettings?.company?.email || 'rides@fairfieldairportcars.com'}</p>
        </div>
        
        <p>Thank you for choosing <strong>${businessSettings?.company?.name || 'Fairfield Airport Cars'}</strong>!</p>
        
        <p>Best regards,<br>
        The ${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team</p>
      </div>
    `,
    attachments: [
      {
        filename: 'ride.ics',
        content: icsValue,
        contentType: 'text/calendar',
      },
    ],
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
  console.log('📧 [EMAIL SERVICE] Attempting to send booking verification email...');
  console.log(`   To: ${booking.customer.email}`);
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

  const pickupDate = new Date(booking.trip.pickupDateTime);

  const emailText = `Hi ${booking.customer.name},

One more step to secure your ride from ${booking.trip.pickup.address} to ${booking.trip.dropoff.address}.

Please confirm your booking by opening the link below:
${confirmationUrl}

Once you confirm, we’ll finalize your driver assignment and send you the full itinerary.

Booking summary:
- Booking ID: ${booking.id}
- Date & Time: ${pickupDate.toLocaleString()}
- Pickup: ${booking.trip.pickup.address}
- Dropoff: ${booking.trip.dropoff.address}

Need help? Text ${businessSettings?.company?.phone || '(646) 221-6370'}.

Thank you,
${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: var(--color-primary-600);">Hi ${booking.customer.name},</h2>
      <p>One more step to secure your ride from <strong>${booking.trip.pickup.address}</strong> to <strong>${booking.trip.dropoff.address}</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${confirmationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Confirm My Booking
        </a>
      </p>
      <p>Once you confirm, we’ll finalize your driver assignment and send you the full itinerary.</p>

      <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 Booking Summary</h3>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Date & Time:</strong> ${pickupDate.toLocaleString()}</p>
        <p><strong>Pickup:</strong> ${booking.trip.pickup.address}</p>
        <p><strong>Dropoff:</strong> ${booking.trip.dropoff.address}</p>
      </div>

      <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a16207; margin-top: 0;">💬 Need help?</h3>
        <p>Text us at ${businessSettings?.company?.phone || '(646) 221-6370'} or email ${businessSettings?.company?.email || 'rides@fairfieldairportcars.com'}.</p>
      </div>

      <p>Thank you for choosing <strong>${businessSettings?.company?.name || 'Fairfield Airport Cars'}</strong>!</p>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${VERIFIED_EMAIL_FROM}>`,
      to: booking.customer.email,
      bcc: ['rides@fairfieldairportcar.com', 'justinpease2@gmail.com'],
      subject: `Action Required: Confirm your booking (${booking.id})`,
      text: emailText,
      html
    });
    
    console.log('✅ [EMAIL SERVICE] Booking verification email sent successfully');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${booking.customer.email}`);
    console.log(`   Response: ${result.response}`);
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Failed to send booking verification email');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   To: ${booking.customer.email}`);
    console.error(`   Booking ID: ${booking.id}`);
    throw error; // Re-throw so caller knows email failed
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
Date & Time: ${new Date().toLocaleString()}
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
Email: rides@fairfieldairportcars.com

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
          <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
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
          <p><strong>Email:</strong> rides@fairfieldairportcars.com</p>
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