// src/lib/services/google-calendar.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Client, TrafficModel } from '@googlemaps/google-maps-services-js';

// Google Calendar API configuration
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const mapsClient = new Client({});
const DRIVER_HOME_BASE = process.env.DRIVER_HOME_BASE || 'Newtown, CT';
const DEFAULT_LOOKBACK_MINUTES = 240; // 4 hours
const DEFAULT_LOOKAHEAD_MINUTES = 240;

const travelTimeCache = new Map<string, number>();

// Initialize OAuth2 client
export const createOAuth2Client = (): OAuth2Client => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  return oauth2Client;
};

// Set credentials for authenticated requests
export const setCredentials = (oauth2Client: OAuth2Client, tokens: any) => {
  oauth2Client.setCredentials(tokens);
};

// Initialize Google Calendar API
export const initializeCalendarAPI = (oauth2Client: OAuth2Client) => {
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Types for calendar events
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
  reason?: string;
}

const parseEventDate = (value?: string | null, isEnd = false): Date | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // All-day events provide date without time; treat end date as exclusive
  if (!value.includes('T')) {
    if (isEnd) {
      date.setDate(date.getDate() + 1);
    }
  }

  return date;
};

const getEventTimeRange = (event: any): { start: Date | null; end: Date | null } => {
  const rawStart = event.start?.dateTime || event.start?.date;
  const rawEnd = event.end?.dateTime || event.end?.date;

  return {
    start: parseEventDate(rawStart),
    end: parseEventDate(rawEnd, true),
  };
};

const extractDropoffLocation = (event: any): string | null => {
  const location = typeof event.location === 'string' ? event.location.trim() : '';
  if (location) {
    if (location.includes('→')) {
      const parts = location.split('→');
      const dropoff = parts[parts.length - 1]?.trim();
      if (dropoff) {
        return dropoff;
      }
    }
    return location;
  }

  if (typeof event.description === 'string') {
    const dropoffMatch = event.description.match(/Drop(-| )?off:\s*(.+)/i);
    if (dropoffMatch && dropoffMatch[2]) {
      return dropoffMatch[2].trim();
    }
  }

  return null;
};

const fetchTravelMinutesToBase = async (origin: string, departureTime: Date): Promise<number | null> => {
  if (!process.env.GOOGLE_MAPS_SERVER_API_KEY) {
    return null;
  }

  const cacheKey = `${origin.toLowerCase()}|${departureTime.getHours()}`;
  if (travelTimeCache.has(cacheKey)) {
    return travelTimeCache.get(cacheKey)!;
  }

  try {
    const response = await mapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [DRIVER_HOME_BASE],
        key: process.env.GOOGLE_MAPS_SERVER_API_KEY,
        departure_time: departureTime,
        traffic_model: TrafficModel.best_guess,
      },
    });

    const element = response.data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      return null;
    }

    const travelSeconds = element.duration_in_traffic?.value ?? element.duration?.value;
    if (typeof travelSeconds !== 'number') {
      return null;
    }

    const minutes = Math.max(0, Math.ceil(travelSeconds / 60));
    travelTimeCache.set(cacheKey, minutes);
    return minutes;
  } catch (error) {
    console.error('Error fetching travel time to base:', error);
    return null;
  }
};

const calculatePostEventBufferMinutes = async (
  event: any,
  eventEnd: Date,
  fallbackMinutes: number
): Promise<number> => {
  const dropoff = extractDropoffLocation(event);
  if (!dropoff) {
    return fallbackMinutes;
  }

  if (dropoff.toLowerCase().includes(DRIVER_HOME_BASE.toLowerCase())) {
    return fallbackMinutes;
  }

  const travelMinutes = await fetchTravelMinutesToBase(dropoff, eventEnd);
  if (travelMinutes === null) {
    return fallbackMinutes;
  }

  return Math.max(fallbackMinutes, travelMinutes);
};

// Check availability for a specific time range
export const checkAvailability = async (
  calendar: any,
  startTime: Date,
  endTime: Date,
  bufferMinutes: number = 60
): Promise<AvailabilitySlot[]> => {
  try {
    const lookBack = Math.max(bufferMinutes * 2, DEFAULT_LOOKBACK_MINUTES);
    const lookAhead = Math.max(bufferMinutes * 2, DEFAULT_LOOKAHEAD_MINUTES);
    const queryStart = new Date(startTime.getTime() - lookBack * 60000);
    const queryEnd = new Date(endTime.getTime() + lookAhead * 60000);

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: queryStart.toISOString(),
      timeMax: queryEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    const eventDetails = await Promise.all(events.map(async (event: any) => {
      const { start, end } = getEventTimeRange(event);
      const summary = event.summary || 'Scheduled event';

      if (!start || !end) {
        return {
          start: null,
          end: null,
          postBuffer: bufferMinutes,
          summary,
        };
      }

      const postBuffer = await calculatePostEventBufferMinutes(event, end, bufferMinutes);

      return {
        start,
        end,
        postBuffer,
        summary,
      };
    }));
    
    // Check for conflicts with dynamic buffers
    const conflicts = eventDetails.filter(detail => {
      if (!detail.start || !detail.end) {
        return true;
      }

      const bufferedEventStart = new Date(detail.start.getTime() - bufferMinutes * 60000);
      const bufferedEventEnd = new Date(detail.end.getTime() + detail.postBuffer * 60000);

      return bufferedEventStart < endTime && bufferedEventEnd > startTime;
    });

    // Return availability status
    return [{
      start: startTime,
      end: endTime,
      available: conflicts.length === 0,
      reason: conflicts.length > 0 ? `Conflict with: ${conflicts[0].summary}` : undefined
    }];

  } catch (error) {
    console.error('Error checking availability:', error);
    throw new Error('Failed to check calendar availability');
  }
};

// Get available time slots for a date range
export const getAvailableSlots = async (
  calendar: any,
  date: Date,
  durationMinutes: number = 60,
  bufferMinutes: number = 60
): Promise<AvailabilitySlot[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(6, 0, 0, 0); // Start checking from 6 AM
    
    const endOfDay = new Date(date);
    endOfDay.setHours(22, 0, 0, 0); // Stop checking at 10 PM
    
    // Fetch all events for the day
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const eventDetails = await Promise.all(events.map(async (event: any) => {
      const { start, end } = getEventTimeRange(event);
      const summary = event.summary || 'Scheduled event';

      if (!start || !end) {
        return {
          start: null,
          end: null,
          postBuffer: bufferMinutes,
          summary,
        };
      }

      const postBuffer = await calculatePostEventBufferMinutes(event, end, bufferMinutes);

      return {
        start,
        end,
        postBuffer,
        summary,
      };
    }));

    const availableSlots: AvailabilitySlot[] = [];
    
    // Generate 30-minute slots throughout the day
    const slotDuration = 30; // 30-minute slots
    let currentTime = new Date(startOfDay);
    
    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
      
      // Check if this slot conflicts with any events (including buffer)
      let hasConflict = false;
      let conflictReason: string | undefined;
      
      for (const detail of eventDetails) {
        if (!detail.start || !detail.end) {
          hasConflict = true;
          conflictReason = detail.summary;
          break;
        }

        const bufferedEventStart = new Date(detail.start.getTime() - bufferMinutes * 60000);
        const bufferedEventEnd = new Date(detail.end.getTime() + detail.postBuffer * 60000);

        if (bufferedEventStart < slotEnd && bufferedEventEnd > currentTime) {
          hasConflict = true;
          conflictReason = detail.summary;
          break;
        }
      }
      
      availableSlots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        available: !hasConflict,
        reason: hasConflict ? conflictReason || 'Scheduled event' : undefined
      });
      
      // Move to next slot
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    
    return availableSlots.filter(slot => slot.available);

  } catch (error) {
    console.error('Error getting available slots:', error);
    throw new Error('Failed to get available time slots');
  }
};

// Create a new calendar event for a booking
export const createBookingEvent = async (
  calendar: any,
  bookingData: {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    customerEmail: string;
    customerName: string;
    pickupLocation: string;
    dropoffLocation: string;
  }
): Promise<CalendarEvent> => {
  try {
    const event: CalendarEvent = {
      summary: bookingData.summary,
      description: bookingData.description,
      start: {
        dateTime: bookingData.startTime.toISOString(),
        timeZone: 'America/New_York', // Fairfield, CT timezone
      },
      end: {
        dateTime: bookingData.endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        {
          email: bookingData.customerEmail,
          displayName: bookingData.customerName,
        },
      ],
      location: `${bookingData.pickupLocation} → ${bookingData.dropoffLocation}`,
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    return response.data;

  } catch (error) {
    console.error('Error creating booking event:', error);
    throw new Error('Failed to create calendar event');
  }
};

// Update an existing calendar event
export const updateBookingEvent = async (
  calendar: any,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
  try {
    const response = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: updates,
    });

    return response.data;

  } catch (error) {
    console.error('Error updating booking event:', error);
    throw new Error('Failed to update calendar event');
  }
};

// Delete a calendar event
export const deleteBookingEvent = async (
  calendar: any,
  eventId: string
): Promise<void> => {
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

  } catch (error) {
    console.error('Error deleting booking event:', error);
    throw new Error('Failed to delete calendar event');
  }
};

// Get OAuth2 authorization URL
export const getAuthUrl = (oauth2Client: OAuth2Client): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
};

// Exchange authorization code for tokens
export const getTokens = async (
  oauth2Client: OAuth2Client,
  code: string
): Promise<any> => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) {
      throw new Error('No tokens returned from Google');
    }
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to get access tokens');
  }
};

// Get stored calendar tokens (from environment or database)
// TODO: Implement secure token storage in database
export const getStoredCalendarTokens = async (): Promise<any | null> => {
  try {
    // Check environment variable first (for server-side operations)
    if (process.env.GOOGLE_CALENDAR_TOKENS) {
      return JSON.parse(process.env.GOOGLE_CALENDAR_TOKENS);
    }
    
    // TODO: Fetch from secure database storage
    // For now, return null if not in environment
    return null;
  } catch (error) {
    console.error('Error getting stored calendar tokens:', error);
    return null;
  }
};

// Create calendar event for a booking and return event ID
// This is used server-side when bookings are confirmed
export const createBookingCalendarEvent = async (
  booking: {
    id: string;
    trip: {
      pickup: { address: string };
      dropoff: { address: string };
      pickupDateTime: Date | string;
    };
    customer: {
      name: string;
      email: string;
    };
  },
  options?: { smokeTest?: boolean }
): Promise<string | null> => {
  try {
    // Skip calendar operations in smoke test mode
    const isSmokeTest = options?.smokeTest || process.env.SMOKE_TEST_MODE === 'true';
    if (isSmokeTest) {
      console.log(`🧪 Smoke test mode - skipping calendar event creation for booking ${booking.id}`);
      return `smoke-test-event-${booking.id}`; // Return fake event ID for smoke tests
    }

    const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';
    if (!calendarIntegrationEnabled) {
      console.log('Calendar integration disabled - skipping event creation');
      return null;
    }

    const tokens = await getStoredCalendarTokens();
    if (!tokens) {
      console.warn('Calendar tokens not available - cannot create event for booking', booking.id);
      return null;
    }

    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);

    const pickupTime = new Date(booking.trip.pickupDateTime);
    const endTime = new Date(pickupTime);
    endTime.setHours(endTime.getHours() + 2); // Assume 2 hour duration

    const event = await createBookingEvent(calendar, {
      summary: `Ride: ${booking.customer.name}`,
      description: `Booking ID: ${booking.id}\nPickup: ${booking.trip.pickup.address}\nDropoff: ${booking.trip.dropoff.address}`,
      startTime: pickupTime,
      endTime: endTime,
      customerEmail: booking.customer.email,
      customerName: booking.customer.name,
      pickupLocation: booking.trip.pickup.address,
      dropoffLocation: booking.trip.dropoff.address,
    });

    if (event.id) {
      console.log(`✅ Created calendar event ${event.id} for booking ${booking.id}`);
      return event.id;
    }

    return null;
  } catch (error) {
    console.error(`Failed to create calendar event for booking ${booking.id}:`, error);
    // Don't throw - calendar event creation failure shouldn't break booking
    return null;
  }
};
