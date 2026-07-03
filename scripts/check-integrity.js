#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let hasError = false;

function error(msg) {
  hasError = true;
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
}

function ok(msg) {
  console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
}

// --- 1. Validate package.json is valid JSON ---
console.log('\n--- Checking package.json ---');
const pkgPath = path.join(ROOT, 'package.json');
let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  ok('Valid JSON');
} catch (e) {
  error(`Invalid JSON: ${e.message}`);
  process.exit(1);
}

// --- 2. Check required fields ---
const requiredFields = ['name', 'displayName', 'description', 'version', 'publisher', 'categories', 'contributes'];
for (const field of requiredFields) {
  if (pkg[field] === undefined || pkg[field] === null || pkg[field] === '') {
    error(`Missing or empty field: "${field}"`);
  } else {
    ok(`Field "${field}" present`);
  }
}

// --- 3. Check contributes.themes ---
if (!pkg.contributes?.themes || pkg.contributes.themes.length === 0) {
  error('contributes.themes is empty or missing');
} else {
  ok(`contributes.themes has ${pkg.contributes.themes.length} entries`);
}

// --- 4. Check each theme file exists ---
console.log('\n--- Checking theme files ---');
const themesDir = path.join(ROOT, 'themes');
const themeFiles = fs.readdirSync(themesDir).filter(f => f.endsWith('-color-theme.json'));
const themeLabels = [];

for (const theme of pkg.contributes.themes) {
  const filePath = path.join(ROOT, theme.path);
  if (!fs.existsSync(filePath)) {
    error(`Theme file not found: ${theme.path}`);
  } else {
    ok(`Theme file exists: ${theme.path}`);
    themeLabels.push(theme.label);
  }
}

// --- 5. Check icon.png exists ---
console.log('\n--- Checking assets ---');
if (pkg.icon) {
  const iconPath = path.join(ROOT, pkg.icon);
  if (!fs.existsSync(iconPath)) {
    error(`Icon file not found: ${pkg.icon}`);
  } else {
    ok(`Icon file exists: ${pkg.icon}`);
  }
}

// --- 6. Check README.md exists ---
if (!fs.existsSync(path.join(ROOT, 'README.md'))) {
  error('README.md not found');
} else {
  ok('README.md exists');
}

// --- 7. Check LICENSE exists ---
if (!fs.existsSync(path.join(ROOT, 'LICENSE'))) {
  error('LICENSE not found');
} else {
  ok('LICENSE exists');
}

// --- 8. Check screenshots coverage ---
console.log('\n--- Checking screenshots ---');
const screenshotsDir = path.join(ROOT, 'screenshots');
const screenshotFiles = fs.existsSync(screenshotsDir)
  ? fs.readdirSync(screenshotsDir).filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
  : [];

if (screenshotFiles.length === 0) {
  error('No screenshot files found in screenshots/ directory');
} else {
  ok(`Found ${screenshotFiles.length} screenshot(s)`);
}

// --- 9. Cross-check: themes vs screenshot files ---
// Match theme labels to screenshot files flexibly
// e.g. "Explosive Green Dark" → "green-dark.png" or "explosive-green-dark.png"
const screenshotNames = screenshotFiles.map(f => path.basename(f, path.extname(f)).toLowerCase());

let missingScreenshots = [];
for (const theme of pkg.contributes.themes) {
  const label = theme.label.toLowerCase();
  // Try exact match first
  const matched = screenshotNames.some(s => s === label);
  if (matched) continue;

  // Try matching the last 2 words (e.g. "green dark", "high contrast blue")
  const parts = label.split(/\s+/);
  const suffix = parts.slice(-2).join('-');
  const matchedSuffix = screenshotNames.some(s => s === suffix || s.includes(suffix));
  if (matchedSuffix) continue;

  // Try matching any screenshot that contains key words from the theme name
  const hasKeywords = screenshotNames.some(s => {
    // Skip common prefix words like "Explosive" that appear in all theme names
    const keywords = parts.filter(p => p !== 'explosive' && p.length >= 3);
    if (keywords.length === 0) return true;
    return keywords.some(k => s.includes(k));
  });
  if (hasKeywords) continue;

  missingScreenshots.push(theme.label);
}

if (missingScreenshots.length > 0) {
  error(`${missingScreenshots.length} theme(s) missing screenshots: ${missingScreenshots.join(', ')}`);
} else {
  ok('All themes have corresponding screenshots');
}

// --- Summary ---
console.log('');
if (hasError) {
  console.error(`\x1b[31mIntegrity check FAILED. Fix the errors above before packaging.\x1b[0m`);
  process.exit(1);
} else {
  ok('All integrity checks passed.');
}
