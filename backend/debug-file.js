import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuid } from 'uuid';

async function debugFileCreation() {
  try {
    console.log('🔍 Debugging file creation...');
    
    const tempDir = path.join(os.tmpdir(), `code-${uuid()}`);
    console.log('📁 Temp directory:', tempDir);
    
    await fs.mkdir(tempDir, { recursive: true });
    console.log('✅ Directory created');
    
    const filePath = path.join(tempDir, 'main.js');
    const code = 'console.log("Hello from JavaScript!");';
    
    console.log('📝 Writing file:', filePath);
    await fs.writeFile(filePath, code, { encoding: 'utf8', flag: 'w' });
    console.log('✅ File written');
    
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    console.log('🔍 File exists:', fileExists);
    
    if (fileExists) {
      const content = await fs.readFile(filePath, 'utf8');
      console.log('📖 File content:', content);
    }
    
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log('🧹 Cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFileCreation();
