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

## Multi-Agent Development
```bash
# Run cleanup orchestration
node scripts/cleanup-orchestration.js

# Run individual agents
node scripts/agents/cleanup-agent.js --task="Remove temporary build files"
node scripts/agents/structure-agent.js --task="Create lib subdirectories"
```

## Project Structure
- `src/lib/services/` - External service integrations
- `src/lib/utils/` - Pure utility functions  
- `src/lib/validation/` - Data validation
- `src/lib/business/` - Business logic
- `src/components/ui/` - Core UI components
- `src/components/admin/` - Admin functionality
- `src/app/api/` - API routes organized by feature

## Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Screenshot comparisons

## Deployment
```bash
# Build for production
npm run build

# Deploy (configure your deployment platform)
npm run deploy
```

## 🚨 CRITICAL DEVELOPMENT RULES

### **Component Refactoring:**
- **NEVER** remove reusable components during refactoring
- **ALWAYS** refactor components internally (replace Tailwind/inline styles with semantic CSS)
- **ALWAYS** maintain component architecture and reusability
- See: `docs/development/COMPONENT_REFACTORING_RULES.md`

### **Code Quality:**
- **ALWAYS** run tests before committing
- **ALWAYS** update documentation for new features
- **ALWAYS** follow the established component patterns
