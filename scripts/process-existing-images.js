#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');

const ORIGINAL_DIR = path.join(__dirname, '../frontend/public/images/original');
const PROCESSED_DIR = path.join(__dirname, '../frontend/public/images/processed');

// Standard output dimensions (square for circular avatars)
const OUTPUT_SIZE = 800; // 800x800px

async function processImage(inputPath, outputPath) {
  try {
    console.log(`  Processing: ${path.basename(inputPath)}...`);

    // Step 1: Remove background
    const blob = await removeBackground(inputPath);
    const bgRemovedBuffer = Buffer.from(await blob.arrayBuffer());

    // Step 2: Load with sharp to get dimensions and process
    const image = sharp(bgRemovedBuffer);
    const metadata = await image.metadata();

    console.log(`    Original size: ${metadata.width}x${metadata.height}`);

    // Step 3: Calculate dimensions to fit within square while maintaining aspect ratio
    const maxDimension = Math.max(metadata.width, metadata.height);
    const scaleFactor = (OUTPUT_SIZE * 0.85) / maxDimension; // Use 85% to leave some padding
    const newWidth = Math.round(metadata.width * scaleFactor);
    const newHeight = Math.round(metadata.height * scaleFactor);

    console.log(`    Resized to: ${newWidth}x${newHeight}`);

    // Step 4: Resize and center on transparent canvas
    const processedBuffer = await sharp(bgRemovedBuffer)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: false,
      })
      .extend({
        top: Math.round((OUTPUT_SIZE - newHeight) / 2),
        bottom: Math.round((OUTPUT_SIZE - newHeight) / 2),
        left: Math.round((OUTPUT_SIZE - newWidth) / 2),
        right: Math.round((OUTPUT_SIZE - newWidth) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toBuffer();

    await fs.writeFile(outputPath, processedBuffer);
    console.log(`  ✓ Saved: ${path.basename(outputPath)} (${OUTPUT_SIZE}x${OUTPUT_SIZE})`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to process ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Processing Existing Images ===\n');
  console.log(`Original Images: ${ORIGINAL_DIR}`);
  console.log(`Processed Images: ${PROCESSED_DIR}`);
  console.log(`Output Size: ${OUTPUT_SIZE}x${OUTPUT_SIZE}\n`);

  // Ensure directories exist
  await fs.mkdir(ORIGINAL_DIR, { recursive: true });
  await fs.mkdir(PROCESSED_DIR, { recursive: true });

  // Read all files from original directory
  const files = await fs.readdir(ORIGINAL_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|bmp)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('No images found in original directory.');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) to process\n`);

  let processCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const baseName = path.parse(filename).name;
    const processedFilename = `${baseName}.png`;

    const originalPath = path.join(ORIGINAL_DIR, filename);
    const processedPath = path.join(PROCESSED_DIR, processedFilename);

    console.log(`[${i + 1}/${imageFiles.length}] ${filename}`);

    // Check if already processed
    const processedExists = await fs.access(processedPath).then(() => true).catch(() => false);

    if (processedExists) {
      console.log(`  ⊙ Already processed: ${processedFilename}`);
      skippedCount++;
      continue;
    }

    const success = await processImage(originalPath, processedPath);
    if (success) {
      processCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Processed: ${processCount} images`);
  console.log(`Skipped: ${skippedCount} images (already processed)`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nAll processed images: ${OUTPUT_SIZE}x${OUTPUT_SIZE} PNG with transparent background`);
  console.log(`Images saved to: ${PROCESSED_DIR}`);
}

main().catch(console.error);
