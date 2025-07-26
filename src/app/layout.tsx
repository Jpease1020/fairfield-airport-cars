import type { Metadata } from 'next';
import './globals.css';
import './standard-layout.css';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';

export const metadata: Metadata = {
  title: 'Fairfield Airport Cars - Premium Transportation',
  description: 'Professional airport transportation service in Fairfield County, CT. Reliable, comfortable rides to all major airports.',
  keywords: 'airport transportation, Fairfield County, car service, professional drivers, airport transfer',
  openGraph: {
    title: 'Fairfield Airport Cars - Premium Transportation',
    description: 'Professional airport transportation service in Fairfield County, CT',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/fairfield_logo.png" />
      </head>
      <body>
        <AccessibilityEnhancer>
          <div id="main-content">
            {children}
          </div>
        </AccessibilityEnhancer>
      </body>
    </html>
  );
}
