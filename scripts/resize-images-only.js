#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const ORIGINAL_DIR = path.join(__dirname, '../frontend/public/images/original');
const RESIZED_DIR = path.join(__dirname, '../frontend/public/images/resized');

// Standard output dimensions (square for circular avatars)
const OUTPUT_SIZE = 800; // 800x800px

async function resizeImage(inputPath, outputPath) {
  try {
    console.log(`  Resizing: ${path.basename(inputPath)}...`);

    // Load image and get metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`    Original size: ${metadata.width}x${metadata.height}`);

    // Calculate dimensions to fit within square while maintaining aspect ratio
    const maxDimension = Math.max(metadata.width, metadata.height);
    const scaleFactor = (OUTPUT_SIZE * 0.85) / maxDimension; // Use 85% to leave some padding
    const newWidth = Math.round(metadata.width * scaleFactor);
    const newHeight = Math.round(metadata.height * scaleFactor);

    console.log(`    Resized to: ${newWidth}x${newHeight}`);

    // Resize and center on canvas with white background, convert to PNG
    const resizedBuffer = await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: false,
      })
      .extend({
        top: Math.round((OUTPUT_SIZE - newHeight) / 2),
        bottom: Math.round((OUTPUT_SIZE - newHeight) / 2),
        left: Math.round((OUTPUT_SIZE - newWidth) / 2),
        right: Math.round((OUTPUT_SIZE - newWidth) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .png()
      .toBuffer();

    await fs.writeFile(outputPath, resizedBuffer);
    console.log(`  ✓ Saved: ${path.basename(outputPath)} (${OUTPUT_SIZE}x${OUTPUT_SIZE} PNG)`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to resize ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Resizing Images (No Background Removal) ===\n');
  console.log(`Original Images: ${ORIGINAL_DIR}`);
  console.log(`Resized Images: ${RESIZED_DIR}`);
  console.log(`Output Size: ${OUTPUT_SIZE}x${OUTPUT_SIZE} PNG with white background\n`);

  // Ensure directories exist
  await fs.mkdir(ORIGINAL_DIR, { recursive: true });
  await fs.mkdir(RESIZED_DIR, { recursive: true });

  // Read all files from original directory
  const files = await fs.readdir(ORIGINAL_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|bmp)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('No images found in original directory.');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) to resize\n`);

  let resizeCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const baseName = path.parse(filename).name;

    // Always output as PNG
    const resizedFilename = `${baseName}.png`;

    const originalPath = path.join(ORIGINAL_DIR, filename);
    const resizedPath = path.join(RESIZED_DIR, resizedFilename);

    console.log(`[${i + 1}/${imageFiles.length}] ${filename}`);

    // Check if already resized
    const resizedExists = await fs.access(resizedPath).then(() => true).catch(() => false);

    if (resizedExists) {
      console.log(`  ⊙ Already resized: ${resizedFilename}`);
      skippedCount++;
      continue;
    }

    const success = await resizeImage(originalPath, resizedPath);
    if (success) {
      resizeCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Resized: ${resizeCount} images`);
  console.log(`Skipped: ${skippedCount} images (already resized)`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nAll resized images: ${OUTPUT_SIZE}x${OUTPUT_SIZE} PNG with white background`);
  console.log(`Images saved to: ${RESIZED_DIR}`);
}

main().catch(console.error);
