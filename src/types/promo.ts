export interface PromoCode {
  id?: string;
  code: string; // uppercase unique
  type: 'percent' | 'flat';
  value: number; // 10 = 10% or $10
  expiresAt?: Date;
  usageLimit?: number; // max redemptions
  usageCount: number; // current redemptions
  createdAt: Date;
} 