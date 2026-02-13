/**
 * Booking Migration Script
 *
 * SAFETY STEPS:
 * 1. Run with --export-only first to backup current data
 * 2. Review the backup JSON file
 * 3. Run with --dry-run to see what changes would be made
 * 4. Run without flags to actually migrate
 *
 * Usage:
 *   node scripts/migrate-bookings.js --export-only  # Step 1: Backup
 *   node scripts/migrate-bookings.js --dry-run      # Step 2: Preview
 *   node scripts/migrate-bookings.js                # Step 3: Migrate
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const EXPORT_ONLY = args.includes('--export-only');
const DRY_RUN = args.includes('--dry-run');

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  console.log('Set it to the path of your Firebase service account JSON file');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const db = admin.firestore();

function transformBooking(old) {
  // Check if already in new format
  const hasNestedCustomer = !!(old.customer && old.customer.name);
  const hasNestedTrip = !!(old.trip && old.trip.pickup && old.trip.pickup.address);
  const hasNestedPayment = !!(old.payment && old.payment.balanceDue !== undefined);

  return {
    status: old.status,

    customer: {
      name: hasNestedCustomer ? old.customer.name : (old.name || ''),
      email: hasNestedCustomer ? old.customer.email : (old.email || ''),
      phone: hasNestedCustomer ? old.customer.phone : (old.phone || ''),
      notes: hasNestedCustomer ? (old.customer.notes || '') : (old.notes || ''),
      smsOptIn: hasNestedCustomer ? (old.customer.smsOptIn || false) : (old.smsOptIn || false),
    },

    trip: {
      pickup: {
        address: hasNestedTrip ? old.trip.pickup.address : (old.pickupLocation || ''),
        coordinates: hasNestedTrip ? (old.trip.pickup.coordinates || null) : null,
      },
      dropoff: {
        address: hasNestedTrip ? old.trip.dropoff.address : (old.dropoffLocation || ''),
        coordinates: hasNestedTrip ? (old.trip.dropoff.coordinates || null) : null,
      },
      pickupDateTime: hasNestedTrip ? old.trip.pickupDateTime : old.pickupDateTime,
      fareType: hasNestedTrip ? (old.trip.fareType || 'personal') : 'personal',
      flightInfo: hasNestedTrip && old.trip.flightInfo ? old.trip.flightInfo : {
        hasFlight: !!old.flightNumber,
        airline: '',
        flightNumber: old.flightNumber || '',
        arrivalTime: '',
        terminal: '',
      },
      fare: hasNestedTrip ? old.trip.fare : (old.fare || 0),
    },

    payment: {
      depositAmount: hasNestedPayment ? (old.payment.depositAmount || 0) : 0,
      depositPaid: hasNestedPayment ? old.payment.depositPaid : (old.depositPaid || false),
      balanceDue: hasNestedPayment ? old.payment.balanceDue : (old.balanceDue || old.fare || 0),
      tipAmount: hasNestedPayment ? (old.payment.tipAmount || 0) : 0,
    },

    // Preserve other fields
    ...(old.confirmation && { confirmation: old.confirmation }),
    ...(old.driverId && { driverId: old.driverId }),
    ...(old.driverName && { driverName: old.driverName }),
    ...(old.requiresApproval !== undefined && { requiresApproval: old.requiresApproval }),
    ...(old.exceptionReason && { exceptionReason: old.exceptionReason }),
    ...(old.approvedAt && { approvedAt: old.approvedAt }),
    ...(old.rejectedAt && { rejectedAt: old.rejectedAt }),
    ...(old.rejectionReason && { rejectionReason: old.rejectionReason }),

    createdAt: old.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function main() {
  console.log('🔄 Booking Migration Script');
  console.log('==========================\n');

  if (EXPORT_ONLY) {
    console.log('📦 MODE: Export Only (backup)\n');
  } else if (DRY_RUN) {
    console.log('👀 MODE: Dry Run (preview changes)\n');
  } else {
    console.log('⚠️  MODE: LIVE MIGRATION\n');
  }

  // Fetch all bookings
  console.log('📥 Fetching all bookings...');
  const snapshot = await db.collection('bookings').get();
  console.log(`   Found ${snapshot.size} bookings\n`);

  if (snapshot.empty) {
    console.log('No bookings to migrate.');
    process.exit(0);
  }

  // Export current data as backup
  const backupData = [];
  snapshot.forEach(doc => {
    backupData.push({ id: doc.id, data: doc.data() });
  });

  const backupPath = path.join(__dirname, `bookings-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`💾 Backup saved to: ${backupPath}\n`);

  if (EXPORT_ONLY) {
    console.log('✅ Export complete. Review the backup file before proceeding.');
    process.exit(0);
  }

  // Transform and show changes
  console.log('🔄 Transforming bookings...\n');

  const migrations = [];

  snapshot.forEach(doc => {
    const oldData = doc.data();
    const newData = transformBooking(oldData);
    migrations.push({ id: doc.id, old: oldData, new: newData });
  });

  // Show summary of changes
  for (const m of migrations) {
    console.log(`📋 Booking: ${m.id}`);
    console.log(`   Customer: ${m.new.customer.name} (${m.new.customer.email})`);
    console.log(`   Route: ${m.new.trip.pickup.address} → ${m.new.trip.dropoff.address}`);
    console.log(`   Fare: $${m.new.trip.fare}`);
    console.log(`   Status: ${m.new.status}`);
    console.log('');
  }

  if (DRY_RUN) {
    console.log('✅ Dry run complete. Review the changes above.');
    console.log('   Run without --dry-run to apply changes.');
    process.exit(0);
  }

  // Apply migrations
  console.log('⚡ Applying migrations...\n');

  const batch = db.batch();

  for (const m of migrations) {
    const docRef = db.collection('bookings').doc(m.id);
    batch.set(docRef, m.new);
    console.log(`   ✓ Queued: ${m.id}`);
  }

  await batch.commit();

  console.log('\n✅ Migration complete!');
  console.log(`   ${migrations.length} bookings migrated to nested structure.`);
  console.log(`   Backup saved at: ${backupPath}`);
}

main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
