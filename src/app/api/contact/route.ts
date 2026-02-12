import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, BUSINESS_CONTACT } from '@/utils/constants';

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

// Create transporter for sending emails
const getTransporter = () => {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service not configured');
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    ...(EMAIL_HOST === 'smtp.sendgrid.net' && {
      requireTLS: true,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    }),
  });
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      console.error('[Contact Form] Email service not configured');
      return NextResponse.json(
        { error: 'Contact form is temporarily unavailable. Please call us directly.' },
        { status: 503 }
      );
    }

    const transporter = getTransporter();

    // Send email to business
    await transporter.sendMail({
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.verifiedSender}>`,
      to: BUSINESS_CONTACT.ridesEmail,
      replyTo: email,
      subject: `Contact Form: Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">New Contact Form Submission</h2>

          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #2d3748; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p style="color: #718096; font-size: 12px; margin-top: 20px;">
            This message was sent from the contact form on fairfieldairportcar.com
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}

---
This message was sent from the contact form on fairfieldairportcar.com
      `,
    });

    // Send auto-reply to customer
    await transporter.sendMail({
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.verifiedSender}>`,
      to: email,
      subject: 'Thank you for contacting Fairfield Airport Cars',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Thank You for Reaching Out!</h2>

          <p>Dear ${name},</p>

          <p>We've received your message and will get back to you as soon as possible, typically within 24 hours.</p>

          <p>If you need immediate assistance with a booking, please don't hesitate to call us directly at <strong>${BUSINESS_CONTACT.phone}</strong>.</p>

          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Your Message:</h3>
            <p style="white-space: pre-wrap; color: #4a5568;">${message}</p>
          </div>

          <p>Best regards,<br>
          <strong>Fairfield Airport Cars</strong></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

          <p style="color: #718096; font-size: 12px;">
            Phone: ${BUSINESS_CONTACT.phone}<br>
            Email: ${BUSINESS_CONTACT.ridesEmail}<br>
            Website: fairfieldairportcar.com
          </p>
        </div>
      `,
      text: `
Thank You for Reaching Out!

Dear ${name},

We've received your message and will get back to you as soon as possible, typically within 24 hours.

If you need immediate assistance with a booking, please don't hesitate to call us directly at ${BUSINESS_CONTACT.phone}.

Your Message:
${message}

Best regards,
Fairfield Airport Cars

Phone: ${BUSINESS_CONTACT.phone}
Email: ${BUSINESS_CONTACT.ridesEmail}
Website: fairfieldairportcar.com
      `,
    });

    console.log(`[Contact Form] Message received from ${name} (${email})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact Form] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or call us directly.' },
      { status: 500 }
    );
  }
}
