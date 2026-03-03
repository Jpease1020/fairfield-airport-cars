import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function parsePrivateKey(raw) {
  return raw.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

async function main() {
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

  const db = getFirestore();
  const snapshot = await db.collection('cms').get();
  const cmsData = {};
  snapshot.docs.forEach((doc) => {
    cmsData[doc.id] = doc.data();
  });

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const dataDir = path.resolve('data');
  const outFile = path.join(dataDir, `cms-data-backup.${timestamp}.json`);
  const latestFile = path.join(dataDir, 'cms-data-backup.json');

  await fs.mkdir(dataDir, { recursive: true });
  const serialized = JSON.stringify(cmsData, null, 2);
  await fs.writeFile(outFile, serialized, 'utf8');
  await fs.writeFile(latestFile, serialized, 'utf8');

  console.log(`Exported ${snapshot.size} CMS documents to: ${outFile}`);
  console.log(`Updated latest snapshot: ${latestFile}`);
}

main().catch((error) => {
  console.error('Failed to export CMS snapshot:', error);
  process.exit(1);
});
