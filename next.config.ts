import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enhanced performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  // Server external packages
  serverExternalPackages: ['firebase-admin'],
  // Optimized image configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Advanced webpack optimization
  webpack: (config, { isServer, dev, webpack }) => {
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

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            styled: {
              test: /[\\/]node_modules[\\/]styled-components[\\/]/,
              name: 'styled-components',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }
    
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
