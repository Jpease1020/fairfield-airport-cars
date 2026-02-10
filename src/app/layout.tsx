import '@/design/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import { StyledComponentsRegistry, AccessibilityEnhancer } from '@/design/ui';
import { ErrorBoundary } from '@/components/business/ErrorBoundary';  
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';
import { Suspense } from 'react';

import { GoogleMapsClientProvider } from '@/providers/GoogleMapsClientProvider';
import { CMSDataProvider } from '@/design/providers/CMSDataProvider';
import { getAllCMSDataCached } from '@/lib/services/cms-cache';
import { BookingProvider } from '@/providers/BookingProvider';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';

import { AppContent } from './AppContent';
import { NavigationWrapper } from '@/components/app/NavigationWrapper';
import { Footer } from '@/design/page-sections/Footer';
import { Container } from '@/design/layout/containers/Container';

export const metadata = {
  title: 'Fairfield Airport Cars - Premium Airport Transportation Service',
  description: 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
  manifest: '/manifest.json',
  keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

// Disable ISR caching in development for hot reloading
// In production, use default Next.js behavior (static generation with ISR)
// Only export dynamic in development - in production Next.js will use defaults

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch CMS data once at build time or per serverless function call
  const allCmsData = await getAllCMSDataCached();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        {/* Apple PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Airport Cars" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-152x152.png" />
        {/* Splash screens for iOS */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <PWAProvider>
            <CMSDataProvider initialCmsData={allCmsData}>
              <Suspense fallback={<div>Loading...</div>}>
                <GoogleMapsClientProvider>
                <BookingProvider>
                    <ErrorBoundary>
                      <AccessibilityEnhancer>
                        <AdminProvider>
                          <InteractionModeProvider>
                            <NavigationWrapper />
                            
                            <Container as="main" maxWidth="full" data-testid="layout-main-content">
                              <AppContent>{children}</AppContent>
                            </Container>
                            
                            <Footer data-testid="layout-footer" />
                            <PWAInstallBanner />
                          </InteractionModeProvider>
                        </AdminProvider>
                      </AccessibilityEnhancer>
                    </ErrorBoundary>
                </BookingProvider>
              </GoogleMapsClientProvider>
              </Suspense>
            </CMSDataProvider>
          </PWAProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

