#!/bin/bash
# Neo4j Clean Wipe Script
# This script deletes ALL nodes and relationships from the Neo4j database

NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-familytree123}"

echo "=== Neo4j Clean Wipe Script ==="
echo "URI: $NEO4J_URI"
echo "User: $NEO4J_USER"
echo ""

# Check if cypher-shell is available (Docker)
if command -v cypher-shell &> /dev/null; then
    echo "Using cypher-shell..."
    cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" <<EOF
// Delete all relationships and nodes
MATCH (n) DETACH DELETE n;
EOF
else
    # Use Docker to run cypher-shell
    echo "Using Docker to run cypher-shell..."
    docker exec -i family_tree_neo4j cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" <<EOF
// Delete all relationships and nodes
MATCH (n) DETACH DELETE n;
EOF
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "SUCCESS: All nodes and relationships have been deleted."
else
    echo ""
    echo "ERROR: Failed to clean database. Check connection settings."
    exit 1
fi
