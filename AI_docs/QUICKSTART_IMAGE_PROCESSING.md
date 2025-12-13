# Quick Start: Image Processing

## TL;DR - Run These Commands

```bash
# 1. Install dependencies (one-time setup)
npm install

# 2. Process images (downloads + background removal)
npm run process-images

# 3. Review results
open frontend/public/images/processed/

# 4. If satisfied, update the CSV
cp real_data/my_family_persons_updated.csv real_data/my_family_persons.csv

# 5. Re-import to database
./scripts/csv_import.sh real_data/my_family_persons.csv real_data/my_family_relationships.csv

# 6. Done! Restart frontend to see changes
cd frontend && npm run dev
```

## What Happens

1. **Download**: Photos downloaded from Google Drive URLs → `frontend/public/images/original/`
2. **Process**: AI removes backgrounds → `frontend/public/images/processed/` (transparent PNGs)
3. **Update CSV**: `photo_url` field updated to `/images/processed/{id}.png`
4. **Display**: Frontend shows processed images with nice gradient backgrounds

## Expected Output

```
=== Family Tree Image Preprocessing ===

[1/50] Processing: Heemank Verma (a1b2)
  Downloading...
  ✓ Downloaded: a1b2.jpg
  Processing...
  ✓ Saved: a1b2.png

[2/50] Processing: Mangesh Verma (c3d4)
  ⊙ Already downloaded
  ⊙ Already processed

=== Summary ===
Downloaded: 25 images
Processed: 25 images
Errors: 0
```

## Notes

- **First run**: Downloads ~20MB AI model (cached for future runs)
- **Processing time**: ~2-5 seconds per image
- **Re-running**: Script skips already processed images (incremental)
- **Failures**: Original URLs kept in CSV as fallback

## Full Documentation

See [IMAGE_PROCESSING.md](./IMAGE_PROCESSING.md) for detailed docs.
