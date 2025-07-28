module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Custom Architecture Guardrails Rules
    
    // No hardcoded colors
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3,6}$/]',
        message: '❌ Hardcoded color detected. Use design tokens instead: colors.primary[600]'
      },
      {
        selector: 'TemplateLiteral:has(TemplateElement[value.raw*="#"]:not([value.raw*="var(--"]))',
        message: '❌ Hardcoded color in template literal. Use CSS variables instead: var(--primary-color)'
      },
      {
        selector: 'JSXAttribute[name.name="style"]',
        message: '❌ Inline styles are forbidden. Use styled-components instead.'
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
    
    // Enforce styled-components import
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['styled-components'],
            importNames: ['styled'],
            message: '❌ styled-components must be imported as default: import styled from "styled-components"'
          }
        ]
      }
    ],
    
    // Additional custom rules using built-in ESLint capabilities
    'no-restricted-properties': [
      'error',
      {
        object: 'JSXAttribute',
        property: 'className',
        message: '❌ className props are forbidden. Use styled-components instead.'
      }
    ],
    
    // CRITICAL: No className usage anywhere
    'no-restricted-globals': [
      'error',
      {
        name: 'className',
        message: '❌ className is FORBIDDEN. Use styled-components and design tokens instead.'
      }
    ],
    
    // Prevent className in object properties
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Property[key.name="className"]',
        message: '❌ className property is FORBIDDEN. Use styled-components instead.'
      },
      {
        selector: 'JSXAttribute[name.name="className"]',
        message: '❌ className attribute is FORBIDDEN. Use styled-components instead.'
      },
      {
        selector: 'TSPropertySignature[key.name="className"]',
        message: '❌ className in TypeScript interface is FORBIDDEN. Use styled-components instead.'
      }
    ]
  },
  
  // Custom rule definitions
  overrides: [
    {
      files: ['src/app/**/page.tsx', 'src/app/**/layout.tsx'],
      rules: {
        // Additional rules for page files
      }
    },
    {
      files: ['*.css'],
      rules: {
        // CSS file size limit (this would need a custom rule)
      }
    }
  ]
}; 