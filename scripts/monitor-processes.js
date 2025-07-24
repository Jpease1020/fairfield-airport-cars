const { exec } = require('child_process');
const fs = require('fs');

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function checkProcesses() {
  log('🔍 Checking for hanging processes...');
  
  // Check for Node.js processes
  exec('ps aux | grep node | grep -v grep', (error, stdout) => {
    if (stdout) {
      const processes = stdout.trim().split('\n');
      log(`Found ${processes.length} Node.js processes:`);
      processes.forEach(process => {
        log(`  ${process}`);
      });
    }
  });
  
  // Check for Playwright processes
  exec('ps aux | grep playwright | grep -v grep', (error, stdout) => {
    if (stdout) {
      const processes = stdout.trim().split('\n');
      log(`Found ${processes.length} Playwright processes:`);
      processes.forEach(process => {
        log(`  ${process}`);
      });
    }
  });
  
  // Check for Chrome/Chromium processes
  exec('ps aux | grep -E "(chrome|chromium)" | grep -v grep', (error, stdout) => {
    if (stdout) {
      const processes = stdout.trim().split('\n');
      log(`Found ${processes.length} Chrome/Chromium processes:`);
      processes.forEach(process => {
        log(`  ${process}`);
      });
    }
  });
  
  // Check for processes using port 3000
  exec('lsof -i :3000', (error, stdout) => {
    if (stdout) {
      log('Processes using port 3000:');
      log(stdout);
    } else {
      log('No processes using port 3000');
    }
  });
  
  // Check for processes using port 9323 (Playwright)
  exec('lsof -i :9323', (error, stdout) => {
    if (stdout) {
      log('Processes using port 9323 (Playwright):');
      log(stdout);
    }
  });
}

function killHangingProcesses() {
  log('💀 Attempting to kill hanging processes...');
  
  // Kill Node.js processes that might be hanging
  exec('pkill -f "node.*test"', (error) => {
    if (!error) log('Killed hanging test processes');
  });
  
  // Kill Playwright processes
  exec('pkill -f playwright', (error) => {
    if (!error) log('Killed Playwright processes');
  });
  
  // Kill Chrome processes
  exec('pkill -f chrome', (error) => {
    if (!error) log('Killed Chrome processes');
  });
  
  // Kill processes on port 3000
  exec('lsof -ti :3000 | xargs kill -9', (error) => {
    if (!error) log('Killed processes on port 3000');
  });
}

// Run monitoring every 10 seconds
const interval = setInterval(() => {
  checkProcesses();
  console.log('---');
}, 10000);

// Stop monitoring after 5 minutes
setTimeout(() => {
  clearInterval(interval);
  log('Monitoring stopped');
}, 300000);

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('Received SIGINT, cleaning up...');
  killHangingProcesses();
  clearInterval(interval);
  process.exit(0);
});

log('🚀 Process monitor started. Press Ctrl+C to stop and kill hanging processes.');
checkProcesses(); 