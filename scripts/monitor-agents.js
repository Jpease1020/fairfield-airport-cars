#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Cursor Agents Real-Time Monitor');
console.log('====================================\n');

// Get current violation stats
function getCurrentViolations() {
  try {
    const result = execSync('npm run check:components', { encoding: 'utf8', stdio: 'pipe' });
    const lines = result.split('\n');
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let filesWithIssues = 0;
    let currentFile = '';
    let fileViolations = {};
    
    for (const line of lines) {
      if (line.includes('📄 ') && line.includes('.tsx')) {
        currentFile = line.split('📄 ')[1];
        if (!fileViolations[currentFile]) {
          fileViolations[currentFile] = { errors: 0, warnings: 0 };
          filesWithIssues++;
        }
      } else if (line.includes('❌')) {
        totalErrors++;
        if (currentFile) fileViolations[currentFile].errors++;
      } else if (line.includes('⚠️')) {
        totalWarnings++;
        if (currentFile) fileViolations[currentFile].warnings++;
      }
    }
    
    return { totalErrors, totalWarnings, filesWithIssues, fileViolations };
  } catch (error) {
    console.log('⚠️  Could not get violation stats - component checker may have failed');
    return { totalErrors: 'N/A', totalWarnings: 'N/A', filesWithIssues: 'N/A', fileViolations: {} };
  }
}

// Get recent git changes
function getRecentChanges() {
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const gitLog = execSync('git log --oneline -10', { encoding: 'utf8' });
    
    const modifiedFiles = gitStatus.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
    
    const recentCommits = gitLog.split('\n')
      .filter(line => line.trim())
      .slice(0, 5);
    
    return { modifiedFiles, recentCommits };
  } catch (error) {
    return { modifiedFiles: [], recentCommits: [] };
  }
}

// Check if build is passing
function checkBuildStatus() {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    return '✅ PASSING';
  } catch (error) {
    return '❌ FAILING';
  }
}

// Main monitoring function
function monitorAgents() {
  const timestamp = new Date().toLocaleString();
  console.log(`📊 Status Report - ${timestamp}\n`);
  
  // Violation Stats
  const violations = getCurrentViolations();
  console.log('🚨 Current Violation Count:');
  console.log(`   Errors: ${violations.totalErrors}`);
  console.log(`   Warnings: ${violations.totalWarnings}`);
  console.log(`   Files with Issues: ${violations.filesWithIssues}\n`);
  
  // Build Status
  console.log(`🏗️  Build Status: ${checkBuildStatus()}\n`);
  
  // Recent Changes
  const changes = getRecentChanges();
  console.log('📝 Recent Activity:');
  if (changes.modifiedFiles.length > 0) {
    console.log('   Modified Files:');
    changes.modifiedFiles.slice(0, 5).forEach(file => {
      console.log(`   📄 ${file}`);
    });
  } else {
    console.log('   No uncommitted changes');
  }
  
  if (changes.recentCommits.length > 0) {
    console.log('\n   Recent Commits:');
    changes.recentCommits.forEach(commit => {
      console.log(`   📋 ${commit}`);
    });
  }
  
  // High Priority Files
  console.log('\n🎯 HIGH PRIORITY FILES (Most Violations):');
  const sortedFiles = Object.entries(violations.fileViolations)
    .sort(([,a], [,b]) => (b.errors + b.warnings) - (a.errors + a.warnings))
    .slice(0, 10);
  
  if (sortedFiles.length > 0) {
    sortedFiles.forEach(([file, counts], index) => {
      const total = counts.errors + counts.warnings;
      if (total > 5) {
        console.log(`   ${index + 1}. ${file} (${counts.errors} errors, ${counts.warnings} warnings)`);
      }
    });
  } else {
    console.log('   🎉 No high-priority files detected!');
  }
  
  // Agent Status Assessment
  console.log('\n🤖 CURSOR AGENTS STATUS:');
  if (changes.modifiedFiles.length > 0) {
    console.log('   ✅ ACTIVE - Files being modified');
  } else if (changes.recentCommits.some(commit => commit.includes('refactor') || commit.includes('fix'))) {
    console.log('   ✅ PRODUCTIVE - Recent cleanup commits detected');
  } else {
    console.log('   ⚠️  INACTIVE - No recent activity detected');
    console.log('   💡 Agents may need unblocking or new instructions');
  }
  
  // Quick Commands
  console.log('\n🚀 QUICK COMMANDS:');
  console.log('   npm run check:components     - Full violation report');
  console.log('   npm run monitor:agents       - Run this monitor again');
  console.log('   git status                   - Check current changes');
  console.log('   git log --oneline -5         - Recent commits');
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (violations.totalErrors > 200) {
    console.log('   🔴 High error count - Focus agents on high-priority files');
  } else if (violations.totalErrors > 100) {
    console.log('   🟡 Moderate errors - Agents making good progress');
  } else {
    console.log('   🟢 Low error count - Excellent progress!');
  }
  
  if (changes.modifiedFiles.length === 0) {
    console.log('   📞 Consider checking if agents need unblocking');
    console.log('   📖 Share: scripts/cursor-agents-unblocking-guide.md');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Monitor complete. Run again to check progress.');
}

// Run the monitor
monitorAgents();