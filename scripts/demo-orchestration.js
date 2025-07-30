#!/usr/bin/env node

/**
 * Multi-Agent Orchestration Demo
 * Demonstrates how agents can work in parallel on different tasks
 */

const { AgentOrchestrator, ORCHESTRATION_SCENARIOS } = require('./orchestrate-agents.js');

async function demoOrchestration() {
  console.log('🎯 Multi-Agent Orchestration Demo');
  console.log('==================================');
  console.log('');
  
  // Show available scenarios
  console.log('📋 Available Scenarios:');
  Object.keys(ORCHESTRATION_SCENARIOS).forEach(scenario => {
    const tasks = ORCHESTRATION_SCENARIOS[scenario];
    console.log(`  • ${scenario} (${tasks.length} agents)`);
    tasks.forEach(task => {
      console.log(`    - ${task.agent}`);
    });
  });
  
  console.log('');
  console.log('🚀 Running Critical Gaps Scenario (Parallel Mode)');
  console.log('This will test the 3 most critical areas simultaneously:');
  console.log('  • Payment Engineer - Test Square integration');
  console.log('  • Communication Manager - Test email/SMS delivery');
  console.log('  • Admin Dashboard Developer - Test admin interface');
  console.log('');
  
  const orchestrator = new AgentOrchestrator();
  
  try {
    // Run the critical gaps scenario in parallel
    const results = await orchestrator.runParallelTasks(
      ORCHESTRATION_SCENARIOS['critical-gaps']
    );
    
    console.log('');
    console.log('📊 Demo Results:');
    results.forEach((result, index) => {
      const task = ORCHESTRATION_SCENARIOS['critical-gaps'][index];
      const status = result.status === 'fulfilled' ? '✅ SUCCESS' : '❌ FAILED';
      console.log(`  ${task.agent}: ${status}`);
    });
    
    orchestrator.generateReport();
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run demo if called directly
if (require.main === module) {
  demoOrchestration().catch(console.error);
}

module.exports = { demoOrchestration }; 