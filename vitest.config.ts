import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**', '**/.worktrees/**'],
    // Optimize memory usage - use threads with isolation
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Use single thread to prevent memory accumulation
        isolate: true, // Isolate each test file for memory safety
        minThreads: 1,
        maxThreads: 1, // Single thread only
      },
    },
    // Reduce memory pressure
    testTimeout: 10000, // 10 second timeout per test
    hookTimeout: 10000, // 10 second timeout for hooks
    teardownTimeout: 5000, // 5 second timeout for teardown
    // Run tests sequentially within a file to prevent memory accumulation
    sequence: {
      concurrent: false, // Run tests sequentially, not in parallel
      shuffle: false, // Don't shuffle to maintain order
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'tests/archive/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.next/**',
        '**/playwright-report/**',
        '**/test-results/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@/ui$': resolve(__dirname, './src/design/ui.ts'),
      '@/ui': resolve(__dirname, './src/design/ui.ts'),
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/providers': resolve(__dirname, './src/providers'),
      '@/design': resolve(__dirname, './src/design')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  }
});
