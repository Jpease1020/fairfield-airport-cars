# 🎯 Booking System - Comprehensive User Flows

## 📋 Customer Flow

### Phase 1: Trip Details
**User Action:**
1. Navigate to home page (`/`)
2. Enter pickup location (with autocomplete)
3. Enter dropoff location (with autocomplete)
4. Select date & time for pickup
5. Select fare type (personal/business)
6. View estimated ride time and distance
7. Calculate fare → See quote with 15-minute expiration
8. Continue to next phase

**Success Criteria:**
- ✅ Google Maps autocomplete works for both locations
- ✅ DateTime picker shows calendar and time picker
- ✅ Fare calculation API returns valid quote
- ✅ Quote includes expiration (15 minutes)
- ✅ User can see estimated time/distance
- ✅ Quote expires if user waits too long

---

### Phase 2: Contact Information
**User Action:**
1. Enter full name
2. Enter email address
3. Enter phone number (formatted)
4. Add optional notes/special requests
5. Option to save info for future bookings
6. Continue to payment phase

**Success Criteria:**
- ✅ Form validation for email format
- ✅ Form validation for phone number
- ✅ Name field is required
- ✅ All fields are properly validated
- ✅ User can go back to edit trip details

---

### Phase 3: Payment
**User Action:**
1. Review trip summary (pickup, dropoff, datetime, fare type)
2. View fare breakdown (base fare, tip calculator)
3. Add/calculate tip (optional)
4. See total amount due
5. Review cancellation policy
6. Submit booking (no payment required - promotional period)

**Success Criteria:**
- ✅ All trip details are displayed correctly
- ✅ Fare matches the quote from Phase 1
- ✅ Tip calculator works (amount + percentage)
- ✅ Total is calculated correctly
- ✅ Booking submission creates booking in database
- ✅ Booking ID is returned
- ✅ User sees booking confirmation

---

### Phase 4: Flight Information (Optional)
**User Action:**
1. View booking confirmation message
2. Option to add flight details:
   - Airline
   - Flight number
   - Arrival time
   - Terminal
3. Skip or complete flight information
4. Mark booking as complete

**Success Criteria:**
- ✅ Confirmation shows booking ID
- ✅ Flight info is optional (can skip)
- ✅ Flight details are saved to booking
- ✅ User can complete booking without flight info

---

### Post-Booking Customer Actions
**User Action:**
1. View booking in "My Bookings" page
2. Receive confirmation email/SMS
3. View booking details (route, time, driver info when assigned)
4. Track ride status (when driver is assigned)
5. Add/edit flight information
6. Cancel booking (if allowed by policy)
7. Receive notifications when driver is on the way

**Success Criteria:**
- ✅ Booking appears in customer's booking list
- ✅ Customer can view all booking details
- ✅ Booking status updates correctly
- ✅ Customer receives real-time updates
- ✅ Cancellation policy is enforced

---

## 🚗 Gregg's Admin Flow

### Dashboard View
**Admin Action:**
1. Login to admin dashboard (`/admin`)
2. View dashboard with key metrics:
   - Total bookings
   - Active drivers (Gregg = always 1)
   - Revenue this month
   - Customer rating
3. See recent activity feed

**Success Criteria:**
- ✅ Metrics display correctly
- ✅ Recent bookings show in activity feed
- ✅ Dashboard loads all data accurately

---

### View All Bookings
**Admin Action:**
1. Navigate to bookings page (`/admin/bookings`)
2. View all bookings in table format
3. Filter by status (all, pending, confirmed, in-progress, completed, cancelled)
4. See customer info (name, email, phone)
5. See route (pickup → dropoff)
6. See date/time
7. See status badge
8. See fare information

**Success Criteria:**
- ✅ All bookings load from database
- ✅ Filtering works for each status
- ✅ Booking details are displayed correctly
- ✅ Table is responsive and sortable
- ✅ Data refreshes when new bookings arrive

---

### View Individual Booking Details
**Admin Action:**
1. Click on a booking to view details
2. See complete booking information:
   - Customer details
   - Trip details (pickup, dropoff, datetime)
   - Flight information (if provided)
   - Payment status
   - Booking status
   - Driver assignment
3. View/update booking status
4. Assign driver (Gregg)
5. View driver tracking (if available)

**Success Criteria:**
- ✅ All booking data is displayed
- ✅ Admin can update booking status
- ✅ Driver assignment works
- ✅ Tracking information loads

---

### Manage Booking Status
**Admin Action:**
1. Update booking status (pending → confirmed → in-progress → completed)
2. Assign Gregg as driver
3. Cancel booking (if needed)
4. Update customer notifications

**Success Criteria:**
- ✅ Status updates persist in database
- ✅ Customer receives status update notifications
- ✅ Booking state transitions are valid
- ✅ Cancellations follow policy

---

### Handle Booking Conflicts
**Admin Action:**
1. View scheduling calendar
2. See existing bookings and blocked times
3. Check for time slot conflicts
4. Verify 1-hour buffer around rides
5. Approve or suggest alternate times

**Success Criteria:**
- ✅ Calendar shows all bookings
- ✅ Conflicts are highlighted
- ✅ Buffer times are enforced
- ✅ Suggestions work for alternate times

---

### Payment & Revenue Tracking
**Admin Action:**
1. View payment status for each booking
2. See deposit payment status
3. See balance due
4. View revenue reports
5. Track payment history

**Success Criteria:**
- ✅ Payment status is accurate
- ✅ Revenue tracking is correct
- ✅ Payment history is complete
- ✅ Reports are accurate

---

### Driver Management (Gregg as Single Driver)
**Admin Action:**
1. View Gregg's availability
2. Assign Gregg to bookings
3. Update Gregg's status (available, busy, offline)
4. Track Gregg's location (when on rides)
5. View Gregg's schedule

**Success Criteria:**
- ✅ Gregg's status displays correctly
- ✅ Assignments work properly
- ✅ Location tracking functions (if implemented)
- ✅ Schedule shows all assigned rides

---

## 🧪 Test Scenarios

### Customer Booking Flow Tests
1. **Complete booking with all optional fields**
2. **Complete booking without flight info**
3. **Booking with different fare types**
4. **Booking cancellation within policy**
5. **Booking cancellation outside policy**
6. **Quote expiration handling**
7. **Concurrent booking conflicts**
8. **Email/SMS confirmation delivery**

### Admin Management Tests
1. **View all bookings**
2. **Update booking status**
3. **Assign driver**
4. **Handle booking conflicts**
5. **Process cancellations**
6. **Revenue reporting**
7. **Driver schedule management**
8. **Customer notification triggers**

---

## 🔍 Key Integration Points

### Customer → Backend
- `/api/booking/quote` - Fare calculation
- `/api/booking/submit` - Booking creation
- `/api/booking/[bookingId]` - Booking retrieval
- `/api/booking/cancel-booking` - Cancellation

### Admin → Backend
- `/api/admin/bookings` - All bookings retrieval
- `/api/booking/[bookingId]` - Individual booking details
- `/api/booking/update-status` - Status updates
- `/api/driver/assign` - Driver assignment

### Real-time Updates
- Firebase Firestore listeners
- Booking status change notifications
- Driver location updates
- ETA calculations

---

## ✅ Definition of Done

For each user flow to be considered "complete":
1. ✅ All API endpoints work correctly
2. ✅ Data persists in Firebase Firestore
3. ✅ User receives confirmation
4. ✅ Admin can view and manage
5. ✅ Status updates trigger notifications
6. ✅ Integration tests pass
7. ✅ UI/UX is intuitive and functional
8. ✅ Error handling is graceful
9. ✅ Mobile responsive
10. ✅ Accessibility compliant (WCAG 2.1 AA)








