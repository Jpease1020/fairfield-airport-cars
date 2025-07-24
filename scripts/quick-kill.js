const { exec } = require('child_process');

console.log('🚨 QUICK KILL - Terminating hanging processes...');

// Kill all potentially hanging processes
const commands = [
  'pkill -f playwright',
  'pkill -f chrome',
  'pkill -f chromium',
  'lsof -ti :9323 | xargs kill -9',
  'lsof -ti :3000 | xargs kill -9',
  'pkill -f "node.*test"',
  'pkill -f puppeteer'
];

commands.forEach(cmd => {
  exec(cmd, (error) => {
    if (!error) {
      console.log(`✅ Killed: ${cmd}`);
    }
  });
});

console.log('✅ Quick kill completed. All hanging processes should be terminated.');
console.log('💡 RULE: If any command hangs for >2 minutes, run this script immediately!'); 