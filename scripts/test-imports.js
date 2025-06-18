#!/usr/bin/env node

// Test script to verify all imports are working correctly
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function testImports() {
  console.log('Testing server module imports...\n');
  
  const modules = [
    '../api/index.ts',
    '../server/routes.ts',
    '../server/storage.ts',
    '../server/mongodb-storage.ts',
    '../server/mongodb.ts',
    '../server/jwt.ts',
    '../server/auth.ts',
    '../server/logger.ts',
    '../server/vite.ts'
  ];
  
  for (const modulePath of modules) {
    try {
      console.log(`✓ Testing import: ${modulePath}`);
      await import(modulePath);
    } catch (error) {
      console.error(`✗ Failed to import ${modulePath}:`, error.message);
    }
  }
  
  console.log('\nImport test complete!');
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testImports().catch(console.error);
}
