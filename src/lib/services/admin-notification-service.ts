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

    console.log('📞 [ADMIN SMS] Checking admin phone configuration...');
    console.log('📞 [ADMIN SMS] Business settings:', JSON.stringify(businessSettings?.company || {}, null, 2));
    console.log('📞 [ADMIN SMS] Admin phone:', adminPhone);

    if (!adminPhone) {
      console.warn('⚠️ [ADMIN SMS] Admin phone number not configured in CMS. SMS notification skipped.');
      console.warn('⚠️ [ADMIN SMS] Please set adminPhone in Business Settings → Company → Admin Phone Number');
      return;
    }

    console.log(`📤 [ADMIN SMS] Attempting to send SMS to ${adminPhone}...`);
    console.log(`📤 [ADMIN SMS] Message: ${message}`);

    // Send SMS using Twilio service
    const result = await sendSms({
      to: adminPhone,
      body: message
    });

    console.log(`✅ [ADMIN SMS] SMS sent successfully to ${adminPhone}`);
    console.log(`✅ [ADMIN SMS] Twilio message SID: ${result.sid}`);
  } catch (error) {
    // Don't throw - SMS failures should not break booking operations
    console.error('❌ [ADMIN SMS] Failed to send admin SMS notification:', error);
    console.error('❌ [ADMIN SMS] Error details:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('❌ [ADMIN SMS] Stack trace:', error.stack);
    }
  }
}

