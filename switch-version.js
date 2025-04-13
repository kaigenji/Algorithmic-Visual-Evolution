#!/usr/bin/env node
/**
 * Algorithmic Visual Evolution - Version Switcher
 * A utility to switch between JavaScript and TypeScript versions
 * 
 * Usage:
 *   node switch-version.js js    # Run JavaScript version
 *   node switch-version.js ts    # Run TypeScript version
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Parse command line arguments
const versionArg = process.argv[2]?.toLowerCase();
if (!versionArg || (versionArg !== 'js' && versionArg !== 'ts')) {
  console.error('Please specify which version to run: js or ts');
  console.error('Example: node switch-version.js ts');
  process.exit(1);
}

// Function to add .js extensions to imports in compiled files
function fixImports() {
  function addJsExtensionToImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statements without extensions to include .js
    const updatedContent = content.replace(
      /from\s+['"](.+?)(?:\.js)?['"]/g,
      (match, importPath) => {
        // Skip external module imports
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          return `from '${importPath}.js'`;
        }
        return match;
      }
    );
    
    fs.writeFileSync(filePath, updatedContent);
  }

  function processDirectory(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.name.endsWith('.js')) {
        addJsExtensionToImports(fullPath);
      }
    }
  }

  // Start processing the dist directory
  processDirectory('./dist');
  console.log('Added .js extensions to all imports in compiled files');
}

// Ensure the dist directory exists
function ensureDistDirectory() {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Also ensure subdirectories exist for JS version
  if (versionArg === 'js') {
    if (!fs.existsSync('dist/utils')) {
      fs.mkdirSync('dist/utils', { recursive: true });
    }
    if (!fs.existsSync('dist/algorithms')) {
      fs.mkdirSync('dist/algorithms', { recursive: true });
    }
  }
}

// Copy JS files to dist for the JS version
function copyJsFilesToDist() {
  console.log('Copying JavaScript files to dist directory...');
  
  // Copy main app.js
  fs.copyFileSync('app.js', 'dist/app.js');
  
  // Copy config.js
  if (fs.existsSync('config.js')) {
    fs.copyFileSync('config.js', 'dist/config.js');
  }
  
  // Copy types.js
  if (fs.existsSync('types.js')) {
    fs.copyFileSync('types.js', 'dist/types.js');
  }
  
  // Copy utils directory
  if (fs.existsSync('utils')) {
    const utilsFiles = fs.readdirSync('utils');
    utilsFiles.forEach(file => {
      if (file.endsWith('.js')) {
        fs.copyFileSync(`utils/${file}`, `dist/utils/${file}`);
      }
    });
  }
  
  // Copy algorithms directory
  if (fs.existsSync('algorithms')) {
    const algoFiles = fs.readdirSync('algorithms');
    algoFiles.forEach(file => {
      if (file.endsWith('.js')) {
        fs.copyFileSync(`algorithms/${file}`, `dist/algorithms/${file}`);
      }
    });
  }
}

// Clean up function to be called before exit
function cleanup() {
  // No need to delete any files as we're now keeping everything in dist/
  process.exit(0);
}

// Register cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Main execution logic
try {
  // Clean dist directory for both versions
  console.log('Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  ensureDistDirectory();
  
  if (versionArg === 'js') {
    console.log('🚀 Running JavaScript version');
    console.log('📢 If you experience any UI issues, please run the JavaScript version again');
    copyJsFilesToDist();
  } else { // TypeScript version
    console.log('🚀 Running TypeScript version');
    console.log('📢 If parameters or UI elements are missing, try refreshing the browser');
    
    // Compile TypeScript
    console.log('Compiling TypeScript...');
    execSync('tsc', { stdio: 'inherit' });
    
    // Fix imports
    console.log('Fixing module imports...');
    fixImports();
  }
  
  // Start live-server
  console.log('Starting development server...');
  const server = spawn('live-server', ['--open=index.html'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('exit', cleanup);
  
} catch (error) {
  console.error('Error:', error.message);
  cleanup();
} 