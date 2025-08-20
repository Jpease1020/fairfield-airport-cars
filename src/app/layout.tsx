import '@/design/globals.css';
import { ErrorBoundary, StyledComponentsRegistry, AccessibilityEnhancer } from '@/ui';  
import { AdminProvider } from '@/design/providers/AdminProvider';
import { InteractionModeProvider } from '@/design/providers/InteractionModeProvider';

import { AppContent } from './AppContent';
import { SmartNavigation } from '@/components/app/SmartNavigation';
import { Footer } from '@/design/page-sections/Footer';
import { Container } from '@/design/layout/containers/Container';

export const metadata = {
  title: 'Fairfield Airport Cars - Premium Airport Transportation Service',
  description: 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
  keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                  
                    <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="layout-navigation" padding="none">
                      <SmartNavigation />
                    </Container>
                    
                    <Container as="main" maxWidth="full" data-testid="layout-main-content">
                      <AppContent>{children}</AppContent>
                    </Container>
                    
                    <Footer data-testid="layout-footer"/>
                  
                </InteractionModeProvider>
              </AdminProvider>
            </AccessibilityEnhancer>
          </ErrorBoundary>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
