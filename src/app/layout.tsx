import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fairfield Airport Cars - Premium Airport Transportation",
  description: "Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area. Book your ride today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://apis.google.com/js/platform.js" async defer></script>
        <meta name="google-signin-client_id" content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
        {/* Initialize interaction tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize interaction tracking
              if (typeof window !== 'undefined') {
                setTimeout(() => {
                  console.log('🔍 Initializing interaction tracking...');
                }, 100);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
