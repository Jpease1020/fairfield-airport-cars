import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function runEslintOn(paths) {
  const eslintBin = './node_modules/eslint/bin/eslint.js';
  const args = ['-f', 'json', '--ext', '.ts,.tsx,.js,.jsx', ...paths, '--no-error-on-unmatched-pattern'];
  const result = spawnSync('node', [eslintBin, ...args], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0 && result.stdout.trim().length === 0) {
    // Non-zero without JSON (likely config error)
    console.error(result.stderr);
    process.exit(result.status);
  }
  const json = result.stdout.trim();
  try {
    return JSON.parse(json || '[]');
  } catch (e) {
    console.error('Failed to parse ESLint JSON output');
    console.error(json.slice(0, 1000));
    throw e;
  }
}

function summarize(results) {
  const summary = {
    files: results.length,
    messages: 0,
    errors: 0,
    warnings: 0,
    byRule: {},
  };
  for (const file of results) {
    for (const m of file.messages) {
      summary.messages += 1;
      if (m.severity === 2) summary.errors += 1; else summary.warnings += 1;
      const rule = m.ruleId || 'unknown';
      summary.byRule[rule] = (summary.byRule[rule] || 0) + 1;
    }
  }
  return summary;
}

function formatMarkdown(summary, results) {
  const lines = [];
  lines.push('# Lint Progress');
  lines.push('');
  lines.push(`- Date: ${new Date().toISOString()}`);
  lines.push(`- Files checked: ${summary.files}`);
  lines.push(`- Errors: ${summary.errors}`);
  lines.push(`- Warnings: ${summary.warnings}`);
  lines.push('');
  lines.push('## Top rules');
  const topRules = Object.entries(summary.byRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [rule, count] of topRules) {
    lines.push(`- ${rule}: ${count}`);
  }
  lines.push('');
  lines.push('## Most affected files');
  const fileCounts = results.map(f => ({
    path: f.filePath,
    count: f.messages.length,
  })).sort((a, b) => b.count - a.count).slice(0, 10);
  for (const f of fileCounts) {
    lines.push(`- ${f.path}: ${f.count}`);
  }
  lines.push('');
  lines.push('Checked paths: src/app, tests');
  return lines.join('\n');
}

function main() {
  const results = runEslintOn(['src/app', 'tests']);
  const summary = summarize(results);
  const markdown = formatMarkdown(summary, results);
  const outPath = '/workspace/docs/lint-progress.md';
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, markdown, 'utf8');
  console.log(markdown);
}

main();