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

  const systemPrompt = `You are Gregg's AI assistant for his car service business in Fairfield, CT. You help him manage bookings, customers, and business operations.

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

Be helpful, professional, and provide specific actionable advice. Keep responses concise but informative.`;

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

  // Technical support responses
  if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('not working')) {
    return `Common troubleshooting:\n\n• Booking form not working? Check Google Maps API key\n• SMS/email not sending? Check Twilio and email credentials\n• Payments not processing? Verify Square credentials\n• Admin login issues? Contact your developer\n\nFor technical support, contact your developer.`;
  }

  // General help
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return `I can help you with:\n\n• Managing bookings and customers\n• Updating website content\n• Understanding your business data\n• Troubleshooting technical issues\n• Setting up payments and communications\n\nTry asking about bookings, pricing, payments, or website updates!`;
  }

  // Default response
  return `I understand you're asking about "${message}". Let me help you with that. Could you be more specific? I can help with:\n\n• Booking management\n• Business information\n• Customer communication\n• Pricing and payments\n• Website content\n• Technical issues`;
};

// Future: Integrate with external AI services
export const callExternalAI = async (message: string, context: AIAssistantContext) => {
  // This could integrate with OpenAI, Anthropic, or other AI services
  // For now, we'll use our local logic
  return generateAIResponse(message, context);
}; 