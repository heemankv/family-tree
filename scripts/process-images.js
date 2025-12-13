#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');

const CSV_FILE = process.argv[2] || path.join(__dirname, '../real_data/my_family_persons.csv');
const ORIGINAL_DIR = path.join(__dirname, '../frontend/public/images/original');
const PROCESSED_DIR = path.join(__dirname, '../frontend/public/images/processed');
const UPDATED_CSV = process.argv[3] || CSV_FILE.replace('.csv', '_updated.csv');

// Standard output dimensions (square for circular avatars)
const OUTPUT_SIZE = 800; // 800x800px

async function downloadImage(url, filename, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const client = url.startsWith('https') ? https : http;

    client.get(url, { followRedirect: true }, (response) => {
      // Handle all redirect status codes including 303
      if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 303 || response.statusCode === 307 || response.statusCode === 308) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect without location header`));
          return;
        }
        downloadImage(redirectUrl, filename, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);

          // Check if it's actually an image (check magic bytes)
          const isImage = buffer.length > 0 && (
            buffer[0] === 0xFF && buffer[1] === 0xD8 || // JPEG
            buffer[0] === 0x89 && buffer[1] === 0x50 || // PNG
            buffer[0] === 0x47 && buffer[1] === 0x49 || // GIF
            buffer[0] === 0x42 && buffer[1] === 0x4D    // BMP
          );

          if (!isImage) {
            reject(new Error('Downloaded file is not an image (possibly HTML page)'));
            return;
          }

          await fs.writeFile(filename, buffer);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function extractGoogleDriveFileId(url) {
  const match = url.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
}

function getGoogleDriveDirectUrl(url) {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return null;
  // Use the correct Google Drive direct download URL
  return `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`;
}

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

async function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

async function generateCSV(headers, rows) {
  const lines = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map(header => {
      const value = row[header] || '';
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

async function ensureDirectories() {
  await fs.mkdir(ORIGINAL_DIR, { recursive: true });
  await fs.mkdir(PROCESSED_DIR, { recursive: true });
}

async function main() {
  console.log('=== Family Tree Image Preprocessing ===\n');
  console.log(`CSV File: ${CSV_FILE}`);
  console.log(`Original Images: ${ORIGINAL_DIR}`);
  console.log(`Processed Images: ${PROCESSED_DIR}`);
  console.log(`Updated CSV: ${UPDATED_CSV}\n`);

  await ensureDirectories();

  const csvContent = await fs.readFile(CSV_FILE, 'utf-8');
  const { headers, rows } = await parseCSV(csvContent);

  let downloadCount = 0;
  let processCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const photoUrl = row.photo_url;

    if (!photoUrl || photoUrl.trim() === '' || photoUrl === '´') {
      console.log(`[${i + 1}/${rows.length}] ${row.name}: No photo URL, skipping`);
      continue;
    }

    const personId = row.id;
    const ext = '.jpg';
    const originalFilename = `${personId}${ext}`;
    const processedFilename = `${personId}.png`;
    const originalPath = path.join(ORIGINAL_DIR, originalFilename);
    const processedPath = path.join(PROCESSED_DIR, processedFilename);

    console.log(`\n[${i + 1}/${rows.length}] Processing: ${row.name} (${personId})`);

    try {
      let downloadUrl = photoUrl;
      if (photoUrl.includes('drive.google.com')) {
        downloadUrl = getGoogleDriveDirectUrl(photoUrl);
        if (!downloadUrl) {
          console.log(`  ✗ Could not extract Google Drive file ID`);
          errorCount++;
          continue;
        }
      }

      const originalExists = await fs.access(originalPath).then(() => true).catch(() => false);

      if (!originalExists) {
        console.log(`  Downloading from: ${downloadUrl.substring(0, 60)}...`);
        await downloadImage(downloadUrl, originalPath);
        console.log(`  ✓ Downloaded: ${originalFilename}`);
        downloadCount++;
      } else {
        console.log(`  ⊙ Already downloaded: ${originalFilename}`);
      }

      const processedExists = await fs.access(processedPath).then(() => true).catch(() => false);

      if (!processedExists) {
        const success = await processImage(originalPath, processedPath);
        if (success) {
          processCount++;
          row.photo_url = `/images/processed/${processedFilename}`;
        } else {
          errorCount++;
          row.photo_url = `/images/original/${originalFilename}`;
        }
      } else {
        console.log(`  ⊙ Already processed: ${processedFilename}`);
        row.photo_url = `/images/processed/${processedFilename}`;
      }

    } catch (error) {
      console.error(`  ✗ Error:`, error.message);
      errorCount++;
      row.photo_url = photoUrl;
    }
  }

  const updatedCSV = await generateCSV(headers, rows);
  await fs.writeFile(UPDATED_CSV, updatedCSV, 'utf-8');

  console.log('\n=== Summary ===');
  console.log(`Downloaded: ${downloadCount} images`);
  console.log(`Processed: ${processCount} images`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nUpdated CSV saved to: ${UPDATED_CSV}`);
  console.log('\nNext steps:');
  console.log(`1. Review processed images in: ${PROCESSED_DIR}`);
  console.log(`2. Replace original CSV with updated CSV if satisfied`);
  console.log(`3. Re-import CSV to Neo4j using: ./scripts/csv_import.sh`);
}

main().catch(console.error);
