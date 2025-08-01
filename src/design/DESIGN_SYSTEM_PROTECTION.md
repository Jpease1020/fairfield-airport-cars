# 🛡️ Design System Protection Guide

## Overview

This document outlines the comprehensive protection strategy for the Fairfield Airport Cars design system to prevent regressions and maintain code quality.

## 🚨 Critical Rules

### **Never Allowed in Design Directory**
- ❌ Inline styles (`style={{}}`)
- ❌ Hardcoded colors (`#000`, `#fff`, etc.)
- ❌ `className` props on design system components
- ❌ Multiple `styled.div` components in same file
- ❌ Relative imports within design system
- ❌ Direct React imports (`import React from 'react'`)
- ❌ `any` TypeScript types
- ❌ Console logs or debugger statements
- ❌ Unused variables or imports

### **Always Required**
- ✅ Use design system components (`Stack`, `Box`, `Container`, etc.)
- ✅ Use CSS variables for colors (`var(--color-primary)`)
- ✅ Use styled-components for complex styling
- ✅ Import from `@/ui` or `@/design/ui`
- ✅ Proper TypeScript types
- ✅ Follow 4-layer architecture

## 🏗️ 4-Layer Architecture Enforcement

### **Layer 1: Grid System (Foundation)**
```tsx
// ✅ Correct
import { Grid, Col, Row } from '@/ui';

<Grid cols={3} gap="lg">
  <Col>Content</Col>
</Grid>
```

### **Layer 2: Content Layout**
```tsx
// ✅ Correct
import { Box, Stack } from '@/ui';

<Stack spacing="lg" align="center">
  <Box variant="elevated" padding="md">
    Content
  </Box>
</Stack>
```

### **Layer 3: Layout System**
```tsx
// ✅ Correct
import { Container, Section } from '@/ui';

<Container maxWidth="xl">
  <Section title="Title">Content</Section>
</Container>
```

### **Layer 4: Page Layout**
```tsx
// ✅ Correct
import { PageLayout } from '@/ui';

<PageLayout>
  <div>Page content</div>
</PageLayout>
```

## 🔧 Protection Tools

### **1. ESLint Configuration**
The design directory has stricter ESLint rules:
- All design system violations are `error` level
- Additional TypeScript restrictions
- Import restrictions
- Syntax restrictions for hardcoded colors

### **2. Design System Guard Script**
```bash
# Check design system integrity
./scripts/design-system-guard.sh

# Fix design system errors
npx eslint src/design/ --fix
```

### **3. Pre-commit Protection**
The guard script can be integrated into pre-commit hooks to prevent commits with design system violations.

## 📋 Development Workflow

### **Before Making Changes**
1. Run design system check:
   ```bash
   ./scripts/design-system-guard.sh
   ```

2. Ensure design directory is clean:
   ```bash
   npx eslint src/design/ --quiet
   ```

### **When Adding New Components**
1. Follow the 4-layer architecture
2. Use existing design system components
3. Create styled-components for complex styling
4. Import from `@/ui` or `@/design/ui`
5. Add proper TypeScript types
6. Test with ESLint

### **When Modifying Existing Components**
1. Don't break existing patterns
2. Maintain backward compatibility
3. Update documentation if needed
4. Test with ESLint

## 🚫 Common Violations & Fixes

### **Inline Styles**
```tsx
// ❌ Wrong
<div style={{ display: 'flex', gap: '1rem' }}>
  Content
</div>

// ✅ Correct
<Stack direction="horizontal" spacing="md">
  Content
</Stack>
```

### **Hardcoded Colors**
```tsx
// ❌ Wrong
<div style={{ color: '#000', backgroundColor: '#fff' }}>

// ✅ Correct
<div style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-background-primary)' }}>
```

### **Multiple Styled Components**
```tsx
// ❌ Wrong
const StyledDiv1 = styled.div`...`;
const StyledDiv2 = styled.div`...`;

// ✅ Correct
const StyledContainer = styled.div`...`;
const StyledContent = styled.div`...`;
```

### **Relative Imports**
```tsx
// ❌ Wrong
import { Button } from '../components/ui-components/Button';

// ✅ Correct
import { Button } from '@/ui';
```

## 🎯 Quality Standards

### **Code Quality**
- Zero ESLint errors in design directory
- Proper TypeScript types
- Clean component structure
- Consistent naming conventions

### **Architecture Compliance**
- Follow 4-layer architecture
- Use appropriate components for each layer
- Maintain separation of concerns
- Proper component composition

### **Design System Consistency**
- Use design tokens for colors, spacing, etc.
- Consistent component APIs
- Proper responsive behavior
- Accessibility compliance

## 🔍 Monitoring & Maintenance

### **Regular Checks**
- Run design system guard weekly
- Monitor ESLint errors in CI/CD
- Review new design files
- Update documentation as needed

### **Automated Protection**
- ESLint runs on every commit
- Design system guard in pre-commit
- CI/CD pipeline checks
- Automated testing for design components

## 📚 Resources

- [Layout System Guide](./LAYOUT_SYSTEM_GUIDE.md)
- [Design System Components](../components/)
- [Design Tokens](../system/tokens/)
- [ESLint Rules](../../scripts/eslint-rules/)

## 🆘 Getting Help

If you encounter design system violations:

1. **Check the error message** - ESLint provides specific guidance
2. **Review this guide** - Common solutions are documented
3. **Check existing components** - See how similar patterns are implemented
4. **Ask for help** - Design system violations block development

Remember: The design system is the foundation of our user experience. Keep it clean and consistent! 🎯 