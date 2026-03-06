import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const filesThatMustUseSharedFormatter = [
  'src/app/api/booking/submit/route.ts',
  'src/app/api/booking/cancel-booking/route.ts',
  'src/app/api/payment/process-payment/route.ts',
  'src/app/api/notifications/send-confirmation/route.ts',
  'src/lib/services/email-service.ts',
  'src/lib/services/driver-notification-service.ts',
  'src/app/(customer)/booking/[id]/BookingDetailClient.tsx',
  'src/components/booking/ConfirmationCard.tsx',
  'src/app/(admin)/admin/AdminDashboardClient.tsx',
];

describe('booking time formatting guard', () => {
  it('prevents direct locale date formatting in booking communication paths', () => {
    for (const relativePath of filesThatMustUseSharedFormatter) {
      const absolutePath = path.join(process.cwd(), relativePath);
      const source = fs.readFileSync(absolutePath, 'utf8');

      expect(source, `${relativePath} should not use toLocaleString directly`).not.toContain('.toLocaleString(');
      expect(source, `${relativePath} should not use toLocaleDateString directly`).not.toContain('.toLocaleDateString(');
      expect(source, `${relativePath} should not use toLocaleTimeString directly`).not.toContain('.toLocaleTimeString(');
    }
  });
});
