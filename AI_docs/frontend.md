# Frontend Design & Architecture Specification

## 1. Overview

The frontend is a Next.js 14 application using the App Router, React 18, TypeScript, and Tailwind CSS. It provides an interactive family tree visualization with a Google Maps-like experience.

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Graph Visualization**: React Flow
- **Icons**: Lucide React
- **Animations**: Framer Motion (optional) / CSS transitions

---

## 2. Design Philosophy

### Aesthetic: "Clean & Architectural"
- **Background**: Off-white (`#F5F5F5`) - mimics paper/drafting table
- **Typography**: Inter or Geist Sans - clean, highly legible
- **Inspiration**: Google Maps (interaction), macOS (glass-morphism modals)

### Responsive Behavior
| Screen Size | Sidebar Behavior |
|-------------|------------------|
| Desktop (>1024px) | Left panel, 30% width, slides in |
| Tablet (768-1024px) | Left panel, 40% width |
| Mobile (<768px) | **Bottom sheet** like Google Maps |

---

## 3. Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, providers)
│   │   ├── page.tsx                  # Main page (redirects or default view)
│   │   ├── globals.css               # Tailwind + custom styles
│   │   └── person/
│   │       └── [id]/
│   │           └── page.tsx          # Person-specific route
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Sticky header with Siri button
│   │   │   ├── Sidebar.tsx           # Desktop: left panel
│   │   │   └── BottomSheet.tsx       # Mobile: bottom panel
│   │   ├── canvas/
│   │   │   ├── FamilyTreeCanvas.tsx  # React Flow canvas wrapper
│   │   │   ├── PersonNode.tsx        # Single person node component
│   │   │   ├── CoupleNode.tsx        # Grouped spouse node component
│   │   │   └── CanvasControls.tsx    # Zoom controls overlay
│   │   ├── modals/
│   │   │   └── QueryModal.tsx        # Siri-style Cypher query modal
│   │   ├── person/
│   │   │   ├── PersonCard.tsx        # Small card on canvas
│   │   │   ├── PersonDetail.tsx      # Full detail in sidebar
│   │   │   └── ImmediateFamily.tsx   # Family navigation section
│   │   └── ui/                       # Reusable UI components
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useTreeData.ts            # Fetch & cache tree data
│   │   ├── usePersonFamily.ts        # Fetch immediate family
│   │   ├── useMediaQuery.ts          # Responsive breakpoints
│   │   └── useKeyboardShortcuts.ts   # Keyboard navigation (TODO)
│   ├── store/
│   │   ├── useAppStore.ts            # Main Zustand store
│   │   └── slices/                   # Store slices (if needed)
│   ├── lib/
│   │   ├── api.ts                    # API client functions
│   │   ├── graph-layout.ts           # Convert API data to React Flow
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       └── index.ts                  # TypeScript types
├── public/
│   └── fonts/                        # Local fonts (if needed)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. State Management (Zustand)

### Store Structure

```typescript
interface AppState {
  // Selected person
  selectedPersonId: string | null;
  setSelectedPerson: (id: string | null) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Graph data
  graphData: { nodes: Person[]; links: Link[] } | null;
  setGraphData: (data: { nodes: Person[]; links: Link[] }) => void;

  // Center node (for fetching)
  centerNodeId: string;
  setCenterNodeId: (id: string) => void;

  // Query modal
  queryModalOpen: boolean;
  setQueryModalOpen: (open: boolean) => void;

  // Viewport (managed by React Flow, but we may sync)
  viewport: { x: number; y: number; zoom: number };
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
}
```

---

## 5. Component Specifications

### 5.1 Header (Sticky)

```
┌────────────────────────────────────────────────────────────────┐
│  Family Tree                                    [🔮 Query]     │
└────────────────────────────────────────────────────────────────┘
```

- Position: `sticky top-0`
- Height: 56px
- Background: White with subtle shadow
- Left: App title/logo
- Right: Multi-colored circular button (Siri-style) to open query modal

### 5.2 Sidebar / Bottom Sheet

**Desktop (Left Panel)**:
```
┌──────────────────┐
│  ┌────┐          │
│  │ 👤 │  Name    │
│  └────┘  Late ⚫ │
│                  │
│  📅 Born: ...    │
│  💀 Died: ...    │
│  📍 Location     │
│  💼 Profession   │
│                  │
│  ─────────────── │
│  Immediate Family│
│  > Father        │
│  > Mother        │
│  > Spouse        │
│  > Children (2)  │
└──────────────────┘
```

**Mobile (Bottom Sheet)**:
- Draggable from bottom
- Three states: collapsed (peek), half, full
- Shows person name in collapsed state
- Full details when expanded

### 5.3 Canvas (React Flow)

- Full viewport minus header
- Pan: Click and drag background
- Zoom: Scroll wheel / pinch
- Node click: Select person, open sidebar, update URL
- Custom nodes: `PersonNode` component
- Custom edges: Styled connection lines

### 5.4 Node Types (Cards on Canvas)

**Single Person Node:**
```
┌─────────────────┐
│    ┌──────┐     │
│    │ 👤   │     │
│    └──────┘     │
│   John Smith    │
│   (1950-2020)   │
└─────────────────┘
```

**Couple Node (Grouped Spouses):**
```
┌─────────────────────────────────┐
│  ┌──────┐    │    ┌──────┐     │
│  │ 👤   │    │    │ 👤   │     │
│  └──────┘    │    └──────┘     │
│  John Smith  │   Jane Smith    │
│  1950-2020   │   1952-present  │
└─────────────────────────────────┘
```

- **Single nodes**: ~140px wide, for unmarried persons
- **Couple nodes**: ~280px wide, groups spouses together
- Avatar: Gender-based icon (no initials)
- Name: Truncated if long
- Years: Birth-Death or Birth-present
- Border: Highlighted when selected
- Handles: Hidden (invisible)
- Edges: Only parent→child connections (no spouse/sibling lines)

### 5.5 Query Modal (Siri-style)

```
┌────────────────────────────────────────┐
│                                        │
│       ┌────────────────────────┐       │
│       │ MATCH (n) RETURN n... │       │
│       └────────────────────────┘       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ {                                │  │
│  │   "results": [...]               │  │
│  │ }                                │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

- Trigger: Click Siri button in header OR keyboard shortcut (TODO)
- Background: Glass-morphism (`backdrop-blur-xl bg-white/80`)
- Input: Single line with glowing border
- Results: Dark-mode code block (terminal aesthetic)
- Close: Click outside or Escape key

---

## 6. Routing Strategy

| Route | Description |
|-------|-------------|
| `/` | Default view, centers on `me-001` |
| `/person/[id]` | Centers on specific person, opens sidebar |

### URL Sync Behavior
1. Click node → Update URL to `/person/{id}`
2. Direct URL visit → Fetch tree centered on that person
3. Browser back/forward → Sync state

---

## 7. API Integration

### API Client (`lib/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getTreeData(centerNodeId?: string, depth?: number);
export async function getPerson(id: string);
export async function getPersonFamily(id: string);
export async function executeQuery(query: string);
```

### Data Fetching Strategy
- Use React Query or SWR for caching (recommended)
- Or simple `useEffect` + Zustand for MVP
- Fetch tree data on mount and when centerNodeId changes

---

## 8. Graph Layout Strategy

React Flow needs nodes with `{ id, position: {x, y}, data }` format.

### Layout Algorithm

```typescript
function layoutFamilyTree(persons: Person[], links: Link[], centerPersonId: string, selectedPersonId: string | null) {
  // 1. Calculate generation for each person (BFS from center)
  // 2. Group spouses into couple nodes (same generation only)
  // 3. Position by generation (y = generation * ROW_HEIGHT)
  // 4. Position within generation (x based on node width + gap)
  // 5. Create only PARENT_CHILD edges (no spouse/sibling lines)
  // 6. Return React Flow nodes and edges
}
```

### Layout Constants
```typescript
const ROW_HEIGHT = 200;    // Vertical spacing between generations
const COUPLE_WIDTH = 280;  // Width of couple nodes
const SINGLE_WIDTH = 160;  // Width of single person nodes
const COL_GAP = 40;        // Gap between nodes
```

---

## 9. Styling System (Tailwind)

### Color Palette
```css
/* tailwind.config.ts */
colors: {
  background: '#F5F5F5',      /* Off-white canvas */
  surface: '#FFFFFF',          /* Cards, sidebar */
  primary: '#3B82F6',          /* Blue - interactive */
  accent: '#8B5CF6',           /* Purple - highlights */
  muted: '#6B7280',            /* Gray - secondary text */
  border: '#E5E7EB',           /* Light gray borders */
}
```

### Component Classes
- **Nodes**: `rounded-2xl shadow-lg border-2 bg-white`
- **Connections**: `stroke-gray-400 stroke-2`
- **Sidebar**: `bg-white shadow-2xl`
- **Modal**: `backdrop-blur-xl bg-white/80 rounded-2xl`
- **Selected**: `ring-2 ring-primary ring-offset-2`

---

## 10. Responsive Breakpoints

```typescript
// hooks/useMediaQuery.ts
const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
};
```

### Behavior by Breakpoint

| Feature | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Sidebar | Bottom sheet | Left 40% | Left 30% |
| Node size | Smaller | Normal | Normal |
| Header | Compact | Normal | Normal |
| Zoom controls | Bottom right | Bottom right | Bottom right |

---

## 11. Animations

### CSS Transitions (Default)
```css
/* Sidebar */
.sidebar {
  transition: transform 300ms ease-in-out;
}

/* Node selection */
.node {
  transition: box-shadow 200ms ease, transform 200ms ease;
}

/* Modal */
.modal-backdrop {
  transition: opacity 200ms ease;
}
```

### React Flow Built-in
- `fitView` animation on load
- Pan/zoom smoothing
- Edge animations (optional)

---

## 12. Implemented Features

### Search Feature ✅
- [x] Search button in header with keyboard hint
- [x] Spotlight-style modal with fuzzy search
- [x] Search by name, profession, or location
- [x] Keyboard navigation (up/down arrows, Enter)
- [x] Click result → navigate to person

### Keyboard Shortcuts ✅
- [x] `Escape` - Close sidebar/modal/deselect
- [x] `+` / `=` - Zoom in
- [x] `-` - Zoom out
- [x] `0` - Fit view / reset zoom
- [x] Arrow keys - Navigate between family members
- [x] `/` or `⌘K` - Open search
- [x] `⌘⇧P` - Open query modal

### Post-MVP Features (Not Implemented)
- [ ] Mini-map overview
- [ ] Generation labels on canvas
- [ ] Export as image
- [ ] Share link with viewport position
- [ ] Virtualize nodes outside viewport
- [ ] Lazy load person details

---

## 13. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 14. Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 15. Implementation Order (All Complete ✅)

1. ✅ **Project Setup** - Next.js 14, Tailwind, dependencies
2. ✅ **Types & API Client** - TypeScript types, fetch functions
3. ✅ **Zustand Store** - Global state management
4. ✅ **Layout Components** - Header with search button
5. ✅ **React Flow Canvas** - Canvas with pan/zoom
6. ✅ **Custom Nodes** - PersonNode component with avatars
7. ✅ **Graph Layout** - Hierarchical generation-based algorithm
8. ✅ **Sidebar** - Desktop right panel (slide-in)
9. ✅ **Bottom Sheet** - Mobile bottom panel (Google Maps-style)
10. ✅ **Person Detail** - Full person info + family navigation
11. ✅ **Query Modal** - Siri-style Cypher interface
12. ✅ **Search Modal** - Spotlight-style search
13. ✅ **Routing** - URL sync with `/person/[id]`
14. ✅ **Keyboard Shortcuts** - Search, zoom, navigation
15. ✅ **Animations** - Polish transitions
16. ✅ **Responsive Testing** - Mobile, tablet, desktop
