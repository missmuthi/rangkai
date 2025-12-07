#!/usr/bin/env node
/**
 * PWA Icon Converter
 * Converts icons to proper PNG format with correct dimensions
 */

import sharp from 'sharp'
import { copyFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const PUBLIC_DIR = 'public'
const BACKUP_DIR = 'backup-icons'
const ARTIFACT_DIR = '/home/mikhailryu/.gemini/antigravity/brain/b245295d-cb8c-4fcd-b821-c01239bf00ba'
const SOURCE_ICON = join(ARTIFACT_DIR, 'rangkai_icon_512_1765131027151.png')

const icons = [
  { filename: 'pwa-192x192.png', size: 192 },
  { filename: 'pwa-512x512.png', size: 512 },
  { filename: 'pwa-maskable-192x192.png', size: 192 },
  { filename: 'pwa-maskable-512x512.png', size: 512 },
  { filename: 'apple-touch-icon.png', size: 180 }
]

async function convertIcon(sourcePath, outputPath, size) {
  console.log(`🔧 Converting ${outputPath} -> ${size}x${size} PNG...`)
  
  await sharp(sourcePath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 15, g: 23, b: 42 } // #0f172a
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath)
  
  console.log(`✅ Created ${outputPath}`)
}

async function main() {
  // Create backup directory
  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true })
    console.log(`📁 Created backup directory: ${BACKUP_DIR}/\n`)
  }

  // Backup existing icons
  for (const { filename } of icons) {
    const sourcePath = join(PUBLIC_DIR, filename)
    const backupPath = join(BACKUP_DIR, filename)
    
    if (existsSync(sourcePath) && !existsSync(backupPath)) {
      await copyFile(sourcePath, backupPath)
      console.log(`💾 Backed up ${filename}`)
    }
  }
  
  console.log('')

  // Check if generated icon exists
  if (!existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`)
    console.error('Please ensure the icon was generated successfully.')
    process.exit(1)
  }

  // Convert all icons
  for (const { filename, size } of icons) {
    const outputPath = join(PUBLIC_DIR, filename)
    await convertIcon(SOURCE_ICON, outputPath, size)
  }

  console.log('\n✅ All icons converted successfully!\n')
  
  // Verify formats
  console.log('Verifying formats:')
  for (const { filename, size } of icons) {
    const iconPath = join(PUBLIC_DIR, filename)
    if (existsSync(iconPath)) {
      const metadata = await sharp(iconPath).metadata()
      console.log(`  ✓ ${filename}: ${metadata.format.toUpperCase()} ${metadata.width}x${metadata.height}`)
    }
  }
}

main().catch(console.error)
