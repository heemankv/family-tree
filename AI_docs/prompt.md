# Project Requirements & Decision Log

This file serves as the source of truth for all requirements and decisions made during project development.

---

## 1. Documentation Structure

All project documentation is stored in `AI_docs/`:

| File | Purpose | Status |
|------|---------|--------|
| `main.md` | Project vision, objectives, and high-level overview | Complete |
| `frontend.md` | Frontend design, UI/UX specification, component architecture | Pending Implementation |
| `backend.md` | Backend architecture, API specification, Go/Gin implementation | **Complete** |
| `database.md` | Neo4j schema, node labels, relationships, sample queries | **Complete** |
| `infrastructure.md` | Docker setup, local development, Neo4j configuration, scripts | **Complete** |
| `prompt.md` | This file - requirements log and decision tracking | Updated |

---

## 2. Implementation Status

### Phase 1: Database & Backend - COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| Neo4j Docker setup | ✅ Complete | v5.15.0-community |
| Database schema | ✅ Complete | Person nodes, 3 relationship types |
| Constraints & indexes | ✅ Complete | Unique ID, name index |
| Go backend structure | ✅ Complete | Gin framework |
| Mock data system | ✅ Complete | 16 persons, 5 generations |
| Neo4j repository | ✅ Complete | Full CRUD operations |
| API endpoints | ✅ Complete | 7 endpoints implemented |
| Rate limiting | ✅ Complete | In-memory, 5 req/min |
| CORS middleware | ✅ Complete | Configured for localhost |
| Database scripts | ✅ Complete | clean.sh, seed.sh |
| Backend tested | ✅ Complete | All endpoints verified |

### Phase 2: Frontend - COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js project setup | ✅ Complete | Next.js 14, TypeScript, Tailwind |
| React Flow canvas | ✅ Complete | Pan/zoom, custom nodes |
| Graph layout algorithm | ✅ Complete | Hierarchical, generation-based |
| Desktop sidebar | ✅ Complete | Right-side slide panel |
| Mobile bottom sheet | ✅ Complete | Google Maps-style draggable |
| Person detail view | ✅ Complete | Full info + family links |
| Query modal | ✅ Complete | Siri-style Cypher interface |
| Search modal | ✅ Complete | Spotlight-style search |
| URL routing | ✅ Complete | /person/[id] sync |
| Keyboard shortcuts | ✅ Complete | Search, zoom, navigation |
| Animations | ✅ Complete | Transitions, hover effects |
| Responsive design | ✅ Complete | Mobile, tablet, desktop |

### Phase 3: Integration & Deployment - PENDING

| Component | Status |
|-----------|--------|
| Frontend-Backend integration | Pending |
| Vercel deployment (Frontend) | Pending |
| Backend deployment | Pending |
| Production Neo4j (AuraDB) | Pending |

---

## 3. Key Technical Decisions

### 3.1 Backend Technology

**Decision**: Use **Go (Golang) with Gin framework** instead of Next.js API Routes.

**Rationale**: 
- Better performance for graph traversal operations
- Strong typing and compile-time safety
- Easier to manage complex database connections
- Better suited for standalone API service

**Implementation**: Complete - `backend/` directory

### 3.2 Mock Data System

**Decision**: Implement a mock data layer controlled by environment variable.

**Configuration**:
```bash
MOCK_DATA=true   # Uses embedded mock data (no Neo4j required)
MOCK_DATA=false  # Connects to real Neo4j
```

**Implementation**: Complete
- File: `backend/internal/database/mock_database.go`
- Contains 16 persons across 5 generations
- Mirrors all Neo4j repository methods

### 3.3 Local Neo4j Setup

**Decision**: Use Docker for local Neo4j instead of cloud-only AuraDB.

**Configuration**:
- Image: `neo4j:5.15.0-community`
- Ports: 7474 (HTTP), 7687 (Bolt)
- Default credentials: `neo4j/familytree123`

**Implementation**: Complete - `docker-compose.yml`

### 3.4 Database Scripts

**Decision**: Create shell scripts for database management.

**Implementation**: Complete
- `scripts/neo4j_clean.sh` - Wipes all data
- `scripts/neo4j_seed.sh` - Seeds 16 persons with relationships

### 3.5 Rate Limiting Strategy

**Decision**: Use in-memory token bucket for rate limiting.

**Configuration**:
- 5 requests per 60 seconds per IP
- Applied only to `/api/query` endpoint
- Returns 429 with retry_after_seconds

**Implementation**: Complete - `backend/internal/middleware/ratelimit.go`

### 3.6 Query Security

**Decision**: Block write operations at application level.

**Implementation**: Complete
- Blocks: CREATE, DELETE, MERGE, SET, REMOVE, DROP, DETACH
- Uses Neo4j read-only session mode
- Returns 403 Forbidden for blocked queries

---

## 4. API Contract (Implemented)

### Base URL
- Development: `http://localhost:8080`
- Production: TBD

### Endpoints

| Method | Path | Description | Rate Limited |
|--------|------|-------------|--------------|
| GET | `/health` | Health check | No |
| GET | `/api/tree` | Fetch graph data | No |
| GET | `/api/persons` | Get all persons | No |
| GET | `/api/person/:id` | Get person by ID | No |
| GET | `/api/person/:id/family` | Get immediate family | No |
| POST | `/api/query` | Execute Cypher query | **Yes** (5/min) |
| POST | `/api/upload` | Upload CSV (admin) | No |

---

## 5. Environment Variables Reference

```bash
# Required for all modes
PORT=8080                          # Server port
GIN_MODE=debug|release             # Gin mode
MOCK_DATA=true|false               # Use mock or real Neo4j

# Required when MOCK_DATA=false
NEO4J_URI=bolt://localhost:7687    # Neo4j Bolt URI
NEO4J_USERNAME=neo4j               # Neo4j username
NEO4J_PASSWORD=familytree123       # Neo4j password

# Optional
ADMIN_TOKEN=<token>                # For /api/upload endpoint
RATE_LIMIT_REQUESTS=5              # Requests per window
RATE_LIMIT_WINDOW_SECONDS=60       # Window duration
```

---

## 6. Sample Data Summary

The seed script creates this family structure:

| ID | Name | Role | Generation |
|----|------|------|------------|
| ggp-001 | William Smith Sr. | Great Grandfather | 1 |
| ggm-001 | Elizabeth Smith | Great Grandmother | 1 |
| gp-001 | Robert Smith | Grandfather (paternal) | 2 |
| gm-001 | Mary Smith | Grandmother (paternal) | 2 |
| gp-002 | Charles Johnson | Grandfather (maternal) | 2 |
| gm-002 | Dorothy Johnson | Grandmother (maternal) | 2 |
| dad-001 | James Smith | Father | 3 |
| mom-001 | Susan Smith | Mother | 3 |
| uncle-001 | Michael Smith | Uncle | 3 |
| aunt-001 | Patricia Smith | Aunt | 3 |
| **me-001** | **Alex Smith** | **Self (default center)** | **4** |
| spouse-001 | Sarah Smith | Spouse | 4 |
| sibling-001 | Emily Smith | Sister | 4 |
| cousin-001 | David Smith | Cousin | 4 |
| child-001 | Oliver Smith | Son | 5 |
| child-002 | Emma Smith | Daughter | 5 |

**Relationships**: 28 total (PARENT_CHILD, SPOUSE, SIBLING)

---

## 7. Decisions Made & Pending

### Completed Decisions
- [x] Frontend state management: **Zustand**
- [x] Canvas library: **React Flow (@xyflow/react)**
- [x] Sidebar position: **Right side** (desktop)
- [x] Mobile UI: **Bottom sheet** (Google Maps-style)
- [x] Graph visualization: **Couple nodes** (spouses grouped), **parent-child edges only**
- [x] Avatar display: **Gender-based icons** (not initials)

### Pending Decisions
- [ ] Authentication strategy for admin endpoints (JWT? API Key?)
- [ ] Image storage solution (S3, Vercel Blob, Cloudinary?)
- [ ] Production rate limiting (Redis for multi-instance?)

---

## 8. Change Log

| Date | Change | Files Affected |
|------|--------|----------------|
| 2024-11-29 | Initial project documentation | All AI_docs/ |
| 2024-11-29 | Changed backend from Next.js to Go/Gin | backend.md, main.md |
| 2024-11-29 | Added Docker Neo4j setup | infrastructure.md |
| 2024-11-29 | Implemented mock data system | backend.md |
| 2024-11-29 | Created database management scripts | infrastructure.md |
| 2024-11-29 | Completed Phase 1 implementation | All |
| 2024-11-29 | Full documentation update | backend.md, database.md, infrastructure.md, prompt.md |
| 2024-11-30 | Frontend implementation complete | All frontend components |
| 2024-11-30 | Search feature added | SearchModal.tsx |
| 2024-11-30 | Keyboard shortcuts added | useKeyboardShortcuts.ts, FamilyTreeCanvas.tsx |
| 2024-11-30 | Simplified graph visualization | CoupleNode.tsx, graph-layout.ts |
| 2024-11-30 | Avatar changed to gender icons | Avatar.tsx |

---

## 9. Quick Start Commands

```bash
# Start Neo4j
docker-compose up -d neo4j

# Seed database (first time or reset)
./scripts/neo4j_seed.sh

# Start backend (with real Neo4j)
cd backend && MOCK_DATA=false go run cmd/server/main.go

# Start backend (with mock data, no Neo4j needed)
cd backend && MOCK_DATA=true go run cmd/server/main.go

# Test API
curl http://localhost:8080/health
curl http://localhost:8080/api/persons | jq '.count'
curl http://localhost:8080/api/person/me-001/family | jq '.person.name'
```

---

## 10. Next Steps

1. ~~**Frontend Implementation** (Phase 2)~~ ✅ COMPLETE
   - ~~Set up Next.js project with Tailwind CSS~~
   - ~~Implement infinite canvas with pan/zoom~~
   - ~~Build profile sidebar component~~
   - ~~Create developer Cypher query modal~~

2. **Integration Testing**
   - ✅ Frontend-Backend integration working
   - [ ] Test all user flows
   - [ ] Performance testing with larger datasets

3. **Deployment** (Phase 3)
   - [ ] Deploy frontend to Vercel
   - [ ] Deploy backend to Cloud Run/Railway
   - [ ] Set up production Neo4j AuraDB

## 11. Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `⌘K` or `/` | Open search |
| `⌘⇧P` | Open Cypher query modal |
| `Escape` | Close modal / deselect person |
| `←` `↑` | Previous person (when selected) |
| `→` `↓` | Next person (when selected) |
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `0` | Fit view / reset zoom |
