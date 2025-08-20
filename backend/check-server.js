#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

console.log('🔍 Server Diagnostic Report\n');

// Check Node.js
console.log('📋 Node.js Information:');
console.log(`   Version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Architecture: ${process.arch}`);
console.log(`   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used\n`);

// Check Python availability
console.log('🐍 Python Availability:');
const pythonPaths = [
  '/usr/bin/python3',
  '/usr/bin/python',
  '/usr/local/bin/python3',
  '/usr/local/bin/python',
  '/opt/python3/bin/python3',
  '/opt/python/bin/python'
];

for (const pyPath of pythonPaths) {
  try {
    await fs.access(pyPath);
    console.log(`   ✅ Found: ${pyPath}`);
    try {
      const version = execSync(`${pyPath} --version`, { encoding: 'utf8' });
      console.log(`      Version: ${version.trim()}`);
    } catch (e) {
      console.log(`      ⚠️  Could not get version`);
    }
  } catch (error) {
    console.log(`   ❌ Not found: ${pyPath}`);
  }
}

// Check Node.js availability
console.log('\n🟢 Node.js Availability:');
const nodePaths = [
  '/usr/bin/node',
  '/usr/local/bin/node',
  '/opt/node/bin/node'
];

for (const nodePath of nodePaths) {
  try {
    await fs.access(nodePath);
    console.log(`   ✅ Found: ${nodePath}`);
    try {
      const version = execSync(`${nodePath} --version`, { encoding: 'utf8' });
      console.log(`      Version: ${version.trim()}`);
    } catch (e) {
      console.log(`      ⚠️  Could not get version`);
    }
  } catch (error) {
    console.log(`   ❌ Not found: ${nodePath}`);
  }
}

// Check PATH commands
console.log('\n🔍 PATH Commands:');
try {
  const python3Path = execSync('which python3', { encoding: 'utf8' });
  console.log(`   ✅ python3: ${python3Path.trim()}`);
} catch (e) {
  console.log('   ❌ python3: Not in PATH');
}

try {
  const nodePath = execSync('which node', { encoding: 'utf8' });
  console.log(`   ✅ node: ${nodePath.trim()}`);
} catch (e) {
  console.log('   ❌ node: Not in PATH');
}

// Check environment
console.log('\n🌍 Environment:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   PWD: ${process.cwd()}`);

console.log('\n✅ Diagnostic complete!');

