# Infrastructure & Local Development Setup

## 1. Overview

This document covers the infrastructure setup for local development and production deployment.

### Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js        │────▶│  Go Backend     │────▶│  Neo4j          │
│  Frontend       │     │  (Gin)          │     │  Database       │
│  :3000          │     │  :8080          │     │  :7687 (Bolt)   │
│                 │     │                 │     │  :7474 (HTTP)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 2. Local Development Stack

| Component | Technology | Port |
|-----------|------------|------|
| Database | Neo4j 5.15.0 (Docker) | 7474, 7687 |
| Backend | Go 1.21+ with Gin | 8080 |
| Frontend | Next.js (React) | 3000 |

---

## 3. Neo4j Docker Setup

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Docker Compose Configuration

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  neo4j:
    image: neo4j:5.15.0-community
    container_name: family_tree_neo4j
    ports:
      - "7474:7474"  # HTTP (Browser interface)
      - "7687:7687"  # Bolt (Driver connection)
    environment:
      - NEO4J_AUTH=neo4j/familytree123
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_dbms_security_procedures_unrestricted=apoc.*
      - NEO4J_dbms_memory_heap_initial__size=512m
      - NEO4J_dbms_memory_heap_max__size=1G
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7474"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  neo4j_data:
  neo4j_logs:
```

### Neo4j Commands

```bash
# Start Neo4j
docker-compose up -d neo4j

# Check status
docker-compose ps

# View logs
docker-compose logs -f neo4j

# Stop Neo4j
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

## 4. Accessing Neo4j

### Neo4j Browser (Web UI)
- **URL**: http://localhost:7474
- **Username**: `neo4j`
- **Password**: `familytree123`

### Bolt Connection (Applications)
- **URI**: `bolt://localhost:7687`
- **Username**: `neo4j`
- **Password**: `familytree123`

---

## 5. Database Management Scripts

Two shell scripts are provided for database management:

### Location
```
scripts/
├── neo4j_clean.sh   # Wipes all data
└── neo4j_seed.sh    # Inserts sample data
```

### neo4j_clean.sh

Deletes ALL nodes and relationships from the database.

```bash
# Usage
./scripts/neo4j_clean.sh

# With custom credentials
NEO4J_USER=neo4j NEO4J_PASSWORD=mypassword ./scripts/neo4j_clean.sh
```

**Output**:
```
=== Neo4j Clean Wipe Script ===
URI: bolt://localhost:7687
User: neo4j

Using Docker to run cypher-shell...

SUCCESS: All nodes and relationships have been deleted.
```

### neo4j_seed.sh

Inserts the complete sample family tree (16 persons, 5 generations).

```bash
# Usage
./scripts/neo4j_seed.sh

# With custom credentials
NEO4J_USER=neo4j NEO4J_PASSWORD=mypassword ./scripts/neo4j_seed.sh
```

**Output**:
```
=== Neo4j Seed Data Script ===
URI: bolt://localhost:7687
User: neo4j

Using Docker to run cypher-shell...
total_persons
16

SUCCESS: Sample data has been inserted.

Family Tree Structure:
=====================
Generation 1: William & Elizabeth Smith (Great Grandparents)
Generation 2: Robert & Mary Smith (Paternal), Charles & Dorothy Johnson (Maternal)
Generation 3: James & Susan Smith (Parents), Michael & Patricia Smith (Uncle/Aunt)
Generation 4: Alex Smith (me-001), Sarah (spouse), Emily (sibling), David (cousin)
Generation 5: Oliver & Emma Smith (children)

Total: 16 persons, 28 relationships
```

### Reset Database (Clean + Seed)

```bash
./scripts/neo4j_clean.sh && ./scripts/neo4j_seed.sh
```

---

## 6. Initial Database Setup

After starting Neo4j for the first time, the seed script automatically creates constraints and indexes. If running manually:

```cypher
// Create unique constraint on Person id
CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.id IS UNIQUE;

// Create index on Person name for faster searches
CREATE INDEX person_name_index IF NOT EXISTS
FOR (p:Person) ON (p.name);

// Create index on Person birth_date
CREATE INDEX person_birth_date_index IF NOT EXISTS
FOR (p:Person) ON (p.birth_date);
```

---

## 7. Backend Setup

### Environment File

Create `backend/.env`:

```bash
# Server
PORT=8080
GIN_MODE=debug

# Mock Data (set to false to use real Neo4j)
MOCK_DATA=false

# Neo4j Connection
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=familytree123

# Admin
ADMIN_TOKEN=dev_admin_token_12345

# Rate Limiting
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW_SECONDS=60
```

### Running the Backend

```bash
cd backend

# Install dependencies
go mod download

# Run in development mode (with Neo4j)
export MOCK_DATA=false
go run cmd/server/main.go

# Run in development mode (with mock data)
export MOCK_DATA=true
go run cmd/server/main.go

# Build for production
go build -o family-tree-api cmd/server/main.go
./family-tree-api
```

---

## 8. Health Checks

### Neo4j Health
```bash
curl http://localhost:7474
# Returns JSON with Neo4j version info
```

### Backend Health
```bash
curl http://localhost:8080/health
# Returns: {"status":"healthy","mock_mode":false}
```

### Full Stack Verification
```bash
# 1. Check Neo4j
curl -s http://localhost:7474 | jq '.neo4j_version'

# 2. Check Backend
curl -s http://localhost:8080/health | jq .

# 3. Check Data
curl -s http://localhost:8080/api/persons | jq '.count'
# Should return: 16
```

---

## 9. Project Directory Structure

```
family_tree/
├── AI_docs/                    # Documentation
│   ├── main.md                 # Project vision
│   ├── frontend.md             # Frontend specification
│   ├── backend.md              # Backend specification
│   ├── database.md             # Database schema
│   ├── infrastructure.md       # This file
│   └── prompt.md               # Requirements log
├── backend/                    # Go backend
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── models/
│   ├── go.mod
│   ├── go.sum
│   ├── .env
│   └── .env.example
├── scripts/                    # Utility scripts
│   ├── neo4j_clean.sh
│   └── neo4j_seed.sh
├── docker-compose.yml          # Docker configuration
└── frontend/                   # Next.js frontend (Phase 2)
```

---

## 10. Development Workflow

### First-Time Setup

```bash
# 1. Start Neo4j
docker-compose up -d neo4j

# 2. Wait for Neo4j to be ready (30-60 seconds)
sleep 30

# 3. Seed the database
./scripts/neo4j_seed.sh

# 4. Start the backend
cd backend
export MOCK_DATA=false
go run cmd/server/main.go
```

### Daily Development

```bash
# Start Neo4j (if not running)
docker-compose up -d neo4j

# Start backend
cd backend && go run cmd/server/main.go
```

### Reset Data

```bash
# Clean and re-seed
./scripts/neo4j_clean.sh
./scripts/neo4j_seed.sh
```

---

## 11. Troubleshooting

### Neo4j won't start
```bash
# Check logs
docker logs family_tree_neo4j

# Common issues:
# - Port already in use: Stop other services on 7474/7687
# - Memory issues: Reduce heap size in docker-compose.yml
# - Permission issues: Check Docker volume permissions
```

### Connection refused from backend
```bash
# Ensure Neo4j is fully started
docker-compose ps  # Should show "healthy"

# Verify Bolt port is accessible
nc -zv localhost 7687

# Check backend logs for connection errors
```

### Scripts fail with "cypher-shell not found"
```bash
# Scripts use Docker to run cypher-shell
# Ensure container is named "family_tree_neo4j"
docker ps | grep neo4j
```

### Port 8080 already in use
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

### Reset everything
```bash
# Stop all containers and remove data
docker-compose down -v

# Restart Neo4j
docker-compose up -d neo4j

# Wait and re-seed
sleep 30
./scripts/neo4j_seed.sh
```

---

## 12. Production Considerations

### Neo4j AuraDB (Cloud)
- Create free tier instance at https://neo4j.com/cloud/aura/
- Update `NEO4J_URI` to `neo4j+s://xxx.databases.neo4j.io`
- Use strong password for production

### Backend Deployment
- Build binary: `go build -o family-tree-api cmd/server/main.go`
- Deploy to Cloud Run, Railway, or any Docker host
- Set `GIN_MODE=release`
- Use environment variables for secrets

### Rate Limiting (Production)
- Consider Redis-backed rate limiting for multiple instances
- Current in-memory implementation works for single instance
