/**
 * 🎯 Fairfield Custom ESLint Rules
 * 
 * Comprehensive custom ESLint rules for our design system and architecture
 * Integrates all our custom rules into a single plugin
 */

export default {
  rules: {
    // Rule: No hardcoded colors (hex codes)
    'no-hardcoded-colors': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Disallow hardcoded hex colors in favor of design tokens',
          category: 'Best Practices',
        },
      },
      create(context) {
        const filename = context.getFilename();
        
        // Skip design token files and CMS color files
        if (filename.includes('tokens') || 
            filename.includes('colors') || 
            filename.includes('cms-integrated-colors') ||
            filename.includes('design-system')) {
          return {};
        }
        
        return {
          Literal(node) {
            if (typeof node.value === 'string' && /^#[0-9a-fA-F]{3,6}$/.test(node.value)) {
              context.report({
                node,
                message: '❌ Hardcoded color detected. Use design tokens instead: colors.primary[600]',
                suggest: [
                  {
                    desc: 'Replace with design token',
                    fix: (fixer) => fixer.replaceText(node, 'colors.primary[600]')
                  }
                ]
              });
            }
          },
          TemplateLiteral(node) {
            node.quasis.forEach(quasi => {
              if (quasi.value.raw && /#[0-9a-fA-F]{3,6}/.test(quasi.value.raw)) {
                context.report({
                  node,
                  message: '❌ Hardcoded color in template literal. Use design tokens instead.',
                  suggest: [
                    {
                      desc: 'Replace with CSS variable',
                      fix: (fixer) => fixer.replaceText(node, '`var(--primary-color, #2563eb)`')
                    }
                  ]
                });
              }
            });
          }
        };
      }
    },

    // Rule: No inline styles
    'no-inline-styles': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Disallow inline styles in favor of styled-components',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'style') {
              context.report({
                node,
                message: '❌ Inline styles are forbidden. Use styled-components instead.',
                suggest: [
                  {
                    desc: 'Create a styled component',
                    fix: (fixer) => fixer.remove(node)
                  }
                ]
              });
            }
          }
        };
      }
    },

    // Rule: No className props (use styled-components instead)
    'no-classname-props': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Disallow className props in favor of styled-components',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'className') {
              context.report({
                node,
                message: '❌ className props are forbidden. Use styled-components instead.',
                suggest: [
                  {
                    desc: 'Remove className and use styled-components',
                    fix: (fixer) => fixer.remove(node)
                  }
                ]
              });
            }
          }
        };
      }
    },

    // Rule: Enforce @/ui imports for design system components
    'enforce-ui-imports': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Enforce @/ui imports for design system components',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (source.includes('./ui-components/') || source.includes('../ui-components/')) {
              context.report({
                node,
                message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.',
                suggest: [
                  {
                    desc: 'Replace with @/ui import',
                    fix: (fixer) => {
                      const newImport = node.specifiers.map(spec => {
                        if (spec.type === 'ImportDefaultSpecifier') {
                          return `import ${spec.local.name} from '@/ui';`;
                        } else if (spec.type === 'ImportSpecifier') {
                          return `import { ${spec.local.name} } from '@/ui';`;
                        }
                      }).join('\n');
                      return fixer.replaceText(node, newImport);
                    }
                  }
                ]
              });
            }
          }
        };
      }
    },

    // Rule: Prevent multiple styled.div in same file
    'no-multiple-styled-divs': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Prevent multiple styled.div components in same file',
          category: 'Best Practices',
        },
      },
      create(context) {
        let styledDivCount = 0;
        return {
          VariableDeclarator(node) {
            if (node.id && node.id.name && node.id.name.includes('Styled')) {
              styledDivCount++;
              if (styledDivCount > 1) {
                context.report({
                  node,
                  message: '❌ Multiple styled.div components in same file. Create reusable components instead.',
                  suggest: [
                    {
                      desc: 'Extract to separate component file',
                      fix: (fixer) => fixer.remove(node)
                    }
                  ]
                });
              }
            }
          }
        };
      }
    },

    // Rule: Enforce design system usage
    'enforce-design-system': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Enforce design system component usage',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            if (node.openingElement.name.name === 'div') {
              const hasStyle = node.openingElement.attributes.some(attr => 
                attr.name && attr.name.name === 'style'
              );
              if (hasStyle) {
                context.report({
                  node,
                  message: '❌ Raw div with styles detected. Use design system components instead.',
                  suggest: [
                    {
                      desc: 'Replace with design system component',
                      fix: (fixer) => fixer.replaceText(node.openingElement.name, 'Box')
                    }
                  ]
                });
              }
            }
          }
        };
      }
    }
  }
}; 