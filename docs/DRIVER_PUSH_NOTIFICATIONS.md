# 🔔 Driver Push Notifications Setup

## Overview

Gregg (driver ID: `gregg-driver-001`) will receive push notifications whenever a new booking is created.

## How It Works

1. **Booking Created** → System sends push notification to Gregg's device
2. **Notification Includes:**
   - Customer name
   - Pickup address
   - Dropoff address
   - Pickup date & time
   - Fare amount
   - Link to view booking details

## Setup Instructions

### **Step 1: Gregg Needs to Register for Push Notifications**

Gregg needs to visit the admin panel and enable push notifications:

1. **Login to admin panel** (as Gregg/admin user)
2. **Navigate to:** `/admin` or `/profile`
3. **Enable push notifications** using the notification manager
4. **Grant browser permission** when prompted
5. **Token is automatically saved** to `user_tokens/gregg-driver-001`

### **Step 2: Verify Token is Saved**

The system will automatically save Gregg's device token to:
- **Collection:** `user_tokens`
- **Document ID:** `gregg-driver-001`
- **Data:** `{ token: "...", userId: "gregg-driver-001", createdAt: Date, lastUpdated: Date }`

### **Step 3: Test Notification**

1. Create a test booking
2. Check that Gregg receives push notification
3. Verify notification includes booking details

## Notification Details

### **When Sent:**
- ✅ Immediately after booking is created
- ✅ Even if customer email fails to send
- ✅ Non-blocking (won't fail booking creation if notification fails)

### **Notification Content:**
```
Title: 🚗 New Booking Received
Body: [Customer Name] - [Date/Time] - $[Fare]
```

### **Notification Actions:**
- **View Booking** - Opens booking details page
- **Dismiss** - Closes notification

## Troubleshooting

### **No Notification Received?**

1. **Check if token exists:**
   - Go to Firebase Console → Firestore
   - Check `user_tokens/gregg-driver-001`
   - Verify token exists and is recent

2. **Check browser permissions:**
   - Browser must allow notifications
   - Check browser settings for notification permissions

3. **Check logs:**
   - Look for `🔔 [BOOKING SUBMIT]` logs in Vercel
   - Check for token errors or messaging errors

### **Token Invalid/Expired?**

If token is invalid:
- Gregg needs to re-register for notifications
- Visit admin panel and enable notifications again
- System will update token automatically

### **Notification Not Showing?**

- Check browser notification settings
- Verify service worker is registered
- Check browser console for errors

## API Endpoint

The notification is sent via:
- **Service:** `driver-notification-service.ts`
- **Function:** `notifyDriverOfNewBooking()`
- **Called from:** `api/booking/submit/route.ts`

## Future Enhancements

- [ ] SMS fallback if push notification fails
- [ ] Email notification to driver as backup
- [ ] Notification preferences (which events to notify)
- [ ] Multiple driver support

---

**Last Updated:** 2025-01-15
**Driver ID:** `gregg-driver-001`


