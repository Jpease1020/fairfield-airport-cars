#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌱 Seeding running Firebase emulator...');

// Function to check if emulator is running
const checkEmulator = (port, service) => {
  return new Promise((resolve) => {
    const net = require('net');
    const client = new net.Socket();
    
    client.connect(port, 'localhost', () => {
      client.destroy();
      console.log(`✅ ${service} emulator is running on port ${port}`);
      resolve(true);
    });
    
    client.on('error', () => {
      console.error(`❌ ${service} emulator is not running on port ${port}`);
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      client.destroy();
      console.error(`❌ Timeout checking ${service} emulator on port ${port}`);
      resolve(false);
    }, 5000);
  });
};

// Main function
const main = async () => {
  try {
    // Check if emulators are running
    console.log('🔍 Checking if emulators are running...');
    
    const [firestoreRunning, authRunning] = await Promise.all([
      checkEmulator(8081, 'Firestore'),
      checkEmulator(9099, 'Auth')
    ]);
    
    if (!firestoreRunning || !authRunning) {
      console.error('❌ Emulators are not running. Please start them first with:');
      console.error('   npm run firebase:emulators');
      console.error('   or');
      console.error('   npm run firebase:emulators:seed');
      process.exit(1);
    }
    
    console.log('🎯 All emulators are running! Proceeding with seeding...');
    
    // Run the seeding script
    const seedProcess = spawn('node', [join(__dirname, 'add-test-user-flow.js')], {
      stdio: 'inherit',
      env: process.env
    });
    
    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Emulator seeded successfully!');
        console.log('🚗 You can now test the complete user flow');
      } else {
        console.error(`❌ Seeding failed with code ${code}`);
        process.exit(code);
      }
    });
    
    seedProcess.on('error', (error) => {
      console.error('❌ Failed to start seeding process:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the main function
main();
