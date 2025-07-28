module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Design System Enforcement Rules
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="style"]',
        message: '❌ Inline styles are forbidden. Use CSS classes from standard-layout.css instead.'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="flex-"])',
        message: '❌ Tailwind flex classes are forbidden. Use standard CSS classes instead.'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="grid-"])',
        message: '❌ Tailwind grid classes are forbidden. Use .grid .grid-2/.grid-3/.grid-4 instead.'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="text-"])',
        message: '❌ Tailwind text classes are forbidden. Use standard typography classes instead.'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="bg-"])',
        message: '❌ Tailwind background classes are forbidden. Use CSS variables instead.'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="p-"])',
        message: '❌ Tailwind padding classes are forbidden. Use standard spacing classes instead.'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="m-"])',
        message: '❌ Tailwind margin classes are forbidden. Use standard spacing classes instead.'
      }
    ],
    
    // Layout Enforcement
    'react/jsx-no-literals': [
      'warn',
      {
        noStrings: false,
        allowedStrings: ['standard-layout', 'admin-layout', 'minimal-layout'],
        ignoreProps: true
      }
    ],
    
    // Custom rules for our design system - temporarily disabled until rules are defined
    // 'fairfield/require-universal-layout': 'error',
    // 'fairfield/no-custom-layouts': 'error',
    // 'fairfield/use-design-tokens': 'error'
  },
  
  // Custom rule definitions
  overrides: [
    {
      files: ['src/app/**/page.tsx', 'src/app/**/layout.tsx'],
      rules: {
        // 'fairfield/require-universal-layout': [
        //   'error',
        //   {
        //     message: '❌ All pages must use UniversalLayout component. Import from @/components/layout/UniversalLayout'
        //   }
        // ]
      }
    }
  ]
}; 