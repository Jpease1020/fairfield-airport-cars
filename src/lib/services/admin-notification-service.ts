/**
 * Admin SMS Notification Service
 * 
 * Sends SMS notifications to Gregg (admin) for all booking interactions.
 */

import { sendSms } from './twilio-service';
import { cmsFlattenedService } from './cms-service';

/**
 * Send SMS notification to admin (Gregg)
 * @param message - The message to send
 */
export async function sendAdminSms(message: string): Promise<void> {
  try {
    // Get admin phone from business settings
    const businessSettings = await cmsFlattenedService.getBusinessSettings();
    const adminPhone = businessSettings?.company?.adminPhone;

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

