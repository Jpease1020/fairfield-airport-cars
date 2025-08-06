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
            filename.includes('design-system') ||
            filename.includes('system/tokens') ||
            filename.endsWith('tokens.ts') ||
            filename.endsWith('colors.ts') ||
            filename.includes('foundation/tokens')) {
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

    // Rule: No direct HTML elements for structure
    'no-html-structure': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Disallow raw HTML elements for structure in favor of design system components',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            const elementName = node.openingElement.name.name;
            // Only flag raw HTML elements used for structure
            if (['div', 'span', 'p', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'].includes(elementName)) {
              const hasStyle = node.openingElement.attributes.some(attr => 
                attr.name && attr.name.name === 'style'
              );
              const hasClassName = node.openingElement.attributes.some(attr => 
                attr.name && attr.name.name === 'className'
              );
              
              // Only report if the element has styling or is being used for layout
              if (hasStyle || hasClassName) {
                context.report({
                  node,
                  message: '❌ Raw HTML elements for structure are forbidden. Use design system components (Container, Stack, Card, etc.) instead.',
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
    },

    // Rule: Prevent circular dependencies in design system
    'no-circular-ui-imports': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Prevent circular dependencies by blocking @/ui imports within design directory',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const filename = context.getFilename();
            const source = node.source.value;
            
            // Check if we're in the design directory and importing from @/ui
            if (filename.includes('/src/design/') && source === '@/ui') {
              context.report({
                node,
                message: '❌ Circular dependency detected! Components in src/design/ cannot import from @/ui. Use @/design/base-ui instead.',
                suggest: [
                  {
                    desc: 'Replace @/ui with @/design/base-ui',
                    fix: (fixer) => {
                      return fixer.replaceText(node.source, "'@/design/base-ui'");
                    }
                  }
                ]
              });
            }
          }
        };
      }
    },

    // Rule: Enforce types architecture - no types directory imports
    'enforce-types-architecture': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Enforce types architecture: components define own types, shared types in shared-types.ts',
          category: 'Best Practices',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const filename = context.getFilename();
            const source = node.source.value;
            
            // Check if importing from types directory within design system
            if (filename.includes('/src/design/') && 
                (source.includes('./types') || source.includes('../types') || source.includes('/types'))) {
              context.report({
                node,
                message: '❌ Types directory imports are FORBIDDEN! Each component should define its own types. Shared types go in shared-types.ts',
                suggest: [
                  {
                    desc: 'Move component-specific types to component file, shared types to shared-types.ts',
                    fix: (fixer) => {
                      // Remove the import - developer needs to move types manually
                      return fixer.remove(node);
                    }
                  }
                ]
              });
            }
          }
        };
      }
    },

    // Rule: No absolute imports in design system
    'no-absolute-imports-in-design': {
      meta: {
        type: 'problem',
        hasSuggestions: true,
        docs: {
          description: 'Disallow absolute imports in design system files. Use relative imports instead.',
          category: 'Best Practices',
        },
      },
      create(context) {
        const filename = context.getFilename();
        
        // Only apply to design system files
        if (!filename.includes('src/design/')) {
          return {};
        }
        
        // Helper function to convert absolute path to relative path
        const getRelativePath = (currentPath, importPath) => {
          const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
          const levels = (currentDir.match(/\//g) || []).length - 1; // -1 for src
          const prefix = '../'.repeat(levels);
          return prefix + importPath;
        };
        
        return {
          ImportDeclaration(node) {
            const importSource = node.source.value;
            
            // Check for absolute imports starting with @/
            if (importSource.startsWith('@/')) {
              // Allow imports from design system itself
              if (importSource.startsWith('@/design/')) {
                context.report({
                  node,
                  message: '❌ Absolute imports are FORBIDDEN in design system. Use relative imports instead.',
                  suggest: [
                    {
                      desc: 'Convert to relative import',
                      fix: (fixer) => {
                        const currentPath = filename.replace(process.cwd(), '');
                        const importPath = importSource.replace('@/design/', '');
                        const relativePath = getRelativePath(currentPath, importPath);
                        return fixer.replaceText(node.source, `'${relativePath}'`);
                      }
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