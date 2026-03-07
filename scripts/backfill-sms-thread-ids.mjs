import process from 'node:process';
import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const VERBOSE = args.has('--verbose');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function parsePrivateKey(raw) {
  return raw.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

function normalizePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits;
}

function toMillis(value) {
  if (!value) return 0;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function initDb() {
  const projectId = requireEnv('FIREBASE_PROJECT_ID');
  const clientEmail = requireEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = parsePrivateKey(requireEnv('FIREBASE_PRIVATE_KEY'));

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getFirestore();
}

async function commitChunks(db, updates) {
  const chunkSize = 400;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const batch = db.batch();
    for (const update of chunk) {
      batch.update(db.collection('smsMessages').doc(update.messageId), {
        threadId: update.threadId,
      });
    }
    await batch.commit();
  }
}

async function main() {
  const db = await initDb();

  const [threadsSnapshot, unthreadedMessagesSnapshot] = await Promise.all([
    db.collection('smsThreads').get(),
    db.collection('smsMessages').where('threadId', '==', null).get(),
  ]);

  const threadsByPhone = new Map();
  const duplicatePhones = new Map();

  for (const doc of threadsSnapshot.docs) {
    const data = doc.data();
    const phone = normalizePhone(data.customerPhone);
    if (!phone) continue;

    const candidate = {
      threadId: doc.id,
      status: data.status === 'closed' ? 'closed' : 'open',
      updatedAt: toMillis(data.updatedAt) || toMillis(data.lastMessageAt) || toMillis(data.createdAt),
    };

    const existing = threadsByPhone.get(phone);
    if (!existing) {
      threadsByPhone.set(phone, candidate);
      continue;
    }

    duplicatePhones.set(phone, (duplicatePhones.get(phone) || 1) + 1);

    const shouldReplace =
      (existing.status === 'closed' && candidate.status === 'open') ||
      (existing.status === candidate.status && candidate.updatedAt > existing.updatedAt);

    if (shouldReplace) {
      threadsByPhone.set(phone, candidate);
    }
  }

  const updates = [];
  let unmatched = 0;

  for (const doc of unthreadedMessagesSnapshot.docs) {
    const data = doc.data();
    const from = normalizePhone(data.from);
    const to = normalizePhone(data.to);

    const fromMatch = from ? threadsByPhone.get(from) : null;
    const toMatch = to ? threadsByPhone.get(to) : null;
    const target = fromMatch || toMatch;

    if (!target) {
      unmatched += 1;
      if (VERBOSE) {
        console.log(`No thread match for message ${doc.id}: from=${data.from || ''} to=${data.to || ''}`);
      }
      continue;
    }

    updates.push({
      messageId: doc.id,
      threadId: target.threadId,
      from: data.from || '',
      to: data.to || '',
    });
  }

  console.log(`Threads loaded: ${threadsSnapshot.size}`);
  console.log(`Phones with threads: ${threadsByPhone.size}`);
  console.log(`Unthreaded smsMessages scanned: ${unthreadedMessagesSnapshot.size}`);
  console.log(`Messages matched to threads: ${updates.length}`);
  console.log(`Messages still unmatched: ${unmatched}`);

  if (duplicatePhones.size > 0) {
    console.log('Phones with multiple threads (using latest/open thread):');
    for (const [phone, count] of duplicatePhones.entries()) {
      console.log(`  ${phone}: ${count} threads`);
    }
  }

  if (!APPLY) {
    console.log('\nDry run only. No changes written.');
    console.log('Run with `node scripts/backfill-sms-thread-ids.mjs --apply` to update Firestore.');
    return;
  }

  if (updates.length === 0) {
    console.log('\nNo updates needed.');
    return;
  }

  await commitChunks(db, updates);
  console.log(`\nApplied threadId backfill to ${updates.length} smsMessages documents.`);
}

main().catch((error) => {
  console.error('Failed to backfill SMS thread IDs:', error);
  process.exit(1);
});
