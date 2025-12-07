# Data Import Guide

This guide explains how to import your family data into the Family Tree Explorer application.

## Overview

Family data is imported using CSV files and a shell script that loads the data into Neo4j. The import process consists of two CSV files:
1. **Persons CSV** - Contains information about each family member
2. **Relationships CSV** - Defines how family members are connected

## Prerequisites

- Docker running with the Family Tree services (`docker compose up -d`)
- Python 3 installed (for CSV parsing)
- Bash shell

## Quick Start

```bash
# 1. Start the services
docker compose up -d

# 2. Prepare your CSV files (see format below)
# Place them in the data/ directory

# 3. Run the import script
./scripts/csv_import.sh data/your_persons.csv data/your_relationships.csv

# 4. Verify import
curl http://localhost:8080/api/persons
```

## CSV File Formats

### Persons CSV

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `id` | string | Yes | Unique identifier for the person | `person-001`, `me-001` |
| `name` | string | Yes | Full name | `John Smith` |
| `aka` | string | No | Nicknames/aliases (comma-separated in quotes) | `"Johnny, JD"` |
| `gender` | string | Yes | Gender | `Male`, `Female`, `Other` |
| `is_alive` | boolean | Yes | Whether person is living | `TRUE`, `FALSE` |
| `birth_date` | date | Yes | Birth date (YYYY-MM-DD) | `1985-09-25` |
| `death_date` | date | No | Death date if deceased | `2020-03-15` |
| `current_location` | string | No | Current/last known location | `San Francisco USA` |
| `profession` | string | No | Occupation/profession | `Software Developer` |
| `photo_url` | string | No | URL to photo | `https://...` |

**Example:**
```csv
id,name,aka,gender,is_alive,birth_date,death_date,current_location,profession,photo_url
grandpa-001,Robert Smith,"Bob, Grandpa",Male,FALSE,1930-03-15,2010-08-20,Boston USA,Teacher,
grandma-001,Mary Smith,,Female,FALSE,1932-07-22,2015-12-10,Boston USA,Nurse,
dad-001,James Smith,"Jim, Jimmy",Male,TRUE,1955-11-08,,New York USA,Engineer,
mom-001,Susan Smith,,Female,TRUE,1958-04-12,,New York USA,Doctor,
me-001,Alex Smith,"Al, Lexi",Male,TRUE,1985-09-25,,San Francisco USA,Software Developer,
spouse-001,Sarah Smith,,Female,TRUE,1987-07-10,,San Francisco USA,Designer,
child-001,Oliver Smith,Ollie,Male,TRUE,2015-02-14,,San Francisco USA,Student,
```

### Relationships CSV

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `type` | string | Yes | Relationship type | `SPOUSE`, `PARENT_CHILD`, `SIBLING` |
| `person1_id` | string | Yes | First person's ID | `dad-001` |
| `person2_id` | string | Yes | Second person's ID | `me-001` |
| `start_date` | date | No | Relationship start (marriages only) | `2012-06-15` |

**Relationship Types:**

| Type | Direction | Description |
|------|-----------|-------------|
| `SPOUSE` | Bidirectional | Marriage relationship |
| `PARENT_CHILD` | Parent → Child | Parent to child relationship |
| `SIBLING` | Bidirectional | Sibling relationship |

**Example:**
```csv
type,person1_id,person2_id,start_date
SPOUSE,grandpa-001,grandma-001,1952-06-20
SPOUSE,dad-001,mom-001,1980-05-15
SPOUSE,me-001,spouse-001,2012-06-15
PARENT_CHILD,grandpa-001,dad-001,
PARENT_CHILD,grandma-001,dad-001,
PARENT_CHILD,dad-001,me-001,
PARENT_CHILD,mom-001,me-001,
PARENT_CHILD,me-001,child-001,
PARENT_CHILD,spouse-001,child-001,
SIBLING,me-001,sibling-001,
```

## ID Naming Convention

Use a consistent naming convention for person IDs:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `me-` | The primary person (you) | `me-001` |
| `spouse-` | Spouse | `spouse-001` |
| `child-` | Children | `child-001`, `child-002` |
| `dad-` | Father | `dad-001` |
| `mom-` | Mother | `mom-001` |
| `sibling-` | Siblings | `sibling-001` |
| `gp-` | Grandparent (paternal) | `gp-001` |
| `gm-` | Grandmother | `gm-001` |
| `ggp-` | Great-grandparent | `ggp-001` |
| `uncle-` | Uncle | `uncle-001` |
| `aunt-` | Aunt | `aunt-001` |
| `cousin-` | Cousin | `cousin-001` |

**Note:** The `me-001` ID is special - the application centers the tree view on this person by default.

## Import Script Usage

### Basic Usage

```bash
# Using default files (data/example_persons.csv and data/example_relationships.csv)
./scripts/csv_import.sh

# Using custom files
./scripts/csv_import.sh path/to/persons.csv path/to/relationships.csv
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j connection URI |
| `NEO4J_USER` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `familytree123` | Neo4j password |

**Example with custom Neo4j credentials:**
```bash
NEO4J_USER=myuser NEO4J_PASSWORD=mypassword ./scripts/csv_import.sh
```

### What the Script Does

1. **Creates constraints** - Ensures unique person IDs
2. **Creates indexes** - Speeds up name searches
3. **Imports persons** - Creates Person nodes in Neo4j
4. **Imports relationships** - Creates SPOUSE, PARENT_CHILD, SIBLING edges
5. **Reports counts** - Shows total persons and relationships created

## Clearing Existing Data

To start fresh before importing:

```bash
# Clear all data
docker exec -i family_tree_neo4j cypher-shell -u neo4j -p familytree123 \
  "MATCH (n) DETACH DELETE n;"

# Then run import
./scripts/csv_import.sh
```

## Verifying Import

### Via API

```bash
# Count persons
curl -s http://localhost:8080/api/persons | jq '.count'

# Get specific person
curl -s http://localhost:8080/api/person/me-001 | jq

# Get tree data
curl -s "http://localhost:8080/api/tree?centerNodeId=me-001&depth=2" | jq
```

### Via Neo4j Browser

1. Open http://localhost:7474
2. Login with `neo4j` / `familytree123`
3. Run queries:

```cypher
// Count all persons
MATCH (p:Person) RETURN count(p)

// View all relationships
MATCH (a)-[r]->(b) RETURN a.name, type(r), b.name LIMIT 50

// Find specific person
MATCH (p:Person {id: 'me-001'}) RETURN p

// Get family tree for a person
MATCH (p:Person {id: 'me-001'})-[r*1..2]-(related)
RETURN p, r, related
```

## Template Files

Template CSV files are provided in the `data/` directory:

```
data/
├── template_persons.csv        # Empty template for persons
├── template_relationships.csv  # Empty template for relationships
├── example_persons.csv         # Sample data (35 persons)
└── example_relationships.csv   # Sample relationships (64 relationships)
```

Copy the templates to start your own family tree:
```bash
cp data/template_persons.csv data/my_family_persons.csv
cp data/template_relationships.csv data/my_family_relationships.csv
```

## Tips for Building Your Family Tree

### 1. Start with Yourself
Begin by creating your own entry as `me-001`, then work outward.

### 2. Work by Generation
- Start with your generation (you, siblings, spouse)
- Add parents
- Add grandparents
- Add aunts, uncles, cousins
- Add children

### 3. Double-Check Parent Relationships
Each child needs **two** PARENT_CHILD entries (one from each parent):
```csv
PARENT_CHILD,dad-001,child-001,
PARENT_CHILD,mom-001,child-001,
```

### 4. Add Sibling Relationships
While the app can infer siblings from shared parents, explicit SIBLING relationships improve performance:
```csv
SIBLING,me-001,sibling-001,
SIBLING,me-001,sibling-002,
SIBLING,sibling-001,sibling-002,
```

### 5. Handle Multiple Marriages
For divorced/remarried individuals:
- Create separate spouse entries
- Add marriage dates to differentiate
- Children are linked to biological parents

```csv
SPOUSE,dad-001,mom-001,1980-05-15
SPOUSE,dad-001,stepmom-001,1995-08-20
```

### 6. AKA Field for Nicknames
Use the AKA field for nicknames and alternative names:
```csv
grandma-001,Mary Elizabeth Smith,"Grandma, Nana, Grammy",Female,...
```

## Troubleshooting

### "Person not found" errors
- Ensure person IDs in relationships match exactly with persons CSV
- IDs are case-sensitive

### Data appears wrong/shifted
- Check for unquoted commas in fields
- The AKA field should be quoted if it contains commas: `"Nick1, Nick2"`

### Import script hangs
- Ensure Neo4j container is running: `docker compose ps`
- Check Neo4j logs: `docker logs family_tree_neo4j`

### Frontend shows "No Family Data"
- Verify backend is connected to Neo4j (not mock data)
- Check backend logs: `docker logs family_tree_backend`
- Ensure `MOCK_DATA` is not set to `true`

## Advanced: Direct Cypher Import

For advanced users, you can import data directly via Cypher:

```cypher
// Create a person
CREATE (p:Person {
  id: 'person-001',
  name: 'John Doe',
  gender: 'Male',
  is_alive: true,
  birth_date: '1985-01-15',
  current_location: 'New York USA',
  profession: 'Engineer',
  aka: ['Johnny', 'JD']
})

// Create a relationship
MATCH (parent:Person {id: 'dad-001'})
MATCH (child:Person {id: 'me-001'})
CREATE (parent)-[:PARENT_CHILD]->(child)

// Create marriage with date
MATCH (a:Person {id: 'me-001'})
MATCH (b:Person {id: 'spouse-001'})
CREATE (a)-[:SPOUSE {start_date: '2012-06-15'}]->(b)
```

## Need Help?

- Check the [AI_docs/database.md](../AI_docs/database.md) for Neo4j schema details
- See [AI_docs/backend.md](../AI_docs/backend.md) for API documentation
- Review the example data in `data/example_*.csv` for reference
