#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestAnalytics {
  constructor() {
    this.results = {
      unit: { time: 0, coverage: 0, tests: 0 },
      integration: { time: 0, coverage: 0, tests: 0 },
      e2e: { time: 0, tests: 0 },
      total: { time: 0, tests: 0 }
    };
    this.recommendations = [];
  }

  async runUnitTests() {
    console.log('🧪 Running unit tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:unit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const endTime = Date.now();
      this.results.unit.time = endTime - startTime;
      
      // Parse test count
      const testMatch = output.match(/(\d+) tests?/);
      if (testMatch) {
        this.results.unit.tests = parseInt(testMatch[1]);
      }
      
      // Parse coverage
      const coverageMatch = output.match(/All files\s+\|\s+(\d+)/);
      if (coverageMatch) {
        this.results.unit.coverage = parseInt(coverageMatch[1]);
      }
      
      console.log(`✅ Unit tests completed in ${this.results.unit.time}ms`);
    } catch (error) {
      console.error('❌ Unit tests failed:', error.message);
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:integration', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const endTime = Date.now();
      this.results.integration.time = endTime - startTime;
      
      // Parse test count
      const testMatch = output.match(/(\d+) tests?/);
      if (testMatch) {
        this.results.integration.tests = parseInt(testMatch[1]);
      }
      
      console.log(`✅ Integration tests completed in ${this.results.integration.time}ms`);
    } catch (error) {
      console.error('❌ Integration tests failed:', error.message);
    }
  }

  async runE2ETests() {
    console.log('🌐 Running E2E tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:e2e', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const endTime = Date.now();
      this.results.e2e.time = endTime - startTime;
      
      // Parse test count
      const testMatch = output.match(/(\d+) tests?/);
      if (testMatch) {
        this.results.e2e.tests = parseInt(testMatch[1]);
      }
      
      console.log(`✅ E2E tests completed in ${this.results.e2e.time}ms`);
    } catch (error) {
      console.error('❌ E2E tests failed:', error.message);
    }
  }

  calculateTotals() {
    this.results.total.time = this.results.unit.time + this.results.integration.time + this.results.e2e.time;
    this.results.total.tests = this.results.unit.tests + this.results.integration.tests + this.results.e2e.tests;
  }

  generateRecommendations() {
    // Test execution time recommendations
    if (this.results.total.time > 60000) { // 1 minute
      this.recommendations.push('⚡ Consider parallelizing tests to reduce execution time');
    }
    
    if (this.results.e2e.time > this.results.total.time * 0.7) {
      this.recommendations.push('🎯 E2E tests are taking too long. Consider moving more tests to integration level');
    }
    
    // Coverage recommendations
    if (this.results.unit.coverage < 70) {
      this.recommendations.push('📊 Unit test coverage is below 70%. Add more unit tests');
    }
    
    // Test distribution recommendations
    const totalTests = this.results.total.tests;
    if (totalTests > 0) {
      const unitPercentage = (this.results.unit.tests / totalTests) * 100;
      const integrationPercentage = (this.results.integration.tests / totalTests) * 100;
      const e2ePercentage = (this.results.e2e.tests / totalTests) * 100;
      
      if (unitPercentage < 50) {
        this.recommendations.push('📈 Increase unit test coverage. Aim for 50%+ of total tests');
      }
      
      if (e2ePercentage > 30) {
        this.recommendations.push('🔄 Too many E2E tests. Move complex scenarios to integration tests');
      }
    }
    
    // Performance recommendations
    if (this.results.unit.time > 10000) {
      this.recommendations.push('🚀 Unit tests are slow. Check for heavy operations or unnecessary setup');
    }
    
    if (this.results.integration.time > 30000) {
      this.recommendations.push('⚡ Integration tests are slow. Consider better mocking strategies');
    }
  }

  generateReport() {
    console.log('\n📊 Test Analytics Report');
    console.log('='.repeat(50));
    
    console.log('\n⏱️  Execution Times:');
    console.log(`  Unit Tests: ${this.results.unit.time}ms (${this.results.unit.tests} tests)`);
    console.log(`  Integration Tests: ${this.results.integration.time}ms (${this.results.integration.tests} tests)`);
    console.log(`  E2E Tests: ${this.results.e2e.time}ms (${this.results.e2e.tests} tests)`);
    console.log(`  Total: ${this.results.total.time}ms (${this.results.total.tests} tests)`);
    
    console.log('\n📈 Coverage:');
    console.log(`  Unit Test Coverage: ${this.results.unit.coverage}%`);
    
    console.log('\n🎯 Recommendations:');
    this.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      recommendations: this.recommendations
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../reports/test-analytics.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 Report saved to reports/test-analytics.json');
  }

  async runFullAnalysis() {
    console.log('🚀 Starting comprehensive test analysis...\n');
    
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runE2ETests();
    
    this.calculateTotals();
    this.generateRecommendations();
    this.generateReport();
  }
}

// Run the analysis
const analytics = new TestAnalytics();
analytics.runFullAnalysis().catch(console.error); 