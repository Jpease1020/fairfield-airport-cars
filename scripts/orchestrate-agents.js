#!/usr/bin/env node

/**
 * Multi-Agent Orchestration System
 * Coordinates specialized agents to work in parallel on Fairfield Airport Cars tasks
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Agent definitions matching the API
const AGENTS = {
  'Booking Specialist': {
    role: 'Booking system optimization, customer journey improvement, form validation',
    capabilities: ['booking flow', 'customer experience', 'form validation', 'user testing'],
    focus: 'booking-system',
    tasks: [
      'Test booking form functionality',
      'Validate fare calculation accuracy',
      'Check form validation rules',
      'Test autocomplete functionality'
    ]
  },
  'Payment Engineer': {
    role: 'Payment processing, Square integration, webhook handling, refund management',
    capabilities: ['payment processing', 'square integration', 'webhooks', 'security'],
    focus: 'payment-system',
    tasks: [
      'Test Square Checkout integration',
      'Verify payment webhook handling',
      'Test payment confirmation flow',
      'Validate refund process'
    ]
  },
  'Communication Manager': {
    role: 'Email/SMS notifications, template management, automated messaging',
    capabilities: ['email service', 'sms notifications', 'templates', 'automation'],
    focus: 'communication-system',
    tasks: [
      'Test email confirmation delivery',
      'Verify SMS notification sending',
      'Check email template rendering',
      'Test communication error handling'
    ]
  },
  'Admin Dashboard Developer': {
    role: 'Admin interface, booking management, analytics, reporting',
    capabilities: ['admin dashboard', 'booking management', 'analytics', 'reporting'],
    focus: 'admin-dashboard',
    tasks: [
      'Test admin authentication',
      'Verify booking management interface',
      'Check dashboard data loading',
      'Test customer communication features'
    ]
  },
  'QA Tester': {
    role: 'End-to-end testing, customer journey validation, bug identification',
    capabilities: ['testing', 'customer journey', 'bug detection', 'quality assurance'],
    focus: 'testing',
    tasks: [
      'Run comprehensive E2E tests',
      'Execute customer journey tests',
      'Perform mobile responsiveness testing',
      'Validate error handling scenarios'
    ]
  },
  'Business Analyst': {
    role: 'Business process optimization, cost analysis, performance metrics',
    capabilities: ['business analysis', 'cost tracking', 'metrics', 'optimization'],
    focus: 'business-analysis',
    tasks: [
      'Analyze current testing status',
      'Generate performance metrics report',
      'Identify critical gaps and priorities',
      'Create business impact assessment'
    ]
  }
};

class AgentOrchestrator {
  constructor() {
    this.activeAgents = new Map();
    this.results = new Map();
    this.startTime = Date.now();
  }

  async startAgent(agentName, taskIndex = 0) {
    const agent = AGENTS[agentName];
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const task = agent.tasks[taskIndex];
    if (!task) {
      console.log(`✅ ${agentName} completed all tasks`);
      return;
    }

    console.log(`🚀 Starting ${agentName} on task: ${task}`);
    
    const agentProcess = this.runAgentTask(agentName, task, agent.focus);
    this.activeAgents.set(agentName, { process: agentProcess, task, startTime: Date.now() });
    
    return agentProcess;
  }

  runAgentTask(agentName, task, focus) {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      // Determine which script to run based on agent focus
      const scriptMap = {
        'booking-system': 'scripts/test-booking-flow.js',
        'payment-system': 'scripts/verify-booking.js',
        'communication-system': 'scripts/manual-booking-test.js',
        'admin-dashboard': 'scripts/comprehensive-flow-test.js',
        'testing': 'scripts/run-tests.js',
        'business-analysis': 'scripts/daily-analysis.js'
      };

      const scriptPath = scriptMap[focus];
      if (!scriptPath || !fs.existsSync(scriptPath)) {
        // Fallback to a generic test script
        const testScript = 'scripts/smoke-test.js';
        console.log(`⚠️  Using fallback script for ${agentName}: ${testScript}`);
      }

      const child = spawn('node', [scriptPath || 'scripts/smoke-test.js'], {
        cwd: process.cwd(),
        env: { ...process.env, AGENT_NAME: agentName, AGENT_TASK: task }
      });

      child.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        console.log(`[${agentName}] ${message.trim()}`);
      });

      child.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        console.error(`[${agentName}] ERROR: ${message.trim()}`);
      });

      child.on('close', (code) => {
        const duration = Date.now() - this.activeAgents.get(agentName)?.startTime;
        this.activeAgents.delete(agentName);
        
        if (code === 0) {
          console.log(`✅ ${agentName} completed task in ${duration}ms`);
          this.results.set(agentName, { success: true, output, duration });
          resolve({ success: true, output, duration });
        } else {
          console.error(`❌ ${agentName} failed with code ${code}`);
          this.results.set(agentName, { success: false, error: errorOutput, duration });
          reject({ success: false, error: errorOutput, duration });
        }
      });

      child.on('error', (error) => {
        console.error(`❌ ${agentName} process error:`, error);
        this.activeAgents.delete(agentName);
        reject({ success: false, error: error.message });
      });
    });
  }

  async runParallelTasks(tasks) {
    console.log('🎯 Starting Multi-Agent Orchestration');
    console.log('=' .repeat(50));
    
    const promises = tasks.map(({ agent, taskIndex = 0 }) => 
      this.startAgent(agent, taskIndex)
    );

    try {
      const results = await Promise.allSettled(promises);
      
      console.log('\n📊 Multi-Agent Results Summary');
      console.log('=' .repeat(50));
      
      results.forEach((result, index) => {
        const task = tasks[index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${task.agent}: SUCCESS`);
        } else {
          console.log(`❌ ${task.agent}: FAILED`);
        }
      });

      return results;
    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      throw error;
    }
  }

  async runSequentialTasks(tasks) {
    console.log('🎯 Starting Sequential Agent Tasks');
    console.log('=' .repeat(50));
    
    const results = [];
    
    for (const task of tasks) {
      try {
        const result = await this.startAgent(task.agent, task.taskIndex);
        results.push({ agent: task.agent, success: true, result });
      } catch (error) {
        console.error(`❌ ${task.agent} failed:`, error);
        results.push({ agent: task.agent, success: false, error });
      }
    }
    
    return results;
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successfulAgents = Array.from(this.results.values()).filter(r => r.success).length;
    const totalAgents = this.results.size;
    
    console.log('\n📋 Multi-Agent Orchestration Report');
    console.log('=' .repeat(50));
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`✅ Successful Agents: ${successfulAgents}/${totalAgents}`);
    console.log(`📊 Success Rate: ${((successfulAgents / totalAgents) * 100).toFixed(1)}%`);
    
    console.log('\n📈 Agent Performance:');
    this.results.forEach((result, agentName) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? `${result.duration}ms` : 'N/A';
      console.log(`${status} ${agentName}: ${duration}`);
    });
  }
}

// Predefined orchestration scenarios
const ORCHESTRATION_SCENARIOS = {
  'critical-gaps': [
    { agent: 'Payment Engineer', taskIndex: 0 },
    { agent: 'Communication Manager', taskIndex: 0 },
    { agent: 'Admin Dashboard Developer', taskIndex: 0 }
  ],
  'comprehensive-testing': [
    { agent: 'QA Tester', taskIndex: 0 },
    { agent: 'Booking Specialist', taskIndex: 0 },
    { agent: 'Payment Engineer', taskIndex: 0 },
    { agent: 'Communication Manager', taskIndex: 0 }
  ],
  'business-analysis': [
    { agent: 'Business Analyst', taskIndex: 0 },
    { agent: 'QA Tester', taskIndex: 0 }
  ],
  'full-system': [
    { agent: 'Booking Specialist', taskIndex: 0 },
    { agent: 'Payment Engineer', taskIndex: 0 },
    { agent: 'Communication Manager', taskIndex: 0 },
    { agent: 'Admin Dashboard Developer', taskIndex: 0 },
    { agent: 'QA Tester', taskIndex: 0 },
    { agent: 'Business Analyst', taskIndex: 0 }
  ]
};

async function main() {
  const orchestrator = new AgentOrchestrator();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const scenario = args[0] || 'critical-gaps';
  const mode = args[1] || 'parallel';
  
  console.log(`🎯 Running scenario: ${scenario} in ${mode} mode`);
  
  const tasks = ORCHESTRATION_SCENARIOS[scenario];
  if (!tasks) {
    console.error(`❌ Unknown scenario: ${scenario}`);
    console.log('Available scenarios:', Object.keys(ORCHESTRATION_SCENARIOS));
    process.exit(1);
  }
  
  try {
    let results;
    if (mode === 'sequential') {
      results = await orchestrator.runSequentialTasks(tasks);
    } else {
      results = await orchestrator.runParallelTasks(tasks);
    }
    
    orchestrator.generateReport();
    
    // Exit with appropriate code
    const allSuccessful = results.every(r => 
      r.status === 'fulfilled' || (r.success === true)
    );
    
    process.exit(allSuccessful ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AgentOrchestrator, ORCHESTRATION_SCENARIOS, AGENTS }; 