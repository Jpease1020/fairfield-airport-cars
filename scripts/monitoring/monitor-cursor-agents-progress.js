#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getCurrentViolations() {
  try {
    const result = execSync('npm run check:components', { encoding: 'utf8' });
    return result;
  } catch (error) {
    return error.stdout || error.message;
  }
}

function parseViolations(output) {
  const violations = {
    errors: [],
    warnings: [],
    files: new Set(),
    types: {
      'className prop': 0,
      'div tag': 0,
      'span tag': 0,
      'p tag': 0,
      'h1-h6 tags': 0,
      'a tag': 0,
      'button tag': 0,
      'input tag': 0,
      'label tag': 0,
      'ul/ol tags': 0,
      'li tag': 0,
      'main tag': 0,
      'inline style': 0,
      'nested Container': 0,
      'nested Stack': 0,
      'wrong import': 0,
      'hardcoded text': 0
    }
  };

  const lines = output.split('\n');
  let currentFile = '';

  for (const line of lines) {
    if (line.includes('📄')) {
      currentFile = line.split('📄 ')[1];
      violations.files.add(currentFile);
    } else if (line.includes('❌ FORBIDDEN:')) {
      violations.errors.push({ file: currentFile, message: line.trim() });
      
      // Count by type
      if (line.includes('className prop')) violations.types['className prop']++;
      else if (line.includes('div tag')) violations.types['div tag']++;
      else if (line.includes('span tag')) violations.types['span tag']++;
      else if (line.includes('p tag')) violations.types['p tag']++;
      else if (line.includes('h1-h6 tags')) violations.types['h1-h6 tags']++;
      else if (line.includes('a tag')) violations.types['a tag']++;
      else if (line.includes('button tag')) violations.types['button tag']++;
      else if (line.includes('input tag')) violations.types['input tag']++;
      else if (line.includes('label tag')) violations.types['label tag']++;
      else if (line.includes('ul/ol tags')) violations.types['ul/ol tags']++;
      else if (line.includes('li tag')) violations.types['li tag']++;
      else if (line.includes('main tag')) violations.types['main tag']++;
      else if (line.includes('inline style')) violations.types['inline style']++;
      else if (line.includes('nested Container')) violations.types['nested Container']++;
      else if (line.includes('nested Stack')) violations.types['nested Stack']++;
      else if (line.includes('wrong import')) violations.types['wrong import']++;
    } else if (line.includes('⚠️  WARNING:')) {
      violations.warnings.push({ file: currentFile, message: line.trim() });
      if (line.includes('Hardcoded text')) violations.types['hardcoded text']++;
    }
  }

  return violations;
}

function generateProgressReport(violations) {
  const totalErrors = violations.errors.length;
  const totalWarnings = violations.warnings.length;
  const totalFiles = violations.files.size;

  log('\n' + '='.repeat(60), 'cyan');
  log('🎯 CURSOR AGENTS PROGRESS MONITOR', 'bold');
  log('='.repeat(60), 'cyan');

  log(`\n📊 CURRENT STATUS:`, 'bold');
  log(`   Total Errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
  log(`   Total Warnings: ${totalWarnings}`, 'yellow');
  log(`   Files with Issues: ${totalFiles}`, 'blue');

  log(`\n🔍 VIOLATION BREAKDOWN:`, 'bold');
  Object.entries(violations.types)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .forEach(([type, count]) => {
      const color = count > 10 ? 'red' : count > 5 ? 'yellow' : 'green';
      log(`   ${type}: ${count}`, color);
    });

  log(`\n📁 FILES WITH MOST VIOLATIONS:`, 'bold');
  const fileViolations = {};
  violations.errors.forEach(error => {
    if (error.file) {
      fileViolations[error.file] = (fileViolations[error.file] || 0) + 1;
    }
  });

  Object.entries(fileViolations)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count]) => {
      log(`   ${file}: ${count} violations`, count > 10 ? 'red' : 'yellow');
    });

  log(`\n🎯 PRIORITY TARGETS FOR CURSOR AGENTS:`, 'bold');
  log(`   1. Files with >10 violations (high impact)`, 'red');
  log(`   2. Common violation types (div, span, className)`, 'yellow');
  log(`   3. Wrong imports (quick wins)`, 'green');
  log(`   4. Nested containers (structural issues)`, 'magenta');

  log(`\n💡 AGENT GUIDANCE:`, 'bold');
  log(`   • Focus on one file at a time`, 'cyan');
  log(`   • Start with files having >5 violations`, 'cyan');
  log(`   • Use the AI prompt from CURSOR_AGENTS_READY.md`, 'cyan');
  log(`   • Test changes with 'npm run check:components'`, 'cyan');
  log(`   • Commit working changes frequently`, 'cyan');

  return {
    totalErrors,
    totalWarnings,
    totalFiles,
    violations
  };
}

function checkForRecentChanges() {
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const modifiedFiles = gitStatus
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3)); // Remove status prefix

    if (modifiedFiles.length > 0) {
      log(`\n🔄 RECENT CHANGES DETECTED:`, 'bold');
      modifiedFiles.forEach(file => {
        log(`   ${file}`, 'green');
      });
    } else {
      log(`\n📝 No recent changes detected`, 'yellow');
    }

    return modifiedFiles;
  } catch (error) {
    log(`\n❌ Error checking git status: ${error.message}`, 'red');
    return [];
  }
}

function saveProgressSnapshot(stats) {
  const timestamp = new Date().toISOString();
  const snapshot = {
    timestamp,
    stats,
    date: new Date().toLocaleString()
  };

  const snapshotsDir = path.join(__dirname, '..', 'reports', 'cursor-agents-snapshots');
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  const filename = `progress-${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(snapshotsDir, filename);

  let snapshots = [];
  if (fs.existsSync(filepath)) {
    try {
      snapshots = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (error) {
      snapshots = [];
    }
  }

  snapshots.push(snapshot);
  fs.writeFileSync(filepath, JSON.stringify(snapshots, null, 2));

  log(`\n💾 Progress snapshot saved to: ${filename}`, 'cyan');
}

function main() {
  log('🔍 Monitoring Cursor Agents Progress...', 'bold');

  // Check for recent changes
  const recentChanges = checkForRecentChanges();

  // Get current violations
  const violationsOutput = getCurrentViolations();
  const violations = parseViolations(violationsOutput);

  // Generate report
  const stats = generateProgressReport(violations);

  // Save snapshot
  saveProgressSnapshot(stats);

  // Provide actionable guidance
  log(`\n🚀 NEXT STEPS:`, 'bold');
  if (stats.totalErrors > 0) {
    log(`   1. Share this report with Cursor Agents`, 'cyan');
    log(`   2. Focus on files with highest violation counts`, 'cyan');
    log(`   3. Use the AI prompt template for consistent fixes`, 'cyan');
    log(`   4. Monitor progress with: npm run monitor:agents`, 'cyan');
  } else {
    log(`   🎉 All violations resolved! Great work!`, 'green');
  }

  log(`\n📋 Quick Commands:`, 'bold');
  log(`   npm run check:components    - Check current violations`, 'cyan');
  log(`   npm run monitor:agents      - Run this monitoring script`, 'cyan');
  log(`   git status                  - Check recent changes`, 'cyan');
  log(`   git log --oneline -10       - View recent commits`, 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { main, parseViolations, generateProgressReport }; 