import { Booking } from '@/types/booking';
import { EMAIL_CONFIG } from '@/utils/constants';
import { getBusinessConfig } from '@/lib/config/business-config';
import {
  getCustomerEmail,
  getCustomerName,
  getDropoffAddress,
  getPickupAddress,
} from '@/utils/booking-helpers';
import { formatBusinessDateTime } from '@/lib/utils/booking-date-time';
import { buildConfirmationEmailHtml, buildConfirmationEmailText } from '@/lib/email-templates/confirmation';
import {
  buildBookingVerificationEmailHtml,
  buildBookingVerificationEmailText,
} from '@/lib/email-templates/booking-verification';
import {
  buildDriverNotificationEmailHtml,
  buildDriverNotificationEmailText,
} from '@/lib/email-templates/driver-notification';
import { buildMagicLinkEmailHtml, buildMagicLinkEmailText } from '@/lib/email-templates/magic-link';
import {
  buildCalendarAttachment,
  buildDriverTemplateData,
  buildTrackingUrl,
  createEmailTransporter,
  getBookingPickupDate,
  isEmailConfigured,
  VERIFIED_EMAIL_FROM,
} from './email-service-utils';

export async function sendConfirmationEmail(booking: Booking) {
  if (!isEmailConfigured) {
    console.warn('❌ [EMAIL SERVICE] Cannot send confirmation email - credentials not configured');
    return;
  }

  const transporter = createEmailTransporter();
  const business = getBusinessConfig();
  const pickupDate = getBookingPickupDate(booking);
  const pickupAddress = getPickupAddress(booking) || 'Pickup location not specified';
  const dropoffAddress = getDropoffAddress(booking) || 'Dropoff location not specified';
  const customerName = getCustomerName(booking) || 'Valued Customer';
  const trackingUrl = buildTrackingUrl(booking);

  await transporter.sendMail({
    from: `${business.name} <${VERIFIED_EMAIL_FROM}>`,
    to: getCustomerEmail(booking),
    bcc: EMAIL_CONFIG.bccRecipients,
    subject: `Your Ride Confirmation - ${booking.id}`,
    text: buildConfirmationEmailText({
      booking,
      customerName,
      pickupDateTime: formatBusinessDateTime(pickupDate),
      pickupAddress,
      dropoffAddress,
      trackingUrl,
      businessName: business.name,
      businessPhone: business.phone,
      businessEmail: business.email,
    }),
    html: buildConfirmationEmailHtml({
      booking,
      customerName,
      pickupDateTime: formatBusinessDateTime(pickupDate),
      pickupAddress,
      dropoffAddress,
      trackingUrl,
      businessName: business.name,
      businessPhone: business.phone,
      businessEmail: business.email,
    }),
    attachments: await buildCalendarAttachment(booking, pickupAddress, dropoffAddress, business.name),
  });
}

export async function sendBookingVerificationEmail(booking: Booking, confirmationUrl: string) {
  if (!isEmailConfigured) {
    throw new Error('Email service not configured. Missing required environment variables.');
  }

  const customerEmail = getCustomerEmail(booking);
  if (!customerEmail) {
    throw new Error('Customer email is required to send verification email');
  }

  const transporter = createEmailTransporter();
  const business = getBusinessConfig();
  const pickupDate = getBookingPickupDate(booking);
  const customerName = getCustomerName(booking) || 'Valued Customer';
  const pickupAddress = getPickupAddress(booking) || 'Pickup location not specified';
  const dropoffAddress = getDropoffAddress(booking) || 'Dropoff location not specified';

  await transporter.sendMail({
    from: `${business.name} <${VERIFIED_EMAIL_FROM}>`,
    to: customerEmail,
    bcc: EMAIL_CONFIG.bccRecipients,
    subject: `Action Required: Confirm your booking (${booking.id})`,
    text: buildBookingVerificationEmailText({
      booking,
      customerName,
      pickupAddress,
      dropoffAddress,
      confirmationUrl,
      pickupDateTime: formatBusinessDateTime(pickupDate),
      businessName: business.name,
      businessPhone: business.phone,
      businessEmail: business.email,
    }),
    html: buildBookingVerificationEmailHtml({
      booking,
      customerName,
      pickupAddress,
      dropoffAddress,
      confirmationUrl,
      pickupDateTime: formatBusinessDateTime(pickupDate),
      businessName: business.name,
      businessPhone: business.phone,
      businessEmail: business.email,
    }),
  });
}

export async function sendDriverNotificationEmail(booking: Booking) {
  if (!isEmailConfigured) {
    console.warn('❌ [EMAIL SERVICE] Cannot send driver notification email - credentials not configured');
    return;
  }

  const transporter = createEmailTransporter();
  const business = getBusinessConfig();
  const templateData = buildDriverTemplateData(booking);

  try {
    await transporter.sendMail({
      from: `${business.name} <${VERIFIED_EMAIL_FROM}>`,
      to: EMAIL_CONFIG.verifiedSender,
      subject: templateData.subject,
      text: buildDriverNotificationEmailText(templateData),
      html: buildDriverNotificationEmailHtml(templateData),
    });
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Failed to send driver notification email');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function sendMagicLinkEmail(email: string, magicLinkUrl: string) {
  if (!isEmailConfigured) {
    throw new Error('Email service not configured.');
  }

  const transporter = createEmailTransporter();
  const business = getBusinessConfig();

  await transporter.sendMail({
    from: VERIFIED_EMAIL_FROM,
    to: email,
    subject: 'Your booking access link',
    text: buildMagicLinkEmailText({
      magicLinkUrl,
      supportEmail: business.email,
      companyName: business.name,
    }),
    html: buildMagicLinkEmailHtml({
      magicLinkUrl,
      supportEmail: business.email,
      companyName: business.name,
    }),
  });
}
