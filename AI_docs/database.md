# Database Documentation: Neo4j Graph Model

## 1. Database Choice: Neo4j

We are using **Neo4j Community Edition 5.15.0** running in Docker for local development. For production, Neo4j AuraDB (cloud) is recommended.

### Why Neo4j?

Family trees are naturally graph-based. Queries like "Find all cousins" or "Find the shortest path between Person A and Person B" are:
- **SQL**: Computationally expensive (requires recursive CTEs/joins)
- **Neo4j**: Trivial and instant (native graph traversal)

### Connection Details (Local)
- **Bolt URI**: `bolt://localhost:7687`
- **HTTP Browser**: `http://localhost:7474`
- **Username**: `neo4j`
- **Password**: `familytree123`

---

## 2. Node Labels & Properties

### Node Label: `:Person`

Every individual in the tree is a node with the label `:Person`.

| Property Key | Data Type | Description | Required |
|--------------|-----------|-------------|----------|
| `id` | String | Unique identifier (e.g., "me-001") | Yes |
| `name` | String | Full name of the individual | Yes |
| `gender` | String | "Male", "Female", "Other" | Yes |
| `is_alive` | Boolean | Determines if "Late" badge is shown | Yes |
| `birth_date` | String | "YYYY-MM-DD" format | Yes |
| `death_date` | String | "YYYY-MM-DD" or null if alive | No |
| `current_location` | String | "City, Country" format | Yes |
| `profession` | String | Job title or "Retired", "Student" | Yes |
| `photo_url` | String | URL to image or empty string | Yes |

### Example Node
```cypher
CREATE (p:Person {
  id: "me-001",
  name: "Alex Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "1985-09-25",
  death_date: null,
  current_location: "San Francisco, USA",
  profession: "Software Developer",
  photo_url: ""
})
```

---

## 3. Relationships (Edges)

### `:PARENT_CHILD`

**Direction**: From Parent TO Child

```
(Parent:Person)-[:PARENT_CHILD]->(Child:Person)
```

**Properties**: None

**Usage**: Primary structural relationship. A person typically has 2 incoming PARENT_CHILD relationships (from mother and father).

### `:SPOUSE`

**Direction**: From one spouse TO the other (query bidirectionally)

```
(Person1:Person)-[:SPOUSE {start_date: "1980-09-20"}]->(Person2:Person)
```

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| `start_date` | String | Marriage date ("YYYY-MM-DD") |
| `end_date` | String | Divorce/death date (optional) |

**Usage**: Defines horizontal connections on the tree.

### `:SIBLING`

**Direction**: Bidirectional (create one direction, query both)

```
(Person1:Person)-[:SIBLING]->(Person2:Person)
```

**Properties**: None

**Usage**: While siblings can be inferred from shared parents, explicit SIBLING relationships optimize traversal performance for visualization.

---

## 4. Database Constraints & Indexes

Run these in Neo4j Browser after database creation:

```cypher
// Unique constraint on Person id
CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.id IS UNIQUE;

// Index for name searches
CREATE INDEX person_name_index IF NOT EXISTS
FOR (p:Person) ON (p.name);

// Index for date-based queries
CREATE INDEX person_birth_date_index IF NOT EXISTS
FOR (p:Person) ON (p.birth_date);
```

---

## 5. Sample Data Structure

The seed script creates a 5-generation family tree:

```
Generation 1: Great Grandparents
├── William Smith Sr. (ggp-001) ═══ Elizabeth Smith (ggm-001)
│
Generation 2: Grandparents
├── Robert Smith (gp-001) ═══ Mary Smith (gm-001)     [Paternal]
├── Charles Johnson (gp-002) ═══ Dorothy Johnson (gm-002) [Maternal]
│
Generation 3: Parents / Aunts / Uncles
├── James Smith (dad-001) ═══ Susan Smith (mom-001)
├── Michael Smith (uncle-001) ═══ Patricia Smith (aunt-001)
│
Generation 4: Current Generation
├── Alex Smith (me-001) ═══ Sarah Smith (spouse-001)
├── Emily Smith (sibling-001)
├── David Smith (cousin-001)
│
Generation 5: Children
├── Oliver Smith (child-001)
├── Emma Smith (child-002)
```

**Totals**: 16 persons, 28 relationships

---

## 6. Cypher Queries Used by Backend

### Get Tree Data (with depth traversal)
```cypher
MATCH (center:Person {id: $centerId})
OPTIONAL MATCH path = (center)-[*1..2]-(related:Person)
WITH collect(DISTINCT center) + collect(DISTINCT related) AS allNodes
UNWIND allNodes AS n
WITH DISTINCT n
WITH collect(n) AS nodes
UNWIND nodes AS n1
UNWIND nodes AS n2
OPTIONAL MATCH (n1)-[rel:PARENT_CHILD|SPOUSE|SIBLING]->(n2)
WHERE rel IS NOT NULL
WITH nodes, collect(DISTINCT {
  source: n1.id, 
  target: n2.id, 
  type: type(rel), 
  start_date: rel.start_date, 
  end_date: rel.end_date
}) AS rels
RETURN nodes, rels
```

### Get Person by ID
```cypher
MATCH (p:Person {id: $id}) 
RETURN p
```

### Get Immediate Family
```cypher
MATCH (p:Person {id: $id})
OPTIONAL MATCH (p)-[:SPOUSE]-(spouse:Person)
OPTIONAL MATCH (p)<-[:PARENT_CHILD]-(parent:Person)
OPTIONAL MATCH (p)-[:PARENT_CHILD]->(child:Person)
OPTIONAL MATCH (p)-[:SIBLING]-(sibling:Person)
RETURN p, spouse, 
       collect(DISTINCT parent) AS parents,
       collect(DISTINCT child) AS children, 
       collect(DISTINCT sibling) AS siblings
```

### Get All Persons
```cypher
MATCH (p:Person) RETURN p
```

### Find Cousins
```cypher
MATCH (p:Person {id: $personId})
      <-[:PARENT_CHILD]-(parent)
      <-[:SIBLING]-(aunt_uncle)
      -[:PARENT_CHILD]->(cousin)
RETURN cousin
```

### Find Path Between Two People
```cypher
MATCH path = shortestPath(
  (a:Person {id: $personA})-[*]-(b:Person {id: $personB})
)
RETURN path
```

---

## 7. ID Naming Convention

| Prefix | Meaning | Example |
|--------|---------|---------|
| `ggp-` | Great Grandparent | `ggp-001` |
| `ggm-` | Great Grandmother | `ggm-001` |
| `gp-` | Grandparent (male) | `gp-001` |
| `gm-` | Grandmother | `gm-001` |
| `dad-` | Father | `dad-001` |
| `mom-` | Mother | `mom-001` |
| `uncle-` | Uncle | `uncle-001` |
| `aunt-` | Aunt | `aunt-001` |
| `me-` | Self (central person) | `me-001` |
| `spouse-` | Spouse | `spouse-001` |
| `sibling-` | Sibling | `sibling-001` |
| `cousin-` | Cousin | `cousin-001` |
| `child-` | Child | `child-001` |

---

## 8. Data Integrity Rules

1. **Every person must have a unique `id`** - Enforced by constraint
2. **PARENT_CHILD direction**: Always Parent → Child
3. **SPOUSE relationships**: Create once, query bidirectionally with `-[:SPOUSE]-`
4. **Birth/death dates**: Use ISO format "YYYY-MM-DD" or null
5. **Photo URLs**: Empty string if no photo (frontend renders default avatar)

---

## 9. Performance Considerations

### For Large Trees (1000+ nodes)

1. **Limit depth in queries**: Never fetch more than 3 levels at once
2. **Use indexes**: Name and birth_date indexes for search
3. **Paginate results**: Use SKIP/LIMIT in Cypher
4. **Cache common queries**: Consider Redis for frequently accessed paths

### Query Optimization Tips

```cypher
// GOOD: Use parameters
MATCH (p:Person {id: $id}) RETURN p

// BAD: String concatenation
MATCH (p:Person {id: "me-001"}) RETURN p

// GOOD: Limit depth explicitly
MATCH path = (center)-[*1..3]-(related)

// BAD: Unlimited traversal
MATCH path = (center)-[*]-(related)
```

---

## 10. Backup & Recovery

### Export Data
```cypher
// Export all nodes
CALL apoc.export.json.all("family_tree_backup.json", {useTypes: true})

// Or use neo4j-admin for full backup
```

### Import Data
```cypher
// Import from JSON
CALL apoc.import.json("family_tree_backup.json")
```

### Using Scripts
```bash
# Clean database
./scripts/neo4j_clean.sh

# Re-seed sample data
./scripts/neo4j_seed.sh
```
