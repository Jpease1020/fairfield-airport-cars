# 🚀 Future Features Directory

This directory contains work-in-progress features, experimental code, and planned functionality that is not yet ready for production use.

## 📁 Directory Structure

```
src/future-features/
├── README.md                    # This file
├── comment-system/              # Admin commenting system
│   ├── CommentWidgetWrapper.tsx
│   ├── CommentWrapper.tsx
│   ├── CommentableSection.tsx
│   ├── GlobalCommentWidget.tsx
│   ├── SimpleCommentSystem.tsx
│   ├── TestCommentWidget.tsx
│   └── DraggableCommentSystem.tsx
└── ai-assistant/                # AI assistant functionality
    ├── ai-assistant.ts          # AI service
    ├── page.tsx                 # AI assistant page
    ├── settings/page.tsx        # AI settings page
    └── route.ts                 # AI API route
```

## 🎯 Purpose

This directory serves as a staging area for:

- **Work-in-progress features** that are being developed
- **Experimental code** that needs testing before integration
- **Planned features** that are designed but not yet implemented
- **Roadmap items** that are part of the product vision

## 🔧 Development Guidelines

### ✅ What Goes Here
- Features that are actively being developed
- Experimental implementations
- Planned functionality with clear roadmap
- Code that needs refinement before production

### ❌ What Doesn't Go Here
- Broken or abandoned code
- Temporary hacks or workarounds
- Code that should be deleted entirely
- Production-ready features

## 🚦 Status Tracking

### Comment System
- **Status**: In Development
- **Purpose**: Allow admins to comment on page sections and components
- **Progress**: Basic infrastructure complete, needs UI integration

### AI Assistant
- **Status**: Planned
- **Purpose**: Help customers and admins with tasks
- **Progress**: Service structure defined, needs implementation

## 🔄 Integration Process

When a feature is ready for production:

1. **Review and test** the feature thoroughly
2. **Move files** to appropriate production directories
3. **Update imports** and references
4. **Remove** from this directory
5. **Update documentation** and tests

## 📋 Maintenance

- **Regular review**: Check this directory monthly
- **Cleanup**: Remove abandoned or completed features
- **Documentation**: Keep this README updated
- **Testing**: Ensure moved features work in production

## 🛡️ Exclusions

This directory is excluded from:
- ESLint checks
- TypeScript strict mode
- Test coverage requirements
- Build optimization

This allows for rapid prototyping and experimentation without affecting the main codebase. 