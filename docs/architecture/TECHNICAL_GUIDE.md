# Technical Guide - Fairfield Airport Cars

## Overview
This document provides technical details for the Fairfield Airport Cars application, including architecture, APIs, deployment, and development guidelines.

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes, Firebase
- **Database:** Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Payments:** Square API
- **SMS:** Twilio
- **Maps:** Google Maps API
- **Deployment:** Vercel
- **Monitoring:** Custom analytics system

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── admin/             # Admin dashboard
│   └── [pages]/           # Customer-facing pages
├── components/            # Reusable React components
├── lib/                   # Business logic and utilities
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Firebase CLI (optional)

### Environment Variables
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_API_KEY=

# Square
SQUARE_ACCESS_TOKEN=
SQUARE_WEBHOOK_SIGNATURE_KEY=
SQUARE_LOCATION_ID=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# OpenAI (for AI Assistant)
OPENAI_API_KEY=

# Monitoring
NOTIFICATION_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
ERROR_WEBHOOK_URL=
```

### Installation
```bash
# Clone repository
git clone [repository-url]
cd fairfield-airport-cars

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Initialize CMS
npm run init-cms

# Start development server
npm run dev
```

---

## 📊 Database Schema

### Collections

#### `bookings`
```typescript
interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  passengers: number;
  flightNumber?: string;
  notes?: string;
  fare: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  driverId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `users`
```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'driver' | 'customer';
  name: string;
  phone?: string;
  createdAt: Date;
  lastLogin: Date;
}
```

#### `drivers`
```typescript
interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  status: 'available' | 'on-trip' | 'offline';
  location?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  rating: number;
  totalRides: number;
  createdAt: Date;
}
```

#### `analytics`
```typescript
interface AnalyticsEvent {
  id: string;
  type: 'interaction' | 'error';
  interactionType?: string;
  element?: string;
  page: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}
```

---

## 🔌 API Endpoints

### Booking Management
- `POST /api/estimate-fare` - Calculate fare for a route
- `POST /api/create-checkout-session` - Create Square payment session
- `POST /api/send-confirmation` - Send booking confirmation
- `GET /api/bookings` - List all bookings (admin)
- `PUT /api/bookings/[id]` - Update booking status

### Customer Management
- `POST /api/places-autocomplete` - Google Places autocomplete
- `POST /api/send-feedback-request` - Request customer feedback
- `GET /api/booking/[id]` - Get booking details

### Admin Functions
- `GET /api/analytics/summary` - Get analytics summary
- `POST /api/analytics/interaction` - Log user interaction
- `POST /api/analytics/error` - Log error event
- `POST /api/ai-assistant` - AI assistant chat

### Driver Management
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/[id]` - Update driver status
- `POST /api/drivers/[id]/location` - Update driver location

---

## 🧪 Testing

### Test Types
- **Unit Tests:** Business logic and utilities
- **Integration Tests:** API endpoints
- **E2E Tests:** Complete user flows
- **Visual Tests:** UI consistency

### Running Tests
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:e2e
npm run test:visual

# Run with UI
npm run test:ui

# Update snapshots
npm run test:update
```

### Test Files
- `tests/customer-pages-optimized.spec.ts` - Customer flow tests
- `tests/visual.spec.ts` - Visual regression tests
- `scripts/smoke-test.js` - Basic functionality tests

---

## 🚀 Deployment

### Production Deployment
```bash
# Build application
npm run build

# Deploy to Vercel
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Environment Setup
1. **Vercel Project**
   - Connect GitHub repository
   - Set environment variables
   - Configure custom domain

2. **Firebase Setup**
   - Enable Firestore
   - Set up security rules
   - Configure authentication

3. **External Services**
   - Square webhook configuration
   - Twilio phone number setup
   - Google Maps API key

### Monitoring
- **Analytics Dashboard:** `/admin/analytics`
- **Error Tracking:** Custom error monitoring
- **Performance:** Vercel Analytics
- **Uptime:** Custom monitoring script

---

## 🔒 Security

### Authentication
- Firebase Auth for user management
- Role-based access control (admin, driver, customer)
- Session management with secure tokens

### Data Protection
- Input validation on all endpoints
- SQL injection prevention (Firestore)
- XSS protection with DOMPurify
- CSRF protection with Next.js

### Payment Security
- Square webhook signature verification
- Secure payment processing
- PCI compliance through Square

---

## 📈 Performance

### Optimization Strategies
- **Code Splitting:** Automatic with Next.js
- **Image Optimization:** Next.js Image component
- **Caching:** Static generation where possible
- **CDN:** Vercel Edge Network

### Monitoring
- **Core Web Vitals:** Tracked via analytics
- **API Response Times:** Monitored in dashboard
- **Error Rates:** Real-time tracking
- **User Interactions:** Comprehensive analytics

---

## 🛠️ Development Guidelines

### Code Style
- **TypeScript:** Strict mode enabled
- **ESLint:** Enforced code quality
- **Prettier:** Consistent formatting
- **Conventional Commits:** Standard commit messages

### Component Patterns
- **Functional Components:** Use hooks for state
- **Error Boundaries:** Wrap critical components
- **Loading States:** Show progress indicators
- **Accessibility:** ARIA labels and keyboard navigation

### State Management
- **React Hooks:** Local component state
- **Context API:** Global state (auth, theme)
- **Firestore:** Real-time data synchronization

---

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Firebase Connection
```bash
# Check environment variables
echo $NEXT_PUBLIC_FIREBASE_API_KEY

# Test connection
npm run test:smoke
```

#### Payment Issues
- Verify Square webhook configuration
- Check payment status in Square dashboard
- Review webhook logs in Vercel

#### SMS Delivery
- Confirm Twilio credentials
- Check phone number format
- Review Twilio logs

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug_analytics', 'true');
localStorage.setItem('debug_payments', 'true');
```

---

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Square API Documentation](https://developer.squareup.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)

### Tools
- **Firebase Console:** Database and auth management
- **Square Dashboard:** Payment and business management
- **Vercel Dashboard:** Deployment and analytics
- **GitHub:** Code repository and project management

---

## 🔄 Maintenance

### Regular Tasks
- **Daily:** Check error logs and analytics
- **Weekly:** Review performance metrics
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Review and update documentation

### Backup Strategy
- **Database:** Daily automated backups
- **Code:** Version control with GitHub
- **Configuration:** Environment variables documented
- **Deployment:** Vercel deployment history

---

## 📞 Support

### Technical Support
- **Developer:** Justin (primary)
- **Documentation:** This guide and inline comments
- **Community:** GitHub Issues and Discussions

### Emergency Contacts
- **Vercel Support:** For deployment issues
- **Firebase Support:** For database/auth issues
- **Square Support:** For payment issues
- **Twilio Support:** For SMS issues

---

**Last Updated:** [Date]
**Version:** 1.0.0 