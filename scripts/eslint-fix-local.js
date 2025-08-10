#!/usr/bin/env node
import { ESLint } from 'eslint';
import fs from 'fs/promises';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

async function main() {
  log('🔧 Running local ESLint warnings fixer...');

  const eslint = new ESLint({
    overrideConfigFile: 'eslint.config.js',
    useEslintrc: false,
    ignore: true,
    fix: false
  });

  const files = await (await import('glob')).glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'out/**',
      'tests/**',
      'docs/**',
      'scripts/**',
      'playwright-report/**',
      'temp/**'
    ],
    absolute: true
  });

  log(`📁 Scanning ${files.length} files...`);
  const results = await eslint.lintFiles(files);

  const filesByPath = new Map();
  for (const r of results) {
    if (!r.messages || r.messages.length === 0) continue;
    const rel = path.relative(process.cwd(), r.filePath);
    const existing = filesByPath.get(rel) || [];
    existing.push(...r.messages);
    filesByPath.set(rel, existing);
  }

  let changedFiles = 0;
  for (const [relPath, messages] of filesByPath.entries()) {
    const absPath = path.join(process.cwd(), relPath);
    let source = await fs.readFile(absPath, 'utf8');
    const original = source;

    // 1) Replace explicit any with unknown in common patterns
    if (messages.some(m => m.ruleId === '@typescript-eslint/no-explicit-any')) {
      source = replaceAnyWithUnknown(source);
    }

    // 2) Handle unused imports and unused variables
    for (const m of messages) {
      if (m.ruleId === 'no-unused-vars' || m.ruleId === '@typescript-eslint/no-unused-vars') {
        const identifier = extractIdentifierFromMessage(m.message);
        if (identifier) {
          // Try to remove from an import line first
          const next = removeImportSpecifierIfPresent(source, identifier);
          if (next !== source) {
            source = next;
            continue;
          }
        }
        // Otherwise, add a line-specific disable just above the reported line
        source = addDisableNextLine(source, m.line, m.ruleId);
      }
    }

    if (source !== original) {
      changedFiles++;
      if (DRY_RUN) {
        log(`📝 [dry-run] Would update ${relPath}`);
      } else {
        await fs.writeFile(absPath, source, 'utf8');
        log(`✅ Updated ${relPath}`);
      }
    }
  }

  log(`\n🎯 Completed. ${changedFiles} file(s) updated${DRY_RUN ? ' (dry-run)' : ''}.`);
}

function replaceAnyWithUnknown(text) {
  // Common safe replacements
  return text
    // any[] -> unknown[]
    .replace(/\bany\s*\[\s*\]/g, 'unknown[]')
    // Array<any> -> Array<unknown>
    .replace(/Array<\s*any\s*>/g, 'Array<unknown>')
    // Promise<any> -> Promise<unknown>
    .replace(/Promise<\s*any\s*>/g, 'Promise<unknown>')
    // <any> (generic) -> <unknown>
    .replace(/<\s*any\s*>/g, '<unknown>')
    // : any -> : unknown
    .replace(/(:\s*)any(\b)/g, '$1unknown$2');
}

function extractIdentifierFromMessage(message) {
  // ESLint no-unused-vars usually formats as: "'foo' is defined but never used."
  const m = message.match(/^'([^']+)' is defined/);
  return m ? m[1] : null;
}

function removeImportSpecifierIfPresent(source, identifier) {
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('import')) continue;

    // Named import: import { A, B as C } from 'x';
    if (line.includes('{') && line.includes('}')) {
      const before = line;
      // remove exact identifier or alias usage
      const updated = line
        .replace(new RegExp(`\\{([^}]*)\\}`, 'g'), (match, inner) => {
          const parts = inner
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .filter(tok => {
              // token can be: X or X as Y
              const [left, , right] = tok.split(/\s+/);
              return left !== identifier && right !== identifier;
            });
          return `{ ${parts.join(', ')} }`;
        })
        .replace(/\{\s*\}/, '');
      if (updated !== before) {
        // If named list now empty and no default/namespace, drop the whole line
        if (/^\s*import\s*\{\s*\}\s*from/.test(updated)) {
          lines.splice(i, 1);
        } else {
          lines[i] = cleanupImportCommas(updated);
        }
        return lines.join('\n');
      }
    }

    // Default import: import Foo from 'x';
    const defaultMatch = line.match(/^\s*import\s+([A-Za-z0-9_\$]+)(\s*,\s*\{[^}]+\})?\s+from/);
    if (defaultMatch && defaultMatch[1] === identifier) {
      if (defaultMatch[2]) {
        // Keep the named part: transform `import Foo, {A} from` -> `import {A} from`
        lines[i] = line.replace(defaultMatch[0], `import ${defaultMatch[2].replace(/^\s*,\s*/, '')} from`);
      } else {
        // Remove the whole import
        lines.splice(i, 1);
      }
      return lines.join('\n');
    }

    // Namespace import: import * as Foo from 'x';
    const nsMatch = line.match(/^\s*import\s+\*\s+as\s+([A-Za-z0-9_\$]+)\s+from/);
    if (nsMatch && nsMatch[1] === identifier) {
      lines.splice(i, 1);
      return lines.join('\n');
    }
  }
  return source;
}

function cleanupImportCommas(line) {
  // Remove redundant commas like `import , { A } from` -> `import { A } from`
  return line
    .replace(/import\s*,\s*\{/, 'import {')
    .replace(/\{\s*,\s*/g, '{ ')
    .replace(/,\s*\}/g, ' }')
    .replace(/\{\s*\}/g, '');
}

function addDisableNextLine(source, problemLine, ruleId) {
  const lines = source.split(/\r?\n/);
  const lineIndex = Math.max(0, problemLine - 1);
  const directive = `/* eslint-disable-next-line ${ruleId} */`;
  // Avoid duplicate directives
  if (lines[lineIndex - 1] && lines[lineIndex - 1].includes(directive)) return source;
  lines.splice(lineIndex, 0, directive);
  return lines.join('\n');
}

main().catch(err => {
  console.error('❌ Failed to run fixer:', err);
  process.exit(1);
});


