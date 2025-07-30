#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DailyAnalysis {
  constructor() {
    this.report = {
      date: new Date().toISOString(),
      summary: {},
      architecture: {},
      performance: {},
      security: {},
      business: {},
      tests: {},
      todos: [],
      recommendations: []
    };
  }

  async run() {
    console.log('🔍 Starting daily analysis...');
    
    try {
      await this.analyzeArchitecture();
      await this.analyzePerformance();
      await this.analyzeSecurity();
      await this.analyzeBusinessMetrics();
      await this.analyzeTests();
      await this.generateTodos();
      await this.saveReport();
      
      console.log('✅ Daily analysis complete!');
      console.log(`📊 Report saved to: reports/daily-analysis-${new Date().toISOString().split('T')[0]}.json`);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    }
  }

  async analyzeArchitecture() {
    console.log('🏗️  Analyzing architecture...');
    
    const analysis = {
      components: this.analyzeComponents(),
      dependencies: this.analyzeDependencies(),
      codeQuality: this.analyzeCodeQuality(),
      structure: this.analyzeFileStructure()
    };

    this.report.architecture = analysis;
  }

  analyzeComponents() {
    const components = {
      total: 0,
      reusable: 0,
      admin: 0,
      ui: 0,
      layout: 0,
      marketing: 0
    };

    try {
      const srcPath = path.join(process.cwd(), 'src');
      const componentDirs = ['components', 'app'];
      
      componentDirs.forEach(dir => {
        const dirPath = path.join(srcPath, dir);
        if (fs.existsSync(dirPath)) {
          this.countComponents(dirPath, components);
        }
      });
    } catch (error) {
      console.warn('⚠️  Could not analyze components:', error.message);
    }

    return components;
  }

  countComponents(dirPath, components) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      if (item.isDirectory()) {
        if (item.name.includes('admin')) components.admin++;
        if (item.name.includes('ui')) components.ui++;
        if (item.name.includes('layout')) components.layout++;
        if (item.name.includes('marketing')) components.marketing++;
        components.total++;
        this.countComponents(path.join(dirPath, item.name), components);
      } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
        components.total++;
        if (item.name.includes('index')) components.reusable++;
      }
    });
  }

  analyzeDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = {
        total: Object.keys(packageJson.dependencies || {}).length,
        devDeps: Object.keys(packageJson.devDependencies || {}).length,
        outdated: this.checkOutdatedDeps(),
        security: this.checkSecurityVulnerabilities()
      };
      return deps;
    } catch (error) {
      return { error: error.message };
    }
  }

  checkOutdatedDeps() {
    try {
      const result = execSync('npm outdated --json', { encoding: 'utf8' });
      return Object.keys(JSON.parse(result)).length;
    } catch (error) {
      return 0; // No outdated deps or command failed
    }
  }

  checkSecurityVulnerabilities() {
    try {
      const result = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(result);
      return {
        vulnerabilities: audit.metadata?.vulnerabilities || {},
        summary: audit.summary || {}
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  analyzeCodeQuality() {
    const quality = {
      eslintIssues: this.runESLint(),
      typescriptIssues: this.runTypeScriptCheck(),
      fileSizes: this.analyzeFileSizes(),
      complexity: this.analyzeComplexity()
    };
    return quality;
  }

  runESLint() {
    try {
      const result = execSync('npx eslint src --format json', { encoding: 'utf8' });
      const issues = JSON.parse(result);
      return {
        total: issues.length,
        errors: issues.filter(i => i.severity === 2).length,
        warnings: issues.filter(i => i.severity === 1).length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  runTypeScriptCheck() {
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8' });
      return { errors: 0, warnings: 0 };
    } catch (error) {
      return { error: error.message };
    }
  }

  analyzeFileSizes() {
    const sizes = { large: 0, medium: 0, small: 0 };
    
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.analyzeDirectorySizes(srcPath, sizes);
    } catch (error) {
      console.warn('⚠️  Could not analyze file sizes:', error.message);
    }
    
    return sizes;
  }

  analyzeDirectorySizes(dirPath, sizes) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.analyzeDirectorySizes(fullPath, sizes);
      } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
        const stats = fs.statSync(fullPath);
        const sizeKB = stats.size / 1024;
        if (sizeKB > 50) sizes.large++;
        else if (sizeKB > 20) sizes.medium++;
        else sizes.small++;
      }
    });
  }

  analyzeComplexity() {
    // Simple complexity analysis based on file structure
    return {
      deepNesting: this.countDeepNesting(),
      largeComponents: this.countLargeComponents()
    };
  }

  countDeepNesting() {
    let count = 0;
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.countNestingLevels(srcPath, 0, count);
    } catch (error) {
      console.warn('⚠️  Could not analyze nesting:', error.message);
    }
    return count;
  }

  countNestingLevels(dirPath, level, count) {
    if (level > 4) count++;
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    items.forEach(item => {
      if (item.isDirectory()) {
        this.countNestingLevels(path.join(dirPath, item.name), level + 1, count);
      }
    });
  }

  countLargeComponents() {
    let count = 0;
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.countLargeFiles(srcPath, count);
    } catch (error) {
      console.warn('⚠️  Could not analyze large components:', error.message);
    }
    return count;
  }

  countLargeFiles(dirPath, count) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.countLargeFiles(fullPath, count);
      } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;
        if (lines > 200) count++;
      }
    });
  }

  analyzeFileStructure() {
    const structure = {
      totalFiles: 0,
      directories: 0,
      depth: 0
    };
    
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.analyzeStructure(srcPath, 0, structure);
    } catch (error) {
      console.warn('⚠️  Could not analyze file structure:', error.message);
    }
    
    return structure;
  }

  analyzeStructure(dirPath, depth, structure) {
    structure.directories++;
    structure.depth = Math.max(structure.depth, depth);
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    items.forEach(item => {
      if (item.isDirectory()) {
        this.analyzeStructure(path.join(dirPath, item.name), depth + 1, structure);
      } else {
        structure.totalFiles++;
      }
    });
  }

  async analyzePerformance() {
    console.log('⚡ Analyzing performance...');
    
    const analysis = {
      bundleSize: this.analyzeBundleSize(),
      buildTime: this.analyzeBuildTime(),
      lighthouse: await this.runLighthouse(),
      images: this.analyzeImages()
    };

    this.report.performance = analysis;
  }

  analyzeBundleSize() {
    try {
      // This would require a build to analyze
      return { estimated: 'Requires build analysis' };
    } catch (error) {
      return { error: error.message };
    }
  }

  analyzeBuildTime() {
    try {
      const start = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = Date.now() - start;
      return { timeMs: buildTime, status: 'success' };
    } catch (error) {
      return { error: error.message };
    }
  }

  async runLighthouse() {
    try {
      // This would require lighthouse CI or similar
      return { status: 'Requires lighthouse CI setup' };
    } catch (error) {
      return { error: error.message };
    }
  }

  analyzeImages() {
    const images = { total: 0, optimized: 0, large: 0 };
    
    try {
      const publicPath = path.join(process.cwd(), 'public');
      if (fs.existsSync(publicPath)) {
        const items = fs.readdirSync(publicPath);
        items.forEach(item => {
          if (item.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            images.total++;
            const stats = fs.statSync(path.join(publicPath, item));
            if (stats.size > 500 * 1024) images.large++;
            if (item.endsWith('.webp') || item.endsWith('.svg')) images.optimized++;
          }
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze images:', error.message);
    }
    
    return images;
  }

  async analyzeSecurity() {
    console.log('🔒 Analyzing security...');
    
    const analysis = {
      dependencies: this.report.architecture.dependencies.security,
      environment: this.analyzeEnvironment(),
      secrets: this.scanForSecrets(),
      permissions: this.analyzePermissions()
    };

    this.report.security = analysis;
  }

  analyzeEnvironment() {
    const env = {
      hasEnvFile: fs.existsSync('.env'),
      hasEnvExample: fs.existsSync('.env.example'),
      hasEnvLocal: fs.existsSync('.env.local'),
      hasEnvProd: fs.existsSync('.env.production')
    };
    
    return env;
  }

  scanForSecrets() {
    const secrets = { found: 0, files: [] };
    
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.scanDirectoryForSecrets(srcPath, secrets);
    } catch (error) {
      console.warn('⚠️  Could not scan for secrets:', error.message);
    }
    
    return secrets;
  }

  scanDirectoryForSecrets(dirPath, secrets) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.scanDirectoryForSecrets(fullPath, secrets);
      } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const secretPatterns = [
            /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
            /password\s*[:=]\s*['"][^'"]+['"]/gi,
            /secret\s*[:=]\s*['"][^'"]+['"]/gi,
            /token\s*[:=]\s*['"][^'"]+['"]/gi
          ];
          
          secretPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              secrets.found++;
              secrets.files.push(fullPath);
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }

  analyzePermissions() {
    // Analyze file permissions
    const permissions = { readable: 0, writable: 0 };
    
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.analyzeFilePermissions(srcPath, permissions);
    } catch (error) {
      console.warn('⚠️  Could not analyze permissions:', error.message);
    }
    
    return permissions;
  }

  analyzeFilePermissions(dirPath, permissions) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.analyzeFilePermissions(fullPath, permissions);
      } else {
        try {
          fs.accessSync(fullPath, fs.constants.R_OK);
          permissions.readable++;
        } catch (error) {
          // File not readable
        }
        
        try {
          fs.accessSync(fullPath, fs.constants.W_OK);
          permissions.writable++;
        } catch (error) {
          // File not writable
        }
      }
    });
  }

  async analyzeBusinessMetrics() {
    console.log('📊 Analyzing business metrics...');
    
    const analysis = {
      pages: this.analyzePages(),
      features: this.analyzeFeatures(),
      cms: this.analyzeCMS(),
      booking: this.analyzeBookingSystem()
    };

    this.report.business = analysis;
  }

  analyzePages() {
    const pages = { total: 0, public: 0, admin: 0, api: 0 };
    
    try {
      const appPath = path.join(process.cwd(), 'src/app');
      this.countPages(appPath, pages);
    } catch (error) {
      console.warn('⚠️  Could not analyze pages:', error.message);
    }
    
    return pages;
  }

  countPages(dirPath, pages) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      if (item.isDirectory()) {
        if (item.name === 'admin') pages.admin++;
        else if (item.name === 'api') pages.api++;
        else pages.public++;
        pages.total++;
        this.countPages(path.join(dirPath, item.name), pages);
      } else if (item.name === 'page.tsx') {
        pages.total++;
      }
    });
  }

  analyzeFeatures() {
    const features = {
      booking: this.hasFeature('booking'),
      cms: this.hasFeature('cms'),
      payments: this.hasFeature('payments'),
      notifications: this.hasFeature('notifications'),
      analytics: this.hasFeature('analytics')
    };
    
    return features;
  }

  hasFeature(feature) {
    try {
      const srcPath = path.join(process.cwd(), 'src');
      const featurePatterns = {
        booking: /booking/i,
        cms: /cms/i,
        payments: /payment|stripe|square/i,
        notifications: /notification|email|sms/i,
        analytics: /analytics|tracking/i
      };
      
      return this.searchForPattern(srcPath, featurePatterns[feature]);
    } catch (error) {
      return false;
    }
  }

  searchForPattern(dirPath, pattern) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        if (this.searchForPattern(fullPath, pattern)) return true;
      } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (pattern.test(content)) return true;
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    
    return false;
  }

  analyzeCMS() {
    const cms = {
      hasCMS: this.hasFeature('cms'),
      editablePages: 0,
      contentTypes: 0
    };
    
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.analyzeCMSFeatures(srcPath, cms);
    } catch (error) {
      console.warn('⚠️  Could not analyze CMS:', error.message);
    }
    
    return cms;
  }

  analyzeCMSFeatures(dirPath, cms) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.analyzeCMSFeatures(fullPath, cms);
      } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('editMode') || content.includes('useCMS')) {
            cms.editablePages++;
          }
          if (content.includes('contentType') || content.includes('CMS')) {
            cms.contentTypes++;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }

  analyzeBookingSystem() {
    const booking = {
      hasBooking: this.hasFeature('booking'),
      hasPayment: this.hasFeature('payments'),
      hasConfirmation: false,
      hasCancellation: false
    };
    
    try {
      const srcPath = path.join(process.cwd(), 'src');
      this.analyzeBookingFeatures(srcPath, booking);
    } catch (error) {
      console.warn('⚠️  Could not analyze booking system:', error.message);
    }
    
    return booking;
  }

  analyzeBookingFeatures(dirPath, booking) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.analyzeBookingFeatures(fullPath, booking);
      } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('confirmation') || content.includes('success')) {
            booking.hasConfirmation = true;
          }
          if (content.includes('cancel') || content.includes('cancellation')) {
            booking.hasCancellation = true;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }

  async analyzeTests() {
    console.log('🧪 Analyzing tests...');
    
    const analysis = {
      coverage: this.analyzeTestCoverage(),
      performance: this.analyzeTestPerformance(),
      types: this.analyzeTestTypes(),
      status: this.runTests()
    };

    this.report.tests = analysis;
  }

  analyzeTestCoverage() {
    try {
      const testPath = path.join(process.cwd(), 'tests');
      const coverage = { total: 0, unit: 0, integration: 0, e2e: 0 };
      
      if (fs.existsSync(testPath)) {
        this.countTests(testPath, coverage);
      }
      
      return coverage;
    } catch (error) {
      return { error: error.message };
    }
  }

  countTests(dirPath, coverage) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        this.countTests(fullPath, coverage);
      } else if (item.name.includes('.spec.') || item.name.includes('.test.')) {
        coverage.total++;
        if (item.name.includes('e2e') || item.name.includes('playwright')) {
          coverage.e2e++;
        } else if (item.name.includes('integration')) {
          coverage.integration++;
        } else {
          coverage.unit++;
        }
      }
    });
  }

  analyzeTestPerformance() {
    try {
      const start = Date.now();
      execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
      const testTime = Date.now() - start;
      return { timeMs: testTime, status: 'success' };
    } catch (error) {
      return { error: error.message };
    }
  }

  analyzeTestTypes() {
    const types = {
      unit: this.hasTestType('unit'),
      integration: this.hasTestType('integration'),
      e2e: this.hasTestType('e2e'),
      visual: this.hasTestType('visual')
    };
    
    return types;
  }

  hasTestType(type) {
    try {
      const testPath = path.join(process.cwd(), 'tests');
      if (!fs.existsSync(testPath)) return false;
      
      const items = fs.readdirSync(testPath, { withFileTypes: true });
      return items.some(item => {
        if (item.isFile()) {
          return item.name.includes(type) || item.name.includes('.spec.') || item.name.includes('.test.');
        }
        return false;
      });
    } catch (error) {
      return false;
    }
  }

  runTests() {
    try {
      execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
      return { status: 'passed', errors: 0 };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  async generateTodos() {
    console.log('📝 Generating todos...');
    
    const todos = [];
    
    // Architecture todos
    if (this.report.architecture.components.large > 0) {
      todos.push({
        category: 'Architecture',
        priority: 'medium',
        task: `Refactor ${this.report.architecture.components.large} large components to improve maintainability`,
        impact: 'Maintainability'
      });
    }
    
    if (this.report.architecture.dependencies.outdated > 0) {
      todos.push({
        category: 'Dependencies',
        priority: 'high',
        task: `Update ${this.report.architecture.dependencies.outdated} outdated dependencies`,
        impact: 'Security & Performance'
      });
    }
    
    // Performance todos
    if (this.report.performance.images.large > 0) {
      todos.push({
        category: 'Performance',
        priority: 'medium',
        task: `Optimize ${this.report.performance.images.large} large images`,
        impact: 'Page Load Speed'
      });
    }
    
    // Security todos
    if (this.report.security.secrets.found > 0) {
      todos.push({
        category: 'Security',
        priority: 'critical',
        task: `Remove ${this.report.security.secrets.found} hardcoded secrets from codebase`,
        impact: 'Security'
      });
    }
    
    // Test todos
    if (this.report.tests.coverage.total < 10) {
      todos.push({
        category: 'Testing',
        priority: 'high',
        task: 'Increase test coverage - currently very low',
        impact: 'Code Quality'
      });
    }
    
    // Business todos
    if (!this.report.business.features.analytics) {
      todos.push({
        category: 'Business',
        priority: 'medium',
        task: 'Implement analytics tracking for better business insights',
        impact: 'Business Intelligence'
      });
    }
    
    // Code quality todos
    if (this.report.architecture.codeQuality.eslintIssues.errors > 0) {
      todos.push({
        category: 'Code Quality',
        priority: 'high',
        task: `Fix ${this.report.architecture.codeQuality.eslintIssues.errors} ESLint errors`,
        impact: 'Code Quality'
      });
    }
    
    this.report.todos = todos;
  }

  async saveReport() {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filename = `daily-analysis-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.report, null, 2));
    
    // Also save a summary markdown file
    const summaryPath = path.join(reportsDir, `summary-${new Date().toISOString().split('T')[0]}.md`);
    this.generateSummaryMarkdown(summaryPath);
  }

  generateSummaryMarkdown(filepath) {
    const summary = `# Daily Analysis Summary - ${new Date().toLocaleDateString()}

## 📊 Quick Stats
- **Components**: ${this.report.architecture.components.total} total
- **Dependencies**: ${this.report.architecture.dependencies.total} total, ${this.report.architecture.dependencies.outdated} outdated
- **Security Issues**: ${this.report.security.secrets.found} secrets found
- **Test Coverage**: ${this.report.tests.coverage.total} test files
- **Performance**: ${this.report.performance.images.large} large images

## 🎯 Priority Todos
${this.report.todos
  .filter(todo => todo.priority === 'critical' || todo.priority === 'high')
  .map(todo => `- **[${todo.priority.toUpperCase()}]** ${todo.task} (${todo.impact})`)
  .join('\n')}

## 📈 Recommendations
${this.report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated automatically by daily analysis script*
`;

    fs.writeFileSync(filepath, summary);
  }
}

// Run the analysis
const analysis = new DailyAnalysis();
analysis.run().catch(console.error); 