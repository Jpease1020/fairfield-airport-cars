/**
 * Customer Import Script
 *
 * Imports customers from the Excel file (FAC Customers.xlsx) into Firestore.
 *
 * Usage:
 *   npx ts-node scripts/import-customers.ts [path-to-xlsx]
 *
 * If no path is provided, defaults to ~/Desktop/FAC Customers.xlsx
 *
 * Environment:
 *   Requires Firebase Admin credentials in .env (production) not .env.local (emulator)
 */

import XLSX from 'xlsx';
import * as path from 'path';
import * as os from 'os';
import admin from 'firebase-admin';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env (production credentials)
// NOT .env.local which has emulator/demo credentials
config({ path: path.resolve(__dirname, '../.env') });

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase credentials in .env.local');
  console.error('   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  console.error('   Found:', {
    projectId: projectId ? `${projectId.substring(0, 10)}...` : 'missing',
    clientEmail: clientEmail ? `${clientEmail.substring(0, 20)}...` : 'missing',
    privateKey: privateKey ? `${privateKey.length} chars` : 'missing'
  });
  process.exit(1);
}

// Handle private key formatting - multiple formats
// First, remove any surrounding quotes
privateKey = privateKey.replace(/^["']|["']$/g, '');

// Replace \\n with actual newlines (Vercel format)
privateKey = privateKey.replace(/\\n/g, '\n');

// Validate private key format
if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
  console.error('❌ FIREBASE_PRIVATE_KEY is malformed.');
  console.error('   Must include -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----');
  console.error('   Key starts with:', privateKey.substring(0, 50));
  process.exit(1);
}

console.log('🔧 Firebase config:');
console.log(`   Project: ${projectId}`);
console.log(`   Email: ${clientEmail}`);
console.log(`   Key: ${privateKey.length} chars, has newlines: ${privateKey.includes('\n')}`);

const apps = admin.apps;
if (!apps || apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  console.log('✅ Firebase Admin initialized\n');
}

const db = admin.firestore();
const COLLECTION = 'customers';

// Excel column mappings
interface ExcelRow {
  'First Name'?: string;
  'Middle Name'?: string;
  'Last Name'?: string;
  'E-mail 1 - Value'?: string;
  'Phone 1 - Value'?: string;
  'Address 1 - Street'?: string;
  'Address 1 - City'?: string;
  'Address 1 - Region'?: string;
  'Address 1 - Postal Code'?: string;
  'Notes'?: string;
}

interface CustomerImport {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    formatted?: string;
  };
  notes?: string;
}

/**
 * Normalize phone to 10 digits
 */
function normalizePhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1);
  }
  if (digits.length !== 10) {
    return null;
  }
  return digits;
}

/**
 * Format phone for display
 */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Parse Excel row to CustomerImport
 */
function parseExcelRow(row: ExcelRow): CustomerImport | null {
  const phone = row['Phone 1 - Value'];
  if (!phone || phone.toString().trim() === '') {
    return null;
  }

  const firstName = row['First Name'];
  if (!firstName || firstName.trim() === '') {
    return null;
  }

  let address: CustomerImport['address'];
  if (row['Address 1 - Street'] || row['Address 1 - City']) {
    address = {
      street: row['Address 1 - Street']?.trim(),
      city: row['Address 1 - City']?.trim(),
      state: row['Address 1 - Region']?.trim(),
      zip: row['Address 1 - Postal Code']?.toString().trim(),
    };

    const parts = [address.street, address.city, address.state, address.zip].filter(Boolean);
    if (parts.length > 0) {
      address.formatted = parts.join(', ');
    }
  }

  return {
    firstName: firstName.trim(),
    lastName: row['Last Name']?.trim(),
    phone: phone.toString().trim(),
    email: row['E-mail 1 - Value']?.trim(),
    address,
    notes: row['Notes']?.trim(),
  };
}

/**
 * Check if customer already exists by phone
 */
async function customerExists(normalizedPhone: string): Promise<boolean> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('phone', '==', normalizedPhone)
    .limit(1)
    .get();
  return !snapshot.empty;
}

async function main() {
  console.log('🚀 Customer Import Script\n');

  // Get file path
  const defaultPath = path.join(os.homedir(), 'Desktop', 'FAC Customers.xlsx');
  const filePath = process.argv[2] || defaultPath;

  console.log(`📁 Reading from: ${filePath}\n`);

  // Read Excel file
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (error) {
    console.error(`❌ Error reading file: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`📊 Found ${rows.length} rows in Excel file\n`);

  // Parse rows
  const customers: CustomerImport[] = [];
  const skippedRows: number[] = [];

  rows.forEach((row, index) => {
    const customer = parseExcelRow(row);
    if (customer) {
      customers.push(customer);
    } else {
      skippedRows.push(index + 2);
    }
  });

  console.log(`✅ Parsed ${customers.length} valid customers`);
  if (skippedRows.length > 0) {
    console.log(`⏭️  Skipped ${skippedRows.length} rows (no phone or name)`);
  }
  console.log('');

  // Preview
  console.log('📋 Preview (first 5 customers):');
  console.log('─'.repeat(80));
  customers.slice(0, 5).forEach((c, i) => {
    const normalized = normalizePhone(c.phone);
    console.log(`${i + 1}. ${c.firstName} ${c.lastName || ''}`);
    console.log(`   Phone: ${c.phone} → ${normalized ? formatPhone(normalized) : '❌ INVALID'}`);
    if (c.email) console.log(`   Email: ${c.email}`);
    if (c.address?.formatted) console.log(`   Address: ${c.address.formatted}`);
    if (c.notes) console.log(`   Notes: ${c.notes.substring(0, 50)}${c.notes.length > 50 ? '...' : ''}`);
    console.log('');
  });
  console.log('─'.repeat(80));
  console.log('');

  // Countdown
  console.log('⚠️  This will import customers to Firestore.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Import
  console.log('🔄 Importing customers...\n');

  let imported = 0;
  let skipped = 0;
  const errors: Array<{ row: number; phone: string; reason: string }> = [];

  for (let i = 0; i < customers.length; i++) {
    const row = i + 1;
    const customer = customers[i];

    const normalizedPhone = normalizePhone(customer.phone);
    if (!normalizedPhone) {
      skipped++;
      errors.push({ row, phone: customer.phone, reason: 'Invalid phone (not 10 digits)' });
      continue;
    }

    const exists = await customerExists(normalizedPhone);
    if (exists) {
      skipped++;
      errors.push({ row, phone: customer.phone, reason: 'Duplicate (phone already exists)' });
      continue;
    }

    try {
      const now = new Date();

      // Clean address object - remove undefined values
      let cleanAddress = null;
      if (customer.address) {
        cleanAddress = {
          ...(customer.address.street && { street: customer.address.street }),
          ...(customer.address.city && { city: customer.address.city }),
          ...(customer.address.state && { state: customer.address.state }),
          ...(customer.address.zip && { zip: customer.address.zip }),
          ...(customer.address.formatted && { formatted: customer.address.formatted }),
        };
        // If address is empty after cleaning, set to null
        if (Object.keys(cleanAddress).length === 0) {
          cleanAddress = null;
        }
      }

      await db.collection(COLLECTION).add({
        phone: normalizedPhone,
        phoneFormatted: formatPhone(normalizedPhone),
        firstName: customer.firstName,
        lastName: customer.lastName || null,
        email: customer.email?.toLowerCase() || null,
        address: cleanAddress,
        notes: customer.notes || null,
        bookingCount: 0,
        totalSpent: 0,
        createdAt: now,
        updatedAt: now,
        importedFrom: `fac-excel-${now.toISOString().split('T')[0]}`,
      });
      imported++;

      // Progress indicator
      if (imported % 10 === 0) {
        process.stdout.write(`   Imported ${imported}...\r`);
      }
    } catch (error) {
      skipped++;
      errors.push({
        row,
        phone: customer.phone,
        reason: `DB error: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
    }
  }

  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📊 IMPORT RESULTS');
  console.log('═'.repeat(80));
  console.log(`   Total processed: ${customers.length}`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log('');

  if (errors.length > 0 && errors.length <= 20) {
    console.log('❌ Errors/Skips:');
    errors.forEach(err => {
      console.log(`   Row ${err.row}: ${err.phone} - ${err.reason}`);
    });
  } else if (errors.length > 20) {
    console.log(`❌ ${errors.length} errors (showing first 10):`);
    errors.slice(0, 10).forEach(err => {
      console.log(`   Row ${err.row}: ${err.phone} - ${err.reason}`);
    });
  }

  console.log('═'.repeat(80));
  console.log('\n✨ Import complete!\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
