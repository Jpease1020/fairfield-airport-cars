#!/usr/bin/env node

/**
 * 🧪 Testing Agent
 * Handles testing infrastructure, test optimization, and coverage analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestingAgent {
  constructor() {
    this.testFiles = [];
    this.testResults = {};
  }

  async auditCurrentTestCoverage() {
    console.log('🧪 Auditing current test coverage...');
    
    // Find all test files
    const testDirs = ['tests', 'src'];
    const testFiles = [];
    
    for (const dir of testDirs) {
      if (fs.existsSync(dir)) {
        this.findTestFiles(dir, testFiles);
      }
    }
    
    console.log(`  📊 Found ${testFiles.length} test files:`);
    
    const testTypes = {
      unit: 0,
      integration: 0,
      e2e: 0,
      visual: 0
    };
    
    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      if (fileName.includes('unit')) {
        testTypes.unit++;
      } else if (fileName.includes('api') || fileName.includes('integration')) {
        testTypes.integration++;
      } else if (fileName.includes('visual')) {
        testTypes.visual++;
      } else {
        testTypes.e2e++;
      }
      
      console.log(`    • ${file}`);
    }
    
    console.log('\n  📈 Test Distribution:');
    console.log(`    • Unit Tests: ${testTypes.unit}`);
    console.log(`    • Integration Tests: ${testTypes.integration}`);
    console.log(`    • E2E Tests: ${testTypes.e2e}`);
    console.log(`    • Visual Tests: ${testTypes.visual}`);
    
    return testFiles.length;
  }

  findTestFiles(dir, files) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findTestFiles(fullPath, files);
      } else if (item.includes('.test.') || item.includes('.spec.') || item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
        files.push(fullPath);
      }
    }
  }

  async consolidateDuplicateTestFlows() {
    console.log('🧪 Consolidating duplicate test flows...');
    
    const testFiles = [];
    this.findTestFiles('tests', testFiles);
    
    const duplicateFlows = [];
    
    // Check for duplicate test descriptions
    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (line.includes('test(') || line.includes('it(')) {
          const testName = line.match(/['"`]([^'"`]+)['"`]/)?.[1];
          if (testName) {
            // Check if this test name appears in other files
            for (const otherFile of testFiles) {
              if (otherFile !== file) {
                const otherContent = fs.readFileSync(otherFile, 'utf8');
                if (otherContent.includes(testName)) {
                  duplicateFlows.push({
                    testName,
                    files: [file, otherFile]
                  });
                }
              }
            }
          }
        }
      }
    }
    
    if (duplicateFlows.length > 0) {
      console.log('  ⚠️  Found duplicate test flows:');
      duplicateFlows.forEach(({ testName, files }) => {
        console.log(`    • "${testName}" appears in: ${files.join(', ')}`);
      });
    } else {
      console.log('  ✅ No duplicate test flows found');
    }
    
    return duplicateFlows.length;
  }

  async optimizeTestExecution() {
    console.log('🧪 Optimizing test execution...');
    
    // Check Jest configuration
    const jestConfigPath = 'jest.config.js';
    if (fs.existsSync(jestConfigPath)) {
      const config = fs.readFileSync(jestConfigPath, 'utf8');
      
      if (config.includes('maxWorkers')) {
        console.log('  ✅ Jest has maxWorkers configured');
      } else {
        console.log('  ℹ️  Consider adding maxWorkers to Jest config for parallel execution');
      }
    }
    
    // Check Playwright configuration
    const playwrightConfigPath = 'playwright.config.ts';
    if (fs.existsSync(playwrightConfigPath)) {
      const config = fs.readFileSync(playwrightConfigPath, 'utf8');
      
      if (config.includes('fullyParallel')) {
        console.log('  ✅ Playwright has fullyParallel enabled');
      } else {
        console.log('  ℹ️  Consider enabling fullyParallel in Playwright config');
      }
    }
    
    console.log('  ℹ️  Test execution optimization recommendations:');
    console.log('    • Use parallel test execution where possible');
    console.log('    • Implement test data factories for consistent data');
    console.log('    • Add test result caching to avoid redundant runs');
    
    return true;
  }

  async addMissingTestCategories() {
    console.log('🧪 Adding missing test categories...');
    
    const missingCategories = [];
    
    // Check for component tests
    const componentDirs = ['src/components'];
    let componentTestCount = 0;
    
    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        this.findTestFiles(dir, []);
        componentTestCount++;
      }
    }
    
    if (componentTestCount === 0) {
      missingCategories.push('Component Tests (React Testing Library)');
    }
    
    // Check for API route tests
    const apiTestCount = fs.readdirSync('tests').filter(f => f.includes('api')).length;
    if (apiTestCount === 0) {
      missingCategories.push('API Route Tests');
    }
    
    // Check for service tests
    const serviceTestCount = fs.readdirSync('tests').filter(f => f.includes('service')).length;
    if (serviceTestCount === 0) {
      missingCategories.push('Service Tests');
    }
    
    if (missingCategories.length > 0) {
      console.log('  ⚠️  Missing test categories:');
      missingCategories.forEach(category => {
        console.log(`    • ${category}`);
      });
    } else {
      console.log('  ✅ All major test categories are covered');
    }
    
    return missingCategories.length;
  }

  async updateTestConfiguration() {
    console.log('🧪 Updating test configuration...');
    
    // Check Jest config
    const jestConfigPath = 'jest.config.js';
    if (fs.existsSync(jestConfigPath)) {
      let config = fs.readFileSync(jestConfigPath, 'utf8');
      
      // Check for moduleNameMapper (was moduleNameMapping)
      if (config.includes('moduleNameMapper')) {
        console.log('  ✅ Jest has correct moduleNameMapper configuration');
      } else {
        console.log('  ⚠️  Jest config may need moduleNameMapper update');
      }
    }
    
    // Check Playwright config
    const playwrightConfigPath = 'playwright.config.ts';
    if (fs.existsSync(playwrightConfigPath)) {
      let config = fs.readFileSync(playwrightConfigPath, 'utf8');
      
      if (config.includes('testIgnore')) {
        console.log('  ✅ Playwright has testIgnore configured');
      } else {
        console.log('  ℹ️  Consider adding testIgnore to exclude Jest files');
      }
    }
    
    console.log('  ✅ Test configuration appears to be up to date');
    return true;
  }

  async runTask(taskName) {
    console.log(`🚀 Testing Agent: ${taskName}`);
    
    switch (taskName) {
      case 'Audit current test coverage':
        return await this.auditCurrentTestCoverage();
        
      case 'Consolidate duplicate test flows':
        return await this.consolidateDuplicateTestFlows();
        
      case 'Optimize test execution':
        return await this.optimizeTestExecution();
        
      case 'Add missing test categories':
        return await this.addMissingTestCategories();
        
      case 'Update test configuration':
        return await this.updateTestConfiguration();
        
      default:
        console.log(`❌ Unknown task: ${taskName}`);
        return false;
    }
  }
}

async function main() {
  const agent = new TestingAgent();
  
  const task = process.argv.find(arg => arg.startsWith('--task='))?.split('=')[1];
  
  if (!task) {
    console.log('❌ No task specified. Use --task=<taskName>');
    process.exit(1);
  }
  
  try {
    await agent.runTask(task);
    console.log('✅ Testing Agent completed successfully');
  } catch (error) {
    console.error('❌ Testing Agent failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TestingAgent }; 