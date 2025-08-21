# 🚀 Local Development Setup Guide

## 🎯 **Goal: Full Local Test Environment**

This guide sets up a complete local development environment that mirrors production functionality without touching real data, charging real money, or sending real communications.

## 📋 **Prerequisites**

- Node.js 18+
- npm or yarn
- Firebase CLI installed (`npm install -g firebase-tools`)
- Access to service provider developer accounts

## 🔧 **Step 1: Firebase Emulator Setup**

### **1.1 Start Firebase Emulators**
```bash
# Start emulators with demo project (avoids production rules)
firebase emulators:start --project demo-project
```

**Expected Output:**
```
✔  All emulators ready! It is now safe to connect your app.
i  View Emulator UI at http://127.0.0.1:4000/
```

**Emulator Ports:**
- **Firestore**: localhost:8081
- **Auth**: localhost:9099
- **UI**: localhost:4000

### **1.2 Verify Emulator Connection**
When you run `npm run dev`, check console for:
```
🔌 Connecting to Firebase emulators...
📊 Firestore emulator: localhost:8081
🔐 Auth emulator: localhost:9099
```

## 💳 **Step 2: Square Payment Sandbox**

### **2.1 Square Developer Dashboard Setup**
1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. **Create/Select Application** → Enable Sandbox Mode
3. **Get Sandbox Credentials:**
   - Access Token (starts with `EAAA...`)
   - Location ID
   - Application ID

### **2.2 Environment Variables**
```bash
# .env.local - Development
SANDBOX_SQUARE_ACCESS_TOKEN=EAAAyour_sandbox_token_here
SANDBOX_SQUARE_LOCATION_ID=your_sandbox_location_id
SANDBOX_SQUARE_APPLICATION_ID=your_sandbox_app_id

# .env.production - Production (when ready)
SQUARE_ACCESS_TOKEN=your_real_production_token
SQUARE_LOCATION_ID=your_real_location_id
SQUARE_APPLICATION_ID=your_real_app_id
```

### **2.3 Test Card Numbers**
```
Visa: 4111111111111111
Mastercard: 5555555555554444
Expiry: Any future date
CVV: Any 3 digits
```

## 🗺️ **Step 3: Google Maps API**

### **3.1 Google Cloud Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create/Select Project** → Enable Maps APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
   - Distance Matrix API

### **3.2 API Key Restrictions (Development)**
- **Application restrictions**: HTTP referrers
- **API restrictions**: Only enabled Maps APIs
- **Quota limits**: Set low limits for development

### **3.3 Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_restricted_development_key
GOOGLE_MAPS_API_KEY=your_server_side_key
```

## 📧 **Step 4: Email Service (SendGrid)**

### **4.1 SendGrid Setup**
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. **Create API Key** with restricted permissions
3. **Verify Sender Domain** (or use test email)

### **4.2 Environment Variables**
```bash
# .env.local
SENDGRID_API_KEY=your_development_api_key
EMAIL_FROM=test@yourdomain.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_api_key_here
```

### **4.3 Development Email Safety**
```typescript
// Only send real emails in production
if (process.env.NODE_ENV === 'production') {
  // Send real email
  await sendEmail(recipient, subject, body);
} else {
  // Log to console in development
  console.log('📧 EMAIL (DEV):', { recipient, subject, body });
}
```

## 📱 **Step 5: SMS Service (Twilio)**

### **5.1 Twilio Sandbox Setup**
1. Go to [Twilio Console](https://console.twilio.com/)
2. **Get Sandbox Credentials:**
   - Account SID
   - Auth Token
   - Sandbox Phone Number

### **5.2 Environment Variables**
```bash
# .env.local
TWILIO_ACCOUNT_SID=your_sandbox_account_sid
TWILIO_AUTH_TOKEN=your_sandbox_auth_token
TWILIO_PHONE_NUMBER=your_sandbox_phone_number
```

### **5.3 Development SMS Safety**
```typescript
// Only send real SMS in production
if (process.env.NODE_ENV === 'production') {
  // Send real SMS
  await sendSMS(phone, message);
} else {
  // Log to console in development
  console.log('📱 SMS (DEV):', { phone, message });
}
```

## 🔔 **Step 6: Push Notifications (Firebase)**

### **6.1 Firebase Cloud Messaging**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Project Settings** → **Cloud Messaging**
3. **Generate Web Push Certificate** (VAPID key)

### **6.2 Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

## 🚫 **Step 7: Services to Mock/Disable**

### **7.1 Cost Tracking APIs**
```typescript
// Mock cost tracking in development
if (process.env.NODE_ENV === 'development') {
  return {
    totalMonthly: 0,
    totalYearly: 0,
    byCategory: {},
    byProvider: {}
  };
}
```

### **7.2 External Analytics**
```typescript
// Disable analytics in development
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Analytics disabled in development');
  return;
}
```

## 🧪 **Step 8: Test Data Setup**

### **8.1 Add Test User Flow Data**
```bash
# Add sample data for testing complete user journey
npm run add:test-flow
```

**This creates:**
- Sample driver (Gregg) with location
- Sample customer user
- Sample booking with payment
- Driver location for real-time tracking

### **8.2 Verify Test Data**
1. Go to [Firebase Emulator UI](http://localhost:4000)
2. Check **Firestore** → **Data** tab
3. Verify collections: `drivers`, `users`, `bookings`, `payments`

## 🚀 **Step 9: Start Development**

### **9.1 Start Emulators**
```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start --project demo-project
```

### **9.2 Start App**
```bash
# Terminal 2: Start Next.js app
npm run dev
```

### **9.3 Verify Connections**
Check console for:
```
🔌 Connecting to Firebase emulators...
📊 Firestore emulator: localhost:8081
🔐 Auth emulator: localhost:9099
🚀 Using development Square sandbox
📧 Email service: Development mode (logging only)
📱 SMS service: Development mode (logging only)
```

## 🎯 **Step 10: Test Complete User Flow**

### **10.1 Test Journey**
1. **User visits app** → localhost:3000
2. **Books a ride** → Uses emulator database
3. **Makes payment** → Uses Square sandbox
4. **Sees driver approaching** → Real-time emulator updates

### **10.2 What Works Locally**
✅ **Database operations** → Firebase emulator  
✅ **User authentication** → Firebase emulator  
✅ **Payment processing** → Square sandbox  
✅ **Maps/geocoding** → Google Maps (restricted key)  
✅ **Real-time updates** → Firebase emulator  

### **10.3 What's Safe in Development**
✅ **No real money** charged (Square sandbox)  
✅ **No real emails** sent (logging only)  
✅ **No real SMS** sent (logging only)  
✅ **No production data** touched  
✅ **No API charges** (restricted keys)  

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Emulator Not Connecting**
```bash
# Check if emulator is running
lsof -ti:8081

# Restart emulator
firebase emulators:start --project demo-project
```

#### **Square Sandbox Errors**
- Verify sandbox credentials are correct
- Check if sandbox mode is enabled
- Use test card numbers only

#### **Google Maps API Errors**
- Verify API key restrictions
- Check if required APIs are enabled
- Monitor quota usage

#### **Environment Variables Not Loading**
```bash
# Restart Next.js after changing .env.local
npm run dev
```

## 📚 **Reference Commands**

```bash
# Start development environment
firebase emulators:start --project demo-project
npm run dev

# Add test data
npm run add:test-flow

# Check emulator status
lsof -ti:8081
lsof -ti:9099

# View emulator UI
open http://localhost:4000
```

## 🎉 **You're Ready!**

Your local development environment now provides:
- **Full app functionality** without production risks
- **Real-time database** with Firebase emulator
- **Safe payment testing** with Square sandbox
- **Protected external services** with restricted keys
- **Complete user journey testing** with sample data

**Happy local development! 🚀**
