import '@/design/globals.css';
import { ErrorBoundary, StyledComponentsRegistry, AccessibilityEnhancer } from '@/ui';  
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';

import { GoogleMapsProvider } from '@/providers/GoogleMapsProvider';
import { CMSDataProvider } from '@/design/providers/CMSDataProvider';
import { cmsFlattenedService } from '@/lib/services/cms-service';

import { AppContent } from './AppContent';
import { NavigationWrapper } from '@/components/app/NavigationWrapper';
import { Footer } from '@/design/page-sections/Footer';
import { Container } from '@/design/layout/containers/Container';



export const metadata = {
  title: 'Fairfield Airport Cars - Premium Airport Transportation Service',
  description: 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
  keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get all CMS data for the entire application
  let allCmsData = null;
  try {
    // Only try to get CMS data if we're in development with emulators
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
      allCmsData = await cmsFlattenedService.getAllCMSData();
    }
  } catch (error) {
    console.error('Failed to load CMS data:', error);
    // Continue without CMS data
  }

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <CMSDataProvider cmsData={allCmsData as any}>
            <ErrorBoundary>
              <AccessibilityEnhancer>
                <AdminProvider>
                  <InteractionModeProvider>
                    <GoogleMapsProvider>
                      <NavigationWrapper />
                      
                      <Container as="main" maxWidth="full" data-testid="layout-main-content">
                        <AppContent>{children}</AppContent>
                      </Container>
                      
                      <Footer data-testid="layout-footer" />
                    </GoogleMapsProvider>
                  </InteractionModeProvider>
                </AdminProvider>
              </AccessibilityEnhancer>
            </ErrorBoundary>
          </CMSDataProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
