# Family Tree Explorer

An interactive family tree visualization application with a Google Maps-like experience. Built with Go, Next.js, and Neo4j.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Graph Viz | React Flow (@xyflow/react) |
| State | Zustand |
| Backend | Go 1.21+, Gin framework |
| Database | Neo4j (graph database) |

## Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Docker (for Neo4j)

### 1. Database
```bash
# Start Neo4j
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/familytree123 \
  neo4j:5.15.0-community

# Seed sample data
./scripts/neo4j_seed.sh
```

### 2. Backend
```bash
cd backend
export MOCK_DATA=true  # Use mock data (no Neo4j needed)
go run cmd/server/main.go
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Features

- **Interactive Canvas**: Pan, zoom, drag nodes, click-to-select
- **Family Visualization**: Bottom-to-top hierarchical layout (ancestors at bottom)
- **Person Details**: Sidebar with full info, AKA/nicknames, and family navigation
- **Couple Details**: Click couple card background to see combined family view
- **Search**: Spotlight-style search by name, profession, location
- **Cypher Query Tool**: Execute read-only Neo4j queries (rate-limited)
- **Dark/Light Theme**: Warm, eye-friendly color palettes
- **Mobile Support**: Bottom sheet UI, rotate device prompt
- **Node Dragging**: Rearrange nodes manually with reset layout button

## Project Structure

```
family_tree/
├── backend/          # Go API server
├── frontend/         # Next.js application
├── AI_docs/          # Detailed documentation
│   ├── database.md   # Neo4j schema & queries
│   ├── backend.md    # API endpoints & models
│   └── frontend.md   # Components & architecture
└── scripts/          # Database utilities
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/tree` | Fetch graph data for visualization |
| `GET /api/person/:id` | Get person details |
| `GET /api/person/:id/family` | Get immediate family |
| `GET /api/persons` | List all persons |
| `POST /api/query` | Execute Cypher query (read-only) |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` or `Cmd+K` | Open search |
| `Cmd+Shift+P` | Open query modal |
| `+` / `-` | Zoom in/out |
| `0` | Fit view / Reset layout |
| `Escape` | Close modal/deselect |
| Arrow keys | Navigate family members |

## Selection & Highlighting

- **Person Selection**: Click a person to see their details, parents, spouse, children, and siblings
- **Couple Selection**: Click the background of a couple card to see combined family view with both sets of parents
- **Edge Highlighting**: Green edges show blood relations (parent-child connections) when a person or couple is selected

## Local Network Access

For mobile testing on the same network:

```bash
# Backend
cd backend
export ALLOW_ALL_ORIGINS=true
go run cmd/server/main.go

# Frontend
cd frontend
NEXT_PUBLIC_API_URL=http://<your-ip>:8080 npm run dev -- -H 0.0.0.0
```

## Documentation

See `AI_docs/` for detailed documentation:
- **database.md**: Neo4j schema, relationships, Cypher queries
- **backend.md**: API specification, models, rate limiting
- **frontend.md**: Components, state management, styling

## License

MIT
