import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enhanced performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  // Turbopack config (empty to allow webpack to work)
  // We use webpack via --webpack flag in build script
  turbopack: {},
  // Server external packages
  serverExternalPackages: ['firebase-admin'],
  // Optimized image configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image caching in development for hot reloading
    // In production, use shorter cache (30 seconds) for faster updates
    minimumCacheTTL: process.env.NODE_ENV === 'development' ? 0 : 30,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Advanced webpack optimization
  webpack: (config, { isServer, webpack }) => {
    // Exclude temp directory from build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /temp/,
    };
    
    // Prevent Firebase Admin SDK from being bundled for client-side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
        'firebase-admin/app': false,
        'firebase-admin/firestore': false,
        'firebase-admin/auth': false,
        'firebase-admin/messaging': false,
      };
    }

    // Handle 'self is not defined' error in SSR
    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': JSON.stringify('undefined'),
          'self': 'undefined',
        })
      );
    }

    // NOTE: Do NOT override config.optimization.splitChunks here. Next.js ships a
    // carefully-tuned splitChunks config that keeps CSS chunks associated with the
    // correct entry. A wholesale replacement (a custom `chunks: 'all'` with only
    // vendor/styled cacheGroups) breaks that association, causing a CSS file to be
    // emitted into the entry's *script* bootstrap list as `<script src="….css">`.
    // The browser then refuses it ("MIME type text/css is not executable"), the app
    // JS never executes, hydration fails, and every <Link> on the page is dead.

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      http2: false,
      child_process: false,
    };
    
    return config;
  },
  // Compression for better performance
  compress: true,
  // Optimize for performance
  poweredByHeader: false,
  generateEtags: false,
  // Styled-components configuration
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
