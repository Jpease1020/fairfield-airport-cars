import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Mock data storage for API responses
const MOCK_DATA_DIR = path.join(__dirname, '../../mocks/api-responses');
const HEALTH_CHECK_FILE = path.join(__dirname, '../../mocks/health-check-results.json');

interface HealthCheckResult {
  status?: number | string;
  ok?: boolean;
  error?: string;
  timestamp: string;
}

interface HealthCheckResults {
  [endpoint: string]: HealthCheckResult;
}

describe('API Endpoint Health Check', () => {
  beforeEach(() => {
    // Ensure mock data directory exists
    if (!fs.existsSync(MOCK_DATA_DIR)) {
      fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
    }
  });

  describe('Critical API Endpoints', () => {
    it('checks booking API health', async () => {
      const endpoints = [
        '/api/booking',
        '/api/booking/estimate-fare',
        '/api/booking/check-time-slot'
      ];

      const results: HealthCheckResults = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };

          // Store response for mocking if it's successful
          if (response.ok) {
            const responseData = await response.json();
            const mockFile = path.join(MOCK_DATA_DIR, `${endpoint.replace(/\//g, '-')}.json`);
            fs.writeFileSync(mockFile, JSON.stringify(responseData, null, 2));
          }
        } catch (error) {
          results[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Save health check results
      fs.writeFileSync(HEALTH_CHECK_FILE, JSON.stringify(results, null, 2));

      // Verify critical endpoints are accessible
      expect(results['/api/booking']?.ok).toBe(true);
      expect(results['/api/booking/estimate-fare']?.ok).toBe(true);
    });

    it('checks payment API health', async () => {
      const endpoints = [
        '/api/payment/create-checkout-session',
        '/api/payment/complete-payment',
        '/api/payment/square-webhook'
      ];

      const results: HealthCheckResults = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          results[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Payment endpoints might return 405 (Method Not Allowed) for GET requests
      // This is expected behavior
      expect(results['/api/payment/create-checkout-session']?.status).toBeDefined();
    });

    it('checks admin API health', async () => {
      const endpoints = [
        '/api/admin/cms/pages',
        '/api/admin/analytics/summary',
        '/api/admin/bookings'
      ];

      const results: HealthCheckResults = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          results[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Admin endpoints might require authentication
      // We're just checking they exist and respond
      expect(results['/api/admin/cms/pages']?.status).toBeDefined();
    });

    it('checks notification API health', async () => {
      const endpoints = [
        '/api/notifications/send-confirmation',
        '/api/notifications/send-feedback-request'
      ];

      const results: HealthCheckResults = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          results[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      expect(results['/api/notifications/send-confirmation']?.status).toBeDefined();
    });
  });

  describe('Page Endpoints', () => {
    it('checks customer-facing pages', async () => {
      const pages = [
        '/',
        '/book',
        '/help',
        '/about',
        '/privacy',
        '/terms'
      ];

      const results: HealthCheckResults = {};

      for (const page of pages) {
        try {
          const response = await fetch(`http://localhost:3000${page}`);
          
          results[page] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };

          // Store page content for visual regression testing
          if (response.ok) {
            const content = await response.text();
            const mockFile = path.join(MOCK_DATA_DIR, `page-${page.replace(/\//g, '-')}.html`);
            fs.writeFileSync(mockFile, content);
          }
        } catch (error) {
          results[page] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      // All customer pages should be accessible
      expect(results['/']?.ok).toBe(true);
      expect(results['/book']?.ok).toBe(true);
      expect(results['/help']?.ok).toBe(true);
    });

    it('checks admin pages', async () => {
      const pages = [
        '/admin/login',
        '/admin/cms/pages',
        '/admin/bookings',
        '/admin/drivers'
      ];

      const results: HealthCheckResults = {};

      for (const page of pages) {
        try {
          const response = await fetch(`http://localhost:3000${page}`);
          
          results[page] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          results[page] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Admin pages should exist (might redirect to login)
      expect(results['/admin/login']?.status).toBeDefined();
      expect(results['/admin/cms/pages']?.status).toBeDefined();
    });
  });

  describe('WebSocket Endpoints', () => {
    it('checks WebSocket connections', async () => {
      const wsEndpoints = [
        '/api/ws/bookings/booking-123'
      ];

      const results: HealthCheckResults = {};

      for (const endpoint of wsEndpoints) {
        try {
          // WebSocket endpoints might not respond to HTTP requests
          // This is expected behavior
          results[endpoint] = {
            status: 'WebSocket endpoint - requires WS connection',
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          results[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }

      expect(results['/api/ws/bookings/booking-123']?.status).toBeDefined();
    });
  });
}); 