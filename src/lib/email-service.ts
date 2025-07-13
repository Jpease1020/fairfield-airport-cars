import nodemailer from 'nodemailer';
import { createEvent } from 'ics';
import { Booking } from '@/types/booking';

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM = 'no-reply@fairfieldairportcars.com',
} = process.env;

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
    organizer: { name: 'Fairfield Airport Cars', email: EMAIL_FROM },
  } as const;

  const { value: icsValue } = await new Promise<{ value: string }>((resolve) => {
    createEvent(event, (error: Error | null, value: string) => {
      if (error || !value) resolve({ value: '' });
      else resolve({ value });
    });
  });

  const mailOptions = {
    from: `Fairfield Airport Cars <${EMAIL_FROM}>`,
    to: booking.email,
    subject: 'Your Ride Confirmation',
    text: `Hi ${booking.name},\n\nYour ride on ${booking.pickupDateTime.toLocaleString()} is confirmed.\nPickup: ${booking.pickupLocation}\nDrop-off: ${booking.dropoffLocation}\n\nThanks for choosing us!`,
    attachments: [
      {
        filename: 'ride.ics',
        content: icsValue,
        contentType: 'text/calendar',
      },
    ],
  } as const;

  await transporter.sendMail(mailOptions);
} 