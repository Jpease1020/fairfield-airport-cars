#!/usr/bin/env node

/**
 * 🧹 Cleanup Orchestration System
 * Coordinates specialized agents for project cleanup and reorganization
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cleanup-specific agents
const CLEANUP_AGENTS = {
  'Cleanup Agent': {
    role: 'File cleanup, duplicate removal, temporary file management',
    capabilities: ['file cleanup', 'duplicate detection', 'temp file removal'],
    focus: 'cleanup',
    tasks: [
      'Remove duplicate LoadingSpinner components',
      'Clean up unused imports and variables',
      'Remove temporary build files (.next, test-results, etc.)',
      'Audit for other duplicate components',
      'Clean up log files (firebase-debug.log, pglite-debug.log)'
    ]
  },
  'Structure Agent': {
    role: 'Directory reorganization, file moving, import updates',
    capabilities: ['file organization', 'import management', 'directory structure'],
    focus: 'structure',
    tasks: [
      'Create lib subdirectories (services, utils, validation, business)',
      'Move lib files to appropriate subdirectories',
      'Reorganize API routes by feature',
      'Update import paths throughout codebase',
      'Create new index files for organized modules'
    ]
  },
  'Fix Agent': {
    role: 'Bug fixes, TypeScript errors, linting issues',
    capabilities: ['bug fixing', 'typescript', 'linting', 'code quality'],
    focus: 'fixes',
    tasks: [
      'Fix admin authentication issues',
      'Resolve TypeScript compilation errors',
      'Fix linting violations',
      'Standardize code patterns',
      'Consolidate edit mode logic'
    ]
  },
  'Test Agent': {
    role: 'Testing infrastructure, test optimization',
    capabilities: ['testing', 'test optimization', 'coverage analysis'],
    focus: 'testing',
    tasks: [
      'Audit current test coverage',
      'Consolidate duplicate test flows',
      'Optimize test execution',
      'Add missing test categories',
      'Update test configuration'
    ]
  },
  'Documentation Agent': {
    role: 'Documentation updates, README maintenance',
    capabilities: ['documentation', 'readme', 'guides'],
    focus: 'documentation',
    tasks: [
      'Update TODO.md with cleanup progress',
      'Create component documentation',
      'Update README with new structure',
      'Document new import patterns',
      'Create development setup guide'
    ]
  }
};

class CleanupOrchestrator {
  constructor() {
    this.activeAgents = new Map();
    this.results = new Map();
    this.startTime = Date.now();
    this.cleanupTasks = [];
  }

  async startAgent(agentName, taskIndex = 0) {
    const agent = CLEANUP_AGENTS[agentName];
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const task = agent.tasks[taskIndex];
    if (!task) {
      console.log(`✅ ${agentName} completed all tasks`);
      return;
    }

    console.log(`🚀 Starting ${agentName}: ${task}`);
    
    try {
      const result = await this.runAgentTask(agentName, task, agent.focus);
      this.results.set(`${agentName}-${taskIndex}`, {
        agent: agentName,
        task,
        result,
        timestamp: Date.now()
      });
      
      console.log(`✅ ${agentName} completed: ${task}`);
      
      // Continue with next task
      await this.startAgent(agentName, taskIndex + 1);
      
    } catch (error) {
      console.error(`❌ ${agentName} failed on task "${task}":`, error.message);
      this.results.set(`${agentName}-${taskIndex}`, {
        agent: agentName,
        task,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async runAgentTask(agentName, task, focus) {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const child = spawn('node', [
        path.join(__dirname, 'agents', `${focus}-agent.js`),
        '--task=' + task
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output, code });
        } else {
          reject(new Error(`Agent failed with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runParallelTasks(tasks) {
    console.log(`🔄 Running ${tasks.length} tasks in parallel...\n`);
    
    const promises = tasks.map(({ agentName, taskIndex }) => 
      this.startAgent(agentName, taskIndex)
    );
    
    await Promise.allSettled(promises);
  }

  async runSequentialTasks(tasks) {
    console.log(`🔄 Running ${tasks.length} tasks sequentially...\n`);
    
    for (const { agentName, taskIndex } of tasks) {
      await this.startAgent(agentName, taskIndex);
    }
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successfulTasks = Array.from(this.results.values()).filter(r => !r.error);
    const failedTasks = Array.from(this.results.values()).filter(r => r.error);
    
    console.log('\n📊 Cleanup Orchestration Report');
    console.log('================================');
    console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`✅ Successful Tasks: ${successfulTasks.length}`);
    console.log(`❌ Failed Tasks: ${failedTasks.length}`);
    console.log(`📈 Success Rate: ${((successfulTasks.length / this.results.size) * 100).toFixed(1)}%`);
    
    if (successfulTasks.length > 0) {
      console.log('\n✅ Completed Tasks:');
      successfulTasks.forEach(({ agent, task }) => {
        console.log(`  • ${agent}: ${task}`);
      });
    }
    
    if (failedTasks.length > 0) {
      console.log('\n❌ Failed Tasks:');
      failedTasks.forEach(({ agent, task, error }) => {
        console.log(`  • ${agent}: ${task} (${error})`);
      });
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'reports', 'cleanup-report.json');
    const reportData = {
      timestamp: new Date().toISOString(),
      duration,
      results: Array.from(this.results.values()),
      summary: {
        total: this.results.size,
        successful: successfulTasks.length,
        failed: failedTasks.length,
        successRate: (successfulTasks.length / this.results.size) * 100
      }
    };
    
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

async function main() {
  const orchestrator = new CleanupOrchestrator();
  
  console.log('🧹 Starting Cleanup Orchestration...\n');
  
  // Phase 1: Parallel cleanup tasks
  const phase1Tasks = [
    { agentName: 'Cleanup Agent', taskIndex: 0 },
    { agentName: 'Fix Agent', taskIndex: 0 },
    { agentName: 'Test Agent', taskIndex: 0 }
  ];
  
  await orchestrator.runParallelTasks(phase1Tasks);
  
  // Phase 2: Sequential structure changes (dependencies)
  const phase2Tasks = [
    { agentName: 'Structure Agent', taskIndex: 0 },
    { agentName: 'Documentation Agent', taskIndex: 0 }
  ];
  
  await orchestrator.runSequentialTasks(phase2Tasks);
  
  // Generate final report
  orchestrator.generateReport();
  
  console.log('\n🎉 Cleanup orchestration completed!');
  console.log('\n📋 Next steps:');
  console.log('  1. Review the cleanup report');
  console.log('  2. Run npm run lint to check for remaining issues');
  console.log('  3. Run npm run test to ensure everything works');
  console.log('  4. Run npm run build to verify production build');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CleanupOrchestrator }; 