#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '../frontend/public/images/original');
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/images/converted');

async function convertToPng(inputPath, outputPath) {
  try {
    console.log(`  Converting: ${path.basename(inputPath)}...`);

    // Convert to PNG without any resizing or modifications
    await sharp(inputPath)
      .png()
      .toFile(outputPath);

    console.log(`  ✓ Converted: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to convert ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Converting Images to PNG ===\n');
  console.log(`Input Directory: ${INPUT_DIR}`);
  console.log(`Output Directory: ${OUTPUT_DIR}\n`);

  // Ensure directories exist
  await fs.mkdir(INPUT_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Read all files from input directory
  const files = await fs.readdir(INPUT_DIR);
  // Process both JPEG and PNG files
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('No image files found in input directory.');
    return;
  }

  console.log(`Found ${imageFiles.length} image file(s) to process\n`);

  let convertCount = 0;
  let copyCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const ext = path.extname(filename).toLowerCase();
    const baseName = path.parse(filename).name;
    const isPng = ext === '.png';

    // Output as PNG
    const outputFilename = `${baseName}.png`;

    const inputPath = path.join(INPUT_DIR, filename);
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`[${i + 1}/${imageFiles.length}] ${filename}`);

    // Check if already exists in output
    const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);

    if (outputExists) {
      console.log(`  ⊙ Already exists: ${outputFilename}`);
      skippedCount++;
      continue;
    }

    // If already PNG, just copy it
    if (isPng) {
      try {
        await fs.copyFile(inputPath, outputPath);
        console.log(`  ✓ Copied: ${outputFilename}`);
        copyCount++;
      } catch (error) {
        console.error(`  ✗ Failed to copy ${filename}:`, error.message);
        errorCount++;
      }
    } else {
      // Convert JPEG to PNG
      const success = await convertToPng(inputPath, outputPath);
      if (success) {
        convertCount++;
      } else {
        errorCount++;
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Converted: ${convertCount} JPEG images`);
  console.log(`Copied: ${copyCount} PNG images`);
  console.log(`Skipped: ${skippedCount} images (already in output)`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nAll images saved to: ${OUTPUT_DIR}`);
  console.log(`\nNote: JPEG files converted to PNG, PNG files copied as-is`);
}

main().catch(console.error);
