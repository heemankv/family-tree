# Deployment Notes - Image Processing

## Current Setup (December 13, 2025)

### Processed Images Status
✅ **Example: 4 people have processed images with background removal:**

1. **person-id-1** → `/images/processed/person-id-1.png`
2. **person-id-2** → `/images/processed/person-id-2.png`
3. **person-id-3** → `/images/processed/person-id-3.png`
4. **person-id-4** → `/images/processed/person-id-4.png`

### Database
- **Total persons**: 42
- **Total relationships**: 107
- **Import status**: Complete

### Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Neo4j Browser: http://localhost:7474

### Image Display
- Processed images show with transparent backgrounds and gradient backgrounds (blue-purple gradient)
- All other 38 people show default avatars (gender-based)

## Important: Rebuilding Frontend

**When you add new processed images**, you must rebuild the frontend container:

```bash
# After processing new images with npm run process-images
docker compose up -d --build frontend
```

This ensures the new images are included in the Docker container.

## Workflow Recap

1. **Process images**:
   ```bash
   npm run process-images
   ```

2. **Update CSV** with new image paths (automatic in script)

3. **Re-import to Neo4j**:
   ```bash
   ./scripts/csv_import.sh real_data/my_family_persons.csv real_data/my_family_relationships.csv
   ```

4. **Rebuild frontend** (to include new images):
   ```bash
   docker compose up -d --build frontend
   ```

## Files Modified
- `real_data/my_family_persons.csv` - 4 entries updated with `/images/processed/*.png` paths
- `frontend/public/images/processed/` - Contains 4 processed PNG files
- `frontend/src/components/ui/Avatar.tsx` - Enhanced to display processed images with gradient backgrounds

## Next Steps
To process remaining family photos:
1. Ensure Google Drive files are publicly accessible
2. Run `npm run process-images` to download and process all images
3. Review processed images
4. Update CSV and re-import
5. Rebuild frontend container
