#!/bin/bash
# CSV Import Script for Family Tree
# Imports persons and relationships from CSV files into Neo4j

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/../data"

PERSONS_CSV="${1:-$DATA_DIR/example_persons.csv}"
RELATIONSHIPS_CSV="${2:-$DATA_DIR/example_relationships.csv}"

NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-familytree123}"

echo "=== CSV Import Script for Family Tree ==="
echo "Persons CSV: $PERSONS_CSV"
echo "Relationships CSV: $RELATIONSHIPS_CSV"
echo "Neo4j URI: $NEO4J_URI"
echo ""

# Check if files exist
if [ ! -f "$PERSONS_CSV" ]; then
    echo "ERROR: Persons CSV file not found: $PERSONS_CSV"
    exit 1
fi

if [ ! -f "$RELATIONSHIPS_CSV" ]; then
    echo "ERROR: Relationships CSV file not found: $RELATIONSHIPS_CSV"
    exit 1
fi

# Function to execute cypher
run_cypher() {
    local query="$1"
    if command -v cypher-shell &> /dev/null; then
        echo "$query" | cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" 2>/dev/null
    else
        echo "$query" | docker exec -i family_tree_neo4j cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" 2>/dev/null
    fi
}

# Function to parse CSV field (handles quoted fields with commas)
# Usage: parse_csv_line "csv_line" field_number (0-indexed)
parse_csv_field() {
    echo "$1" | python3 -c "
import csv
import sys
reader = csv.reader([sys.stdin.read().strip()])
for row in reader:
    if len(row) > $2:
        print(row[$2])
    else:
        print('')
"
}

# Create constraints
echo "Creating constraints..."
run_cypher "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;"
run_cypher "CREATE INDEX person_name_index IF NOT EXISTS FOR (p:Person) ON (p.name);"

# Import persons
echo "Importing persons..."
PERSON_COUNT=0

# Skip header and process each line using Python for proper CSV parsing
tail -n +2 "$PERSONS_CSV" | while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines
    [ -z "$line" ] && continue

    # Parse CSV fields using Python (handles quoted fields correctly)
    id=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[0] if len(r)>0 else '')")
    name=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[1] if len(r)>1 else '')")
    aka=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[2] if len(r)>2 else '')")
    gender=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[3] if len(r)>3 else '')")
    is_alive=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[4].lower() if len(r)>4 else '')")
    birth_date=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[5] if len(r)>5 else '')")
    death_date=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[6] if len(r)>6 else '')")
    current_location=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[7] if len(r)>7 else '')")
    profession=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[8] if len(r)>8 else '')")
    photo_url=$(echo "$line" | python3 -c "import csv,sys; r=list(csv.reader([sys.stdin.read().strip()]))[0]; print(r[9] if len(r)>9 else '')")

    # Skip if no ID
    [ -z "$id" ] && continue

    # Convert is_alive to boolean
    if [ "$is_alive" = "true" ] || [ "$is_alive" = "yes" ] || [ "$is_alive" = "1" ]; then
        is_alive_val="true"
    else
        is_alive_val="false"
    fi

    # Create person node
    CYPHER="MERGE (p:Person {id: \"$id\"})
SET p.name = \"$name\",
    p.gender = \"$gender\",
    p.is_alive = $is_alive_val,
    p.birth_date = \"$birth_date\",
    p.current_location = \"$current_location\",
    p.profession = \"$profession\",
    p.photo_url = \"${photo_url:-}\""

    # Add aka if present (split by comma and create array)
    if [ -n "$aka" ]; then
        # Convert "Bill, Big Will" to ["Bill", "Big Will"]
        aka_array=$(echo "$aka" | python3 -c "import sys; parts=[p.strip() for p in sys.stdin.read().strip().split(',')]; print('[' + ', '.join(['\"'+p+'\"' for p in parts if p]) + ']')")
        CYPHER="$CYPHER SET p.aka = $aka_array"
    else
        CYPHER="$CYPHER SET p.aka = []"
    fi

    # Add death_date if present
    if [ -n "$death_date" ]; then
        CYPHER="$CYPHER SET p.death_date = \"$death_date\""
    else
        CYPHER="$CYPHER SET p.death_date = null"
    fi

    run_cypher "$CYPHER"
    echo "  Created: $name ($id)"
    PERSON_COUNT=$((PERSON_COUNT + 1))
done

echo ""
echo "Importing relationships..."

# Import relationships
tail -n +2 "$RELATIONSHIPS_CSV" | while IFS=, read -r type person1_id person2_id start_date; do
    # Clean up values
    type=$(echo "$type" | tr -d '"' | xargs)
    person1_id=$(echo "$person1_id" | tr -d '"' | xargs)
    person2_id=$(echo "$person2_id" | tr -d '"' | xargs)
    start_date=$(echo "$start_date" | tr -d '"' | xargs)

    # Skip empty lines
    [ -z "$type" ] && continue

    # Build relationship query based on type
    if [ "$type" = "SPOUSE" ] && [ -n "$start_date" ]; then
        CYPHER="MATCH (a:Person {id: \"$person1_id\"}), (b:Person {id: \"$person2_id\"})
MERGE (a)-[:SPOUSE {start_date: \"$start_date\"}]->(b);"
    elif [ "$type" = "SPOUSE" ]; then
        CYPHER="MATCH (a:Person {id: \"$person1_id\"}), (b:Person {id: \"$person2_id\"})
MERGE (a)-[:SPOUSE]->(b);"
    else
        CYPHER="MATCH (a:Person {id: \"$person1_id\"}), (b:Person {id: \"$person2_id\"})
MERGE (a)-[:$type]->(b);"
    fi

    run_cypher "$CYPHER"
    echo "  Created: $type ($person1_id -> $person2_id)"
done

echo ""
echo "=== Import Complete ==="

# Get counts
TOTAL_PERSONS=$(run_cypher "MATCH (n:Person) RETURN count(n) as count;" | tail -1)
TOTAL_RELS=$(run_cypher "MATCH ()-[r]->() RETURN count(r) as count;" | tail -1)

echo "Total persons: $TOTAL_PERSONS"
echo "Total relationships: $TOTAL_RELS"
