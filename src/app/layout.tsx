import type { Metadata } from 'next';
import './standard-layout.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fairfield Airport Cars',
  description: 'Premium airport transportation service in Fairfield County, CT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
