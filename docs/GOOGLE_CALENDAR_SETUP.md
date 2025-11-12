# 📅 Google Calendar Integration Setup Guide

## Overview
This guide walks you through setting up Google Calendar integration for the Fairfield Airport Cars booking system. The integration will automatically check Gregg's availability and create calendar events for confirmed bookings.

## Prerequisites
- Google Cloud Platform account
- Google Calendar API enabled
- OAuth2 credentials configured

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name: `Fairfield Airport Cars`
4. Click "Create"

### 1.2 Enable Google Calendar API
1. In the project dashboard, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 1.3 Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: `Fairfield Airport Cars Calendar`
5. Authorized redirect URIs:
   - `http://localhost:3000/api/calendar/callback` (development)
   - `https://your-domain.com/api/calendar/callback` (production)
6. Click "Create"
7. Download the credentials JSON file

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
GOOGLE_CALENDAR_ID=primary

# For production, use your actual domain:
# GOOGLE_REDIRECT_URI=https://your-domain.com/api/calendar/callback
```

## Step 3: Install Required Dependencies

```bash
npm install googleapis google-auth-library
```

## Step 4: Calendar Configuration

### 4.1 Set Up Gregg's Calendar
1. Create a dedicated Google Calendar for bookings (optional)
2. Share the calendar with the service account email
3. Set appropriate permissions (read/write)

### 4.2 Configure Calendar ID
- Use `primary` for Gregg's main calendar
- Or use a specific calendar ID for a dedicated booking calendar

## Step 5: Testing the Integration

### 5.1 Local Testing
1. Start your development server: `npm run dev`
2. Navigate to the calendar connection page
3. Click "Connect Google Calendar"
4. Complete the OAuth flow
5. Test availability checking

### 5.2 Production Deployment
1. Update environment variables with production URLs
2. Deploy to Vercel
3. Test the integration in production

## API Endpoints

### Authentication
- `GET /api/calendar/auth` - Get authorization URL
- `GET /api/calendar/callback` - Handle OAuth callback

### Availability
- `POST /api/calendar/availability` - Check availability or get available slots

### Events
- `POST /api/calendar/events` - Create booking event
- `PUT /api/calendar/events` - Update booking event
- `DELETE /api/calendar/events` - Delete booking event

## Usage Examples

### Check Availability for Specific Time
```typescript
const availability = await checkAvailability(
  new Date('2024-01-15T10:00:00'),
  new Date('2024-01-15T11:00:00'),
  60 // 1-hour buffer
);
```

### Get Available Slots for a Date
```typescript
const slots = await getAvailableSlots(
  new Date('2024-01-15'),
  60, // 60-minute duration
  60  // 1-hour buffer
);
```

### Create Booking Event
```typescript
const event = await createBookingEvent({
  summary: 'Airport Transfer - John Doe',
  description: 'Fairfield to JFK Airport',
  startTime: new Date('2024-01-15T10:00:00'),
  endTime: new Date('2024-01-15T11:00:00'),
  customerEmail: 'john@example.com',
  customerName: 'John Doe',
  pickupLocation: '123 Main St, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY'
});
```

## Security Considerations

### Token Storage
- Store OAuth tokens securely in production
- Implement token refresh logic
- Use environment variables for sensitive data

### Rate Limiting
- Google Calendar API has rate limits
- Implement proper error handling
- Consider caching for frequently accessed data

### Permissions
- Use minimal required scopes
- Regularly audit calendar access
- Implement proper error handling

## Troubleshooting

### Common Issues

#### 1. "Access Denied" Error
- Check OAuth2 credentials
- Verify redirect URI matches exactly
- Ensure API is enabled

#### 2. "Calendar Not Found" Error
- Verify calendar ID is correct
- Check calendar permissions
- Ensure calendar exists

#### 3. Rate Limit Exceeded
- Implement exponential backoff
- Cache frequently accessed data
- Monitor API usage

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=google-calendar
```

## Production Checklist

- [ ] Google Calendar API enabled
- [ ] OAuth2 credentials configured
- [ ] Environment variables set
- [ ] Redirect URIs updated for production
- [ ] Calendar permissions configured
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Token storage secured
- [ ] Monitoring set up
- [ ] Backup procedures in place

## Support

For issues with Google Calendar integration:
1. Check the [Google Calendar API documentation](https://developers.google.com/calendar)
2. Review the [OAuth2 documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the [Google Cloud Console](https://console.cloud.google.com) for API usage

## Next Steps

After completing this setup:
1. Test the integration thoroughly
2. Implement availability checking in the booking flow
3. Add calendar event creation for confirmed bookings
4. Set up monitoring and alerts
5. Train users on the new system
