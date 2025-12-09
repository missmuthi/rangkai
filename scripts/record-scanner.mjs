import { chromium, devices } from '@playwright/test';
import fs from 'fs';
import readline from 'readline';

const outputDir = './public/screenshots'; // Changed to match your requested structure

// Ensure output directory exists
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// Setup CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n📸 \x1b[36mRangkai Asset Capture Tool\x1b[0m');
  console.log('-----------------------------');
  console.log('1. 🎥 Record Scanner Demo (for scanner.gif)');
  console.log('2. 🖼️  Capture Metadata Editor (metadata-editor.png)');
  console.log('3. 🖼️  Capture AI Cleanup (ai-cleanup.png)');
  console.log('0. ❌ Exit');
  
  const choice = await ask('\nSelect an option [1-3]: ');

  if (choice === '0') {
    rl.close();
    return;
  }

  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const device = devices['iPhone 12 Pro'];
  
  let contextOptions = { ...device };
  
  // If recording video
  if (choice === '1') {
    contextOptions.recordVideo = {
      dir: outputDir,
      size: { width: 390, height: 844 }
    };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  try {
    console.log('\n🚀 Opening app...');
    await page.goto('http://localhost:3000');
    
    // Login Prompt
    console.log('\n🔑 \x1b[33mACTION REQUIRED:\x1b[0m Log in to the app in the browser window.');
    await ask('Press [ENTER] when you are logged in and ready...');

    if (choice === '1') {
      // --- SCANNER DEMO ---
      console.log('\n📱 Navigating to mobile scanner...');
      await page.goto('http://localhost:3000/scan/mobile');
      
      console.log('\n🎥 \x1b[32mRECORDING STARTED\x1b[0m');
      console.log('1. Demonstrate the scanning flow');
      console.log('2. Scan a book');
      console.log('3. Show the result');
      
      await ask('\nPress [ENTER] to STOP recording and save video...');
      
      await context.close(); // Saves video
      console.log(`\n✅ Video saved to ${outputDir} (look for the .webm file)`);
      console.log('⚠️  Note: You will need to convert this .webm to .gif yourself using ffmpeg or ezgif.com');
      
    } else if (choice === '2') {
      // --- METADATA EDITOR ---
      console.log('\n📱 Navigating to history...'); // Assuming editor is accessed from history or scan
      await page.goto('http://localhost:3000/dashboard'); // Or wherever appropriate
      
      console.log('\n🖼️  \x1b[33mSETUP REQUIRED:\x1b[0m');
      console.log('Navigate to a book detail/edit page that looks good.');
      
      await ask('Press [ENTER] to take the screenshot (metadata-editor.png)...');
      
      await page.screenshot({ path: `${outputDir}/metadata-editor.png` });
      console.log(`\n✅ Screenshot saved to ${outputDir}/metadata-editor.png`);
      
    } else if (choice === '3') {
      // --- AI CLEANUP ---
      console.log('\n📱 Opening app...');
      
      console.log('\n🖼️  \x1b[33mSETUP REQUIRED:\x1b[0m');
      console.log('Navigate to a screen showing the AI cleanup results (before/after or success state).');
      
      await ask('Press [ENTER] to take the screenshot (ai-cleanup.png)...');
      
      await page.screenshot({ path: `${outputDir}/ai-cleanup.png` });
      console.log(`\n✅ Screenshot saved to ${outputDir}/ai-cleanup.png`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser.isConnected()) await browser.close();
    rl.close();
    process.exit(0);
  }
}

main();
