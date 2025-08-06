import '@/design/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { AccessibilityEnhancer, ErrorBoundary, CMSDesignProvider, StyledComponentsRegistry, UnifiedLayout } from '@/ui';

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
                <UnifiedLayout>
                  {children}
                </UnifiedLayout>
                <Analytics />
              </AccessibilityEnhancer>
            </CMSDesignProvider>
          </ErrorBoundary>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
