import { setupWorker } from 'msw/browser';
import { handlers } from '../../../tests/mocks/handlers';

let worker: ReturnType<typeof setupWorker> | null = null;

export async function setupDemoMSW() {
  if (typeof window === 'undefined') {
    // Server-side, do nothing
    return;
  }

  try {
    // Only setup MSW if not already running
    if (!worker) {
      console.log('🎭 Setting up MSW worker...');
      worker = setupWorker(...handlers);
      
      // Add request interception logging
      worker.events.on('request:start', ({ request }) => {
        console.log('🎭 MSW intercepted request:', request.method, request.url);
      });
      
      await worker.start({
        onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('🎭 Demo MSW started - API calls will be mocked');
      
      // Test if MSW is working
      try {
        const testResponse = await fetch('/api/test-endpoint');
        const testData = await testResponse.json();
        console.log('🎭 MSW test successful:', testData);
      } catch (error) {
        console.warn('🎭 MSW test failed:', error);
      }
    } else {
      console.log('🎭 MSW already running');
    }
  } catch (error) {
    console.error('Failed to start demo MSW:', error);
  }
}

export async function stopDemoMSW() {
  if (worker) {
    try {
      await worker.stop();
      worker = null;
      console.log('🎭 Demo MSW stopped - API calls will be real');
    } catch (error) {
      console.warn('Failed to stop demo MSW:', error);
    }
  }
}

export function isDemoMSWRunning(): boolean {
  return worker !== null;
}
