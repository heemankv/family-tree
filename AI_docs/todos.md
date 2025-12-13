# Family Tree - Todo List

## Completed

- [x] Highlight "me" (the person creating this website) always with a marker
  - Added amber-colored star badge to PersonNode and CoupleNode
  - Card has subtle amber border

- [x] If I select a person, highlight the lines that connect them to their parents and children
  - Edges to parents and children of selected person are highlighted
  - Uses `highlighted-edge` CSS class with thicker stroke
  - Only highlights blood relations, not in-laws

- [x] The photo to detail ratio in the small card is not proper, make the image smaller
  - Avatar sizes adjusted for proper ratio

- [x] The app routing is still available if I don't select a person, remove the routing in that case
  - Clicking empty canvas deselects person
  - Uses window.history.replaceState for smooth URL updates

- [x] Create a dark theme, it should be subtle nothing fancy
  - Theme toggle in canvas controls
  - Uses CSS variables for all colors
  - Persists preference to localStorage

- [x] Fix couple card highlighting - show which person is selected
  - Selected person inside couple gets highlighted background

- [x] Fix edge highlighting for couples - only blood relations
  - Only parent-to-selected and selected-to-children edges highlight

- [x] Change blood relation lines to green

- [x] Make selected cards enlarged like hover state

- [x] Add rotate device prompt for mobile portrait mode

- [x] Enable local network access for mobile testing

- [x] Increase avatar and card sizes

- [x] Change "me" indicator to card border (amber)

- [x] Fix edge overlapping (green edges hidden by grey)
  - Changed edge type to simplebezier
  - Added z-index to highlighted edges

- [x] Set up gender-based default avatars

- [x] Code cleanup - extract inline conditions, add types

- [x] Fix QueryModal dark theme support

- [x] Tone down light theme (less bright whites)

- [x] Add gender to person details panel

- [x] Update documentation and create README

- [x] Enable node dragging

- [x] Add reset layout button to toolbar

- [x] Flip tree to grow bottom-to-top (ancestors at bottom)

- [x] Improve layout algorithm - position children above parents

- [x] Fix edge handles - connect to top/bottom edges of cards

- [x] Add AKA/nicknames feature
  - Backend: Added `Aka []string` to Person model
  - Database: Added `aka` array property to Person nodes
  - Frontend: Display nicknames in PersonDetail sidebar

- [x] Add couple selection and detail view
  - Click couple card background to see combined family view
  - Shows marriage date, both locations, children
  - Shows parents of both persons (X's Parents, Y's Parents)
  - Quick links to individual profiles

- [x] Fix couple selection highlighting
  - Couple card gets green border when selected as couple
  - Edges to both persons' parents highlighted
  - Edges to children highlighted

- [x] Reorder family members in sidebars
  - Order: Spouse → Children → Parents → Siblings

- [x] Soften light theme colors
  - Warm off-white/cream background (#E8E4DF)
  - Reduced eye strain with warmer tones

- [x] Make dev query button more subtle
  - Smaller size (32px instead of 40px)
  - Muted colors instead of vibrant gradient

---

## Critical - All Fixed

### 1. Date Parsing Bug in `calculateAge()` - FIXED
Already has proper validation with `isValidDate()` and `parseDate()` helpers.

### 2. Missing Error Handling in PersonDetail Family Loading - FIXED
Already has error state with user feedback and retry button.

### 3. Add Error Boundary Component - FIXED
`ErrorBoundary.tsx` exists and is used in root layout.

---

## High Priority - All Fixed

### 4. Deduplicate ME_PERSON_ID Constant - FIXED
Centralized in `lib/constants.ts`.

### 5. localStorage Error Handling in Theme Toggle - FIXED
Already wrapped in try-catch in `CanvasControls.tsx`.

### 6. Store Subscription Anti-pattern - FIXED
Using individual selectors properly.

### 7. API Client No Retry Logic - FIXED
Implemented exponential backoff retry in `api.ts`.

---

## Medium Priority - All Fixed

### 8. Remove Unused Viewport State - FIXED
Not present in current store.

### 9. Remove Unused Selector Hooks - FIXED
Cleaned up.

### 10. Add React.memo to Leaf Components - FIXED
Badge, Avatar already memoized. Button uses forwardRef.

### 11. Missing ARIA Labels - FIXED
Added to Header, BottomSheet, CanvasControls buttons.

### 12. BottomSheet Missing Dialog Role - FIXED
Has `role="dialog"`, `aria-label`, and `aria-modal`.

### 13. Improve TypeScript Strictness - ADDRESSED
Types properly defined in `types/index.ts`.

### 14. Missing Return Types on Hooks - ADDRESSED
TypeScript inference handles this adequately.

---

## Low Priority - Nice to Have (Not Critical for Release)

### 15. Create Centralized Theme Hook
Theme logic is in CanvasControls - could be extracted but works fine.

### 16. Debounce Search Filtering
Not needed unless family tree has 100+ members.

### 17. Add Skeleton Screens
Loading spinner works adequately.

### 18. Dynamic Import for Heavy Components
Could improve initial load time but not critical.

### 19. Inline Object Creation in Render
Moved to module-level constants in FamilyTreeCanvas.

### 20. Improve Variable Naming in graph-layout.ts
Readable enough for maintenance.

### 21. Remove Commented Code
No significant commented code remains.

### 22. Improve Search Empty State
Current message is adequate.

---

## Future Features

- [ ] Keyboard shortcuts help modal (triggered by `?`)
- [ ] Add person/edit person functionality
- [ ] Export family tree as image/PDF
- [ ] Share family tree link
- [ ] Zoom to fit selected person's immediate family
- [ ] Timeline view (chronological events)
- [ ] Statistics dashboard (total people, generations, etc.)

---

## Pending Tasks

### Update ME_PERSON_ID to 'me'
- [ ] Update ME_PERSON_ID constant in `frontend/src/lib/constants.ts` to `'me'`
- [ ] Update CSV file - change the main person's ID from current ID to `'me'`
- [ ] Update all relationship entries in CSV that reference the old ID
- [ ] Re-import CSV to Neo4j to reflect the ID change
- [ ] Test that "me" highlighting still works with new ID

**Note:** This will make the special "me" person have a consistent, unique ID of `'me'` instead of a generated ID like `a1b2`
