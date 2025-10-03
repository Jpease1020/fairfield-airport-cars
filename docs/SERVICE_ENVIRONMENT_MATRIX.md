# 🔧 Service Environment Matrix

## 📊 **Quick Reference: What to Use Where**

| Service | Development | Production | Notes |
|---------|-------------|------------|-------|
| **Firebase** | 🟢 Emulator | 🟢 Live | Use `--project demo-project` for emulator |
| **Square Payments** | 🟡 Sandbox | 🟢 Live | Test cards only, no real charges |
| **Google Maps** | 🟡 Restricted Key | 🟢 Production Key | Limit quotas, restrict referrers |
| **SendGrid Email** | 🔴 Mock/Log | 🟢 Live | Log to console in development |
| **Twilio SMS** | 🟡 Sandbox | 🟢 Live | Sandbox phone numbers only |
| **Push Notifications** | 🟢 Emulator | 🟢 Live | Firebase emulator handles FCM |

## 🎯 **Service Setup Priority**

### **🟢 HIGH PRIORITY (Required for Testing)**
1. **Firebase Emulator** - Core app functionality
2. **Square Sandbox** - Payment flow testing
3. **Google Maps** - Location services

### **🟡 MEDIUM PRIORITY (Nice to Have)**
4. **Twilio Sandbox** - SMS notifications
5. **SendGrid** - Email confirmations

### **🔴 LOW PRIORITY (Can Mock)**
6. **Cost Tracking APIs** - Mock with fake data
7. **Analytics** - Disable in development

## 🚨 **Critical Safety Rules**

### **NEVER in Development:**
- ❌ Real payment processing
- ❌ Real SMS to real numbers
- ❌ Real emails to real addresses
- ❌ Production API keys
- ❌ Production database access

### **ALWAYS in Development:**
- ✅ Sandbox/test credentials
- ✅ Emulator databases
- ✅ Restricted API keys
- ✅ Console logging for external services
- ✅ Test phone numbers/emails

## 🔑 **Environment Variable Checklist**

```bash
# .env.local - Development
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost:8081
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099


# Google Maps (Restricted)
NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY=...
GOOGLE_MAPS_SERVER_API_KEY=...

# Twilio Sandbox
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# SendGrid (Development)
SENDGRID_API_KEY=...
EMAIL_FROM=test@...

# Firebase FCM
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

## 🧪 **Testing Strategy**

### **Phase 1: Core Functionality**
- [ ] Firebase emulator connection
- [ ] Basic app navigation
- [ ] Database read/write operations

### **Phase 2: Payment Flow**
- [ ] Square sandbox connection
- [ ] Test payment processing
- [ ] Booking creation with payment

### **Phase 3: External Services**
- [ ] Google Maps integration
- [ ] SMS notifications (Twilio sandbox)
- [ ] Email confirmations (SendGrid mock)

### **Phase 4: Real-time Features**
- [ ] Driver tracking
- [ ] Push notifications
- [ ] WebSocket connections

## 🚀 **Quick Start Commands**

```bash
# 1. Start emulators
firebase emulators:start --project demo-project

# 2. Add test data
npm run add:test-flow

# 3. Start app
npm run dev

# 4. Verify connections
# Check console for emulator connection messages
```

## 📱 **Test User Journey**

1. **Visit app** → localhost:3000
2. **Book ride** → Uses emulator database
3. **Enter payment** → Uses Square sandbox
4. **Receive confirmation** → Mock SMS/email
5. **Track driver** → Real-time emulator updates
6. **Complete ride** → Full flow testing

## 🎉 **Success Indicators**

✅ **Console shows emulator connections**  
✅ **Payments process without real charges**  
✅ **Maps load with restricted API key**  
✅ **SMS/emails log to console only**  
✅ **Real-time updates work locally**  
✅ **No production data accessed**  

**You're ready for safe local development! 🚀**
