# Image Processing Workflow

This document describes the automated image preprocessing workflow for family tree photos, including background removal and local storage management.

## Overview

The image processing workflow:
1. **Downloads** photos from Google Drive URLs in CSV
2. **Processes** them with background removal (AI-powered)
3. **Exports** to `/frontend/public/images/processed/`
4. **Updates** CSV with new local paths

## Prerequisites

- Node.js 18+ installed
- Dependencies installed: `npm install` (in project root)

## Directory Structure

```
family_tree/
├── scripts/
│   └── process-images.js          # Main processing script
├── frontend/public/images/
│   ├── original/                  # Downloaded originals (git-ignored)
│   ├── processed/                 # Background-removed PNGs (committed)
│   ├── default-avatar-male.png
│   └── default-avatar-female.png
├── real_data/
│   ├── my_family_persons.csv      # Original CSV with Google Drive URLs
│   └── my_family_persons_updated.csv  # Updated CSV with local paths
└── package.json                   # Root dependencies
```

## Usage

### Step 1: Run Image Processing

Process images from the default CSV file:

```bash
npm run process-images
```

Or specify a custom CSV file:

```bash
node scripts/process-images.js path/to/persons.csv path/to/output.csv
```

### Step 2: Review Processed Images

Check the processed images in:
```
frontend/public/images/processed/
```

Each image will be a PNG with transparent background.

### Step 3: Update CSV in Database

If satisfied with the results, replace the original CSV with the updated one:

```bash
cp real_data/my_family_persons_updated.csv real_data/my_family_persons.csv
```

Then re-import to Neo4j:

```bash
./scripts/csv_import.sh real_data/my_family_persons.csv real_data/my_family_relationships.csv
```

## How It Works

### 1. Download Phase

The script parses the CSV and identifies photo URLs:
- **Google Drive URLs**: Extracts file ID and converts to direct download URL
- **Other URLs**: Downloads directly
- **Local paths**: Skipped if already exist

Downloaded files are saved as: `{person_id}.jpg` in `frontend/public/images/original/`

### 2. Processing Phase

For each downloaded image:
- **Step 1**: Uses `@imgly/background-removal-node` (AI-powered, runs locally) to remove background
- **Step 2**: Uses `sharp` to resize and center the image
  - Resizes to fit within 800x800px while maintaining aspect ratio
  - Centers the person on a transparent canvas
  - All images standardized to exactly 800x800px
- **Step 3**: Saves as: `{person_id}.png` in `frontend/public/images/processed/`

This ensures:
- ✅ All images are the same size (800x800px)
- ✅ Person is centered in the frame
- ✅ Consistent appearance in circular avatars
- ✅ Transparent background with proper padding

### 3. CSV Update Phase

Updates the `photo_url` field in CSV:
- **Success**: `/images/processed/{person_id}.png`
- **Failure**: `/images/original/{person_id}.jpg` (fallback)
- **No photo**: Left empty

### 4. Frontend Display

The Avatar component (`frontend/src/components/ui/Avatar.tsx`):
- Loads from the path specified in `photo_url`
- Adds gradient background for processed images (transparent PNGs)
- Falls back to default avatars on error

## CSV Format

### Input CSV (`photo_url` field)

```csv
id,name,gender,photo_url
a1b2,John Doe,Male,https://drive.google.com/open?id=1lSP3s2bkjZhm4v8k...
c3d4,Jane Smith,Female,https://example.com/photo.jpg
```

### Output CSV (`photo_url` field)

```csv
id,name,gender,photo_url
a1b2,John Doe,Male,/images/processed/a1b2.png
c3d4,Jane Smith,Female,/images/processed/c3d4.png
```

## Script Output Example

```
=== Family Tree Image Preprocessing ===

CSV File: /path/to/my_family_persons.csv
Original Images: /path/to/frontend/public/images/original
Processed Images: /path/to/frontend/public/images/processed
Updated CSV: /path/to/my_family_persons_updated.csv

[1/50] Processing: Heemank Verma (a1b2)
  Downloading from: https://drive.google.com/uc?export=download&id=1lSP3s...
  ✓ Downloaded: a1b2.jpg
  Processing: a1b2.jpg...
  ✓ Saved: a1b2.png

[2/50] Processing: Mangesh Verma (c3d4)
  ⊙ Already downloaded: c3d4.jpg
  ⊙ Already processed: c3d4.png

=== Summary ===
Downloaded: 25 images
Processed: 25 images
Errors: 0

Updated CSV saved to: /path/to/my_family_persons_updated.csv
```

## Features

### Incremental Processing
- **Smart caching**: Skips already downloaded/processed images
- **Resume support**: Can re-run without re-downloading everything
- **Fast iteration**: Only processes new or missing images

### Error Handling
- **Download failures**: Logged, original URL kept in CSV
- **Processing failures**: Falls back to original image path
- **Partial success**: Script completes even if some images fail

### Performance
- **Background removal**: ~2-5 seconds per image
- **Model download**: ~20MB (first run only, cached locally)
- **Parallel processing**: Can be added in future for speed

## Customization

### Adjust Background Removal Settings

Edit `scripts/process-images.js`, modify the `processImage` function:

```javascript
const blob = await removeBackground(inputPath, {
  model: 'medium', // Options: 'small', 'medium', 'large'
  output: { 
    quality: 0.9,
    type: 'png'
  }
});
```

### Change Output Paths

Modify constants at top of `scripts/process-images.js`:

```javascript
const ORIGINAL_DIR = path.join(__dirname, '../frontend/public/images/original');
const PROCESSED_DIR = path.join(__dirname, '../frontend/public/images/processed');
```

## Troubleshooting

### "Module not found: @imgly/background-removal-node"

Run: `npm install` in project root

### "Permission denied" when downloading

- Check Google Drive file permissions (should be "Anyone with link can view")
- For private files, use Google Drive API with authentication

### Images not showing in frontend

1. Check paths in CSV match actual file locations
2. Verify files exist in `frontend/public/images/processed/`
3. Check browser console for 404 errors
4. Ensure Neo4j was re-imported with updated CSV

### Background removal quality issues

- Try different model sizes in script settings
- Some complex backgrounds may need manual editing
- Original images are kept as fallback in `/original/` folder

## Git Strategy

### Ignored (not committed)
- `frontend/public/images/original/` - Large original files
- `node_modules/` - Dependencies

### Committed
- `frontend/public/images/processed/` - Processed PNGs (smaller with transparency)
- `scripts/process-images.js` - Processing script
- Updated CSV files - With local paths

## Future Enhancements

- [ ] Parallel processing for faster batch jobs
- [ ] Progress bar during processing
- [ ] Image optimization (compression, resizing)
- [ ] Web UI for manual review/approval
- [ ] Support for multiple image versions (thumb, medium, full)
- [ ] Cloudinary API fallback for difficult images

## References

- Background removal library: [@imgly/background-removal-node](https://github.com/imgly/background-removal-js)
- Avatar component: `frontend/src/components/ui/Avatar.tsx`
- CSV import script: `scripts/csv_import.sh`
