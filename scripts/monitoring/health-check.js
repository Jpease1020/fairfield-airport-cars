#!/usr/bin/env node

// Production health check script
// Run this regularly to monitor system health

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

class HealthChecker {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async checkEndpoint(path, name, expectedStatus = 200) {
    return new Promise((resolve) => {
      const url = `${BASE_URL}${path}`;
      const client = url.startsWith('https') ? https : http;
      const startTime = Date.now();
      
      const timeout = setTimeout(() => {
        this.results.push({
          name,
          path,
          status: 'TIMEOUT',
          responseTime: 5000,
          error: 'Request timed out'
        });
        resolve();
      }, 5000);

      client.get(url, (res) => {
        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode === expectedStatus) {
          this.results.push({
            name,
            path,
            status: 'HEALTHY',
            responseTime,
            statusCode: res.statusCode
          });
        } else {
          this.results.push({
            name,
            path,
            status: 'UNHEALTHY',
            responseTime,
            statusCode: res.statusCode,
            error: `Expected ${expectedStatus}, got ${res.statusCode}`
          });
        }
        resolve();
      }).on('error', (err) => {
        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;
        this.results.push({
          name,
          path,
          status: 'ERROR',
          responseTime,
          error: err.message
        });
        resolve();
      });
    });
  }

  async runChecks() {
    console.log('🏥 Running health checks...\n');

    const checks = [
      { path: '/', name: 'Homepage' },
      { path: '/book', name: 'Booking Form' },
      { path: '/help', name: 'Help Page' },
      { path: '/admin', name: 'Admin Login' },
      { path: '/api/estimate-fare', name: 'Fare API', expectedStatus: 400 },
      { path: '/api/places-autocomplete', name: 'Places API', expectedStatus: 400 },
    ];

    for (const check of checks) {
      await this.checkEndpoint(check.path, check.name, check.expectedStatus);
    }

    this.printResults();
  }

  printResults() {
    const totalTime = Date.now() - this.startTime;
    const healthy = this.results.filter(r => r.status === 'HEALTHY').length;
    const total = this.results.length;

    console.log('\n📊 Health Check Results:');
    console.log('='.repeat(50));

    this.results.forEach(result => {
      const status = result.status === 'HEALTHY' ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      console.log(`${status} ${result.name} (${time})`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Overall: ${healthy}/${total} healthy endpoints`);
    console.log(`Total time: ${totalTime}ms`);

    if (healthy === total) {
      console.log('🎉 All systems healthy!');
      process.exit(0);
    } else {
      console.log('⚠️  Some systems unhealthy. Check logs.');
      process.exit(1);
    }
  }
}

// Run health checks
const checker = new HealthChecker();
checker.runChecks().catch(console.error); 