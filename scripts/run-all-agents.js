#!/usr/bin/env node

/**
 * 🚀 Run All Agents Script
 * 
 * Executes all cleanup agents in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

const agents = [
  { name: 'Security', script: 'scripts/agents/security-agent.js' },
  { name: 'Email', script: 'scripts/agents/email-agent.js' },
  { name: 'Content', script: 'scripts/agents/content-agent.js' }
];

async function runAllAgents() {
  console.log('🚀 Starting Multi-Agent Cleanup System...\n');
  
  const results = [];
  
  for (const agent of agents) {
    console.log(`\n🔧 Running ${agent.name} Agent...`);
    console.log('='.repeat(50));
    
    try {
      const output = execSync(`node ${agent.script}`, { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log(output);
      results.push({ name: agent.name, success: true });
    } catch (error) {
      console.log(`❌ ${agent.name} Agent failed:`, error.message);
      results.push({ name: agent.name, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Multi-Agent Cleanup Summary:');
  console.log('================================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} Agent: ${result.success ? 'Completed' : 'Failed'}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Overall Progress: ${successCount}/${totalCount} agents completed successfully`);
  
  if (successCount === totalCount) {
    console.log('🎉 All agents completed successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Test the application to ensure everything works');
    console.log('2. Verify admin access with role-based auth');
    console.log('3. Check that all contact info is database-driven');
    console.log('4. Test email templates with dynamic company names');
  } else {
    console.log('⚠️  Some agents encountered issues. Check the logs above.');
  }
}

if (require.main === module) {
  runAllAgents().catch(console.error);
}

module.exports = { runAllAgents }; 