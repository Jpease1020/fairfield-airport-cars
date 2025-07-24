# Environment Setup

## Overview
This guide helps developers set up the Fairfield Airport Cars development environment.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Firebase CLI** (for deployment)
- **Code editor** (VS Code recommended)

### Required Accounts
- **Firebase** - Backend services
- **Google Cloud** - Maps API
- **Square** - Payment processing
- **Twilio** - SMS services
- **OpenAI** - AI assistant (optional)

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd fairfield-airport-cars
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key

# Square Configuration
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key

# Admin Authentication
ADMIN_EMAIL=admin@fairfieldairportcars.com
ADMIN_PASSWORD=your_admin_password
```

### 4. Firebase Setup

#### Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase (if not already done)
```bash
firebase init
```

#### Set up Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Database Setup

#### Initialize CMS
```bash
npm run init-cms
```

This will create the initial CMS content in Firestore.

### 6. Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. Create API credentials
5. Add your domain to the API key restrictions

### 7. Square Setup

1. Create a Square Developer account
2. Create a new application
3. Get your access token and environment settings
4. Set up webhook endpoints for payment notifications

### 8. Twilio Setup

1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Configure webhook endpoints

## Development Commands

### Start Development Server
```bash
npm run dev
# or
yarn dev
```

### Build for Production
```bash
npm run build
# or
yarn build
```

### Run Tests
```bash
npm run test
# or
yarn test
```

### Lint Code
```bash
npm run lint
# or
yarn lint
```

## Project Structure

```
fairfield-airport-cars/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   ├── lib/                # Service and utility functions
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── docs/                   # Documentation
├── public/                 # Static assets
└── scripts/                # Build and deployment scripts
```

## Common Issues

### Firebase Connection Issues
- Verify your Firebase configuration
- Check if your project is on the correct plan
- Ensure Firestore is enabled

### Google Maps API Issues
- Verify API key is correct
- Check API quotas and billing
- Ensure required APIs are enabled

### Payment Testing
- Use Square sandbox environment for testing
- Test with Square's test card numbers
- Verify webhook endpoints are accessible

### Email/SMS Issues
- Check SMTP settings for email
- Verify Twilio credentials
- Test with development phone numbers

## Development Workflow

### 1. Feature Development
1. Create a new branch
2. Make your changes
3. Test locally
4. Update documentation
5. Create pull request

### 2. Testing
1. Run unit tests
2. Test integration points
3. Verify UI/UX
4. Check accessibility

### 3. Deployment
1. Test in staging environment
2. Deploy to production
3. Monitor for issues
4. Update documentation

## Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase configuration | Yes |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google Maps API | Yes |
| `SQUARE_ACCESS_TOKEN` | Square payments | Yes |
| `TWILIO_ACCOUNT_SID` | SMS notifications | Yes |
| `EMAIL_HOST` | Email sending | Yes |
| `OPENAI_API_KEY` | AI assistant | No |
| `ADMIN_EMAIL` | Admin authentication | Yes |

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly

### API Keys
- Restrict API keys to specific domains
- Use environment-specific keys
- Monitor API usage

### Database Security
- Use Firestore security rules
- Validate all user inputs
- Implement proper authentication

## Troubleshooting

### Common Errors

#### "Firebase not initialized"
- Check Firebase configuration
- Verify environment variables

#### "Google Maps not loading"
- Verify API key
- Check API quotas
- Ensure HTTPS in production

#### "Payment processing failed"
- Check Square credentials
- Verify webhook endpoints
- Test with sandbox environment

#### "SMS not sending"
- Verify Twilio credentials
- Check phone number format
- Test with development numbers

### Getting Help
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review [API Documentation](./api-documentation.md)
3. Check GitHub issues
4. Contact the development team 