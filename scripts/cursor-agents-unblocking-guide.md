# 🚀 Cursor Agents Unblocking Guide

## 🎯 Current Status (July 27, 2025)
- **Total Errors**: 281
- **Total Warnings**: 328  
- **Files with Issues**: 74

## 🎯 Priority Targets (Start Here!)

### 1. HIGH IMPACT FILES (>10 violations)
```
src/app/privacy/page.tsx: 40 violations
src/app/admin/analytics-disabled/page.tsx: 27 violations
src/components/layout/CMSContentPage.tsx: 14 violations
src/app/book/booking-form.tsx: 10 violations
```

### 2. QUICK WINS (Common violations)
- **div tag**: 37 violations
- **span tag**: 19 violations  
- **className prop**: 32 violations
- **a tag**: 21 violations

## 🔧 How to Get Unblocked

### Step 1: Choose Your Target
Pick ONE file from the priority list above. Start with the highest violation count.

### Step 2: Use This AI Prompt
```
I need to refactor this React component to follow our design system rules. 

CRITICAL RULES:
- Replace <div> with <Container>, <Stack>, or <Card>
- Replace <span> with <Span> 
- Replace <p> with <Text>
- Replace <h1-h6> with <H1>, <H2>, etc.
- Replace <a> with <Link>
- Replace <button> with <Button>
- Replace <input> with <Input>
- Replace <label> with <Label>
- Replace <ul>/<ol> with <Stack>
- Replace <li> with <Container>
- Remove className props from reusable components
- Import Stack and Card from @/components/ui/containers
- Import other UI components from @/components/ui

SPECIAL CASES:
- For dangerouslySetInnerHTML, use native <span> with inline styles
- For inline styles, replace with component props or CSS variables

Please refactor this file: [FILENAME]
```

### Step 3: Test Your Changes
```bash
npm run check:components
```

### Step 4: Commit Working Changes
```bash
git add [filename]
git commit -m "refactor: fix JSX violations in [filename]"
git push
```

## 🚨 Common Blockers & Solutions

### Blocker 1: "Property doesn't exist on type"
**Solution**: Check the component's props interface. Use native HTML tags for unsupported props.

### Blocker 2: "Import not found"
**Solution**: 
- Stack/Card: `import { Stack, Card } from '@/components/ui/containers'`
- Others: `import { Component } from '@/components/ui'`

### Blocker 3: "Infinite recursion"
**Solution**: Don't replace HTML tags INSIDE component definitions, only in usage.

### Blocker 4: "TypeScript errors"
**Solution**: Use native HTML tags for special cases like `dangerouslySetInnerHTML`.

## 📋 Workflow Checklist

- [ ] Pick one file from priority list
- [ ] Use the AI prompt above
- [ ] Test with `npm run check:components`
- [ ] Fix any new errors introduced
- [ ] Commit working changes
- [ ] Move to next file

## 🎯 Success Metrics

**Target**: Reduce total errors from 281 to <100
**Strategy**: Focus on files with >5 violations first

## 📞 Need Help?

1. Check the full rules in `CURSOR_AGENTS_READY.md`
2. Use `npm run monitor:agents` to see progress
3. Look at `scripts/cursor-agents-quick-reference.md` for patterns

## 🚀 Quick Start Commands

```bash
# Check current violations
npm run check:components

# Monitor progress
npm run monitor:agents

# See recent changes
git status

# View commit history
git log --oneline -5
```

---

**Remember**: Focus on ONE file at a time. Quality over quantity! 