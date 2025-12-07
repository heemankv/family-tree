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

## Quick Start with Docker (Recommended)

The easiest way to run the application is using Docker Compose with pre-built images.

### Prerequisites
- Docker and Docker Compose

### Option 1: Using Pre-built Images (Fastest)
```bash
# Download the production compose file
curl -O https://raw.githubusercontent.com/heemankv/family-tree/master/docker-compose.prod.yml

# Start all services
docker compose -f docker-compose.prod.yml up -d
```

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/heemankv/family-tree.git
cd family-tree

# Start all services (Neo4j, Backend, Frontend)
docker compose up -d

# Check services are running
docker compose ps
```

### 2. Import Sample Data
```bash
# Import the example family tree (35 persons, 64 relationships)
./scripts/csv_import.sh
```

### 3. Open the Application
- **Frontend**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474 (login: `neo4j` / `familytree123`)
- **Backend API**: http://localhost:8080

### 4. Import Your Own Data
See [Data Import Guide](docs/DATA_IMPORT.md) for detailed instructions on importing your family data.

```bash
# Prepare your CSV files (see docs/DATA_IMPORT.md for format)
# Then import:
./scripts/csv_import.sh data/your_persons.csv data/your_relationships.csv
```

## Manual Setup (Development)

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
```

### 2. Backend
```bash
cd backend
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

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:
| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8080` | Port for backend API |
| `FRONTEND_PORT` | `3000` | Port for frontend |
| `NEO4J_PASSWORD` | `familytree123` | Neo4j password |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API URL for frontend |

### Port Conflicts

If ports are in use, change them in `.env`:
```bash
BACKEND_PORT=8081
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Documentation

| Document | Description |
|----------|-------------|
| [Data Import Guide](docs/DATA_IMPORT.md) | How to import your family data |
| [AI_docs/database.md](AI_docs/database.md) | Neo4j schema, relationships, Cypher queries |
| [AI_docs/backend.md](AI_docs/backend.md) | API specification, models, rate limiting |
| [AI_docs/frontend.md](AI_docs/frontend.md) | Components, state management, styling |

## Docker Commands

```bash
# Start all services (build from source)
docker compose up -d

# Start with pre-built images
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d

# Clear database and start fresh
docker compose down -v
docker compose up -d
./scripts/csv_import.sh
```

## Docker Images

Pre-built multi-platform images are available on GitHub Container Registry:

```bash
# Backend (linux/amd64, linux/arm64)
docker pull ghcr.io/heemankv/family-tree/backend:latest

# Frontend (linux/amd64, linux/arm64)
docker pull ghcr.io/heemankv/family-tree/frontend:latest
```

Supported platforms:
- `linux/amd64` - Intel/AMD processors
- `linux/arm64` - Apple Silicon (M1/M2/M3), ARM servers, Raspberry Pi 4

## License

MIT
