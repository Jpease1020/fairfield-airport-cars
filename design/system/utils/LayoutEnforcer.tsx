import React from 'react';

/**
 * LayoutEnforcer - Ensures all pages follow design system rules
 * 
 * This component validates that pages are using proper layout patterns
 * and provides helpful warnings in development mode.
 */

interface LayoutValidationProps {
  children: React.ReactNode;
}

export const LayoutEnforcer: React.FC<LayoutValidationProps> = ({ children }) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check for common design system violations
      const violations: string[] = [];
      
      // Check for inline styles
      const elementsWithInlineStyles = document.querySelectorAll('[style]');
      if (elementsWithInlineStyles.length > 0) {
        violations.push(`❌ Found ${elementsWithInlineStyles.length} elements with inline styles. Use CSS classes instead.`);
      }
      
      // Check for Tailwind classes (should use standard CSS)
      const elementsWithTailwind = document.querySelectorAll('[class*="flex-"], [class*="grid-"], [class*="text-"], [class*="bg-"], [class*="p-"], [class*="m-"]');
      const tailwindViolations = Array.from(elementsWithTailwind).filter(el => {
        const classes = el.className;
        return classes.includes('flex-') || classes.includes('grid-') || 
               classes.includes('text-') || classes.includes('bg-') ||
               classes.includes('p-') || classes.includes('m-');
      });
      
      if (tailwindViolations.length > 0) {
        violations.push(`⚠️ Found potential Tailwind classes. Use standard CSS classes instead.`);
      }
      
      // Check for missing layout wrapper
      const hasStandardLayout = document.querySelector('.standard-layout');
      if (!hasStandardLayout) {
        violations.push(`❌ Page missing .standard-layout wrapper. All pages must use UniversalLayout.`);
      }
      
      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let hasH1 = false;
      headings.forEach(heading => {
        if (heading.tagName === 'H1') hasH1 = true;
      });
      
      if (!hasH1 && headings.length > 0) {
        violations.push(`⚠️ Page should have exactly one H1 heading.`);
      }
      
      // Log violations
      if (violations.length > 0) {
        console.group('🎨 Design System Violations');
        violations.forEach(violation => console.warn(violation));
        console.groupEnd();
      } else {
        console.log('✅ Design system compliance check passed!');
      }
    }
  }, []);

  return <>{children}</>;
};

/**
 * Design System Rules Enforcer
 * 
 * Add this to your page components to ensure they follow design system rules:
 * 
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <LayoutEnforcer>
 *       <UniversalLayout title="My Page">
 *         <div >
 *           // Your content here
 *         </div>
 *       </UniversalLayout>
 *     </LayoutEnforcer>
 *   );
 * }
 * ```
 */ 