# Build-Time Image Preprocessing for Family Tree

## Overview
Plan to add automated background removal for family member photos during the build process. This will isolate people from photo backgrounds (mountains, rooms, etc.) for a cleaner, more consistent family tree visualization.

## Current State

### Architecture
- **Stack:** Next.js 14 + Go + Neo4j graph database
- **Images:** Stored in `/frontend/public/images/`
- **Data Flow:** CSV → Neo4j → Go API → React Frontend
- **Display:** Avatar component with `photo_url` field from Person model

### Current Image Handling
- Default avatars: `default-avatar-male.png`, `default-avatar-female.png`
- Mixed image sources in CSV (Google Drive links, local filenames)
- Avatar component has fallback logic to default avatars
- Path resolution: `/images/{filename}` for relative paths

## Proposed Solution

### High-Level Architecture

```
Pre-Build Phase:
┌─────────────────────────────────────────────────────────┐
│ 1. Download photos from Google Drive                   │
│    → /frontend/public/images/original/                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Run: npm run process-images                         │
│    - Use @imgly/background-removal                     │
│    - Process all images in /original/                  │
│    - Output to /frontend/public/images/processed/      │
│    - Generate image-manifest.json mapping              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Run: npm run build                                  │
│    - Next.js bundles processed images                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Runtime: Avatar component loads /images/processed/  │
└─────────────────────────────────────────────────────────┘
```

### Components to Create/Modify

#### New Files
1. **`scripts/process-images.js`**
   - Node.js script using `@imgly/background-removal`
   - Reads from `/frontend/public/images/original/`
   - Outputs to `/frontend/public/images/processed/`
   - Creates `image-manifest.json` with mapping
   - Error handling and progress logging

2. **`frontend/public/images/original/`**
   - Source images folder (git-ignored)
   - Downloaded from Google Drive

3. **`frontend/public/images/processed/`**
   - Processed images with backgrounds removed
   - PNG format with transparency
   - Committed to git

4. **`frontend/public/images/image-manifest.json`**
   - Maps original filenames to processed versions
   - Example: `{ "john-doe.jpg": "john-doe-processed.png" }`

#### Modified Files
1. **`frontend/package.json`**
   - Add `"process-images"` script
   - Add `@imgly/background-removal` dependency
   - Update build pipeline: `"prebuild": "npm run process-images"`

2. **`frontend/src/components/ui/Avatar.tsx`**
   - Update to use processed images
   - Load manifest for filename mapping
   - Keep fallback to defaults if processing failed

3. **`.gitignore`**
   - Add `/frontend/public/images/original/` (large files)
   - Keep processed images in git (smaller PNGs)

4. **`docker-compose.yml` / `docker-compose.prod.yml`**
   - Add image processing step to Docker build
   - Or document as pre-deployment manual step

### Technology Choice

**Background Removal Library:** `@imgly/background-removal`
- Runs in Node.js with WASM
- No API costs
- ~5-20MB model download
- Good quality for person detection

**Alternative Considered:** Cloudinary API
- Rejected due to rate limits and cost at scale
- Could revisit if quality is insufficient

## Implementation Steps

1. Create `scripts/process-images.js` script
2. Add npm dependencies and scripts
3. Create folder structure
4. Update Avatar component
5. Test with sample images
6. Update .gitignore
7. Document in README
8. Integrate into Docker build (optional)

## Key Decisions Needed

### Before Implementation
1. **Image Source Strategy**
   - [ ] Download all images from Google Drive manually?
   - [ ] Script to fetch from Drive API?
   - [ ] Store originals locally first?

2. **Processing Timing**
   - [ ] Manual pre-build step?
   - [ ] Automated in Docker build?
   - [ ] Part of CI/CD pipeline?

3. **Fallback Strategy**
   - [ ] Use original if processing fails?
   - [ ] Use default avatar?
   - [ ] Show error indicator?

4. **Git Strategy**
   - [ ] Commit processed images?
   - [ ] Ignore originals?
   - [ ] Store both?

5. **Performance Considerations**
   - [ ] Process all images every build?
   - [ ] Only process new/changed images (caching)?
   - [ ] Process once, commit results?

## Benefits

- **Consistent Look:** All photos have uniform backgrounds (transparent)
- **Professional Appearance:** Cleaner UI without distracting backgrounds
- **No Runtime Cost:** Processing happens at build time, not in user's browser
- **No API Costs:** Self-hosted solution using open-source library
- **Caching:** Processed images served as static assets (fast CDN delivery)

## Potential Issues & Solutions

### Issue: Model size (~20MB download during build)
**Solution:** Acceptable for build-time use; not downloaded by users

### Issue: Processing time (2-5 seconds per image)
**Solution:** Build-time processing acceptable; could parallelize for speed

### Issue: Quality may vary with complex backgrounds
**Solution:** Manual review after processing; can keep originals as fallback

### Issue: Transparent backgrounds may look odd in some contexts
**Solution:** Add colored background circle in Avatar component CSS

## Future Enhancements

- [ ] Compare multiple background removal libraries for quality
- [ ] Add image optimization (compression, resizing)
- [ ] Support multiple image versions (original, processed, thumbnail)
- [ ] Admin UI to review/approve processed images
- [ ] Fallback to Cloudinary API for difficult images

## References

- `@imgly/background-removal` docs: https://github.com/imgly/background-removal-js
- Current Avatar implementation: `/frontend/src/components/ui/Avatar.tsx`
- Person model: `/backend/internal/models/person.go`
- Data import: `/scripts/csv_import.sh`

---

**Status:** ✅ IMPLEMENTED
**Created:** 2025-12-13
**Implemented:** 2025-12-13
**Documentation:** See [IMAGE_PROCESSING.md](../IMAGE_PROCESSING.md) and [QUICKSTART_IMAGE_PROCESSING.md](../QUICKSTART_IMAGE_PROCESSING.md)

## Implementation Summary

All core features implemented:
- ✅ `scripts/process-images.js` - Downloads from Google Drive + background removal
- ✅ Directory structure created (`original/` and `processed/`)
- ✅ CSV update workflow (generates `*_updated.csv` with local paths)
- ✅ Avatar component updated with gradient backgrounds for processed images
- ✅ `.gitignore` configured (originals ignored, processed committed)
- ✅ Dependencies installed (`@imgly/background-removal-node`)
- ✅ Complete documentation

**Usage:** `npm run process-images`
