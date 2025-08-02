import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing bookingId or status' },
        { status: 400 }
      );
    }

    // Get booking details
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data();
    const customerPhone = bookingData.customerPhone;
    const customerEmail = bookingData.customerEmail;
    const customerName = bookingData.customerName;

    // Generate notification message based on status
    const message = generateStatusMessage(status, customerName);

    // Send SMS notification
    if (customerPhone) {
      await sendSMSNotification(customerPhone, message);
    }

    // Send email notification
    if (customerEmail) {
      await sendEmailNotification(customerEmail, message, status);
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully',
      bookingId,
      status
    });

  } catch (error) {
    console.error('Error sending status notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

function generateStatusMessage(status: string, customerName: string): string {
  const name = customerName || 'there';
  
  switch (status) {
    case 'confirmed':
      return `Hi ${name}! Your Fairfield Airport Cars booking has been confirmed. We'll assign your driver shortly.`;
    case 'driver-assigned':
      return `Hi ${name}! Your driver Gregg has been assigned and is preparing for pickup.`;
    case 'en-route':
      return `Hi ${name}! Gregg is on his way to your location. You can track your ride in real-time.`;
    case 'arrived':
      return `Hi ${name}! Gregg has arrived at your pickup location. Please look for a silver Toyota Camry.`;
    case 'completed':
      return `Hi ${name}! Your ride has been completed. Thank you for choosing Fairfield Airport Cars!`;
    default:
      return `Hi ${name}! Your booking status has been updated.`;
  }
}

async function sendSMSNotification(phone: string, message: string): Promise<void> {
  try {
    // In production, integrate with Twilio or similar SMS service
    // For now, we'll log the message
    console.log(`SMS to ${phone}: ${message}`);
    
    // Example Twilio integration (uncomment when ready):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    */
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
}

async function sendEmailNotification(email: string, message: string, status: string): Promise<void> {
  try {
    // In production, integrate with SendGrid or similar email service
    // For now, we'll log the email
    console.log(`Email to ${email}: ${message}`);
    
    // Example SendGrid integration (uncomment when ready):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: 'notifications@fairfieldairportcars.com',
      subject: `Booking Update - ${status.replace('-', ' ')}`,
      text: message,
      html: generateEmailHTML(message, status)
    };
    
    await sgMail.send(msg);
    */
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

function generateEmailHTML(status: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: var(--color-primary-600); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Fairfield Airport Cars</h1>
      </div>
      <div style="background-color: white; padding: 20px; border: 1px solid var(--color-border); border-radius: 0 0 8px 8px;">
        <h2 style="color: var(--color-text-primary); margin-bottom: 16px;">Booking Status Update</h2>
        <p style="color: var(--color-text-secondary); line-height: 1.6;">
          Your booking status has been updated to: <strong>${status}</strong>
        </p>
        <p style="color: var(--color-text-secondary); line-height: 1.6;">
          Thank you for choosing Fairfield Airport Cars for your transportation needs.
        </p>
      </div>
    </div>
  `;
} 