# 🚀 Next.js 15 Comprehensive Optimization Guide
## Tailored for Fairfield Airport Cars Application

## 📋 **Table of Contents**

1. [App Router Architecture](#app-router-architecture)
2. [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
3. ['use client' Directive](#use-client-directive)
4. [Design Library Export Strategy](#design-library-export-strategy)
5. [Code Splitting Strategies](#code-splitting-strategies)
6. [PWA Implementation](#pwa-implementation)
7. [Admin Routing & Authentication](#admin-routing--authentication)
8. [Performance Optimization](#performance-optimization)
9. [Bundle Optimization](#bundle-optimization)
10. [Real-time Features](#real-time-features)

---

## 🏗️ **App Router Architecture**

### **Optimal Directory Structure for Multi-Role Apps**

```typescript
src/app/
├── (auth)/                    # Authentication group
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── layout.tsx            # Auth-specific layout
├── (admin)/                   # Admin group (code-split)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── bookings/
│   │   └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   ├── drivers/
│   │   └── page.tsx
│   └── layout.tsx            # Admin-specific layout
├── (customer)/                # Customer group (code-split)
│   ├── book/
│   │   └── page.tsx
│   ├── bookings/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── layout.tsx            # Customer-specific layout
├── (driver)/                  # Driver group (code-split)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── trips/
│   │   └── page.tsx
│   └── layout.tsx            # Driver-specific layout
├── api/                       # API routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   └── logout/
│   │       └── route.ts
│   ├── bookings/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   └── admin/
│       ├── analytics/
│       │   └── route.ts
│       └── users/
│           └── route.ts
├── globals.css               # Global styles
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
└── not-found.tsx            # 404 page
```

### **Layout Hierarchy Strategy**

```typescript
// Root layout - Common providers and global styles
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}

// Role-specific layouts
// (admin)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminNavigation />
      <AdminSidebar />
      <main>{children}</main>
    </AdminProvider>
  );
}

// (customer)/layout.tsx
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <CustomerNavigation />
      <main>{children}</main>
      <CustomerFooter />
    </CustomerProvider>
  );
}
```

---

## 🔄 **Server-Side Rendering (SSR)**

### **SSR vs Client-Side Rendering Decision Matrix**

```typescript
// ✅ SSR - Good for SEO, initial load performance
export default async function BookingPage() {
  // Fetch data on server
  const bookings = await getBookings();
  
  return (
    <div>
      <h1>Your Bookings</h1>
      <BookingList bookings={bookings} />
    </div>
  );
}

// ❌ Client-only - Bad for SEO, slower initial load
'use client';
export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    // Fetch data on client
    fetchBookings().then(setBookings);
  }, []);
  
  return (
    <div>
      <h1>Your Bookings</h1>
      <BookingList bookings={bookings} />
    </div>
  );
}
```

### **Hybrid Approach - SSR with Client Hydration**

```typescript
// Server component for initial render
export default async function BookingPage() {
  const initialBookings = await getBookings();
  
  return (
    <div>
      <h1>Your Bookings</h1>
      <BookingListClient initialBookings={initialBookings} />
    </div>
  );
}

// Client component for interactivity
'use client';
export function BookingListClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  
  const refreshBookings = async () => {
    const updated = await fetchBookings();
    setBookings(updated);
  };
  
  return (
    <div>
      <BookingList bookings={bookings} />
      <button onClick={refreshBookings}>Refresh</button>
    </div>
  );
}
```

### **Streaming SSR for Large Data**

```typescript
// Streaming for large datasets
export default async function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Load critical data first */}
      <Suspense fallback={<RevenueSkeleton />}>
        <RevenueChart />
      </Suspense>
      
      {/* Load secondary data */}
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsTable />
      </Suspense>
      
      {/* Load analytics last */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsChart />
      </Suspense>
    </div>
  );
}

// Individual components with their own data fetching
async function RevenueChart() {
  const revenue = await getRevenueData();
  return <Chart data={revenue} />;
}

async function BookingsTable() {
  const bookings = await getBookingsData();
  return <Table data={bookings} />;
}
```

---

## 🖥️ **'use client' Directive**

### **When to Use 'use client'**

```typescript
// ✅ Use 'use client' for:
// - Event handlers
// - useState, useEffect, useRef
// - Browser APIs (localStorage, window, document)
// - Third-party libraries that need browser APIs

'use client';
export function BookingForm() {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}

// ❌ Don't use 'use client' for:
// - Static content
// - Data fetching
// - SEO-important content
// - Server-only operations
```

### **Client Component Patterns**

```typescript
// 1. Interactive Components
'use client';
export function InteractiveMap() {
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    // Browser-only code
    navigator.geolocation.getCurrentPosition(setLocation);
  }, []);
  
  return <Map location={location} />;
}

// 2. Form Components
'use client';
export function BookingForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  return (
    <div>
      {step === 1 && <LocationStep onNext={nextStep} />}
      {step === 2 && <TimeStep onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <PaymentStep onBack={prevStep} />}
    </div>
  );
}

// 3. Real-time Components
'use client';
export function LiveTracking() {
  const [driverLocation, setDriverLocation] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/tracking');
    ws.onmessage = (event) => {
      setDriverLocation(JSON.parse(event.data));
    };
    
    return () => ws.close();
  }, []);
  
  return <Map driverLocation={driverLocation} />;
}
```

### **Server/Client Component Boundary**

```typescript
// Server component (no 'use client')
export default async function BookingPage() {
  const initialData = await getInitialBookingData();
  
  return (
    <div>
      <h1>Book Your Ride</h1>
      
      {/* Server-rendered static content */}
      <BookingInfo />
      
      {/* Client component for interactivity */}
      <BookingFormClient initialData={initialData} />
      
      {/* Another client component */}
      <LiveTrackingClient />
    </div>
  );
}

// Client components
'use client';
export function BookingFormClient({ initialData }: { initialData: any }) {
  // Interactive form logic
}

'use client';
export function LiveTrackingClient() {
  // Real-time tracking logic
}
```

---

## 🎨 **Design Library Export Strategy**

### **Optimal Design Library Structure**

```typescript
// src/design/index.ts - Main export file
export * from './components/base-components';
export * from './components/business-components';
export * from './components/composite-components';
export * from './foundation/tokens';
export * from './foundation/styles';

// src/design/components/base-components/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Text } from './Text';
export { Stack } from './Stack';
export { Container } from './Container';

// src/design/foundation/tokens/index.ts
export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { breakpoints } from './breakpoints';
```

### **Tree-Shaking Optimized Exports**

```typescript
// ✅ Tree-shaking friendly
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';

// ❌ Not tree-shaking friendly
export * from './Button';
export * from './Input';
export * from './Card';
```

### **Component Export Patterns**

```typescript
// src/design/components/Button/Button.tsx
'use client';
import styled from 'styled-components';
import { ButtonProps } from './Button.types';

const StyledButton = styled.button<ButtonProps>`
  // Styled components logic
`;

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <StyledButton variant={variant} {...props}>
      {children}
    </StyledButton>
  );
}

// src/design/components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// src/design/components/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
}
```

### **Design System Provider Pattern**

```typescript
// src/design/providers/DesignSystemProvider.tsx
'use client';
import { createContext, useContext, ReactNode } from 'react';
import { colors, spacing, typography } from '../foundation/tokens';

interface DesignSystemContext {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  theme: 'light' | 'dark';
}

const DesignSystemContext = createContext<DesignSystemContext | undefined>(undefined);

export function DesignSystemProvider({ 
  children, 
  theme = 'light' 
}: { 
  children: ReactNode; 
  theme?: 'light' | 'dark' 
}) {
  const value = {
    colors,
    spacing,
    typography,
    theme
  };
  
  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within DesignSystemProvider');
  }
  return context;
}
```

---

## 📦 **Code Splitting Strategies**

### **Route-Based Code Splitting**

```typescript
// Automatic with App Router route groups
src/app/
├── (admin)/          # Admin bundle
├── (customer)/       # Customer bundle
├── (driver)/         # Driver bundle
└── (auth)/           # Auth bundle

// Each route group becomes a separate chunk
```

### **Component-Level Code Splitting**

```typescript
// src/components/LazyComponents.tsx
import dynamic from 'next/dynamic';

// Heavy admin components
export const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <AdminDashboardSkeleton />,
  ssr: false, // Admin dashboard doesn't need SSR
});

export const AnalyticsChart = dynamic(() => import('./AnalyticsChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// Customer components
export const BookingForm = dynamic(() => import('./BookingForm'), {
  loading: () => <BookingFormSkeleton />,
  ssr: true, // Can be server-rendered
});

export const DriverMap = dynamic(() => import('./DriverMap'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Maps don't work well with SSR
});

// Heavy third-party components
export const Calendar = dynamic(() => import('@fullcalendar/react'), {
  loading: () => <CalendarSkeleton />,
  ssr: false,
});
```

### **Service-Level Code Splitting**

```typescript
// src/lib/services/lazy-services.ts
export const AnalyticsService = dynamic(() => import('./AnalyticsService'), {
  loading: () => null,
  ssr: false,
});

export const TrackingService = dynamic(() => import('./TrackingService'), {
  loading: () => null,
  ssr: false,
});
```

### **Webpack Configuration for Code Splitting**

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['firebase', 'styled-components', 'lucide-react'],
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Role-specific chunks
          admin: {
            test: /[\\/]src[\\/]app[\\/]\(admin\)[\\/]/,
            name: 'admin',
            chunks: 'all',
            priority: 20,
          },
          customer: {
            test: /[\\/]src[\\/]app[\\/]\(customer\)[\\/]/,
            name: 'customer',
            chunks: 'all',
            priority: 20,
          },
          driver: {
            test: /[\\/]src[\\/]app[\\/]\(driver\)[\\/]/,
            name: 'driver',
            chunks: 'all',
            priority: 20,
          },
          // Design system chunk
          design: {
            test: /[\\/]src[\\/]design[\\/]/,
            name: 'design-system',
            chunks: 'all',
            priority: 15,
          },
          // Service chunks
          services: {
            test: /[\\/]src[\\/]lib[\\/]services[\\/]/,
            name: 'services',
            chunks: 'all',
            priority: 15,
          },
        },
      };
    }
    return config;
  },
};
```

---

## 📱 **PWA Implementation**

### **PWA Configuration**

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/static\/.+\.js$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-js-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
```

### **PWA Manifest**

```json
// public/manifest.json
{
  "name": "Fairfield Airport Cars",
  "short_name": "Airport Cars",
  "description": "Premium airport transportation service",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **PWA Registration**

```typescript
// src/components/PWARegistration.tsx
'use client';
import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return null;
}
```

---

## 🔐 **Admin Routing & Authentication**

### **Admin Route Protection**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify admin role
    try {
      const user = await verifyToken(authToken);
      if (user.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Customer route protection
  const protectedCustomerRoutes = ['/dashboard', '/bookings', '/profile'];
  if (protectedCustomerRoutes.some(route => pathname.startsWith(route))) {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/bookings/:path*',
    '/profile/:path*',
  ],
};
```

### **Admin Layout with Authentication**

```typescript
// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { AdminNavigation } from '@/components/AdminNavigation';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="admin-layout">
      <AdminNavigation user={session.user} />
      <div className="admin-content">
        <AdminSidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### **Admin Authentication Provider**

```typescript
// src/providers/AdminAuthProvider.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthContext {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContext | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/check');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const userData = await response.json();
    setUser(userData);
    router.push('/admin/dashboard');
  };

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
```

---

## ⚡ **Performance Optimization**

### **Image Optimization**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

// Usage in components
import Image from 'next/image';

export function DriverPhoto({ driver }: { driver: Driver }) {
  return (
    <Image
      src={driver.photo}
      alt={driver.name}
      width={200}
      height={200}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      priority={false}
    />
  );
}
```

### **Font Optimization**

```typescript
// src/app/layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### **Bundle Analysis**

```typescript
// next.config.ts
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Add bundle analyzer
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        );
      }
    }
    return config;
  },
};

// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

---

## 🔄 **Real-time Features**

### **WebSocket Implementation**

```typescript
// src/lib/services/websocket-service.ts
'use client';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners = new Map<string, Function[]>();

  connect(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data.type, data.payload);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(this.ws?.url || '');
      }, 1000 * this.reconnectAttempts);
    }
  }

  subscribe(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  unsubscribe(type: string, callback: Function) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(type: string, payload: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

// Usage in components
'use client';
export function LiveTracking() {
  const [driverLocation, setDriverLocation] = useState(null);
  const wsService = useMemo(() => new WebSocketService(), []);

  useEffect(() => {
    wsService.connect('ws://localhost:3001/tracking');
    
    wsService.subscribe('driver-location', (location) => {
      setDriverLocation(location);
    });

    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  return (
    <div>
      {driverLocation && (
        <Map location={driverLocation} />
      )}
    </div>
  );
}
```

### **Server-Sent Events (SSE)**

```typescript
// src/lib/services/sse-service.ts
'use client';

export class SSEService {
  private eventSource: EventSource | null = null;
  private listeners = new Map<string, Function[]>();

  connect(url: string) {
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      console.log('SSE connected');
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data.type, data.payload);
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };
  }

  subscribe(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  unsubscribe(type: string, callback: Function) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(type: string, payload: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }

  disconnect() {
    this.eventSource?.close();
  }
}
```

---

## 📊 **Performance Monitoring**

### **Core Web Vitals Tracking**

```typescript
// src/lib/monitoring/performance.ts
'use client';

export class PerformanceMonitor {
  static trackCoreWebVitals() {
    if (typeof window === 'undefined') return;

    // Track LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.sendMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.sendMetric('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Track CLS (Cumulative Layout Shift)
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.sendMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private static sendMetric(name: string, value: number) {
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'core_web_vital', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true,
      });
    }
  }
}
```

### **Error Tracking**

```typescript
// src/lib/monitoring/error-tracking.ts
'use client';

export class ErrorTracker {
  static init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandledrejection',
      });
    });
  }

  static captureError(error: Error, context?: any) {
    // Send to error tracking service
    console.error('Error captured:', error, context);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        ...context,
      });
    }
  }
}
```

---

## 🎯 **Implementation Checklist**

### **Phase 1: Foundation**
- [ ] Set up route groups (auth, admin, customer, driver)
- [ ] Implement proper 'use client' boundaries
- [ ] Configure design library exports
- [ ] Set up basic code splitting

### **Phase 2: Performance**
- [ ] Implement PWA features
- [ ] Add image and font optimization
- [ ] Set up performance monitoring
- [ ] Configure bundle analysis

### **Phase 3: Advanced Features**
- [ ] Implement real-time features
- [ ] Add comprehensive error tracking
- [ ] Optimize for Core Web Vitals
- [ ] Set up admin authentication

### **Phase 4: Production Ready**
- [ ] Add comprehensive testing
- [ ] Implement security measures
- [ ] Optimize for mobile
- [ ] Set up monitoring and analytics

This comprehensive guide provides all the Next.js optimization concepts you need for your Fairfield Airport Cars application, with specific patterns for your design library, admin routing, and real-time features. 