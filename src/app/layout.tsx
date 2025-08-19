import '@/design/globals.css';
import { ErrorBoundary, StyledComponentsRegistry, AccessibilityEnhancer } from '@/ui';  
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';
import { DemoModeProvider } from '@/design/providers/DemoModeProvider';
import { AppContent } from './AppContent';
import { NavigationManager } from '@/components/app/NavigationManager';
import { Footer } from '@/design/page-sections/Footer';
import { Container } from '@/design/layout/containers/Container';
import { isDemoModeEnabled } from '@/lib/config/feature-flags';
import { DemoModeIndicator } from '../components/demo/DemoModeIndicator';

export const metadata = {
  title: 'Fairfield Airport Cars - Premium Airport Transportation Service',
  description: 'Reliable, comfortable rides to and from Fairfield Airport with professional drivers',
  keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoModeEnabled = isDemoModeEnabled();

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
          <ErrorBoundary>
            <AccessibilityEnhancer>
              <AdminProvider>
                <InteractionModeProvider>
                  {demoModeEnabled ? (
                    <DemoModeProvider>
                      <DemoModeIndicator />
                      
                      {/* Intelligent Navigation - renders the right nav for each route */}
                      <NavigationManager />
                      
                      {/* Main content */}
                      <Container as="main" maxWidth="full" data-testid="layout-main-content">
                        <AppContent>{children}</AppContent>
                      </Container>
                      
                      <Footer data-testid="layout-footer"/>
                    </DemoModeProvider>
                  ) : (
                    <>
                      {/* Intelligent Navigation - renders the right nav for each route */}
                      <NavigationManager />
                      
                      {/* Main content */}
                      <Container as="main" maxWidth="full" data-testid="layout-main-content">
                        <AppContent>{children}</AppContent>
                      </Container>
                      
                      <Footer data-testid="layout-footer"/>
                    </>
                  )}
                </InteractionModeProvider>
              </AdminProvider>
            </AccessibilityEnhancer>
          </ErrorBoundary>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
