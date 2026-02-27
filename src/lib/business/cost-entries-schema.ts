/**
 * Shared cost entry schema and enums (client-safe).
 * Server logic in cost-entries-service.ts.
 */

import { z } from 'zod';

export const COST_PROVIDERS = ['twilio', 'square', 'firebase', 'vercel', 'google-cloud', 'sendgrid', 'other'] as const;
export const COST_CATEGORIES = ['sms', 'email', 'hosting', 'database', 'maps', 'processing-fee', 'other'] as const;

export const costEntrySchema = z.object({
  id: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM'),
  provider: z.enum(COST_PROVIDERS),
  category: z.enum(COST_CATEGORIES),
  amount: z.number().positive('amount must be positive'),
  notes: z.string().max(500).optional(),
  invoiceUrl: z.string().url().optional().or(z.literal('')),
  createdAt: z.union([z.date(), z.any()]).optional(),
  createdBy: z.string().optional(),
});

export type CostEntry = z.infer<typeof costEntrySchema>;
