// === [scripts/verify-dist.js] ===
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST = path.resolve(__dirname, '..', 'dist');
const BAD_PATTERNS = [
  'imports-loader?',
  'exports-loader?',
  '!exports-loader',
  '!imports-loader'
];

function scan(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const p of BAD_PATTERNS) {
    if (content.includes(p)) {
      throw new Error(`Build verification failed: found "${p}" in ${path.basename(file)}.`);
    }
  }
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // Skip scratch directory as it contains pre-built webpack bundles
      if (name === 'scratch') {
        console.log('Skipping scratch directory (contains pre-built webpack bundles)');
        continue;
      }
      walk(full);
    } else if (/\.(js|mjs|html|css|map)$/.test(name)) scan(full);
  }
}

if (!fs.existsSync(DIST)) {
  throw new Error(`dist/ not found. Run "npm run build" first.`);
}
walk(DIST);
console.log('verify-dist: OK');
