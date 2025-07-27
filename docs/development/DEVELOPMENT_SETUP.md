# Development Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

## Installation
```bash
# Clone the repository
git clone <repository-url>
cd fairfield-airport-cars

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

## Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm run test:unit      # Jest unit tests
npm run test:e2e       # Playwright E2E tests
npm run test           # All tests

# Linting and formatting
npm run lint           # ESLint
npm run lint -- --fix  # Auto-fix linting issues

# Build for production
npm run build
```

## 🎯 Recent Codebase Improvements

### **✅ Systematic className Cleanup (January 2025)**
- **Reduced className instances from 1539 to ~230** (85% reduction)
- **Established clear architecture**: Reusable components keep `className`, pages/features use reusable components
- **Improved maintainability**: Consistent component usage across codebase
- **Enhanced developer experience**: Clear patterns for component usage

### **✅ Code Quality Enhancements**
- **Removed hundreds of unused imports and variables**
- **Fixed ESLint warnings and errors**
- **Improved code consistency and maintainability**
- **Enhanced component reusability patterns**

## Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── book/              # Booking flow pages
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components (keep className)
│   ├── admin/             # Admin-specific components
│   ├── booking/           # Booking-specific components
│   ├── layout/            # Layout components
│   └── marketing/         # Marketing components
├── lib/
│   ├── services/          # External service integrations
│   ├── utils/             # Pure utility functions  
│   ├── validation/        # Data validation
│   └── business/          # Business logic
└── types/                 # TypeScript type definitions
```

## 🏗️ Component Architecture

### **Reusable Components** (`src/components/ui/`)
- **Purpose**: Provide building blocks for the entire application
- **className Usage**: ✅ Keep `className` for flexibility and internal styling
- **Examples**: `Button`, `Container`, `Stack`, `Text`, `H3`, `H4`, `Span`

### **Page/Feature Components** (`src/app/`, `src/components/marketing/`)
- **Purpose**: Implement specific features and pages
- **className Usage**: ❌ No custom `className`, use reusable components
- **Examples**: `BookingForm`, `AdminDashboard`, `HomePage`

### **Layout Components** (`src/components/layout/`)
- **Purpose**: Provide page structure and layout patterns
- **className Usage**: ✅ Keep `className` for layout flexibility
- **Examples**: `CMSLayout`, `PageContent`, `PageHeader`

## 🧪 Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Screenshot comparisons

## 🚨 CRITICAL DEVELOPMENT RULES

### **Component Architecture:**
- **NEVER** remove reusable components during refactoring
- **ALWAYS** refactor components internally (replace Tailwind/inline styles with semantic CSS)
- **ALWAYS** maintain component architecture and reusability
- **NEVER** add custom `className` to page/feature components (use reusable components instead)
- **ALWAYS** keep `className` in reusable components for flexibility
- See: `docs/development/COMPONENT_REFACTORING_RULES.md`

### **Code Quality:**
- **ALWAYS** run tests before committing
- **ALWAYS** update documentation for new features
- **ALWAYS** follow the established component patterns
- **ALWAYS** remove unused imports and variables
- **ALWAYS** maintain ESLint compliance

### **Component Usage Guidelines:**

#### **✅ DO: Use Reusable Components**
```tsx
// ✅ Good - Using reusable components
const BookingPage = () => {
  return (
    <Container>
      <Stack spacing="lg">
        <H3>Book Your Airport Transfer</H3>
        <Text>Complete your reservation below</Text>
        <BookingForm />
      </Stack>
    </Container>
  )
}
```

#### **❌ DON'T: Add Custom className to Pages**
```tsx
// ❌ Bad - Custom className in page component
const BookingPage = () => {
  return (
    <div className="booking-page-container"> {/* Don't do this */}
      <h3 className="booking-title">Book Your Airport Transfer</h3>
      <p className="booking-description">Complete your reservation below</p>
      <BookingForm />
    </div>
  )
}
```

#### **✅ DO: Keep className in Reusable Components**
```tsx
// ✅ Good - Reusable component with className flexibility
const ActionButton = ({ className, children, ...props }) => {
  return (
    <button className={cn("action-button", className)} {...props}>
      {children}
    </button>
  )
}
```

## 🔧 Development Workflow

### **1. Setting Up a New Feature**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Start development server
npm run dev

# 3. Run tests to ensure everything works
npm run test

# 4. Make changes following component architecture rules
# 5. Test your changes
npm run test

# 6. Check linting
npm run lint

# 7. Commit with descriptive message
git commit -m "feat: add new feature with reusable components"
```

### **2. Component Development**
```bash
# 1. Create reusable component in src/components/ui/
# 2. Include className prop for flexibility
# 3. Add TypeScript interfaces
# 4. Include accessibility attributes
# 5. Add to component index
# 6. Test the component
npm run test:unit

# 7. Use in pages/features without custom className
```

### **3. Code Quality Checks**
```bash
# Check for unused variables and imports
npm run lint

# Auto-fix what can be fixed
npm run lint -- --fix

# Run all tests
npm run test

# Build to check for errors
npm run build
```

## 📚 Documentation Standards

### **Updating Documentation**
- Update relevant guides when adding new features
- Include code examples and use cases
- Follow the established documentation structure
- Archive outdated files in `docs/archive/`

### **Component Documentation**
- Document all reusable components with examples
- Include TypeScript interfaces
- Show usage patterns and best practices
- Update when component APIs change

## 🚀 Deployment
```bash
# Build for production
npm run build

# Deploy (configure your deployment platform)
npm run deploy
```

## 📞 Support & Resources

### **Development Resources**
- **Component Guide**: `docs/development/COMPONENT_GUIDE.md`
- **Style Guide**: `docs/development/STYLE_GUIDE.md`
- **Testing Guide**: `docs/testing/README.md`
- **Architecture Guide**: `docs/architecture/TECHNICAL_GUIDE.md`

### **Current Status**
- **Project Status**: `docs/multi-agent/CONSOLIDATED_STATUS.md`
- **Current TODO**: `docs/CURRENT_TODO.md`
- **Recent Achievements**: Codebase cleanup complete

---

*Last Updated: January 2025*  
*Status: Updated to reflect recent codebase cleanup and current development practices*
