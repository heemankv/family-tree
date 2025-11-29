# Family Tree - Todo List

## Completed

- [x] Highlight "me" (the person creating this website) always with a marker
  - Added amber-colored star badge to PersonNode and CoupleNode
  - Card has subtle amber border and background tint

- [x] If I select a person, highlight the lines that connect them to their parents and children
  - Edges to parents and children of selected person are highlighted
  - Uses `highlighted-edge` CSS class with thicker stroke
  - Only highlights blood relations, not in-laws

- [x] The photo to detail ratio in the small card is not proper, make the image smaller
  - Reduced avatar sizes: sm from w-8 to w-6, md from w-12 to w-9
  - Text remains the same size for better readability

- [x] The app routing is still available if I don't select a person, remove the routing in that case
  - Clicking empty canvas deselects person
  - Deselecting navigates back to "/" (home)
  - Selection changes update URL properly

- [x] Create a dark theme, it should be subtle nothing fancy
  - Added theme toggle button in header (sun/moon icons)
  - Uses CSS variables for all colors
  - Dark theme uses subtle grays (#1A1A1A, #242424, #2A2A2A)
  - Persists preference to localStorage
  - Respects system preference on first visit

- [x] Fix couple card highlighting - show which person is selected
  - Added hover effect (move up + shadow) on couple card
  - Selected person inside couple gets darkened background

- [x] Fix edge highlighting for couples - only blood relations
  - In-laws' edges no longer highlighted
  - Only parent-to-selected and selected-to-children edges highlight

---

## Critical - Fix First

### 1. Date Parsing Bug in `calculateAge()`
**File:** `frontend/src/lib/utils.ts`
**Issue:** No validation for invalid date formats. `new Date(dateString)` may return Invalid Date, leading to `NaN` results.
**Fix:** Add date validation check before calculations.

### 2. Missing Error Handling in PersonDetail Family Loading
**File:** `frontend/src/components/person/PersonDetail.tsx`
**Issue:** Errors are caught but only logged. No user feedback when family data fails to load.
**Fix:** Add error state and display error message to user.

### 3. Add Error Boundary Component
**File:** `frontend/src/app/layout.tsx`
**Issue:** No error boundary to catch render errors, especially important for complex canvas rendering.
**Fix:** Create ErrorBoundary component and wrap app content.

---

## High Priority - Fix Soon

### 4. Deduplicate ME_PERSON_ID Constant
**Files:** PersonNode.tsx, CoupleNode.tsx, useTreeData.ts, FamilyTreeCanvas.tsx
**Issue:** Same constant `'me-001'` hardcoded in 4 different files.
**Fix:** Create `lib/constants.ts` and import everywhere.

### 5. localStorage Error Handling in Theme Toggle
**File:** `frontend/src/components/layout/Header.tsx`
**Issue:** No error handling if localStorage is unavailable (private browsing mode).
**Fix:** Wrap localStorage calls in try-catch.

### 6. Store Subscription Anti-pattern
**File:** `frontend/src/components/canvas/FamilyTreeCanvas.tsx`
**Issue:** Subscribing to entire store causes re-render on any store change.
**Fix:** Use individual selectors or create a single memoized selector.

### 7. API Client No Retry Logic
**File:** `frontend/src/lib/api.ts`
**Issue:** Network failures aren't retried. Transient errors common on mobile.
**Fix:** Add exponential backoff retry logic (3 attempts).

---

## Medium Priority - Fix Before Release

### 8. Remove Unused Viewport State
**File:** `frontend/src/store/useAppStore.ts`
**Issue:** `viewport` state and `setViewport` defined but never used.
**Fix:** Remove dead code or implement viewport persistence.

### 9. Remove Unused Selector Hooks
**File:** `frontend/src/store/useAppStore.ts`
**Issue:** `useSearchModalOpen` and potentially other selectors exported but never used.
**Fix:** Remove or use consistently.

### 10. Add React.memo to Leaf Components
**Files:** Badge.tsx, Button.tsx, Avatar.tsx
**Issue:** These components re-render whenever parent re-renders.
**Fix:** Wrap exports with `memo()`.

### 11. Missing ARIA Labels
**Files:** Header.tsx, BottomSheet.tsx, various buttons
**Issue:** Buttons have `title` but missing `aria-label` for screen readers.
**Fix:** Add `aria-label` attributes to interactive elements.

### 12. BottomSheet Missing Dialog Role
**File:** `frontend/src/components/layout/BottomSheet.tsx`
**Issue:** No `role="dialog"` or `aria-label` on the bottom sheet.
**Fix:** Add proper ARIA attributes.

### 13. Improve TypeScript Strictness
**File:** `frontend/src/types/index.ts`
**Issue:** Using `Record<string, unknown>` makes TypeScript loose in PersonNodeData/CoupleNodeData.
**Fix:** Remove the extends clause or make explicit.

### 14. Missing Return Types on Hooks
**File:** `frontend/src/hooks/useTreeData.ts`
**Issue:** Return type is inferred but not explicit.
**Fix:** Add explicit return type interface.

---

## Low Priority - Nice to Have

### 15. Create Centralized Theme Hook
**File:** Create `frontend/src/hooks/useTheme.ts`
**Issue:** Theme initialization logic duplicated in Header.
**Fix:** Create custom `useTheme()` hook that centralizes all theme logic.

### 16. Debounce Search Filtering
**File:** `frontend/src/components/modals/SearchModal.tsx`
**Issue:** Linear search on every keystroke. For large families, could be slow.
**Fix:** Add 300ms debounce on search query.

### 17. Add Skeleton Screens
**File:** `frontend/src/components/person/PersonDetail.tsx`
**Issue:** Loading spinner looks jarring. Content suddenly appears.
**Fix:** Add skeleton placeholder components for smoother UX.

### 18. Dynamic Import for Heavy Components
**File:** `frontend/src/app/page.tsx`
**Issue:** FamilyTreeCanvas is heavy but always bundled.
**Fix:** Use Next.js `dynamic()` with loading fallback.

### 19. Inline Object Creation in Render
**File:** `frontend/src/components/canvas/FamilyTreeCanvas.tsx`
**Issue:** `defaultViewport={{ x: 0, y: 0, zoom: 1 }}` creates new object on every render.
**Fix:** Move to module-level constant.

### 20. Improve Variable Naming in graph-layout.ts
**File:** `frontend/src/lib/graph-layout.ts`
**Issue:** Abbreviated variable names like `gen`, `min`, `max`.
**Fix:** Use more descriptive names: `generationLevel`, `minGenerationLevel`, etc.

### 21. Remove Commented Code
**File:** `frontend/src/hooks/useKeyboardShortcuts.ts`
**Issue:** Commented-out help shortcut feature.
**Fix:** Either implement or remove the comments.

### 22. Improve Search Empty State
**File:** `frontend/src/components/modals/SearchModal.tsx`
**Issue:** "No people found" message could be more helpful.
**Fix:** Add suggestions like "Try searching by name, profession, or location".

---

## Future Features

- [ ] Keyboard shortcuts help modal (triggered by `?`)
- [ ] Add person/edit person functionality
- [ ] Export family tree as image/PDF
- [ ] Share family tree link
- [ ] Zoom to fit selected person's immediate family
- [ ] Timeline view (chronological events)
- [ ] Statistics dashboard (total people, generations, etc.)
