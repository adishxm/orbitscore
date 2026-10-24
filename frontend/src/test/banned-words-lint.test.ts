import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Master prompt §7.6 Ban List
const BANNED_PHRASES = [
  'certified',
  'compliant',
  'approved',
  'guaranteed',
  'safe to launch',
  'risk score',
  'readiness score',
  'score of',
  'pass/fail',
  'cleared',
  'ready for launch',
];

// Approved disclaimer sentence that may contain "score" or "certify"
const APPROVED_DISCLAIMER_PHRASES = [
  'orbitscore does not score or certify missions',
  'does not score or certify missions',
  'despite the name, orbitscore does not score or certify missions; it organizes evidence for human review',
  'despite the name, orbitscore does not score or certify missions; it organizes evidence for qualified human review',
];

function getAllFiles(dir: string, extList: string[]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results = results.concat(getAllFiles(fullPath, extList));
      }
    } else {
      if (extList.some((ext) => file.endsWith(ext))) {
        // Exclude this test file itself so it doesn't trigger on its own banned list
        if (!file.includes('banned-words-lint.test.ts')) {
          results.push(fullPath);
        }
      }
    }
  }
  return results;
}

describe('§7.6 Banned Wording & Copy Integrity Lint', () => {
  const srcDir = path.resolve(__dirname, '../');
  const files = getAllFiles(srcDir, ['.ts', '.tsx', '.css', '.html']);

  it('scans all source files in /src for forbidden compliance, certification, and score terms', () => {
    const violations: { file: string; line: number; term: string; snippet: string }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineIndex) => {
        // Clean line for checks, but preserve context
        const lower = line.toLowerCase();

        // 1. Check prohibited phrases
        for (const phrase of BANNED_PHRASES) {
          if (lower.includes(phrase)) {
            // Check if it's the approved disclaimer
            const isApprovedDisclaimer = APPROVED_DISCLAIMER_PHRASES.some((approved) =>
              lower.includes(approved)
            );
            if (!isApprovedDisclaimer) {
              violations.push({
                file: path.relative(srcDir, file),
                line: lineIndex + 1,
                term: phrase,
                snippet: line.trim(),
              });
            }
          }
        }

        // 2. Check solitary word "score" (must only appear as brand "OrbitScore" or approved disclaimer)
        const scoreMatches = lower.match(/\bscore\b/g);
        if (scoreMatches) {
          const isApprovedDisclaimer = APPROVED_DISCLAIMER_PHRASES.some((approved) =>
            lower.includes(approved)
          );
          if (!isApprovedDisclaimer) {
            // Check if preceded immediately by orbit in lower text (e.g. orbitscore)
            // Note: \bscore\b matches the standalone word 'score', NOT 'orbitscore'.
            violations.push({
              file: path.relative(srcDir, file),
              line: lineIndex + 1,
              term: 'isolated "score"',
              snippet: line.trim(),
            });
          }
        }
      });
    }

    if (violations.length > 0) {
      console.error('Banned wording violations found:', violations);
    }

    expect(violations).toEqual([]);
  });
});
