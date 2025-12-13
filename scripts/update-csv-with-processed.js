#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const CSV_FILE = process.argv[2] || path.join(__dirname, '../real_data/my_family_persons.csv');
const PROCESSED_DIR = path.join(__dirname, '../frontend/public/images/processed');
const OUTPUT_CSV = CSV_FILE.replace('.csv', '_with_images.csv');

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

async function main() {
  console.log('=== Updating CSV with Processed Images ===\n');

  // Get list of processed images
  const processedFiles = await fs.readdir(PROCESSED_DIR);
  const processedMap = new Map();

  for (const file of processedFiles) {
    if (file.endsWith('.png')) {
      const personId = path.parse(file).name;
      processedMap.set(personId, `/images/processed/${file}`);
    }
  }

  console.log(`Found ${processedMap.size} processed images\n`);

  // Read and parse CSV
  const csvContent = await fs.readFile(CSV_FILE, 'utf-8');
  const { headers, rows } = await parseCSV(csvContent);

  let updateCount = 0;

  // Update rows with processed image paths
  for (const row of rows) {
    const personId = row.id;
    if (processedMap.has(personId)) {
      row.photo_url = processedMap.get(personId);
      console.log(`✓ ${personId}: ${row.name} -> ${row.photo_url}`);
      updateCount++;
    }
  }

  // Generate updated CSV
  const updatedCSV = await generateCSV(headers, rows);
  await fs.writeFile(OUTPUT_CSV, updatedCSV, 'utf-8');

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updateCount} entries`);
  console.log(`Output: ${OUTPUT_CSV}`);
  console.log(`\nNext step: Re-import to Neo4j with:`);
  console.log(`./scripts/csv_import.sh ${OUTPUT_CSV} real_data/my_family_relationships.csv`);
}

main().catch(console.error);
