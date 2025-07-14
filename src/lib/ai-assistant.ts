import { listBookings } from '@/lib/booking-service';
import { getCMSConfig } from '@/lib/cms-service';
import { getSettings } from '@/lib/settings-service';
import { Booking } from '@/types/booking';
import OpenAI from 'openai';

export interface AIAssistantContext {
  bookings: Booking[];
  cmsConfig: any;
  settings: any;
  todayBookings: Booking[];
  businessInfo: any;
}

export const getAIAssistantContext = async (): Promise<AIAssistantContext> => {
  const [bookings, cmsConfig, settings] = await Promise.all([
    listBookings(),
    getCMSConfig(),
    getSettings()
  ]);

  const today = new Date();
  const todayBookings = bookings.filter((booking: Booking) => {
    const bookingDate = new Date(booking.pickupDateTime);
    return bookingDate.toDateString() === today.toDateString();
  });

  return {
    bookings,
    cmsConfig,
    settings,
    todayBookings,
    businessInfo: cmsConfig.business.company
  };
};

// Enhanced AI response with OpenAI integration
export const generateAIResponse = async (message: string, context: AIAssistantContext) => {
  // Try OpenAI first if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(message, context);
    } catch (error) {
      console.error('OpenAI call failed, falling back to local logic:', error);
      // Fall back to local logic
    }
  }
  
  // Local fallback logic
  return generateLocalResponse(message, context);
};

// OpenAI integration
export const callOpenAI = async (message: string, context: AIAssistantContext) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = `You are Gregg's AI assistant for his car service business in Fairfield, CT. You help him manage bookings, customers, and business operations. You also have knowledge about the technical aspects of the app.

Current business context:
- Company: ${context.businessInfo.name}
- Phone: ${context.businessInfo.phone}
- Email: ${context.businessInfo.email}
- Today's bookings: ${context.todayBookings.length}
- Base fare: $${context.settings.baseFare}
- Per mile rate: $${context.settings.perMile}
- Deposit percentage: ${context.settings.depositPercent}%

Available actions:
- View bookings: Admin → Bookings
- Update business info: Admin → CMS → Business Settings
- Change pricing: Admin → CMS → Pricing
- Send customer messages: Admin → Bookings → Click booking → Send Message
- Update website content: Admin → CMS → Pages

Technical knowledge about the app:
- Built with Next.js 15, TypeScript, and Tailwind CSS
- Backend: Firebase (Firestore database, Authentication)
- Payments: Square integration for secure payment processing
- SMS: Twilio for customer notifications
- Email: SMTP (Gmail/Google Workspace) for confirmations
- Maps: Google Maps API for location services
- Hosting: Vercel for deployment
- Database: Firestore (NoSQL) for bookings, CMS, settings
- Admin authentication: Firebase Auth with email/password
- Voice features: Web Speech API for AI assistant
- AI: OpenAI integration (optional) with local fallback
- Mobile-responsive design with modern UI components

Be helpful, professional, and provide specific actionable advice. Keep responses concise but informative. You can explain both business operations and technical aspects of the app.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: message
      }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";
};

// Local fallback logic
export const generateLocalResponse = async (message: string, context: AIAssistantContext) => {
  const lowerMessage = message.toLowerCase();
  
  // Business information responses
  if (lowerMessage.includes('business') || lowerMessage.includes('company') || lowerMessage.includes('contact')) {
    const business = context.businessInfo;
    return `Your business information:\n\n• Company: ${business.name}\n• Phone: ${business.phone}\n• Email: ${business.email}\n• Address: ${business.address}\n• Hours: ${business.hours}\n\nTo update this information, go to Admin → CMS → Business Settings.`;
  }

  // Booking management responses
  if (lowerMessage.includes('booking') || lowerMessage.includes('ride') || lowerMessage.includes('today')) {
    if (context.todayBookings.length === 0) {
      return `You have no bookings scheduled for today. To view all bookings, go to Admin → Bookings.`;
    }
    
    const bookingList = context.todayBookings.map((booking: Booking) => 
      `• ${booking.name} - ${new Date(booking.pickupDateTime).toLocaleTimeString()} (${booking.status})`
    ).join('\n');
    
    return `You have ${context.todayBookings.length} booking(s) today:\n\n${bookingList}\n\nTo manage bookings, go to Admin → Bookings.`;
  }

  // Customer communication responses
  if (lowerMessage.includes('message') || lowerMessage.includes('sms') || lowerMessage.includes('contact customer')) {
    return `To send a message to a customer:\n\n1. Go to Admin → Bookings\n2. Click on any booking\n3. Use the "Send Message" feature\n\nCustomers automatically receive:\n• Booking confirmations (SMS + email)\n• 24-hour reminders\n• Cancellation confirmations\n• Feedback requests after rides`;
  }

  // Pricing responses
  if (lowerMessage.includes('pricing') || lowerMessage.includes('fare') || lowerMessage.includes('rate')) {
    return `Current pricing:\n\n• Base fare: $${context.settings.baseFare}\n• Per mile: $${context.settings.perMile}\n• Per minute: $${context.settings.perMinute}\n• Deposit: ${context.settings.depositPercent}%\n\nTo change pricing, go to Admin → CMS → Pricing.`;
  }

  // Payment responses
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('square')) {
    return `Payment process:\n\n1. Customer books → pays 50% deposit via Square\n2. You confirm → customer gets confirmation\n3. After ride → collect remaining balance\n4. Tips → handled through Square checkout\n\nCheck your Square dashboard for payment history.`;
  }

  // Cancellation responses
  if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
    return `Cancellation policy:\n\n• >24 hours: Full refund\n• 3-24 hours: 50% refund\n• <3 hours: No refund\n\nCustomers can cancel through their booking link, or you can cancel manually in Admin → Bookings.`;
  }

  // Website content responses
  if (lowerMessage.includes('website') || lowerMessage.includes('homepage') || lowerMessage.includes('content')) {
    return `To update your website content:\n\n• Homepage: Admin → CMS → Pages → Homepage\n• Help/FAQ: Admin → CMS → Pages → Help Page\n• Business info: Admin → CMS → Business Settings\n• Email/SMS templates: Admin → CMS → Communication`;
  }

  // Technical questions about the app
  if (lowerMessage.includes('app') || lowerMessage.includes('built') || lowerMessage.includes('technology') || lowerMessage.includes('tech') || lowerMessage.includes('code')) {
    return `The Fairfield Airport Cars app is built with:\n\n**Frontend:**\n• Next.js 15 (React framework)\n• TypeScript (type-safe JavaScript)\n• Tailwind CSS (styling)\n• Mobile-responsive design\n\n**Backend:**\n• Firebase Firestore (database)\n• Firebase Authentication (admin login)\n• Next.js API routes (server-side logic)\n\n**Integrations:**\n• Square (payments)\n• Twilio (SMS notifications)\n• Google Maps (location services)\n• SMTP email (confirmations)\n• OpenAI (AI assistant)\n\n**Hosting:**\n• Vercel (deployment and hosting)\n• Automatic deployments from GitHub\n\n**Features:**\n• Real-time booking management\n• CMS for editable content\n• Voice-enabled AI assistant\n• Mobile-optimized booking form\n• Admin dashboard with analytics`;
  }

  // Database questions
  if (lowerMessage.includes('database') || lowerMessage.includes('data') || lowerMessage.includes('firebase') || lowerMessage.includes('firestore')) {
    return `The app uses Firebase Firestore as the database:\n\n**What's stored:**\n• Customer bookings and details\n• Business settings and pricing\n• CMS content (pages, business info)\n• Promotional codes\n• Admin user accounts\n\n**Data structure:**\n• Bookings collection (customer info, rides, payments)\n• Settings collection (pricing, business config)\n• CMS collection (website content)\n• Users collection (admin accounts)\n\n**Backup:**\n• Automatic daily backups\n• Data export available\n• Real-time synchronization`;
  }

  // Security questions
  if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('password')) {
    return `Security features:\n\n**Data Protection:**\n• All sensitive data encrypted\n• API keys stored server-side only\n• HTTPS required for all connections\n• Admin authentication required\n\n**Payment Security:**\n• Square handles all payment processing\n• No credit card data stored in app\n• PCI compliant payment system\n\n**Admin Access:**\n• Firebase Authentication\n• Email/password login\n• Session management\n• Secure admin routes\n\n**Customer Data:**\n• Customer info encrypted in database\n• SMS/email sent securely\n• Booking confirmations via secure channels`;
  }

  // Deployment questions
  if (lowerMessage.includes('deploy') || lowerMessage.includes('host') || lowerMessage.includes('server') || lowerMessage.includes('vercel')) {
    return `The app is deployed on Vercel:\n\n**Deployment:**\n• Automatic deployments from GitHub\n• Zero-downtime updates\n• Global CDN for fast loading\n• SSL certificates included\n\n**Environment:**\n• Production: https://your-domain.vercel.app\n• Development: Local development server\n• Environment variables for secrets\n\n**Monitoring:**\n• Vercel analytics included\n• Error tracking and logging\n• Performance monitoring\n• Uptime monitoring`;
  }

  // Troubleshooting responses
  if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('not working') || lowerMessage.includes('error')) {
    return `Common troubleshooting:\n\n**Booking Issues:**\n• Check Google Maps API key configuration\n• Verify Square credentials are set\n• Ensure Firebase connection is working\n\n**Email/SMS Issues:**\n• Check SMTP credentials (Gmail/Google Workspace)\n• Verify Twilio credentials for SMS\n• Test email templates in CMS\n\n**Admin Access:**\n• Reset password via Firebase console\n• Check admin email configuration\n• Verify authentication settings\n\n**Technical Issues:**\n• Check Vercel deployment logs\n• Verify environment variables\n• Contact developer for complex issues`;
  }

  // General help
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return `I can help you with:\n\n**Business Operations:**\n• Managing bookings and customers\n• Updating website content\n• Understanding your business data\n• Setting up payments and communications\n\n**Technical Questions:**\n• How the app is built and deployed\n• Database structure and security\n• Integration details (Square, Twilio, etc.)\n• Troubleshooting technical issues\n\nTry asking about bookings, pricing, payments, website updates, or technical aspects of the app!`;
  }

  // Default response
  return `I understand you're asking about "${message}". Let me help you with that. Could you be more specific? I can help with:\n\n• Booking management\n• Business information\n• Customer communication\n• Pricing and payments\n• Website content\n• Technical aspects of the app\n• Troubleshooting issues`;
};

// Future: Integrate with external AI services
export const callExternalAI = async (message: string, context: AIAssistantContext) => {
  // This could integrate with OpenAI, Anthropic, or other AI services
  // For now, we'll use our local logic
  return generateAIResponse(message, context);
}; 