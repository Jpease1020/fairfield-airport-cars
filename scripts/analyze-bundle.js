#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BundleAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      bundleSizes: {},
      recommendations: [],
      issues: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing bundle size and performance...\n');

    try {
      // Build the project
      console.log('📦 Building project...');
      execSync('npm run build', { stdio: 'pipe' });
      
      // Analyze bundle sizes
      this.analyzeBundleSizes();
      
      // Check for large dependencies
      this.analyzeDependencies();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  analyzeBundleSizes() {
    console.log('📊 Analyzing bundle sizes...');
    
    const buildDir = path.join(this.projectRoot, '.next');
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }

    // Analyze static files
    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      this.analyzeDirectory(staticDir, 'static');
    }

    // Analyze chunks
    const chunksDir = path.join(buildDir, 'static', 'chunks');
    if (fs.existsSync(chunksDir)) {
      this.analyzeDirectory(chunksDir, 'chunks');
    }
  }

  analyzeDirectory(dirPath, type) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      if (sizeKB > 100) {
        this.results.bundleSizes[file] = {
          size: sizeKB,
          type,
          path: filePath
        };
      }
    });
  }

  analyzeDependencies() {
    console.log('📦 Analyzing dependencies...');
    
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
    );

    const largeDeps = [
      'firebase',
      'firebase-admin', 
      'styled-components',
      'lucide-react',
      '@fullcalendar/core',
      'puppeteer'
    ];

    largeDeps.forEach(dep => {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        this.results.issues.push({
          type: 'large-dependency',
          dependency: dep,
          severity: 'warning'
        });
      }
    });
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    // Bundle size recommendations
    const totalSize = Object.values(this.results.bundleSizes)
      .reduce((sum, file) => sum + file.size, 0);
    
    if (totalSize > 500) {
      this.results.recommendations.push({
        priority: 'high',
        category: 'bundle-size',
        title: 'Bundle size is too large',
        description: `Total bundle size: ${totalSize}KB. Consider code splitting and lazy loading.`,
        action: 'Implement route-based code splitting'
      });
    }

    // Provider consolidation
    this.results.recommendations.push({
      priority: 'high',
      category: 'architecture',
      title: 'Consolidate providers',
      description: 'Merge CMSProvider, AdminProvider, and EditModeProvider into UnifiedAuthProvider',
      action: 'Replace multiple providers with UnifiedAuthProvider'
    });

    // CMS optimization
    this.results.recommendations.push({
      priority: 'medium',
      category: 'cms',
      title: 'Optimize CMS loading',
      description: 'Use hybrid server/client approach for CMS content',
      action: 'Implement CMSWrapper with progressive loading'
    });

    // Firebase optimization
    if (this.results.issues.some(issue => issue.dependency === 'firebase')) {
      this.results.recommendations.push({
        priority: 'medium',
        category: 'dependencies',
        title: 'Optimize Firebase usage',
        description: 'Firebase SDK is large. Consider lazy loading and tree shaking.',
        action: 'Implement Firebase lazy loading'
      });
    }
  }

  printResults() {
    console.log('\n📋 BUNDLE ANALYSIS RESULTS\n');
    
    // Bundle sizes
    if (Object.keys(this.results.bundleSizes).length > 0) {
      console.log('📊 Bundle Sizes:');
      Object.entries(this.results.bundleSizes)
        .sort(([,a], [,b]) => b.size - a.size)
        .forEach(([file, info]) => {
          console.log(`  ${file}: ${info.size}KB (${info.type})`);
        });
      console.log('');
    }

    // Issues
    if (this.results.issues.length > 0) {
      console.log('⚠️  Issues Found:');
      this.results.issues.forEach(issue => {
        console.log(`  ${issue.dependency}: Large dependency detected`);
      });
      console.log('');
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .forEach((rec, index) => {
          console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
          console.log(`     ${rec.description}`);
          console.log(`     Action: ${rec.action}`);
          console.log('');
        });
    }

    // Summary
    const totalSize = Object.values(this.results.bundleSizes)
      .reduce((sum, file) => sum + file.size, 0);
    
    console.log('📈 Summary:');
    console.log(`  Total bundle size: ${totalSize}KB`);
    console.log(`  Issues found: ${this.results.issues.length}`);
    console.log(`  Recommendations: ${this.results.recommendations.length}`);
    
    if (totalSize > 500) {
      console.log('\n🚨 Bundle size is too large! Implement optimizations immediately.');
    } else if (totalSize > 300) {
      console.log('\n⚠️  Bundle size is moderate. Consider optimizations for better performance.');
    } else {
      console.log('\n✅ Bundle size is good!');
    }
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze().catch(console.error); 