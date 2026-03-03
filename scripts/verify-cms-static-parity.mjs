import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const flatten = (obj, prefix = '') => {
  if (obj === null || obj === undefined) return {};
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return { [prefix || 'root']: obj };
  }

  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, next));
    } else {
      out[next] = value;
    }
  }
  return out;
};

async function loadJson(filePath) {
  const contents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(contents);
}

async function main() {
  const repoRoot = path.resolve('.');
  const snapshotPath = path.join(repoRoot, 'data', 'cms-data-backup.json');
  const staticPath = path.join(repoRoot, 'src', 'content', 'static-cms.generated.json');

  const [snapshotData, staticData] = await Promise.all([
    loadJson(snapshotPath),
    loadJson(staticPath),
  ]);

  const snapshotFlat = flatten(snapshotData);
  const staticFlat = flatten(staticData);

  const missingInStatic = Object.keys(snapshotFlat).filter((key) => !(key in staticFlat));
  const extraInStatic = Object.keys(staticFlat).filter((key) => !(key in snapshotFlat));
  const mismatchedValues = Object.keys(snapshotFlat).filter(
    (key) => key in staticFlat && JSON.stringify(snapshotFlat[key]) !== JSON.stringify(staticFlat[key])
  );

  if (missingInStatic.length || extraInStatic.length || mismatchedValues.length) {
    console.error('CMS parity check failed.');
    if (missingInStatic.length) {
      console.error(`Missing keys in static (${missingInStatic.length}):`);
      console.error(missingInStatic.slice(0, 100).join('\n'));
    }
    if (extraInStatic.length) {
      console.error(`Extra keys in static (${extraInStatic.length}):`);
      console.error(extraInStatic.slice(0, 100).join('\n'));
    }
    if (mismatchedValues.length) {
      console.error(`Mismatched values (${mismatchedValues.length}):`);
      console.error(mismatchedValues.slice(0, 100).join('\n'));
    }
    process.exit(1);
  }

  console.log('CMS parity check passed.');
  console.log(`Total keys checked: ${Object.keys(snapshotFlat).length}`);
}

main().catch((error) => {
  console.error('CMS parity check failed with runtime error:', error);
  process.exit(1);
});
