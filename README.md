# Family Tree Explorer

[![GitHub release](https://img.shields.io/github/v/release/heemankv/family-tree)](https://github.com/heemankv/family-tree/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/heemankv/family-tree/pkgs/container/family-tree)

An interactive family tree visualization application with a Google Maps-like experience. Explore your ancestry with an intuitive pan-and-zoom interface, search across generations, and visualize complex family relationships.

**[View Demo](https://github.com/heemankv/family-tree)** | **[Report Bug](https://github.com/heemankv/family-tree/issues)** | **[Request Feature](https://github.com/heemankv/family-tree/issues)**

## Features

- **Interactive Canvas** - Pan, zoom, and drag nodes with smooth animations
- **Hierarchical Layout** - Bottom-to-top layout with ancestors at the bottom
- **Smart Search** - Spotlight-style search by name, profession, or location
- **Person & Couple Views** - Detailed sidebar with family navigation
- **Relationship Highlighting** - Green edges show blood relations when selected
- **Dark/Light Theme** - Warm, eye-friendly color palettes
- **Cypher Query Tool** - Execute read-only Neo4j queries for power users
- **Mobile Support** - Touch-friendly with bottom sheet UI
- **CSV Import** - Easily import your family data from spreadsheets

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Visualization | React Flow (@xyflow/react) |
| State | Zustand |
| Backend | Go 1.23, Gin framework |
| Database | Neo4j 5.15 (graph database) |

## Quick Start with Docker

The easiest way to run Family Tree Explorer is using Docker Compose with pre-built images.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Download and Start

```bash
# Download the production compose file
curl -O https://raw.githubusercontent.com/heemankv/family-tree/master/docker-compose.prod.yml

# Start all services (Neo4j, Backend, Frontend)
docker compose -f docker-compose.prod.yml up -d

# Verify services are running
docker compose -f docker-compose.prod.yml ps
```

### 2. Import Sample Data

```bash
# Clone just the scripts and sample data
git clone --depth 1 https://github.com/heemankv/family-tree.git
cd family-tree

# Import the example family tree (35 persons, 64 relationships)
./scripts/csv_import.sh
```

### 3. Open the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Neo4j Browser | http://localhost:7474 | `neo4j` / `familytree123` |
| Backend API | http://localhost:8080 | - |

### 4. Import Your Own Data

See the [Data Import Guide](docs/DATA_IMPORT.md) for detailed instructions on preparing and importing your family data.

```bash
./scripts/csv_import.sh data/your_persons.csv data/your_relationships.csv
```

## Development Setup

For contributors and developers who want to build from source.

### Prerequisites
- Node.js 18+
- Go 1.23+
- Docker (for Neo4j)

### 1. Clone the Repository

```bash
git clone https://github.com/heemankv/family-tree.git
cd family-tree
```

### 2. Start Neo4j

```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/familytree123 \
  neo4j:5.15.0-community
```

### 3. Start Backend

```bash
cd backend
go run cmd/server/main.go
# API available at http://localhost:8080
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

### Build from Source with Docker

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Rebuild after changes
docker compose build --no-cache && docker compose up -d
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/tree` | Fetch complete graph data for visualization |
| `GET /api/person/:id` | Get person details by ID |
| `GET /api/person/:id/family` | Get immediate family members |
| `GET /api/persons` | List all persons |
| `POST /api/query` | Execute Cypher query (read-only, rate-limited) |
| `GET /health` | Health check endpoint |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` or `Cmd+K` | Open search |
| `Cmd+Shift+P` | Open Cypher query modal |
| `+` / `-` | Zoom in/out |
| `0` | Fit view / Reset layout |
| `Escape` | Close modal / Deselect |
| Arrow keys | Navigate between family members |

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8080` | Backend API port |
| `FRONTEND_PORT` | `3000` | Frontend port |
| `NEO4J_PASSWORD` | `familytree123` | Neo4j password |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API URL for frontend |

### Port Conflicts

If default ports are in use:

```bash
# In .env file
BACKEND_PORT=8081
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Project Structure

```
family_tree/
├── backend/           # Go API server
│   ├── cmd/server/    # Entry point
│   ├── internal/      # Business logic
│   └── Dockerfile     # Container build
├── frontend/          # Next.js application
│   ├── src/           # Source code
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store/
│   └── Dockerfile     # Container build
├── scripts/           # Database utilities
│   └── csv_import.sh  # Data import script
├── data/              # Sample CSV data
├── docs/              # Additional documentation
└── AI_docs/           # Detailed technical docs
```

## Documentation

| Document | Description |
|----------|-------------|
| [Data Import Guide](docs/DATA_IMPORT.md) | How to import your family data |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute to the project |
| [AI_docs/database.md](AI_docs/database.md) | Neo4j schema and Cypher queries |
| [AI_docs/backend.md](AI_docs/backend.md) | API specification and models |
| [AI_docs/frontend.md](AI_docs/frontend.md) | Components and architecture |

## Docker Images

Pre-built images are available on GitHub Container Registry:

```bash
docker pull ghcr.io/heemankv/family-tree/backend:latest
docker pull ghcr.io/heemankv/family-tree/frontend:latest
```

**Supported Platforms:** `linux/amd64`

> **Note for Apple Silicon users:** The images work on M1/M2/M3 Macs via Docker's Rosetta emulation. The `docker-compose.prod.yml` file includes the necessary `platform: linux/amd64` configuration.

## Roadmap

See the [open issues](https://github.com/heemankv/family-tree/issues) for a list of planned features:

- [ ] Keyboard shortcuts help modal ([#1](https://github.com/heemankv/family-tree/issues/1))
- [ ] Export as image/PDF ([#2](https://github.com/heemankv/family-tree/issues/2))
- [ ] Shareable links ([#3](https://github.com/heemankv/family-tree/issues/3))
- [ ] Zoom to fit family ([#4](https://github.com/heemankv/family-tree/issues/4))
- [ ] Timeline view ([#5](https://github.com/heemankv/family-tree/issues/5))
- [ ] Statistics dashboard ([#6](https://github.com/heemankv/family-tree/issues/6))
- [ ] Upcoming events (birthdays, anniversaries) ([#7](https://github.com/heemankv/family-tree/issues/7))
- [ ] Mobile responsiveness improvements ([#8](https://github.com/heemankv/family-tree/issues/8))

## Contributing

Contributions are welcome! Please see the [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style guidelines
- Submitting pull requests
- Reporting bugs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React Flow](https://reactflow.dev/) for the graph visualization library
- [Neo4j](https://neo4j.com/) for the graph database
- [Tailwind CSS](https://tailwindcss.com/) for styling
