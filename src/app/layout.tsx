import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CMSDesignProvider } from '@/components/providers/CMSDesignProvider';
import { StyledComponentsRegistry } from '@/components/providers/StyledComponentsRegistry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <ErrorBoundary>
            <CMSDesignProvider>
              <AccessibilityEnhancer>
                {children}
              </AccessibilityEnhancer>
              <Analytics />
            </CMSDesignProvider>
          </ErrorBoundary>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
