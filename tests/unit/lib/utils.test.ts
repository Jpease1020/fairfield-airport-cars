import { cn } from '@/lib/utils/utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
      expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500');
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-sm', 'text-lg', 'text-base')).toBe('text-base');
    });

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
    });

    it('should handle empty and undefined values', () => {
      expect(cn('base-class', '', undefined, null)).toBe('base-class');
      expect(cn('', undefined, null, 'base-class')).toBe('base-class');
    });
  });
}); 