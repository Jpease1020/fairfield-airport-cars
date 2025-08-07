import '@/design/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { AccessibilityEnhancer, ErrorBoundary, CMSDesignProvider, StyledComponentsRegistry, Container } from '@/ui';
import { CommentSystem } from '../components/business';

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
            <CMSDesignProvider>
              <AccessibilityEnhancer>
                <CommentSystem>
                  <Container as="main" maxWidth="full" data-testid="layout-main-content">
                    {children}
                  </Container>
                </CommentSystem>
                <Analytics />
              </AccessibilityEnhancer>
            </CMSDesignProvider>
          </ErrorBoundary>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
