/**
 * Admin config: business profile and notification preferences.
 * Firestore: config/businessProfile, config/notifications.
 */

import { z } from 'zod';

export const businessProfileSchema = z.object({
  businessName: z.string().max(200).optional(),
  primaryPhone: z.string().max(50).optional(),
  primaryEmail: z.string().email().max(200).optional(),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
});
export type BusinessProfile = z.infer<typeof businessProfileSchema>;

export const notificationsConfigSchema = z.object({
  adminPhones: z.array(z.string().max(50)).max(5).optional(),
  adminEmails: z.array(z.string().email()).max(5).optional(),
  channels: z.object({
    sms: z.boolean().optional(),
    email: z.boolean().optional(),
    tracking: z.boolean().optional(),
    feedback: z.boolean().optional(),
  }).optional(),
});
export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: 'Fairfield Airport Cars',
  primaryPhone: '',
  primaryEmail: '',
  websiteUrl: '',
};

const DEFAULT_NOTIFICATIONS: NotificationsConfig = {
  adminPhones: [],
  adminEmails: [],
  channels: { sms: true, email: true, tracking: true, feedback: true },
};

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const snap = await getAdminDb().collection('config').doc('businessProfile').get();
  if (!snap.exists) return DEFAULT_PROFILE;
  const data = snap.data();
  const parsed = businessProfileSchema.safeParse({
    businessName: data?.businessName ?? DEFAULT_PROFILE.businessName,
    primaryPhone: data?.primaryPhone ?? DEFAULT_PROFILE.primaryPhone,
    primaryEmail: data?.primaryEmail ?? DEFAULT_PROFILE.primaryEmail,
    websiteUrl: data?.websiteUrl ?? DEFAULT_PROFILE.websiteUrl,
  });
  return parsed.success ? parsed.data : DEFAULT_PROFILE;
}

export async function saveBusinessProfile(profile: Partial<BusinessProfile>): Promise<void> {
  const merged = { ...DEFAULT_PROFILE, ...profile };
  const validated = businessProfileSchema.parse(merged);
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const { FieldValue } = await import('firebase-admin/firestore');
  await getAdminDb().collection('config').doc('businessProfile').set({
    ...validated,
    websiteUrl: validated.websiteUrl ?? '',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function getNotificationsConfig(): Promise<NotificationsConfig> {
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const snap = await getAdminDb().collection('config').doc('notifications').get();
  if (!snap.exists) return DEFAULT_NOTIFICATIONS;
  const data = snap.data();
  const parsed = notificationsConfigSchema.safeParse({
    adminPhones: data?.adminPhones ?? DEFAULT_NOTIFICATIONS.adminPhones,
    adminEmails: data?.adminEmails ?? DEFAULT_NOTIFICATIONS.adminEmails,
    channels: { ...DEFAULT_NOTIFICATIONS.channels, ...data?.channels },
  });
  return parsed.success ? parsed.data : DEFAULT_NOTIFICATIONS;
}

export async function saveNotificationsConfig(config: Partial<NotificationsConfig>): Promise<void> {
  const current = await getNotificationsConfig();
  const merged = {
    adminPhones: config.adminPhones ?? current.adminPhones,
    adminEmails: config.adminEmails ?? current.adminEmails,
    channels: { ...current.channels, ...config.channels },
  };
  const validated = notificationsConfigSchema.parse(merged);
  const { getAdminDb } = await import('@/lib/utils/firebase-admin');
  const { FieldValue } = await import('firebase-admin/firestore');
  await getAdminDb().collection('config').doc('notifications').set({
    ...validated,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}
