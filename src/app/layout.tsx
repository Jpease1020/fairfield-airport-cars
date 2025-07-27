'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CMSDesignProvider } from '@/components/providers/CMSDesignProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-inter`}>
        <ErrorBoundary>
          <CMSDesignProvider>
            <AccessibilityEnhancer />
            {children}
            <Analytics />
          </CMSDesignProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
