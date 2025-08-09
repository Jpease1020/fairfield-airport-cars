import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.stories.*',
        // Build artifacts and generated files
        '.next/',
        'dist/',
        'build/',
        'out/',
        // Configuration files
        '.eslintrc.js',
        '.eslintrc.*',
        '*.config.js',
        '*.config.ts',
        // Scripts and utilities
        'scripts/',
        'scripts/**/*',
        // Type definitions
        '**/*.d.ts',
        'types/**/*',
        // Generated files
        '**/*.generated.*',
        '**/*.min.js',
        // Coverage reports
        'coverage/',
        'coverage/**/*',
        // Test files
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.test.tsx',
        '**/*.spec.tsx',
        // Documentation
        'docs/',
        '**/*.md',
        // Environment files
        '.env*',
        // Lock files
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        // Future features (work in progress)
        'src/future-features/**',
      ],
      include: [
        'src/**/*',
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.js',
        'src/**/*.jsx',
      ],
      thresholds: {
        global: {
          branches: 4,
          functions: 4,
          lines: 4,
          statements: 4,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/ui': path.resolve(__dirname, './src/design/ui'),
      '@/design': path.resolve(__dirname, './src/design'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
}); 