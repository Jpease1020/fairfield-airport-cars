# Development Documentation

Welcome to the development documentation for Fairfield Airport Cars. This section contains all the essential guides and resources for developers working on the project.

## 🚀 Quick Start

1. **[Development Setup](DEVELOPMENT_SETUP.md)** - Complete setup instructions and development workflow
2. **[Comprehensive Style Guide](COMPREHENSIVE_STYLE_GUIDE.md)** - Complete UI component standards, page templates, and development patterns
3. **[Import Patterns](IMPORT_PATTERNS.md)** - Code organization and import conventions

## 📚 Core Development Guides

### **🏗️ Architecture & Setup**
- **[Development Setup](DEVELOPMENT_SETUP.md)** - Complete development environment setup
- **[Environment Setup](environment-setup.md)** - Environment configuration and deployment
- **[Comprehensive Style Guide](COMPREHENSIVE_STYLE_GUIDE.md)** - Complete UI component standards, page templates, and development patterns
- **[Component Refactoring Rules](COMPONENT_REFACTORING_RULES.md)** - Critical rules for component development

### **🎨 Design & Styling**
- **[Comprehensive Style Guide](COMPREHENSIVE_STYLE_GUIDE.md)** - Complete UI component standards, page templates, and development patterns
- **[Import Patterns](IMPORT_PATTERNS.md)** - Code organization and import conventions

### **🚀 Deployment & Operations**
- **[Production Guide](PRODUCTION_GUIDE.md)** - Production deployment and operations
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Monitoring Guide](MONITORING_GUIDE.md)** - System monitoring and alerting
- **[Dev Server Guide](DEV_SERVER_GUIDE.md)** - Development server management

### **🔧 Configuration & Setup**
- **[Gregg Setup Guide](GREGG_SETUP_GUIDE.md)** - Business owner setup instructions
- **[OpenAI Auth Setup](OPENAI_AUTH_SETUP.md)** - AI assistant configuration

## 🎯 Recent Development Achievements

### **✅ Codebase Cleanup (January 2025)**
- **Systematic className removal** - Reduced from 1539 to ~230 instances (85% reduction)
- **Component architecture standardization** - Clear reusable component patterns
- **Unused variable cleanup** - Removed hundreds of unused imports and variables
- **ESLint compliance** - Improved code quality and consistency

### **✅ Component Architecture**
- **Reusable Components** (`src/components/ui/`): Keep `className` for flexibility
- **Page/Feature Components** (`src/app/`, `src/components/marketing/`): Use reusable components, no custom `className`
- **Layout Components** (`src/components/layout/`): Keep `className` for layout flexibility

## 🚨 Critical Development Rules

### **Component Architecture**
- **NEVER** remove reusable components during refactoring
- **NEVER** add custom `className` to page/feature components (use reusable components instead)
- **ALWAYS** keep `className` in reusable components for flexibility
- **ALWAYS** maintain component architecture and reusability

### **Code Quality**
- **ALWAYS** run tests before committing
- **ALWAYS** remove unused imports and variables
- **ALWAYS** maintain ESLint compliance
- **ALWAYS** update documentation for new features

## 📋 Development Workflow

### **1. Setting Up a New Feature**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Start development server
npm run dev

# Run tests
npm run test

# Check linting
npm run lint
```

### **2. Component Development**
- Create reusable components in `src/components/ui/`
- Include `className` prop for flexibility
- Use TypeScript interfaces
- Include accessibility attributes
- Use in pages/features without custom `className`

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

## 🧪 Testing Strategy

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Screenshot comparisons

## 📞 Support & Resources

### **Development Resources**
- **Comprehensive Style Guide**: `COMPREHENSIVE_STYLE_GUIDE.md`
- **Testing Guide**: `../testing/README.md`
- **Architecture Guide**: `../architecture/TECHNICAL_GUIDE.md`

### **Current Status**
- **Project Status**: `../multi-agent/CONSOLIDATED_STATUS.md`
- **Current TODO**: `../CURRENT_TODO.md`
- **Recent Achievements**: Codebase cleanup complete

## 📁 Archive

Outdated development documentation has been moved to `docs/archive/development/`:
- **HTML Elements Audit** - Historical audit of HTML element usage
- **Custom CSS Audit Report** - Historical CSS refactoring audit
- **Edit Mode Standardization** - Historical edit mode implementation
- **Perfect UI Patterns** - Historical UI pattern documentation
- **Speed Optimization** - Historical performance optimization guides
- **Universal Component System** - Historical component system documentation

---

*Last Updated: January 2025*  
*Status: Streamlined and updated to reflect current development practices* 