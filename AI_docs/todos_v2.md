# Family Tree - Future Features (v2)

This document details planned features for future development phases.

---

## 1. Keyboard Shortcuts Help Modal

**Trigger**: Press `?` key anywhere in the app

**Purpose**: Display all available keyboard shortcuts in a clean, organized modal.

### Design Specification

```
┌──────────────────────────────────────────────────────┐
│                 Keyboard Shortcuts              [×]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Navigation                                          │
│  ─────────────────────────────────────────────────   │
│  ↑ ↓ ← →      Navigate between family members       │
│  Enter        Select focused person                  │
│  Escape       Close sidebar / Deselect               │
│                                                      │
│  Search & Commands                                   │
│  ─────────────────────────────────────────────────   │
│  /  or  ⌘K    Open search                           │
│  ⌘⇧P          Open developer query modal            │
│  ?            Show this help                         │
│                                                      │
│  Canvas Controls                                     │
│  ─────────────────────────────────────────────────   │
│  +  or  =     Zoom in                               │
│  -            Zoom out                               │
│  0            Reset view / Fit to screen            │
│  R            Reset layout                           │
│                                                      │
│  Theme                                               │
│  ─────────────────────────────────────────────────   │
│  T            Toggle dark/light theme               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Implementation Notes

- **Component**: `components/modals/KeyboardShortcutsModal.tsx`
- **State**: Add `shortcutsModalOpen` to Zustand store
- **Styling**: Glass-morphism similar to QueryModal
- **Accessibility**: Close on Escape, trap focus within modal
- **Grouping**: Organize shortcuts by category (Navigation, Search, Canvas, Theme)

### Tasks

- [ ] Create KeyboardShortcutsModal component
- [ ] Add `?` key listener in useKeyboardShortcuts hook
- [ ] Add state management for modal visibility
- [ ] Style consistently with existing modals
- [ ] Add optional hint in header (small `?` icon)

---

## 2. Export Family Tree as Image/PDF

**Purpose**: Allow users to download the family tree visualization for printing or sharing offline.

### Export Options

| Format | Use Case |
|--------|----------|
| PNG | High-quality image for digital sharing |
| SVG | Vector format, scalable for any size |
| PDF | Print-ready document with metadata |

### Design Specification

**Export Button Location**: Canvas controls (bottom-right), next to zoom controls

```
┌─────────────────────────────────────────────────────┐
│                                    [↓] [+] [-] [⟲]  │
│                                     ↑               │
│                              Export button          │
└─────────────────────────────────────────────────────┘
```

**Export Modal**:
```
┌────────────────────────────────────────┐
│         Export Family Tree             │
├────────────────────────────────────────┤
│                                        │
│  Format:  ○ PNG  ○ SVG  ○ PDF         │
│                                        │
│  Options:                              │
│  ☑ Include all visible nodes          │
│  ☑ Include title header               │
│  ☐ High resolution (2x)               │
│                                        │
│  Preview:                              │
│  ┌────────────────────────────────┐   │
│  │     [Preview thumbnail]        │   │
│  └────────────────────────────────┘   │
│                                        │
│        [Cancel]    [Download]          │
└────────────────────────────────────────┘
```

### Implementation Notes

- **Library**: `html-to-image` or `dom-to-image-more` for PNG/SVG
- **PDF**: `jsPDF` with the captured image
- **React Flow**: Use `getViewportForBounds()` to capture all nodes
- **File naming**: `family-tree-{date}.{format}`

### Tasks

- [ ] Add export button to CanvasControls
- [ ] Create ExportModal component
- [ ] Implement PNG export using html-to-image
- [ ] Implement SVG export
- [ ] Implement PDF export with jsPDF
- [ ] Add loading state during export
- [ ] Handle large trees (may need tiling for very large exports)

---

## 3. Share Family Tree Link

**Purpose**: Generate shareable links that open the tree centered on a specific person with specific viewport settings.

### URL Structure

```
https://familytree.example.com/share?
  person=alex-001
  &zoom=0.8
  &x=100
  &y=-200
  &highlight=true
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `person` | Person ID to center on | `me-001` |
| `zoom` | Zoom level (0.1 - 2.0) | `1.0` |
| `x` | Viewport X offset | `0` |
| `y` | Viewport Y offset | `0` |
| `highlight` | Highlight the shared person | `true` |
| `sidebar` | Open sidebar automatically | `true` |

### Share Modal

```
┌────────────────────────────────────────┐
│           Share This View              │
├────────────────────────────────────────┤
│                                        │
│  ☑ Center on: Alex Smith              │
│  ☑ Include current zoom level         │
│  ☑ Open sidebar automatically         │
│                                        │
│  Link:                                 │
│  ┌────────────────────────────────┐   │
│  │ https://familytree.ex.../share │   │
│  └────────────────────────────────┘   │
│                                        │
│     [Copy Link]    [Share...]         │
└────────────────────────────────────────┘
```

### Implementation Notes

- **Share Button**: Add to header or sidebar when person is selected
- **Copy to Clipboard**: Use `navigator.clipboard.writeText()`
- **Native Share**: Use Web Share API on supported devices
- **URL Parsing**: Parse share params on page load and apply viewport

### Tasks

- [ ] Add share button to PersonDetail sidebar
- [ ] Create ShareModal component
- [ ] Implement URL generation with viewport params
- [ ] Parse share URL params on page load
- [ ] Apply shared viewport settings
- [ ] Add copy-to-clipboard functionality
- [ ] Integrate Web Share API for mobile

---

## 4. Zoom to Fit Selected Person's Immediate Family

**Purpose**: One-click action to zoom the canvas to show the selected person and their immediate family (parents, spouse, children, siblings) in view.

### Trigger Options

1. **Button in sidebar**: "View Family" button in PersonDetail
2. **Keyboard shortcut**: `F` key when person is selected
3. **Double-click**: Double-click on a person node

### Behavior

1. Calculate bounding box of:
   - Selected person
   - Their parents (if any)
   - Their spouse (if any)
   - Their children (if any)
   - Their siblings (if any)
2. Add padding (50px on each side)
3. Animate viewport to fit this bounding box
4. Highlight all included nodes briefly

### Visual Feedback

```
Before:                          After:
┌─────────────────┐              ┌─────────────────┐
│        ·        │              │ ┌─────────────┐ │
│     ·     ·     │   ──────►    │ │ Parents     │ │
│  ·    [X]    ·  │              │ │ [X] Spouse  │ │
│     ·     ·     │              │ │ Children    │ │
│        ·        │              │ └─────────────┘ │
└─────────────────┘              └─────────────────┘
   Zoomed out                      Zoomed to family
```

### Implementation Notes

- **React Flow API**: Use `fitBounds()` with custom bounds
- **Animation**: Use `duration` option for smooth transition
- **Node IDs**: Collect IDs of all family members from store/API

### Tasks

- [ ] Add "View Family" button to PersonDetail sidebar
- [ ] Calculate bounding box for immediate family nodes
- [ ] Implement fitBounds animation
- [ ] Add `F` keyboard shortcut
- [ ] Optional: Add brief highlight animation to included nodes

---

## 5. Timeline View

**Purpose**: A chronological view of family events (births, deaths, marriages) displayed as a horizontal or vertical timeline.

### Design Specification

**Timeline Toggle**: Button in header or canvas controls to switch between Graph and Timeline views

```
View Mode: [Graph] [Timeline]
```

**Timeline Layout (Horizontal)**:
```
1920      1940      1960      1980      2000      2020
  │         │         │         │         │         │
  ├─────────┼─────────┼─────────┼─────────┼─────────┤
  │         │         │         │         │         │
  ●         │         ●         │         ●         │
  │         │         │         │         │         │
William   Robert    James     Alex      Oliver
born      born      born      born      born
1922      1945      1960      1985      2015
```

**Timeline Layout (Vertical)**:
```
┌──────────────────────────────────────────────────┐
│ 2024  ─────────────────────────────────────────  │
│       │                                          │
│ 2020  ● Emma Smith born (Mar 15)                │
│       │                                          │
│ 2015  ● Oliver Smith born (Jul 22)              │
│       │                                          │
│ 2012  ♥ Alex & Sarah married (Jun 15)           │
│       │                                          │
│ 1985  ● Alex Smith born (Sep 25)                │
│       │                                          │
│ ...                                              │
└──────────────────────────────────────────────────┘
```

### Event Types & Icons

| Event | Icon | Color |
|-------|------|-------|
| Birth | ● | Green |
| Death | † | Gray |
| Marriage | ♥ | Pink/Red |
| Divorce | ÷ | Orange |

### Features

- **Zoom**: Zoom in/out to change time scale (decades → years → months)
- **Filter**: Filter by event type or person
- **Click**: Click event to navigate to person in graph view
- **Current Date**: Highlight line at current date

### Implementation Notes

- **Library Options**: D3.js timeline, vis-timeline, or custom SVG
- **Data Source**: Derive events from persons (birth_date, death_date) and relationships (marriage start_date)
- **State**: Add `viewMode: 'graph' | 'timeline'` to store

### Tasks

- [ ] Design timeline data structure (Event type)
- [ ] Extract events from persons and relationships
- [ ] Create TimelineView component
- [ ] Implement horizontal scrolling timeline
- [ ] Add zoom controls for time scale
- [ ] Add event type filters
- [ ] Connect event clicks to person navigation
- [ ] Add view mode toggle to header

---

## 6. Statistics Dashboard

**Purpose**: Display interesting statistics and insights about the family tree.

### Dashboard Location

- **Option A**: Dedicated page (`/stats`)
- **Option B**: Modal triggered from header
- **Option C**: Collapsible panel in sidebar

### Statistics to Display

**Overview**:
```
┌─────────────────────────────────────────────────────┐
│              Family Tree Statistics                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Total Members          │  Generations             │
│  ┌─────────┐            │  ┌─────────┐             │
│  │   156   │            │  │    5    │             │
│  └─────────┘            │  └─────────┘             │
│                                                     │
│  Living          Deceased         Couples          │
│  ┌─────┐         ┌─────┐          ┌─────┐          │
│  │ 89  │         │ 67  │          │ 42  │          │
│  └─────┘         └─────┘          └─────┘          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Gender Distribution    │  Age Distribution        │
│  ┌─────────────────┐    │  ┌─────────────────┐     │
│  │ ████████ 52% M  │    │  │ 0-20:  ████ 15  │     │
│  │ ████████ 48% F  │    │  │ 21-40: ██████ 28│     │
│  └─────────────────┘    │  │ 41-60: ████████ 35│   │
│                         │  │ 61-80: ███ 11    │     │
│                         │  └─────────────────┘     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Interesting Facts                                  │
│  ─────────────────────────────────────────────────  │
│  • Oldest living: William Smith (92 years)         │
│  • Youngest: Emma Smith (4 years)                  │
│  • Longest marriage: Robert & Mary (58 years)      │
│  • Most children: James & Susan (4 children)       │
│  • Most common profession: Engineer (12)           │
│  • Most common location: San Francisco (23)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Statistics Categories

1. **Counts**: Total members, living, deceased, couples
2. **Generations**: Number of generations, members per generation
3. **Demographics**: Gender distribution, age distribution
4. **Geography**: Location distribution (map or list)
5. **Records**: Oldest, youngest, longest marriage, most children
6. **Professions**: Most common jobs/professions
7. **Names**: Most common first names, surnames

### Implementation Notes

- **Data Processing**: Calculate stats from `/api/persons` response
- **Visualization**: Simple bar charts, pie charts (consider recharts or visx)
- **Caching**: Cache computed stats to avoid recalculation
- **Backend Option**: Add `/api/stats` endpoint for server-side calculation

### Tasks

- [ ] Design statistics data structure
- [ ] Create StatsModal or StatsPage component
- [ ] Implement count calculations
- [ ] Add simple visualizations (bar charts)
- [ ] Calculate "interesting facts" dynamically
- [ ] Add trigger button in header
- [ ] Optional: Add `/api/stats` backend endpoint

---

## 7. Upcoming Events View (NEW)

**Purpose**: Display upcoming family events like birthdays, wedding anniversaries, and death anniversaries to help users remember and celebrate important dates.

### Event Types

| Event Type | Icon | Calculation | Notification Period |
|------------|------|-------------|---------------------|
| Birthday | 🎂 | `birth_date` (month/day) | 7 days before |
| Wedding Anniversary | 💍 | `marriage_date` (month/day) | 7 days before |
| Death Anniversary | 🕯️ | `death_date` (month/day) | 3 days before |

### Design Specification

**Access Points**:
1. **Header Icon**: Bell/calendar icon with badge showing count of upcoming events
2. **Dedicated Panel**: Slide-out panel or modal
3. **Dashboard Widget**: Section in stats dashboard

**Events Panel**:
```
┌────────────────────────────────────────────────────┐
│  📅 Upcoming Events                           [×]  │
├────────────────────────────────────────────────────┤
│                                                    │
│  This Week                                         │
│  ──────────────────────────────────────────────    │
│                                                    │
│  🎂 Tomorrow, Dec 8                               │
│     Sarah Smith's Birthday                         │
│     Turning 38 years old                          │
│     [View Profile]                                 │
│                                                    │
│  💍 Dec 10 (3 days)                               │
│     Alex & Sarah's Wedding Anniversary            │
│     13 years together                             │
│     [View Couple]                                  │
│                                                    │
│  ──────────────────────────────────────────────    │
│  Next Week                                         │
│  ──────────────────────────────────────────────    │
│                                                    │
│  🎂 Dec 15                                        │
│     Oliver Smith's Birthday                        │
│     Turning 10 years old                          │
│     [View Profile]                                 │
│                                                    │
│  🕯️ Dec 18                                        │
│     William Smith's Death Anniversary             │
│     Passed 3 years ago                            │
│     [View Profile]                                 │
│                                                    │
│  ──────────────────────────────────────────────    │
│  This Month                                        │
│  ──────────────────────────────────────────────    │
│                                                    │
│  🎂 Dec 25                                        │
│     Robert Smith's Birthday                        │
│     Turning 79 years old                          │
│     [View Profile]                                 │
│                                                    │
│  ──────────────────────────────────────────────    │
│                                                    │
│  [View Full Calendar]                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Header Badge**:
```
┌────────────────────────────────────────────────────────────┐
│  Family Tree                        [🔍] [📅³] [🔮]       │
│                                           ↑                │
│                                    Badge showing 3         │
│                                    upcoming events         │
└────────────────────────────────────────────────────────────┘
```

### Event Data Structure

```typescript
interface UpcomingEvent {
  id: string;
  type: 'birthday' | 'wedding_anniversary' | 'death_anniversary';
  date: Date;                    // Next occurrence
  originalDate: string;          // Original date (YYYY-MM-DD)
  personId: string;              // Primary person
  personName: string;
  secondPersonId?: string;       // For anniversaries (spouse)
  secondPersonName?: string;
  yearsCount: number;            // Age or years since event
  daysUntil: number;             // Days until event
}
```

### Grouping Logic

Events are grouped by proximity:
- **Today**: Events happening today (highlighted)
- **Tomorrow**: Events happening tomorrow
- **This Week**: Events in the next 7 days
- **Next Week**: Events 8-14 days away
- **This Month**: Events 15-30 days away
- **Next Month**: Events 31-60 days away (optional, collapsed by default)

### Implementation Notes

**Frontend Calculations**:
```typescript
function getUpcomingEvents(persons: Person[], marriages: Marriage[]): UpcomingEvent[] {
  const today = new Date();
  const events: UpcomingEvent[] = [];
  
  // Birthdays
  for (const person of persons) {
    if (person.birth_date) {
      const nextBirthday = getNextOccurrence(person.birth_date, today);
      const age = calculateAge(person.birth_date, nextBirthday);
      events.push({
        type: 'birthday',
        date: nextBirthday,
        personId: person.id,
        personName: person.name,
        yearsCount: age,
        daysUntil: daysBetween(today, nextBirthday),
      });
    }
  }
  
  // Death anniversaries
  for (const person of persons) {
    if (person.death_date) {
      const nextAnniversary = getNextOccurrence(person.death_date, today);
      const yearsSince = calculateYearsSince(person.death_date);
      events.push({
        type: 'death_anniversary',
        date: nextAnniversary,
        personId: person.id,
        personName: person.name,
        yearsCount: yearsSince,
        daysUntil: daysBetween(today, nextAnniversary),
      });
    }
  }
  
  // Wedding anniversaries
  for (const marriage of marriages) {
    if (marriage.start_date) {
      const nextAnniversary = getNextOccurrence(marriage.start_date, today);
      const yearsTogether = calculateYearsSince(marriage.start_date);
      events.push({
        type: 'wedding_anniversary',
        date: nextAnniversary,
        personId: marriage.person1Id,
        personName: marriage.person1Name,
        secondPersonId: marriage.person2Id,
        secondPersonName: marriage.person2Name,
        yearsCount: yearsTogether,
        daysUntil: daysBetween(today, nextAnniversary),
      });
    }
  }
  
  // Sort by days until
  return events.sort((a, b) => a.daysUntil - b.daysUntil);
}

function getNextOccurrence(dateStr: string, today: Date): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const thisYear = new Date(today.getFullYear(), month - 1, day);
  
  if (thisYear >= today) {
    return thisYear;
  }
  return new Date(today.getFullYear() + 1, month - 1, day);
}
```

**Backend Enhancement** (Optional):
Add `/api/events/upcoming` endpoint:
```json
GET /api/events/upcoming?days=30

Response:
{
  "events": [
    {
      "type": "birthday",
      "date": "2024-12-08",
      "person_id": "sarah-001",
      "person_name": "Sarah Smith",
      "years_count": 38,
      "days_until": 1
    }
  ],
  "count": 5
}
```

### Features

1. **Badge Counter**: Show number of events in next 7 days
2. **Click Navigation**: Click event to navigate to person/couple
3. **Filtering**: Filter by event type (show only birthdays, etc.)
4. **Calendar Integration**: Optional "Add to Calendar" button (generates .ics file)
5. **Notifications**: Future - browser notifications for upcoming events

### Calendar Export (.ics)

```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20241208
SUMMARY:Sarah Smith's Birthday (38th)
DESCRIPTION:Sarah Smith is turning 38 years old
END:VEVENT
END:VCALENDAR
```

### Tasks

- [ ] Create UpcomingEvent type definition
- [ ] Implement event calculation logic (getUpcomingEvents)
- [ ] Create EventsPanel component
- [ ] Add calendar icon with badge to header
- [ ] Implement event grouping (Today, This Week, etc.)
- [ ] Add click-to-navigate functionality
- [ ] Add event type filtering
- [ ] Optional: Implement .ics calendar export
- [ ] Optional: Add `/api/events/upcoming` backend endpoint
- [ ] Optional: Add browser notification support

---

## Implementation Priority

| Priority | Feature | Complexity | User Value |
|----------|---------|------------|------------|
| 1 | Keyboard Shortcuts Help | Low | Medium |
| 2 | Upcoming Events View | Medium | High |
| 3 | Zoom to Fit Family | Low | Medium |
| 4 | Export as Image/PDF | Medium | High |
| 5 | Share Link | Medium | Medium |
| 6 | Statistics Dashboard | Medium | Medium |
| 7 | Timeline View | High | Medium |

---

## Technical Considerations

### State Management Additions

```typescript
// Add to useAppStore.ts
interface AppState {
  // ... existing state
  
  // New modal states
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;
  
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  
  shareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  
  eventsModalOpen: boolean;
  setEventsModalOpen: (open: boolean) => void;
  
  statsModalOpen: boolean;
  setStatsModalOpen: (open: boolean) => void;
  
  // View mode
  viewMode: 'graph' | 'timeline';
  setViewMode: (mode: 'graph' | 'timeline') => void;
  
  // Upcoming events cache
  upcomingEvents: UpcomingEvent[];
  setUpcomingEvents: (events: UpcomingEvent[]) => void;
}
```

### New Dependencies (if needed)

```json
{
  "html-to-image": "^1.11.0",    // For export feature
  "jspdf": "^2.5.0",             // For PDF export
  "recharts": "^2.10.0",         // For statistics charts
  "date-fns": "^3.0.0"           // For date calculations (events)
}
```

### File Structure Additions

```
src/
├── components/
│   ├── modals/
│   │   ├── KeyboardShortcutsModal.tsx   # NEW
│   │   ├── ExportModal.tsx              # NEW
│   │   ├── ShareModal.tsx               # NEW
│   │   ├── StatsModal.tsx               # NEW
│   │   └── EventsPanel.tsx              # NEW
│   └── views/
│       └── TimelineView.tsx             # NEW
├── lib/
│   ├── events.ts                        # NEW - Event calculations
│   ├── export.ts                        # NEW - Export utilities
│   └── stats.ts                         # NEW - Statistics calculations
└── types/
    └── index.ts                         # Add new types
```

---

## Notes

- All features should maintain the existing design language (glass-morphism, clean typography)
- Dark mode support required for all new components
- Mobile responsiveness should be considered for all features
- Keyboard accessibility (focus management, ARIA labels) required
- All new modals should close on Escape key press
