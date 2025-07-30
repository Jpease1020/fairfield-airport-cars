#!/usr/bin/env node

/**
 * Comprehensive App Monitoring Script
 * 
 * This script monitors the entire Fairfield Airport Cars application for:
 * - Broken user interactions (buttons, forms, inputs)
 * - API endpoint failures
 * - Performance issues
 * - Error rates
 * - Critical functionality failures
 * 
 * Usage:
 *   node scripts/monitor-app.js
 *   npm run monitor
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  endpoints: [
    // Customer-facing pages
    { path: '/', name: 'Homepage', critical: true },
    { path: '/book', name: 'Booking Form', critical: true },
    { path: '/help', name: 'Help Page', critical: false },
    { path: '/about', name: 'About Page', critical: false },
    { path: '/privacy', name: 'Privacy Policy', critical: false },
    { path: '/terms', name: 'Terms of Service', critical: false },
    
    // Admin pages
    { path: '/admin', name: 'Admin Dashboard', critical: true },
    { path: '/admin/bookings', name: 'Bookings Management', critical: true },
    { path: '/admin/cms', name: 'CMS Management', critical: true },
    { path: '/admin/ai-assistant', name: 'AI Assistant', critical: false },
    
    // API endpoints
    { path: '/api/estimate-fare', name: 'Fare Estimation API', critical: true, method: 'POST' },
    { path: '/api/places-autocomplete', name: 'Places Autocomplete API', critical: true, method: 'POST' },
    { path: '/api/create-checkout-session', name: 'Payment API', critical: true, method: 'POST' },
    { path: '/api/send-confirmation', name: 'Confirmation API', critical: true, method: 'POST' },
    { path: '/api/ai-assistant', name: 'AI Assistant API', critical: false, method: 'POST' },
    { path: '/api/analytics/summary', name: 'Analytics API', critical: false, method: 'GET' },
  ],
  
  // Test scenarios
  testScenarios: [
    {
      name: 'Booking Flow Test',
      steps: [
        { action: 'GET', path: '/book', expectedStatus: 200 },
        { action: 'POST', path: '/api/estimate-fare', data: {
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          passengers: 2
        }, expectedStatus: 200 },
        { action: 'POST', path: '/api/places-autocomplete', data: {
          query: 'Fairfield'
        }, expectedStatus: 200 }
      ]
    },
    {
      name: 'Admin Access Test',
      steps: [
        { action: 'GET', path: '/admin', expectedStatus: 302 }, // Should redirect to login
        { action: 'GET', path: '/admin/login', expectedStatus: 200 }
      ]
    }
  ],
  
  // Thresholds
  thresholds: {
    maxResponseTime: 5000, // 5 seconds
    maxErrorRate: 0.05, // 5%
    criticalEndpoints: ['/', '/book', '/admin', '/api/estimate-fare', '/api/create-checkout-session']
  }
};

class AppMonitor {
  constructor() {
    this.results = {
      startTime: new Date(),
      tests: [],
      errors: [],
      warnings: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        critical: 0,
        criticalFailed: 0
      }
    };
  }

  // Main monitoring function
  async run() {
    console.log('🔍 Starting comprehensive app monitoring...\n');
    
    try {
      // Test all endpoints
      await this.testEndpoints();
      
      // Run test scenarios
      await this.runTestScenarios();
      
      // Check analytics data
      await this.checkAnalytics();
      
      // Generate report
      this.generateReport();
      
      // Send notifications if needed
      await this.sendNotifications();
      
    } catch (error) {
      console.error('❌ Monitoring failed:', error);
      process.exit(1);
    }
  }

  // Test individual endpoints
  async testEndpoints() {
    console.log('📡 Testing endpoints...');
    
    for (const endpoint of CONFIG.endpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  // Test a single endpoint
  async testEndpoint(endpoint) {
    const startTime = Date.now();
    const testResult = {
      name: endpoint.name,
      path: endpoint.path,
      critical: endpoint.critical,
      status: 'pending',
      responseTime: 0,
      statusCode: 0,
      error: null
    };

    try {
      const url = `${CONFIG.baseUrl}${endpoint.path}`;
      const method = endpoint.method || 'GET';
      
      const response = await this.makeRequest(url, method, endpoint.data);
      
      testResult.statusCode = response.statusCode;
      testResult.responseTime = Date.now() - startTime;
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        testResult.status = 'passed';
        this.results.summary.passed++;
      } else {
        testResult.status = 'failed';
        testResult.error = `HTTP ${response.statusCode}`;
        this.results.summary.failed++;
        
        if (endpoint.critical) {
          this.results.summary.criticalFailed++;
        }
      }
      
      // Check response time
      if (testResult.responseTime > CONFIG.thresholds.maxResponseTime) {
        this.results.warnings.push({
          type: 'performance',
          message: `${endpoint.name} is slow (${testResult.responseTime}ms)`,
          endpoint: endpoint.path
        });
      }
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      this.results.summary.failed++;
      
      if (endpoint.critical) {
        this.results.summary.criticalFailed++;
        this.results.errors.push({
          type: 'critical',
          message: `Critical endpoint ${endpoint.name} is down`,
          endpoint: endpoint.path,
          error: error.message
        });
      }
    }
    
    this.results.summary.total++;
    if (endpoint.critical) {
      this.results.summary.critical++;
    }
    
    this.results.tests.push(testResult);
    
    // Log result
    const statusIcon = testResult.status === 'passed' ? '✅' : '❌';
    const timeInfo = testResult.responseTime ? ` (${testResult.responseTime}ms)` : '';
    console.log(`${statusIcon} ${endpoint.name}${timeInfo}`);
  }

  // Make HTTP request
  makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AppMonitor/1.0'
        }
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      
      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // Run test scenarios
  async runTestScenarios() {
    console.log('\n🧪 Running test scenarios...');
    
    for (const scenario of CONFIG.testScenarios) {
      console.log(`\n📋 ${scenario.name}:`);
      
      for (const step of scenario.steps) {
        try {
          const url = `${CONFIG.baseUrl}${step.path}`;
          const response = await this.makeRequest(url, step.action, step.data);
          
          if (response.statusCode === step.expectedStatus) {
            console.log(`  ✅ ${step.action} ${step.path}`);
          } else {
            console.log(`  ❌ ${step.action} ${step.path} (expected ${step.expectedStatus}, got ${response.statusCode})`);
            this.results.warnings.push({
              type: 'scenario',
              message: `Scenario step failed: ${step.action} ${step.path}`,
              expected: step.expectedStatus,
              actual: response.statusCode
            });
          }
        } catch (error) {
          console.log(`  ❌ ${step.action} ${step.path} - ${error.message}`);
          this.results.errors.push({
            type: 'scenario',
            message: `Scenario step failed: ${step.action} ${step.path}`,
            error: error.message
          });
        }
      }
    }
  }

  // Check analytics data
  async checkAnalytics() {
    console.log('\n📊 Checking analytics data...');
    
    try {
      const response = await this.makeRequest(`${CONFIG.baseUrl}/api/analytics/summary`);
      
      if (response.statusCode === 200) {
        const analytics = JSON.parse(response.body);
        
        // Check error rate
        if (analytics.totalInteractions > 0) {
          const errorRate = analytics.totalErrors / analytics.totalInteractions;
          
          if (errorRate > CONFIG.thresholds.maxErrorRate) {
            this.results.warnings.push({
              type: 'analytics',
              message: `High error rate detected: ${(errorRate * 100).toFixed(2)}%`,
              errorRate: errorRate,
              totalInteractions: analytics.totalInteractions,
              totalErrors: analytics.totalErrors
            });
          }
        }
        
        console.log(`  📈 Total interactions: ${analytics.totalInteractions}`);
        console.log(`  🚨 Total errors: ${analytics.totalErrors}`);
        
      } else {
        console.log('  ⚠️ Analytics API not accessible');
      }
    } catch (error) {
      console.log('  ❌ Analytics check failed:', error.message);
    }
  }

  // Generate monitoring report
  generateReport() {
    console.log('\n📋 Monitoring Report');
    console.log('='.repeat(50));
    
    // Summary
    const successRate = this.results.summary.total > 0 
      ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)
      : '0';
    
    console.log(`Overall Success Rate: ${successRate}%`);
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Critical Tests: ${this.results.summary.critical}`);
    console.log(`Critical Failed: ${this.results.summary.criticalFailed}`);
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Critical Errors:');
      this.results.errors.forEach(error => {
        console.log(`  • ${error.message}`);
        if (error.endpoint) console.log(`    Endpoint: ${error.endpoint}`);
        if (error.error) console.log(`    Error: ${error.error}`);
      });
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  • ${warning.message}`);
      });
    }
    
    // Failed tests
    const failedTests = this.results.tests.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  • ${test.name} (${test.path})`);
        if (test.error) console.log(`    Error: ${test.error}`);
        if (test.responseTime) console.log(`    Time: ${test.responseTime}ms`);
      });
    }
    
    // Performance issues
    const slowTests = this.results.tests.filter(t => t.responseTime > CONFIG.thresholds.maxResponseTime);
    if (slowTests.length > 0) {
      console.log('\n🐌 Slow Responses:');
      slowTests.forEach(test => {
        console.log(`  • ${test.name}: ${test.responseTime}ms`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'reports', 'monitoring-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);
  }

  // Send notifications if critical issues found
  async sendNotifications() {
    const hasCriticalErrors = this.results.summary.criticalFailed > 0;
    const hasHighErrorRate = this.results.warnings.some(w => w.type === 'analytics');
    
    if (hasCriticalErrors || hasHighErrorRate) {
      console.log('\n🔔 Sending notifications...');
      
      try {
        // Send to notification API
        const notificationData = {
          type: hasCriticalErrors ? 'critical' : 'warning',
          title: hasCriticalErrors ? '🚨 Critical App Issues Detected' : '⚠️ App Performance Issues',
          message: this.generateNotificationMessage(),
          context: {
            successRate: this.results.summary.total > 0 
              ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)
              : '0',
            criticalFailed: this.results.summary.criticalFailed,
            totalErrors: this.results.errors.length,
            totalWarnings: this.results.warnings.length
          }
        };
        
        const response = await this.makeRequest(`${CONFIG.baseUrl}/api/notifications/monitoring`, 'POST', notificationData);
        
        if (response.statusCode === 200) {
          console.log('  ✅ Notification sent successfully');
        } else {
          console.log('  ⚠️ Failed to send notification');
        }
      } catch (error) {
        console.log('  ❌ Notification failed:', error.message);
      }
    }
  }

  // Generate notification message
  generateNotificationMessage() {
    const messages = [];
    
    if (this.results.summary.criticalFailed > 0) {
      messages.push(`${this.results.summary.criticalFailed} critical endpoints are down`);
    }
    
    if (this.results.errors.length > 0) {
      messages.push(`${this.results.errors.length} errors detected`);
    }
    
    if (this.results.warnings.length > 0) {
      messages.push(`${this.results.warnings.length} warnings detected`);
    }
    
    const successRate = this.results.summary.total > 0 
      ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)
      : '0';
    
    messages.push(`Overall success rate: ${successRate}%`);
    
    return messages.join('. ');
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new AppMonitor();
  monitor.run().then(() => {
    console.log('\n✅ Monitoring completed');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = AppMonitor; 