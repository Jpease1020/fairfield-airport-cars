import { getSettings } from '../src/lib/business/settings-service.ts';

async function testSettings() {
  console.log('Testing settings service...');
  try {
    const settings = await getSettings();
    console.log('Settings loaded:', settings);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

testSettings();
