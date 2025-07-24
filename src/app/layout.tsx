import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { EditModeProvider } from "@/components/admin/EditModeProvider";
import AdminHamburgerMenu from "@/components/admin/AdminHamburgerMenu";
import CommentWrapper from "@/components/admin/CommentWrapper";

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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', sizes: '512x512' },
    ],
  },
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
        <AdminProvider>
          <EditModeProvider>
            <CommentWrapper>
              <Navigation />
              <main>{children}</main>
              <AdminHamburgerMenu />
            </CommentWrapper>
          </EditModeProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
