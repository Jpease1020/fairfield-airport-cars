import nodemailer from 'nodemailer';
import { createEvent } from 'ics';
import type { Booking } from '@/types/booking';
import { EMAIL_CONFIG } from '@/utils/constants';
import {
  getCustomerEmail,
  getCustomerName,
  getCustomerNotes,
  getCustomerPhone,
  getDropoffAddress,
  getFare,
  getFlightInfo,
  getPickupAddress,
  getPickupDateTime,
  getTipAmount,
  parseBookingDate,
} from '@/utils/booking-helpers';
import {
  formatBusinessDate,
  formatBusinessTime,
  formatBusinessTimeWithZone,
  formatBusinessDateTimeWithZone,
  getUtcDateTimeParts,
} from '@/lib/utils/booking-date-time';

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
export const VERIFIED_EMAIL_FROM = EMAIL_CONFIG.verifiedSender;
export const isEmailConfigured = Boolean(EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS);

export const createEmailTransporter = () => {
  if (!isEmailConfigured) {
    throw new Error('Email service not configured. Missing required environment variables.');
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    ...(EMAIL_HOST === 'smtp.gmail.com' && { service: 'gmail', tls: { rejectUnauthorized: false } }),
    ...(EMAIL_HOST === 'smtp.sendgrid.net' && {
      requireTLS: true,
      tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    }),
  });
};

export const getBookingPickupDate = (booking: Booking) => parseBookingDate(getPickupDateTime(booking)) || new Date();

export const buildTrackingUrl = (booking: Booking): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  const token = (booking as any)?.trackingToken;
  return token ? `${baseUrl}/tracking/${booking.id}?token=${token}` : `${baseUrl}/tracking/${booking.id}`;
};

export const buildCalendarAttachment = async (booking: Booking, pickupAddress: string, dropoffAddress: string, businessName: string) => {
  if ((booking as any).calendarAddedByUser === true) return [];

  const pickupDate = getBookingPickupDate(booking);
  const parts = getUtcDateTimeParts(pickupDate);
  const event = {
    start: parts
      ? [parts.year, parts.month, parts.day, parts.hour, parts.minute]
      : [
          pickupDate.getUTCFullYear(),
          pickupDate.getUTCMonth() + 1,
          pickupDate.getUTCDate(),
          pickupDate.getUTCHours(),
          pickupDate.getUTCMinutes(),
        ],
    startInputType: 'utc' as const,
    startOutputType: 'utc' as const,
    duration: { hours: 2, minutes: 0 },
    title: 'Airport Car Service',
    description: `Ride from ${pickupAddress} to ${dropoffAddress}`,
    location: pickupAddress,
    organizer: { name: businessName, email: VERIFIED_EMAIL_FROM },
  };

  const value = await new Promise<string>((resolve) => {
    createEvent(event, (error: Error | null, icsValue: string) => resolve(error || !icsValue ? '' : icsValue));
  });

  return value ? [{ filename: 'ride.ics', content: value, contentType: 'text/calendar' as const }] : [];
};

export const buildDriverTemplateData = (booking: Booking) => {
  const pickupDate = getBookingPickupDate(booking);
  const fare = getFare(booking);
  const tipAmount = getTipAmount(booking);
  const flightInfo = getFlightInfo(booking);
  const flightTimeText = typeof flightInfo.arrivalTime === 'string'
    ? flightInfo.arrivalTime.trim()
    : '';

  return {
    bookingId: booking.id,
    pickupDate: formatBusinessDate(pickupDate),
    pickupTime: formatBusinessTimeWithZone(pickupDate),
    pickupAddress: getPickupAddress(booking) || 'Not specified',
    dropoffAddress: getDropoffAddress(booking) || 'Not specified',
    customerName: getCustomerName(booking) || 'Not provided',
    customerPhone: getCustomerPhone(booking) || 'Not provided',
    customerEmail: getCustomerEmail(booking) || 'Not provided',
    notes: getCustomerNotes(booking),
    fare,
    tipAmount,
    totalFare: fare + tipAmount,
    hasFlightInfo: flightInfo.hasFlight,
    airline: flightInfo.airline,
    flightNumber: flightInfo.flightNumber,
    terminal: flightInfo.terminal,
    arrivalTime: flightTimeText,
    bookedAt: formatBusinessDateTimeWithZone(new Date()),
    subject: `🚗 NEW RIDE: ${formatBusinessDate(pickupDate)} at ${formatBusinessTime(pickupDate)}`,
  };
};
