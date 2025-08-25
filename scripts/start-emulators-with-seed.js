#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import net from 'net';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Firebase emulators with automatic seeding...');

// Function to wait for emulator to be ready
const waitForEmulator = (port, service) => {
  return new Promise((resolve) => {
    const checkPort = () => {
      const client = new net.Socket();
      
      client.connect(port, 'localhost', () => {
        client.destroy();
        console.log(`✅ ${service} emulator ready on port ${port}`);
        resolve();
      });
      
      client.on('error', () => {
        setTimeout(checkPort, 1000);
      });
    };
    
    checkPort();
  });
};

// Function to seed the emulator
const seedEmulator = async () => {
  try {
    console.log('🌱 Seeding emulator with test data...');
    
    // Wait a bit for emulators to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run the seeding script
    const seedProcess = spawn('node', [join(__dirname, 'add-test-user-flow.js')], {
      stdio: 'inherit',
      env: process.env
    });
    
    return new Promise((resolve, reject) => {
      seedProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Emulator seeded successfully!');
          resolve();
        } else {
          console.error(`❌ Seeding failed with code ${code}`);
          reject(new Error(`Seeding failed with code ${code}`));
        }
      });
      
      seedProcess.on('error', (error) => {
        console.error('❌ Failed to start seeding process:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    // Start Firebase emulators
    console.log('🔥 Starting Firebase emulators...');
    
    const emulatorProcess = spawn('firebase', ['emulators:start', '--only', 'firestore,auth'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Wait for emulators to be ready
    console.log('⏳ Waiting for emulators to start...');
    await Promise.all([
      waitForEmulator(8081, 'Firestore'),
      waitForEmulator(9099, 'Auth')
    ]);
    
    console.log('🎯 All emulators are ready!');
    
    // Seed the emulator
    await seedEmulator();
    
    console.log('🎉 Setup complete! Your emulator is running and seeded with test data.');
    console.log('📊 Firestore: http://localhost:8081');
    console.log('🔐 Auth: http://localhost:9099');
    console.log('🌐 Emulator UI: http://localhost:4000');
    
    // Keep the process running
    emulatorProcess.on('close', (code) => {
      console.log(`🚪 Emulator process exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down emulators...');
      emulatorProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down emulators...');
      emulatorProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Failed to start emulators with seeding:', error);
    process.exit(1);
  }
};

// Run the main function
main();
