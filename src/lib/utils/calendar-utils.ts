/**
 * Calendar utility functions for generating calendar links and .ics files
 * Supports Google Calendar, Outlook/Microsoft Teams, and Apple Calendar (.ics download)
 */

import { createEvent } from 'ics';
import { authFetch } from '@/lib/utils/auth-fetch';

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  bookingId: string;
}

/**
 * Generate Google Calendar URL for adding event
 */
export function generateGoogleCalendarUrl(data: CalendarEventData): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: data.title,
    dates: `${formatDate(data.startDate)}/${formatDate(data.endDate)}`,
    details: data.description,
    location: data.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL for adding event
 */
export function generateOutlookCalendarUrl(data: CalendarEventData): string {
  const formatDate = (date: Date): string => {
    return date.toISOString();
  };

  const params = new URLSearchParams({
    subject: data.title,
    startdt: formatDate(data.startDate),
    enddt: formatDate(data.endDate),
    body: data.description,
    location: data.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate .ics file content for download
 */
export async function generateIcsFile(data: CalendarEventData): Promise<string> {
  return new Promise((resolve, reject) => {
    const event = {
      start: [
        data.startDate.getFullYear(),
        data.startDate.getMonth() + 1,
        data.startDate.getDate(),
        data.startDate.getHours(),
        data.startDate.getMinutes(),
      ],
      end: [
        data.endDate.getFullYear(),
        data.endDate.getMonth() + 1,
        data.endDate.getDate(),
        data.endDate.getHours(),
        data.endDate.getMinutes(),
      ],
      title: data.title,
      description: data.description,
      location: data.location,
    };

    createEvent(event, (error: Error | null, value: string) => {
      if (error) {
        reject(error);
      } else if (!value) {
        reject(new Error('Failed to generate .ics file'));
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Download .ics file to user's device
 */
export async function downloadIcsFile(data: CalendarEventData, filename?: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('downloadIcsFile can only be called in the browser');
  }
  
  try {
    const icsContent = await generateIcsFile(data);
    const blob = new window.Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `booking-${data.bookingId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading .ics file:', error);
    throw error;
  }
}

/**
 * Check if calendar event was already added for this booking
 */
export function hasCalendarBeenAdded(bookingId: string): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  try {
    return !!localStorage.getItem(`calendarAdded-${bookingId}`);
  } catch {
    return false;
  }
}

/**
 * Mark calendar event as added for this booking
 * Updates both localStorage (client-side) and server-side (database)
 */
export async function markCalendarAsAdded(bookingId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Update localStorage for client-side tracking
  localStorage.setItem(`calendarAdded-${bookingId}`, Date.now().toString());
  
  // Update server-side tracking so email can check this
  try {
    await authFetch('/api/booking/calendar-added', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId }),
    });
  } catch (error) {
    console.error('Failed to track calendar addition on server:', error);
    // Don't throw - client-side tracking still works
  }
}

/**
 * Create calendar event data from booking information
 */
export function createCalendarEventData(
  pickupAddress: string,
  dropoffAddress: string,
  pickupDateTime: string | Date,
  bookingId: string,
  customerName?: string
): CalendarEventData {
  const startDate = pickupDateTime instanceof Date 
    ? pickupDateTime 
    : new Date(pickupDateTime);
  
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration

  const title = 'Airport Car Service';
  const description = `Ride from ${pickupAddress} to ${dropoffAddress}${customerName ? `\n\nPassenger: ${customerName}` : ''}`;
  const location = pickupAddress;

  return {
    title,
    description,
    location,
    startDate,
    endDate,
    bookingId,
  };
}
