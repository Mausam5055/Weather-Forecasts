import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get absolute paths
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const sourceDir = path.join(rootDir, 'weather-icons-master', 'production', 'fill', 'all');
const targetDir = path.join(publicDir, 'weather-icons-master', 'production', 'fill', 'all');

console.log('Root directory:', rootDir);
console.log('Source directory:', sourceDir);
console.log('Target directory:', targetDir);

// Create directories
try {
  // Create public directory
  if (!fs.existsSync(publicDir)) {
    console.log('Creating public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Public directory created successfully');
  }

  // Create target directory structure
  console.log('Creating target directory structure...');
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Target directory structure created successfully');

  // Verify source directory exists
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }
  console.log('Source directory verified');

  // Copy files
  console.log('Copying files...');
  const files = fs.readdirSync(sourceDir);
  console.log(`Found ${files.length} files in source directory`);
  let copiedCount = 0;

  files.forEach(file => {
    if (file.endsWith('.svg')) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied: ${file}`);
        copiedCount++;
      } catch (err) {
        console.error(`Error copying ${file}:`, err.message);
        console.error('Stack trace:', err.stack);
      }
    }
  });

  console.log(`Successfully copied ${copiedCount} files to ${targetDir}`);
} catch (err) {
  console.error('Error:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
} 