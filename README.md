# 🚗 Fairfield Airport Cars

**Professional airport transportation booking platform for Fairfield, CT**

## 🎯 **Quick Start**

### **For Developers**
1. **Setup**: `npm install && npm run dev`
2. **Documentation**: [📚 Documentation Hub](./docs/README.md)
3. **Architecture**: [🏗️ Master Architecture Guide](./docs/architecture/MASTER_ARCHITECTURE.md)

### **For Business (Gregg)**
- **Admin Dashboard**: `/admin` - Manage bookings and business
- **Customer Portal**: `/book` - Booking interface for customers

## 📚 **Documentation**

**🎯 Start Here:**
- **[Documentation Hub](./docs/README.md)** - Complete documentation index
- **[Master Architecture](./docs/architecture/MASTER_ARCHITECTURE.md)** - **DEFINITIVE GUIDE** (Senior Next.js Architect Perspective)

**📁 Organized Documentation:**
- **Architecture**: `./docs/architecture/` - Architecture guides and planning
- **Features**: `./docs/features/` - Feature analysis and implementation
- **Implementation**: `./docs/implementation/` - Technical guides and best practices
- **Analysis**: `./docs/analysis/` - Research and analysis documents

## 🏗️ **Architecture Philosophy**

**Built for Fairfield Airport Cars with Gregg as single driver/owner:**

- **Simplicity First**: No over-engineering for features we don't need
- **Single Owner Focus**: Gregg is driver + owner = streamlined workflows
- **Performance Excellence**: Fast, reliable, mobile-first
- **Maintainability**: Clean code that's easy to understand and modify
- **No Duplication**: Every feature serves a clear purpose

## 🚀 **Core Features**

### **Customer-Facing**
- ✅ **Simple Booking System** - Easy booking form with payment
- ✅ **Live Tracking** - Real-time driver location updates
- ✅ **Mobile-Optimized** - Perfect experience on mobile devices

### **Admin Interface (Gregg)**
- ✅ **Simple Dashboard** - Today's schedule and bookings
- ✅ **Booking Management** - Easy booking management
- ✅ **Payment Processing** - Square integration for revenue

## 🚫 **What We're NOT Building**

- ❌ Multi-driver management (Gregg is the only driver)
- ❌ Complex analytics (simple metrics only)
- ❌ Advanced role permissions (admin vs customer only)
- ❌ Over-engineered features

## 🔧 **Development**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Firebase project setup
- Square API credentials

### **Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### **Environment Variables**
```bash
# Copy example environment file
cp .env.example .env.local

# Configure your environment variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project
SQUARE_ACCESS_TOKEN=your_square_token
```

## 📊 **Performance Targets**

- **Page Load Time**: < 2 seconds
- **Mobile Performance**: 90+ Lighthouse score
- **Bundle Size**: < 300KB
- **TypeScript Coverage**: 100%
- **Test Coverage**: > 80%

## 🎯 **Success Metrics**

- **Booking Conversion**: > 20%
- **Customer Satisfaction**: > 4.5/5
- **Mobile Usage**: > 80%
- **Payment Success**: > 95%

## 🔧 **Tech Stack**

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Custom design system with CSS modules
- **Backend**: Firebase (Auth, Firestore)
- **Payments**: Square API
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel

## 📞 **Support**

- **Documentation**: [📚 Documentation Hub](./docs/README.md)
- **Architecture**: [🏗️ Master Architecture](./docs/architecture/MASTER_ARCHITECTURE.md)
- **Issues**: GitHub Issues for bug reports

---

**Built with ❤️ for Fairfield Airport Cars**

*Last Updated: January 2025*
