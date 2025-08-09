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
    alias: [
      // Order matters: more specific aliases first
      { find: '@/ui', replacement: path.resolve(__dirname, './src/design/ui.ts') },
      { find: '@/design', replacement: path.resolve(__dirname, './src/design') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@/types', replacement: path.resolve(__dirname, './src/types') },
      { find: '@/app', replacement: path.resolve(__dirname, './src/app') },
      { find: '@/utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
}); 