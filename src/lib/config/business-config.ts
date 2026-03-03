import { APP_CONFIG, BUSINESS_CONTACT } from '@/utils/constants';

export interface BusinessConfig {
  name: string;
  phone: string;
  email: string;
  adminPhone?: string;
}

export const getBusinessConfig = (): BusinessConfig => ({
  name: APP_CONFIG.name,
  phone: BUSINESS_CONTACT.phone,
  email: BUSINESS_CONTACT.ridesEmail,
  adminPhone:
    process.env.ADMIN_ALERT_PHONE ||
    process.env.NOTIFICATION_ALERT_PHONE ||
    process.env.GREGG_SMS_FORWARD_NUMBER,
});
