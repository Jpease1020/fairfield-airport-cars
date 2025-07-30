/**
 * 🎯 Architecture Guardrails ESLint Plugin
 * 
 * Custom ESLint plugin to enforce our design system and architecture rules
 * Prevents CSS antipatterns, hardcoded styles, and architecture violations
 */

export default {
  rules: {
    // Rule: No hardcoded colors (hex codes)
    'no-hardcoded-colors': {
      create(context) {
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

    // Rule: Enforce styled-components usage
    'enforce-styled-components': {
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value === 'styled-components') {
              // Check if styled-components is imported
              const styledImport = node.specifiers.find(spec => 
                spec.type === 'ImportDefaultSpecifier' && spec.local.name === 'styled'
              );
              
              if (!styledImport) {
                context.report({
                  node,
                  message: '❌ styled-components must be imported as default import: import styled from "styled-components"'
                });
              }
            }
          }
        };
      }
    },

    // Rule: No raw HTML elements (use our components)
    'no-raw-html': {
      create(context) {
        const allowedElements = ['div', 'span', 'section', 'article', 'header', 'footer', 'main', 'aside'];
        
        return {
          JSXElement(node) {
            if (node.openingElement.name.type === 'JSXIdentifier') {
              const elementName = node.openingElement.name.name;
              
              // Check if it's a raw HTML element that should be replaced with our components
              if (elementName === 'h1' || elementName === 'h2' || elementName === 'h3' || 
                  elementName === 'h4' || elementName === 'h5' || elementName === 'h6' ||
                  elementName === 'p' || elementName === 'button' || elementName === 'input' ||
                  elementName === 'textarea' || elementName === 'select' || elementName === 'label') {
                
                context.report({
                  node,
                  message: `❌ Raw HTML element <${elementName}> detected. Use our design system components instead.`,
                  suggest: [
                    {
                      desc: `Replace with ${elementName.toUpperCase()} component`,
                      fix: (fixer) => {
                        const componentName = elementName.toUpperCase();
                        return fixer.replaceText(node.openingElement.name, componentName);
                      }
                    }
                  ]
                });
              }
            }
          }
        };
      }
    },

    // Rule: Enforce design token usage
    'use-design-tokens': {
      create(context) {
        return {
          MemberExpression(node) {
            // Check if accessing design tokens
            if (node.object.name === 'colors' || node.object.name === 'spacing' || 
                node.object.name === 'fontSize' || node.object.name === 'fontWeight') {
              // This is good - using design tokens
              return;
            }
          },
          VariableDeclarator(node) {
            if (node.init && node.init.type === 'Literal' && typeof node.init.value === 'string') {
              // Check for hardcoded values that should use design tokens
              if (/^#[0-9a-fA-F]{3,6}$/.test(node.init.value)) {
                context.report({
                  node,
                  message: '❌ Hardcoded value detected. Use design tokens instead.',
                  suggest: [
                    {
                      desc: 'Use colors from design tokens',
                      fix: (fixer) => fixer.replaceText(node.init, 'colors.primary[600]')
                    }
                  ]
                });
              }
            }
          }
        };
      }
    },

    // Rule: No CSS files over 200 lines
    'css-file-size-limit': {
      create(context) {
        const filename = context.getFilename();
        if (filename.endsWith('.css')) {
          const sourceCode = context.getSourceCode();
          const lines = sourceCode.lines.length;
          
          if (lines > 200) {
            context.report({
              node: sourceCode.ast,
              message: `❌ CSS file is ${lines} lines (max: 200). Use styled-components instead.`,
              suggest: [
                {
                  desc: 'Convert to styled-components',
                  fix: (fixer) => {
                    // This would be complex to auto-fix, so just report the issue
                    return null;
                  }
                }
              ]
            });
          }
        }
      }
    }
  }
}; 