#!/bin/bash
# Backend API Test Script
# Tests the backend API endpoints

API_URL="${API_URL:-http://localhost:8080}"

echo "=== Backend API Test Script ==="
echo "API URL: $API_URL"
echo ""

# Health check
echo "1. Health Check"
echo "   GET /health"
HEALTH=$(curl -s "$API_URL/health")
echo "   Response: $HEALTH"
echo ""

# Get all persons
echo "2. Get All Persons"
echo "   GET /api/persons"
PERSONS=$(curl -s "$API_URL/api/persons")
COUNT=$(echo "$PERSONS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   Total persons: $COUNT"
echo ""

# Get tree data (requires centerNodeId)
echo "3. Get Tree Data"
CENTER_ID="${CENTER_ID:-me-001}"
echo "   GET /api/tree?centerNodeId=$CENTER_ID&depth=2"
TREE=$(curl -s "$API_URL/api/tree?centerNodeId=$CENTER_ID&depth=2")
NODE_COUNT=$(echo "$TREE" | grep -o '"id"' | wc -l | tr -d ' ')
echo "   Nodes in tree: $NODE_COUNT"
echo ""

# Get specific person
echo "4. Get Person by ID"
echo "   GET /api/person/$CENTER_ID"
PERSON=$(curl -s "$API_URL/api/person/$CENTER_ID")
NAME=$(echo "$PERSON" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Person name: $NAME"
echo ""

# Get person's family
echo "5. Get Person's Family"
echo "   GET /api/person/$CENTER_ID/family"
FAMILY=$(curl -s "$API_URL/api/person/$CENTER_ID/family")
echo "   Response received: $(echo "$FAMILY" | wc -c | tr -d ' ') bytes"
echo ""

echo "=== Tests Complete ==="
