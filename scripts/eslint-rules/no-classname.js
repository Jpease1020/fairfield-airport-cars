/**
 * ESLint Rule: No className Usage
 * 
 * This rule prevents the use of className props in our design system
 * to enforce the use of styled-components and design tokens.
 * 
 * CRITICAL: className is FORBIDDEN in our design system
 * Use styled-components and design tokens instead.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow className usage in favor of styled-components and design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noClassName: 'className is FORBIDDEN. Use styled-components and design tokens instead. This is a critical design system rule.',
      noCustomCSS: 'Custom CSS classes are FORBIDDEN. Use design system tokens and styled-components.',
    },
  },
  create(context) {
    return {
      // Check for className in JSX props
      JSXAttribute(node) {
        if (node.name && node.name.name === 'className') {
          context.report({
            node,
            messageId: 'noClassName',
          });
        }
      },
      
      // Check for className in object properties
      Property(node) {
        if (node.key && node.key.name === 'className') {
          context.report({
            node,
            messageId: 'noClassName',
          });
        }
      },
      
      // Check for className in variable declarations
      VariableDeclarator(node) {
        if (node.id && node.id.name && node.id.name.includes('className')) {
          context.report({
            node,
            messageId: 'noCustomCSS',
          });
        }
      },
      
      // Check for className in function parameters
      FunctionDeclaration(node) {
        if (node.params) {
          node.params.forEach(param => {
            if (param.name && param.name.includes('className')) {
              context.report({
                node: param,
                messageId: 'noClassName',
              });
            }
          });
        }
      },
      
      // Check for className in arrow function parameters
      ArrowFunctionExpression(node) {
        if (node.params) {
          node.params.forEach(param => {
            if (param.name && param.name.includes('className')) {
              context.report({
                node: param,
                messageId: 'noClassName',
              });
            }
          });
        }
      },
      
      // Check for className in interface/type definitions
      TSPropertySignature(node) {
        if (node.key && node.key.name === 'className') {
          context.report({
            node,
            messageId: 'noClassName',
          });
        }
      },
      
      // Check for className in interface/type definitions (TypeScript)
      TSInterfaceDeclaration(node) {
        if (node.body && node.body.body) {
          node.body.body.forEach(member => {
            if (member.key && member.key.name === 'className') {
              context.report({
                node: member,
                messageId: 'noClassName',
              });
            }
          });
        }
      },
    };
  },
}; 