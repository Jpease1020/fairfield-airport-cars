import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Simple heuristic: flag JSX Text/H1-H6/Button nodes containing raw literals not wrapped in getCMSField
// We scan the (public) pages for patterns like <Text>Some literal</Text>, etc.

const PUBLIC_PAGES_DIR = path.resolve(__dirname, '../../src/app/(public)');

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
  // Ignore lines that already include getCMSField(
  const lines = source.split(/\n/);
  lines.forEach((line, idx) => {
    const l = line.trim();
    if (l.includes('getCMSField(')) return;
    // Match <Text>literal</Text>, <H1..H6>literal</H1..H6>, <Button>literal</Button>
    const textTag = /<Text[^>]*>[^<{]+<\/Text>/.test(l);
    const headingTag = /<H[1-6][^>]*>[^<{]+<\/H[1-6]>/.test(l);
    const buttonTag = /<Button[^>]*>[^<{]+<\/Button>/.test(l);
    // Also catch Label/placeholder/aria-label props with raw strings in JSX for public pages
    const labelProp = /<Label[^>]*>[^<{]+<\/Label>/.test(l);
    const placeholderAttr = /placeholder=\"[^\{][^\"]+\"/.test(l);
    const ariaLabelAttr = /aria-label=\"[^\{][^\"]+\"/.test(l);
    if (textTag || headingTag || buttonTag || labelProp || placeholderAttr || ariaLabelAttr) {
      offenders.push(`Line ${idx + 1}: ${l}`);
    }
  });
  return offenders;
}

describe('Public pages should not contain hardcoded strings', () => {
  const files = readAllTsxFiles(PUBLIC_PAGES_DIR);

  it('scans all public TSX pages', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`has no raw literals in ${path.relative(PUBLIC_PAGES_DIR, file)}`, () => {
      const src = fs.readFileSync(file, 'utf8');
      const offenders = findRawLiterals(src);
      expect(offenders, `Hardcoded strings found in ${file} ->\n${offenders.join('\n')}`).toEqual([]);
    });
  }
});


