# 🔔 Push Notifications Setup Guide

## 📋 **Required Environment Variables**

Add these to your `.env.local` file:

```bash
# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Admin (for server-side messaging)
FIREBASE_PROJECT_ID=fairfield-airport-car-service
FIREBASE_PRIVATE_KEY=your_private_key_here
FIREBASE_CLIENT_EMAIL=your_client_email_here
```

## 🔧 **Firebase Console Setup**

### **1. Enable Cloud Messaging**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `fairfield-airport-car-service`
3. Go to **Project Settings** → **Cloud Messaging**
4. Enable **Web Push certificates**
5. Generate a new **Web Push certificate**
6. Copy the **VAPID key** to your `.env.local`

### **2. Service Account Setup**
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Extract these values to your `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## 🚀 **Implementation Status**

### ✅ **Completed**
- [x] Firebase Messaging initialization
- [x] Push notification service
- [x] React hook for push notifications
- [x] API endpoints for sending notifications
- [x] Notification manager component
- [x] Service worker for background notifications
- [x] User settings management
- [x] Device token storage

### 🔄 **Next Steps**
1. **Add environment variables** to `.env.local`
2. **Test push notifications** in development
3. **Deploy service worker** to production
4. **Integrate with booking system** for automatic notifications

## 📱 **Usage Examples**

### **Send Booking Confirmation**
```typescript
import { pushNotificationService } from '@/lib/services/push-notification-service';

await pushNotificationService.sendToUser(userId, {
  title: 'Booking Confirmed! 🚗',
  body: 'Your ride from JFK to Fairfield is confirmed for tomorrow at 2:30 PM',
  data: {
    bookingId: 'booking_123',
    action: 'view_booking',
    url: '/bookings/booking_123'
  }
});
```

### **Send Driver Update**
```typescript
await pushNotificationService.sendToUser(userId, {
  title: 'Driver is on the way! 🚗',
  body: 'John will arrive at Terminal 4 in 15 minutes',
  data: {
    bookingId: 'booking_123',
    action: 'driver_status',
    url: '/tracking/booking_123'
  }
});
```

### **Send Flight Delay Alert**
```typescript
await pushNotificationService.sendToUser(userId, {
  title: 'Flight Delay Detected ✈️',
  body: 'Your flight AA123 is delayed 30 minutes. Update pickup time?',
  data: {
    bookingId: 'booking_123',
    action: 'flight_update',
    url: '/manage/booking_123'
  }
});
```

## 🧪 **Testing**

### **1. Enable Notifications**
```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

const { requestPermission, sendTestNotification } = usePushNotifications();

// Request permission
await requestPermission();

// Send test notification
await sendTestNotification();
```

### **2. Test Component**
```tsx
import { NotificationManager } from '@/components/business';

<NotificationManager 
  showSettings={true}
  onNotificationReceived={(payload) => {
    console.log('Notification received:', payload);
  }}
/>
```

## 🔒 **Security Considerations**

### **Token Management**
- Device tokens are stored securely in Firestore
- Tokens are automatically refreshed by Firebase
- Invalid tokens are cleaned up automatically

### **Permission Handling**
- Users must explicitly grant notification permission
- Graceful fallback for unsupported browsers
- Clear user feedback for permission status

### **Data Privacy**
- Notification data is encrypted in transit
- No sensitive data in notification payloads
- User settings are stored securely

## 📊 **Analytics & Monitoring**

### **Success Metrics**
- **Permission Grant Rate**: Target 60%+
- **Notification Open Rate**: Target 40%+
- **Booking Completion Rate**: Target 25% improvement
- **Customer Satisfaction**: Target 4.5+ rating

### **Error Handling**
- Automatic retry for failed notifications
- Detailed error logging for debugging
- Graceful degradation for unsupported features

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "Firebase Messaging not available"**
- Check if Firebase is properly initialized
- Verify environment variables are set
- Ensure browser supports push notifications

#### **2. "Permission not granted"**
- User must manually enable notifications
- Check browser notification settings
- Test in incognito mode

#### **3. "Service worker not registered"**
- Verify `firebase-messaging-sw.js` is in `/public`
- Check browser console for errors
- Ensure HTTPS in production

#### **4. "Token not generated"**
- Check VAPID key configuration
- Verify Firebase project settings
- Test with different browsers

### **Debug Commands**
```javascript
// Check if push notifications are supported
console.log('Supported:', 'Notification' in window && 'serviceWorker' in navigator);

// Check current permission
console.log('Permission:', Notification.permission);

// Check service worker registration
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

## 📈 **Performance Optimization**

### **Best Practices**
- **Batch notifications** for multiple users
- **Use topics** for targeted broadcasts
- **Implement retry logic** for failed sends
- **Monitor token validity** and cleanup

### **Rate Limits**
- Firebase allows up to **500 tokens per request**
- **1000 messages per second** per project
- **1 million messages per day** for free tier

## 🎯 **Business Integration**

### **Booking Flow Notifications**
1. **Booking Confirmed** - Immediate confirmation
2. **Reminder (24h)** - Day before pickup
3. **Driver Assigned** - When driver is assigned
4. **Driver En Route** - 15 minutes before pickup
5. **Driver Arrived** - When driver arrives
6. **Ride Completed** - After drop-off

### **Flight Status Notifications**
1. **Flight Delayed** - Automatic pickup adjustment
2. **Flight Cancelled** - Rescheduling options
3. **Flight Early** - Proactive pickup adjustment
4. **Boarding Started** - Final pickup reminder

---

*Last Updated: January 2025*  
*Status: Implementation Complete - Ready for Testing* 