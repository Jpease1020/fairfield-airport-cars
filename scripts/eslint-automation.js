#!/usr/bin/env node

import { ESLint } from 'eslint';
import { Octokit } from 'octokit';
import chalk from 'chalk';

// Simple configuration - no complex config files needed
const CONFIG = {
  maxIssuesPerPR: 25,
  maxFilesPerPR: 8,
  branchPrefix: 'eslint-fixes-',
  baseBranch: 'main'
};

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const maxRetries = parseInt(args.find(arg => arg.startsWith('--max-retries='))?.split('=')[1]) || 3;

  console.log(chalk.blue('🚀 Starting ESLint Automation...'));
  console.log(chalk.gray('──────────────────────────────────'));

  try {
    // Check for required environment variables
    if (!process.env.GITHUB_TOKEN && !isDryRun) {
      console.error(chalk.red('❌ GITHUB_TOKEN environment variable is required'));
      console.error(chalk.gray('   Set it with: export GITHUB_TOKEN=your_token_here'));
      console.error(chalk.gray('   Or use --dry-run to test without GitHub access'));
      process.exit(1);
    }

    // Get repository info from environment or defaults
    const repo = process.env.GITHUB_REPOSITORY?.split('/') || ['fairfield-airport-cars', 'fairfield-airport-cars'];
    const [owner, repoName] = repo;

    // Run the automation
    const results = await runESLintAutomation({
      owner,
      repo: repoName,
      isDryRun,
      maxRetries
    });

    // Save results for GitHub Actions
    await saveResults(results);

    console.log(chalk.green('\n✅ ESLint automation completed successfully!'));
    console.log(chalk.blue(`📊 Processed ${results.batchesProcessed} batches out of ${results.totalBatches} total`));

  } catch (error) {
    console.error(chalk.red('❌ Automation failed:'), error.message);
    process.exit(1);
  }
}

async function runESLintAutomation({ owner, repo, isDryRun, maxRetries }) {
  // Step 1: Run ESLint analysis
  console.log(chalk.blue('🔍 Analyzing codebase for ESLint issues...'));
  const issues = await analyzeCodebase();
  
  if (issues.length === 0) {
    console.log(chalk.green('✅ No ESLint issues found!'));
    return { success: true, batchesProcessed: 0, totalBatches: 0 };
  }

  // Step 2: Create simple batches
  const batches = createBatches(issues);
  console.log(chalk.blue(`📦 Created ${batches.length} batches`));

  // Step 3: Process batches (limit to 1 per run to avoid overwhelming)
  const maxBatches = Math.min(1, batches.length);
  const processedBatches = [];

  for (let i = 0; i < maxBatches; i++) {
    const batch = batches[i];
    console.log(chalk.blue(`\n📦 Processing Batch ${batch.number}...`));
    
    if (isDryRun) {
      console.log(chalk.yellow('🔍 DRY RUN - No actual changes will be made'));
      console.log(chalk.gray(`  Would create branch: ${CONFIG.branchPrefix}batch-${batch.number}`));
      console.log(chalk.gray(`  Would create PR: 🔧 ESLint Fixes - Batch ${batch.number} (${batch.issues.length} issues, ${batch.files.length} files)`));
    } else {
      const success = await processBatch(batch, { owner, repo, maxRetries });
      if (success) {
        processedBatches.push(batch);
      }
    }
  }

  return {
    success: true,
    batchesProcessed: processedBatches.length,
    totalBatches: batches.length
  };
}

async function analyzeCodebase() {
  const eslint = new ESLint({
    overrideConfigFile: 'eslint.config.js',
    ignore: true
  });

  // Get files to analyze
  const { glob } = await import('glob');
  const files = await glob('src/**/*.{js,jsx,ts,tsx}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'playwright-report/**',
      'temp/**',
      'scripts/**',
      'docs/**',
      'tests/**',
      '*.test.*',
      '*.spec.*'
    ],
    absolute: true
  });

  console.log(chalk.blue(`📁 Found ${files.length} files to analyze`));

  // Run ESLint
  const results = await eslint.lintFiles(files);
  const issues = [];

  for (const result of results) {
    for (const message of result.messages) {
      if (message.severity >= 1) { // Include both errors and warnings
        issues.push({
          file: result.filePath,
          line: message.line,
          column: message.column,
          rule: message.ruleId,
          message: message.message,
          severity: message.severity,
          fixable: message.fix || false
        });
      }
    }
  }

  console.log(chalk.green(`✅ Analysis complete: ${issues.length} issues found`));
  
  // Show summary
  const ruleCounts = {};
  for (const issue of issues) {
    ruleCounts[issue.rule] = (ruleCounts[issue.rule] || 0) + 1;
  }
  
  console.log(chalk.blue('\n📊 Top Issues by Rule:'));
  Object.entries(ruleCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([rule, count]) => {
      console.log(chalk.gray(`  ${rule}: ${count}`));
    });

  return issues;
}

function createBatches(issues) {
  const batches = [];
  let currentBatch = [];
  let currentFiles = new Set();
  let batchNumber = 1;

  // Group issues by file
  const issuesByFile = {};
  for (const issue of issues) {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  }

  // Create simple batches
  for (const [file, fileIssues] of Object.entries(issuesByFile)) {
    // Check if adding this file would exceed limits
    if (currentBatch.length + fileIssues.length > CONFIG.maxIssuesPerPR ||
        currentFiles.size + 1 > CONFIG.maxFilesPerPR) {
      // Finalize current batch
      if (currentBatch.length > 0) {
        batches.push({
          number: batchNumber++,
          issues: currentBatch,
          files: [...currentFiles]
        });
        currentBatch = [];
        currentFiles = new Set();
      }
    }
    
    // Add file issues to current batch
    currentBatch.push(...fileIssues);
    currentFiles.add(file);
  }

  // Add final batch if there are remaining issues
  if (currentBatch.length > 0) {
    batches.push({
      number: batchNumber,
      issues: currentBatch,
      files: [...currentFiles]
    });
  }

  return batches;
}

async function processBatch(batch, { owner, repo, maxRetries }) {
  const branchName = `${CONFIG.branchPrefix}batch-${batch.number}`;
  const prTitle = `🔧 ESLint Fixes - Batch ${batch.number} (${batch.issues.length} issues, ${batch.files.length} files)`;
  
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    // Create branch
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${CONFIG.baseBranch}`
    });

    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha
    });

    console.log(chalk.green(`✅ Created branch: ${branchName}`));

    // Create PR
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: prTitle,
      body: generatePRBody(batch),
      head: branchName,
      base: CONFIG.baseBranch
    });

    console.log(chalk.green(`✅ Created PR: ${pr.title} (#${pr.number})`));
    return true;

  } catch (error) {
    console.error(chalk.red(`❌ Failed to process batch ${batch.number}:`), error.message);
    return false;
  }
}

function generatePRBody(batch) {
  const ruleCounts = {};
  for (const issue of batch.issues) {
    ruleCounts[issue.rule] = (ruleCounts[issue.rule] || 0) + 1;
  }

  const topRules = Object.entries(ruleCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return `## ESLint Fixes - Batch ${batch.number}

This PR automatically fixes ESLint issues in the following files:

**Issues Fixed**: ${batch.issues.length}
**Files Modified**: ${batch.files.length}

### Top Issues by Rule:
${topRules.map(([rule, count]) => `- ${rule}: ${count}`).join('\n')}

### Files Modified:
${batch.files.map(f => `- \`${f.split('/').slice(-2).join('/')}\``).join('\n')}

---
*This PR was automatically generated by the ESLint automation tool.*`;
}

async function saveResults(results) {
  const fs = await import('fs/promises');
  const resultsData = {
    success: results.success,
    batchesProcessed: results.batchesProcessed,
    totalBatches: results.totalBatches,
    timestamp: new Date().toISOString()
  };

  await fs.writeFile(
    'scripts/eslint-automation/automation-results.json',
    JSON.stringify(resultsData, null, 2)
  );
}

// Run the script
main();
