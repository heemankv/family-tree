#!/bin/bash
# Neo4j Clean Wipe Script
# This script deletes ALL nodes and relationships from the Neo4j database
# Supports both local Docker and Neo4j Aura (cloud)

NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-familytree123}"

echo "=== Neo4j Clean Wipe Script ==="
echo "URI: $NEO4J_URI"
echo "User: $NEO4J_USER"
echo ""

CLEAN_SCRIPT='MATCH (n) DETACH DELETE n;'

# Check if URI is remote (Aura or other cloud)
if [[ "$NEO4J_URI" == neo4j+s://* ]] || [[ "$NEO4J_URI" == neo4j+ssc://* ]] || [[ "$NEO4J_URI" == bolt+s://* ]]; then
    echo "Connecting to remote Neo4j (Aura)..."
    if command -v cypher-shell &> /dev/null; then
        echo "$CLEAN_SCRIPT" | cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD"
    else
        echo "ERROR: cypher-shell not found. Install it with: brew install cypher-shell"
        echo "Or download from: https://neo4j.com/download-center/#cypher-shell"
        exit 1
    fi
elif command -v cypher-shell &> /dev/null; then
    echo "Using local cypher-shell..."
    echo "$CLEAN_SCRIPT" | cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD"
else
    echo "Using Docker to run cypher-shell..."
    echo "$CLEAN_SCRIPT" | docker exec -i family_tree_neo4j cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "SUCCESS: All nodes and relationships have been deleted."
else
    echo ""
    echo "ERROR: Failed to clean database. Check connection settings."
    exit 1
fi
