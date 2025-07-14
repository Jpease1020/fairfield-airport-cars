# Fairfield Airport Car Service

A modern, mobile-friendly booking platform for airport car service in Fairfield, CT. Built with Next.js 15, TypeScript, Firebase, and integrated with Square payments, Twilio SMS, and Google Maps.

## Features

### For Customers
- **Mobile-friendly booking form** with Google Maps integration
- **Real-time fare calculation** based on distance and time
- **Secure payment processing** via Square
- **Automatic confirmations** via SMS and email
- **Booking management** with status tracking
- **24-hour reminders** and feedback requests

### For Gregg (Admin)
- **Admin dashboard** with booking management
- **CMS for editable content** (business info, pricing, pages)
- **AI Assistant** with voice input/output capabilities
- **Customer communication tools** (SMS/email)
- **Payment tracking** and Square integration
- **Calendar view** of all bookings

## CMS & Edit Mode Patterns

### Floating Admin Edit Mode
- **Toggle Edit Mode**: Admins see a floating "Edit Mode" button on all customer-facing pages. Clicking it enables inline editing for all content on that page.
- **Inline Editing**: When edit mode is active, all editable fields (titles, subtitles, form labels, FAQ items, etc.) become input fields or textareas, styled for clarity.
- **Save/Cancel**: Admins can save changes (which update the CMS and reflect instantly) or cancel to revert edits.
- **Admin Detection**: Only authorized admin users (e.g., justin@fairfieldairportcar.com, gregg@fairfieldairportcar.com) see the edit controls.

### List of Content-Editable Pages
All major customer-facing pages are fully content-editable via the CMS:
1. **Homepage** – Hero, features, fleet, FAQ, contact, final CTA
2. **Booking Form** – Page headers, form labels, buttons, error messages
3. **Help/FAQ** – FAQ items, contact info, categories
4. **Success Page** – Payment success, status labels, buttons
5. **Booking Details** – Confirmation messages, action buttons, alerts
6. **Feedback Page** – Rating interface, form fields, success/error messages
7. **Cancel Page** – Error messages and instructions
8. **Manage Booking Page** – Action buttons, confirmations, messages
9. **Status Page** – Progress steps, status descriptions, alerts

### Admin CMS Interface
- **Comprehensive Forms**: All content is editable through organized forms at `/admin/cms/pages`.
- **Type Safety**: All content is fully typed with TypeScript interfaces for safety and validation.
- **Default Content**: Each page has fallback content to ensure the site always works.
- **Real-Time Preview**: Changes are reflected immediately on the live site.

### Example Edit Mode Flow
1. Admin logs in and visits any customer-facing page.
2. "Edit Mode" button appears (floating at top-right).
3. Admin clicks to enable edit mode; all editable content becomes input fields.
4. Admin makes changes, then clicks "Save" (or "Cancel" to revert).
5. Changes are saved to the CMS and instantly reflected for all users.

## AI Assistant Features

The AI Assistant provides Gregg with intelligent help for his business:

### Voice Integration
- **Voice Input**: Click the microphone button to speak questions
- **Voice Output**: Click the speaker button to hear responses aloud
- **Hands-free operation**: Perfect for when driving or multitasking

### AI Capabilities
- **OpenAI Integration**: Sophisticated responses using GPT-4 (optional)
- **Local Fallback**: Works without external AI when needed
- **Business Context**: Access to real-time bookings, pricing, and settings
- **Actionable Advice**: Specific guidance for common business tasks

### What the AI Can Help With
- Booking management and customer questions
- Business information updates
- Pricing and payment questions
- Website content management
- Technical troubleshooting
- Customer communication strategies

## Environment Variables

### Required
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key

# Square
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox_or_production
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email (SMTP)
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
EMAIL_FROM=your_from_email_address

# Admin Authentication
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password_hash
```

### Optional (for enhanced AI)
```env
# OpenAI (for enhanced AI responses)
OPENAI_API_KEY=your_openai_api_key
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fairfield-airport-cars
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all required environment variables

4. **Initialize the database**
   ```bash
   npm run init-cms
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Customer booking: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`
   - AI Assistant: `http://localhost:3000/admin/ai-assistant`

## AI Assistant Setup

### Basic Setup (Local AI)
The AI assistant works out of the box with local response logic. No additional setup required.

### Enhanced Setup (OpenAI)
For more sophisticated responses:

1. **Get an OpenAI API key** from [OpenAI Platform](https://platform.openai.com/)
2. **Add to environment variables**:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
3. **Restart the development server**

The AI will automatically use OpenAI when available, with local fallback when not.

## Voice Features

### Voice Input
- Click the microphone button to start voice recognition
- Speak your question clearly
- The AI will process your spoken question and respond

### Voice Output
- Click the speaker button next to any AI response to hear it aloud
- Perfect for hands-free operation while driving
- Automatically stops when you click again

### Browser Support
- **Voice Input**: Works in Chrome, Edge, Safari (webkitSpeechRecognition)
- **Voice Output**: Works in all modern browsers (SpeechSynthesis)
- Graceful fallback for unsupported browsers

## Admin Features

### Dashboard
- View all bookings with status tracking
- Calendar view of scheduled rides
- Customer contact information
- Payment status tracking

### CMS (Content Management System)
- **Business Settings**: Update company info, contact details
- **Pricing**: Adjust base fare, per-mile rates, deposit percentage
- **Pages**: Edit homepage, help page, and other content
- **Communication**: Customize email and SMS templates

### AI Assistant
- **Voice-enabled chat interface**
- **Real-time business context**
- **Quick question suggestions**
- **Actionable business advice**

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Set up environment variables
- Build with `npm run build`
- Start with `npm start`

## Security

- All sensitive tokens kept server-side
- API routes handle secure operations
- Admin authentication required for sensitive areas
- HTTPS required for production

## Support

For technical support or questions about the AI assistant, contact your developer.

## License

Private - Fairfield Airport Car Service
