# Backend Architecture & API Specification

## 1. Overview

The backend is built using **Go (Golang)** with the **Gin** web framework. It acts as a secure middleware between the React Frontend and the Neo4j Database.

### Technology Stack
- **Language**: Go 1.21+
- **Framework**: Gin v1.11.0 (github.com/gin-gonic/gin)
- **Neo4j Driver**: neo4j-go-driver v5.28.4 (github.com/neo4j/neo4j-go-driver/v5)
- **CORS**: gin-contrib/cors v1.7.6
- **Rate Limiting**: Custom in-memory token bucket implementation

### Responsibilities:
- Manage secure connections to Neo4j
- Sanitize and execute Cypher queries
- Implement Rate Limiting (crucial for the public "Developer Tool")
- Handle CSV parsing for bulk data ingestion
- Support mock data mode for development/testing

---

## 2. Project Structure (Implemented)

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Entry point, router setup
├── internal/
│   ├── config/
│   │   └── config.go            # Environment configuration loader
│   ├── database/
│   │   ├── neo4j.go             # Neo4j repository implementation
│   │   ├── mock_database.go     # Mock data repository (16 persons, 5 generations)
│   │   └── repository.go        # Repository interface + factory
│   ├── handlers/
│   │   ├── tree.go              # GET /api/tree, /api/person/:id, /api/persons
│   │   ├── query.go             # POST /api/query
│   │   └── upload.go            # POST /api/upload
│   ├── middleware/
│   │   ├── ratelimit.go         # In-memory rate limiter with cleanup
│   │   └── cors.go              # CORS configuration
│   └── models/
│       └── person.go            # Data models (Person, Link, TreeResponse, etc.)
├── go.mod
├── go.sum
├── .env                         # Local environment variables
├── .env.example                 # Template for environment variables
└── family-tree-api              # Compiled binary
```

---

## 3. API Endpoints (Implemented)

### GET /health

**Purpose**: Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "mock_mode": true|false
}
```

---

### GET /api/tree

**Purpose**: Fetches the graph dataset to render the canvas.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `centerNodeId` | string | `"me-001"` | ID of the person to center on |
| `depth` | int | `2` | Relationship levels to fetch (max: 3) |

**Response Format**:
```json
{
  "nodes": [
    {
      "id": "me-001",
      "name": "Alex Smith",
      "gender": "Male",
      "is_alive": true,
      "birth_date": "1985-09-25",
      "death_date": null,
      "current_location": "San Francisco, USA",
      "profession": "Software Developer",
      "photo_url": ""
    }
  ],
  "links": [
    {
      "source": "dad-001",
      "target": "me-001",
      "relationship": "PARENT_CHILD"
    },
    {
      "source": "me-001",
      "target": "spouse-001",
      "relationship": "SPOUSE",
      "start_date": "2012-06-15"
    }
  ]
}
```

**Implementation Notes**:
- Uses BFS traversal to find connected nodes within depth
- Links use custom person IDs (not Neo4j internal IDs)
- Returns both nodes and relationships between them

---

### GET /api/persons

**Purpose**: Fetches all persons in the database.

**Response**:
```json
{
  "persons": [...],
  "count": 16
}
```

---

### GET /api/person/:id

**Purpose**: Fetches a single person by ID.

**Response**: Single Person object or 404 error.

---

### GET /api/person/:id/family

**Purpose**: Fetches immediate family of a person.

**Response**:
```json
{
  "person": { ... },
  "parents": [ ... ],
  "spouse": { ... } | null,
  "children": [ ... ],
  "siblings": [ ... ]
}
```

---

### POST /api/query (The Developer Tool)

**Purpose**: Executes raw Cypher queries entered into the UI's "Siri bar".

**Security Guardrails**:
- **Rate Limiting**: Max 5 queries per minute per IP
- **Write Blocking**: Blocks CREATE, DELETE, MERGE, SET, REMOVE, DROP, DETACH keywords
- **Read-Only Session**: Uses Neo4j read-only access mode

**Request Body**:
```json
{
  "query": "MATCH (n:Person) RETURN n LIMIT 5"
}
```

**Response**:
```json
{
  "results": [
    { "n": { "id": "...", "name": "..." } }
  ],
  "count": 5
}
```

**Blocked Query Response** (403):
```json
{
  "error": {
    "code": "WRITE_NOT_ALLOWED",
    "message": "Write operations are not allowed. This endpoint is read-only.",
    "details": { "blocked_keyword": "CREATE" }
  }
}
```

---

### POST /api/upload (Admin Only)

**Purpose**: Ingestion pipeline for bulk CSV uploads.

**Headers Required**: `Authorization: Bearer <admin_token>`

**Request**: `multipart/form-data` with `file` field containing CSV.

**Required CSV Columns**: `id`, `name`, `gender`, `birth_date`

**Response**:
```json
{
  "message": "CSV parsed successfully",
  "rows_parsed": 10,
  "columns": ["id", "name", "gender", ...],
  "preview": [ ... first 5 rows ... ]
}
```

---

## 4. Data Models

### Person
```go
type Person struct {
    ID              string  `json:"id"`
    Name            string  `json:"name"`
    Gender          string  `json:"gender"`           // "Male", "Female", "Other"
    IsAlive         bool    `json:"is_alive"`
    BirthDate       string  `json:"birth_date"`       // "YYYY-MM-DD"
    DeathDate       *string `json:"death_date"`       // null if alive
    CurrentLocation string  `json:"current_location"` // "City, Country"
    Profession      string  `json:"profession"`
    PhotoURL        string  `json:"photo_url"`
}
```

### Link
```go
type Link struct {
    Source       string  `json:"source"`              // Person ID
    Target       string  `json:"target"`              // Person ID
    Relationship string  `json:"relationship"`        // "PARENT_CHILD", "SPOUSE", "SIBLING"
    StartDate    *string `json:"start_date,omitempty"` // For SPOUSE relationships
    EndDate      *string `json:"end_date,omitempty"`
}
```

### TreeResponse
```go
type TreeResponse struct {
    Nodes []Person `json:"nodes"`
    Links []Link   `json:"links"`
}
```

### ErrorResponse
```go
type ErrorResponse struct {
    Error ErrorDetail `json:"error"`
}

type ErrorDetail struct {
    Code    string      `json:"code"`
    Message string      `json:"message"`
    Details interface{} `json:"details,omitempty"`
}
```

---

## 5. Environment Variables

```bash
# Server Configuration
PORT=8080                        # Server port
GIN_MODE=debug                   # "debug" or "release"

# Mock Data Mode
MOCK_DATA=true                   # "true" = use embedded mock data
                                 # "false" = connect to Neo4j

# Neo4j Connection (used when MOCK_DATA=false)
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=familytree123

# Admin token for upload endpoint
ADMIN_TOKEN=dev_admin_token_12345

# Rate Limiting
RATE_LIMIT_REQUESTS=5            # Max requests per window
RATE_LIMIT_WINDOW_SECONDS=60     # Window duration in seconds
```

---

## 6. Mock Data System

When `MOCK_DATA=true`, the backend uses an embedded mock database.

### Mock Data Contents (16 Persons, 5 Generations)

| Generation | Persons |
|------------|---------|
| 1 (Great Grandparents) | William Smith Sr., Elizabeth Smith |
| 2 (Grandparents) | Robert & Mary Smith (paternal), Charles & Dorothy Johnson (maternal) |
| 3 (Parents/Aunts/Uncles) | James & Susan Smith, Michael & Patricia Smith |
| 4 (Current) | Alex Smith (me-001), Sarah (spouse), Emily (sibling), David (cousin) |
| 5 (Children) | Oliver Smith, Emma Smith |

### Repository Interface
```go
type Repository interface {
    GetTreeData(centerNodeID string, depth int) (*TreeResponse, error)
    GetPersonByID(id string) (*Person, error)
    GetImmediateFamily(id string) (*ImmediateFamily, error)
    ExecuteQuery(query string) (*QueryResponse, error)
    GetAllPersons() ([]Person, error)
    Close() error
}
```

### Factory Function
```go
func NewRepository(cfg *config.Config) (Repository, error) {
    if cfg.MockData {
        return NewMockRepository(), nil
    }
    return NewNeo4jRepository(cfg)
}
```

---

## 7. Rate Limiting Implementation

### Algorithm
In-memory sliding window with token bucket pattern.

### Features
- Tracks requests per IP address
- Automatic cleanup of stale entries (every minute)
- Returns `429 Too Many Requests` when limit exceeded
- Includes `retry_after_seconds` in response

### Response (429):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait before trying again.",
    "details": {
      "retry_after_seconds": 45,
      "limit": 5,
      "window_seconds": 60
    }
  }
}
```

---

## 8. CORS Configuration

```go
AllowOrigins: []string{
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
}
AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
AllowCredentials: true
MaxAge: 12 hours
```

---

## 9. Running the Backend

### Development (with mock data)
```bash
cd backend
export MOCK_DATA=true
go run cmd/server/main.go
```

### Development (with Neo4j)
```bash
cd backend
export MOCK_DATA=false
go run cmd/server/main.go
```

### Production Build
```bash
cd backend
go build -o family-tree-api cmd/server/main.go
./family-tree-api
```

---

## 10. Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `TREE_FETCH_ERROR` | 500 | Failed to fetch tree data |
| `NOT_FOUND` | 404 | Person not found |
| `INVALID_REQUEST` | 400 | Invalid request body or parameters |
| `EMPTY_QUERY` | 400 | Query string is empty |
| `WRITE_NOT_ALLOWED` | 403 | Write operation blocked |
| `QUERY_ERROR` | 500 | Cypher query execution failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Missing or invalid admin token |
| `FILE_REQUIRED` | 400 | CSV file not provided |
| `INVALID_FILE_TYPE` | 400 | Not a CSV file |
| `CSV_PARSE_ERROR` | 400 | Failed to parse CSV |
| `MISSING_COLUMN` | 400 | Required CSV column missing |
