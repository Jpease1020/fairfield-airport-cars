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

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: Number(EMAIL_PORT) === 465, // true for 465, false for others
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendConfirmationEmail(booking: Booking) {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) return;

      const businessSettings = await cmsFlattenedService.getBusinessSettings();

  // Generate iCalendar event
  const event = {
    start: [
      booking.pickupDateTime.getFullYear(),
      booking.pickupDateTime.getMonth() + 1,
      booking.pickupDateTime.getDate(),
      booking.pickupDateTime.getHours(),
      booking.pickupDateTime.getMinutes(),
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
  const emailText = `Hi ${booking.name},

Your ride has been confirmed! Here are your booking details:

📋 BOOKING DETAILS
==================
Booking ID: ${booking.id}
Date & Time: ${booking.pickupDateTime.toLocaleString()}
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

📞 CONTACT INFORMATION
======================
If you have any questions or need to make changes, please contact us:
Phone: ${businessSettings?.company?.phone || '(203) 555-0123'}
Email: ${businessSettings?.company?.email || 'info@fairfieldairportcars.com'}

Thank you for choosing ${businessSettings?.company?.name || 'Fairfield Airport Cars'}!

Best regards,
The ${businessSettings?.company?.name || 'Fairfield Airport Cars'} Team`;

  const mailOptions = {
    from: `${businessSettings?.company?.name || 'Fairfield Airport Cars'} <${VERIFIED_EMAIL_FROM}>`,
    to: booking.email,
    subject: `Your Ride Confirmation - ${booking.id}`,
    text: emailText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: var(--color-primary-600);">Hi ${booking.name},</h2>
        
        <p>Your ride has been confirmed! Here are your booking details:</p>
        
        <div style="background-color: var(--color-gray-50); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: var(--color-primary-700); margin-top: 0;">📋 BOOKING DETAILS</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Date & Time:</strong> ${booking.pickupDateTime.toLocaleString()}</p>
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
          <h3 style="color: #a16207; margin-top: 0;">📞 CONTACT INFORMATION</h3>
          <p>If you have any questions or need to make changes, please contact us:</p>
          <p><strong>Phone:</strong> ${businessSettings?.company?.phone || '(203) 555-0123'}</p>
          <p><strong>Email:</strong> ${businessSettings?.company?.email || 'info@fairfieldairportcars.com'}</p>
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
  const mailOptions = {
    from: VERIFIED_EMAIL_FROM,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
  return true;
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

📞 CONTACT INFORMATION
======================
If you have any questions or need to make changes, please contact us:
Phone: (203) 555-0123
Email: info@fairfieldairportcars.com

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
          <h3 style="color: #a16207; margin-top: 0;">📞 CONTACT INFORMATION</h3>
          <p>If you have any questions or need to make changes, please contact us:</p>
          <p><strong>Phone:</strong> (203) 555-0123</p>
          <p><strong>Email:</strong> info@fairfieldairportcars.com</p>
        </div>
        
        <p>Thank you for choosing <strong>Fairfield Airport Cars</strong>!</p>
        
        <p>Best regards,<br>
        The Fairfield Airport Cars Team</p>
      </div>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Enhanced test email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send enhanced test email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}