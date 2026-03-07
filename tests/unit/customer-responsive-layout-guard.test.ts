import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const filesThatMustAvoidHardViewportMinimums = [
  'src/app/(customer)/booking/[id]/BookingDetailClient.tsx',
  'src/app/(customer)/manage/[id]/ManageBookingClient.tsx',
  'src/components/business/AddToCalendarButton.tsx',
];

describe('customer responsive layout guard', () => {
  it('prevents fixed min widths that can overflow narrow viewports', () => {
    for (const relativePath of filesThatMustAvoidHardViewportMinimums) {
      const absolutePath = path.join(process.cwd(), relativePath);
      const source = fs.readFileSync(absolutePath, 'utf8');

      expect(source, `${relativePath} should not use fixed minmax columns that overflow mobile widths`).not.toContain(
        'minmax(220px, 1fr)'
      );
      expect(source, `${relativePath} should not use a fixed 200px min-width that can overflow narrow screens`).not.toContain(
        'min-width: 200px'
      );
    }
  });
});
