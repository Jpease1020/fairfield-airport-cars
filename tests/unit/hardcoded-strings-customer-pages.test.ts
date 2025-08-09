import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const CUSTOMER_PAGES_DIR = path.resolve(__dirname, '../../src/app/(customer)');

function readAllTsxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(readAllTsxFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function findRawLiterals(source: string): string[] {
  const offenders: string[] = [];
  const lines = source.split(/\n/);
  lines.forEach((line, idx) => {
    const l = line.trim();
    if (l.includes('getCMSField(')) return;
    const textTag = /<Text[^>]*>[^<{]+<\/Text>/.test(l);
    const headingTag = /<H[1-6][^>]*>[^<{]+<\/H[1-6]>/.test(l);
    const buttonTag = /<Button[^>]*>[^<{]+<\/Button>/.test(l);
    const labelProp = /<Label[^>]*>[^<{]+<\/Label>/.test(l);
    const placeholderAttr = /placeholder=\"[^\{][^\"]+\"/.test(l);
    const ariaLabelAttr = /aria-label=\"[^\{][^\"]+\"/.test(l);
    if (textTag || headingTag || buttonTag || labelProp || placeholderAttr || ariaLabelAttr) {
      offenders.push(`Line ${idx + 1}: ${l}`);
    }
  });
  return offenders;
}

describe('Customer pages should not contain hardcoded strings', () => {
  const files = readAllTsxFiles(CUSTOMER_PAGES_DIR);

  it('scans all customer TSX pages', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`has no raw literals in ${path.relative(CUSTOMER_PAGES_DIR, file)}`, () => {
      const src = fs.readFileSync(file, 'utf8');
      const offenders = findRawLiterals(src);
      expect(offenders, `Hardcoded strings found in ${file} ->\n${offenders.join('\n')}`).toEqual([]);
    });
  }
});


