/**
 * Admin SMS Notification Service
 * 
 * Sends SMS notifications to Gregg (admin) for all booking interactions.
 */

import { sendSms } from './twilio-service';
import { getBusinessConfig } from '@/lib/config/business-config';

/**
 * Send SMS notification to admin (Gregg)
 * @param message - The message to send
 */
export async function sendAdminSms(message: string): Promise<void> {
  try {
    const business = getBusinessConfig();
    const adminPhone = business.adminPhone;

    if (!adminPhone) {
      console.warn('⚠️ Admin phone number not configured. SMS notification skipped.');
      return;
    }

    // Send SMS using Twilio service
    await sendSms({
      to: adminPhone,
      body: message
    });

    console.log(`✅ Admin SMS sent to ${adminPhone}`);
  } catch (error) {
    // Don't throw - SMS failures should not break booking operations
    console.error('❌ Failed to send admin SMS notification:', error);
  }
}
