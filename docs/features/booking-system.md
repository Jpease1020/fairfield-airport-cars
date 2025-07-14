# Booking System

## Overview
The booking system is the core feature of the Fairfield Airport Cars application, allowing customers to book airport transportation services.

## Features

### Customer Booking Flow
1. **Booking Form** (`/book`)
   - Customer information collection
   - Pickup/dropoff location selection with Google Maps autocomplete
   - Date and time selection
   - Passenger count and flight number
   - Fare calculation
   - Payment processing

2. **Booking Management** (`/booking/[id]`)
   - View booking details
   - Edit booking information
   - Cancel booking
   - Payment status tracking

3. **Booking Status** (`/status/[id]`)
   - Real-time booking status
   - Driver location tracking
   - Estimated arrival time

### Admin Booking Management
1. **Booking Dashboard** (`/admin/bookings`)
   - View all bookings
   - Filter by status, date, customer
   - Bulk actions
   - Export functionality

2. **Calendar View** (`/admin/calendar`)
   - Visual booking calendar
   - Drag-and-drop booking management
   - Time slot visualization

3. **Booking Details** (`/admin/bookings/[id]`)
   - Edit booking information
   - Update status
   - Send communications
   - Payment management

## Technical Implementation

### Components
- `BookingForm` - Main booking form component
- `BookingCard` - Booking display component
- `LocationAutocomplete` - Address autocomplete component

### Services
- `booking-service.ts` - Booking CRUD operations
- `settings-service.ts` - Business settings and pricing
- `square-service.ts` - Payment processing

### API Endpoints
- `POST /api/estimate-fare` - Calculate fare based on locations
- `POST /api/create-checkout-session` - Create payment session
- `POST /api/complete-payment` - Process payment completion
- `POST /api/cancel-booking` - Cancel booking and process refund

## Data Flow

1. **Customer submits booking form**
   - Form validation
   - Fare calculation
   - Time slot availability check
   - Booking creation

2. **Payment processing**
   - Square checkout session creation
   - Payment completion webhook
   - Booking status update

3. **Confirmation and communication**
   - Email confirmation
   - SMS confirmation
   - Calendar invitation

## Business Rules

### Pricing
- Base fare calculation based on distance
- Additional charges for:
  - Extra passengers
  - Late night/early morning
  - Special requests
  - Airport parking fees

### Time Slots
- Minimum 2-hour buffer between bookings
- 24/7 availability
- Advance booking up to 30 days

### Cancellation Policy
- Free cancellation up to 24 hours before
- 50% refund for cancellations 2-24 hours before
- No refund for cancellations within 2 hours

## Integration Points

### Google Maps
- Places API for address autocomplete
- Distance calculation for fare estimation
- Route optimization

### Square Payments
- Secure payment processing
- Refund handling
- Payment status tracking

### Communication
- Email confirmations via Nodemailer
- SMS notifications via Twilio
- Calendar invitations

## Error Handling

### Common Issues
- Invalid addresses
- Payment failures
- Time slot conflicts
- Network connectivity issues

### User Feedback
- Clear error messages
- Loading states
- Success confirmations
- Retry mechanisms

## Future Enhancements

### Planned Features
- Recurring bookings
- Group bookings
- Special vehicle requests
- Loyalty program
- Mobile app

### Technical Improvements
- Real-time driver tracking
- Automated dispatch
- Route optimization
- Customer feedback system 