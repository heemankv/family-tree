#!/bin/bash
# Neo4j Seed Data Script
# This script inserts sample family tree data into Neo4j

NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-familytree123}"

echo "=== Neo4j Seed Data Script ==="
echo "URI: $NEO4J_URI"
echo "User: $NEO4J_USER"
echo ""

# The Cypher script to seed data
CYPHER_SCRIPT='
// ============================================
// Create Constraints and Indexes
// ============================================
CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.id IS UNIQUE;

CREATE INDEX person_name_index IF NOT EXISTS
FOR (p:Person) ON (p.name);

// ============================================
// Generation 1: Great Grandparents (Paternal - Dad side)
// ============================================
CREATE (ggp1:Person {
  id: "ggp-001",
  name: "William Smith Sr.",
  gender: "Male",
  is_alive: false,
  birth_date: "1900-01-15",
  death_date: "1975-03-20",
  current_location: "Boston, USA",
  profession: "Farmer",
  photo_url: ""
});

CREATE (ggm1:Person {
  id: "ggm-001",
  name: "Elizabeth Smith",
  gender: "Female",
  is_alive: false,
  birth_date: "1905-06-22",
  death_date: "1980-11-10",
  current_location: "Boston, USA",
  profession: "Homemaker",
  photo_url: ""
});

// ============================================
// Generation 1: Great Grandparents (Maternal - Mom side)
// ============================================
CREATE (ggp2:Person {
  id: "ggp-002",
  name: "Henry Johnson",
  gender: "Male",
  is_alive: false,
  birth_date: "1898-05-10",
  death_date: "1970-12-05",
  current_location: "Chicago, USA",
  profession: "Factory Worker",
  photo_url: ""
});

CREATE (ggm2:Person {
  id: "ggm-002",
  name: "Margaret Johnson",
  gender: "Female",
  is_alive: false,
  birth_date: "1902-08-18",
  death_date: "1985-04-22",
  current_location: "Chicago, USA",
  profession: "Seamstress",
  photo_url: ""
});

// ============================================
// Generation 2: Grandparents (Paternal - Dad side)
// ============================================
CREATE (gp1:Person {
  id: "gp-001",
  name: "Robert Smith",
  gender: "Male",
  is_alive: false,
  birth_date: "1930-03-15",
  death_date: "2010-08-20",
  current_location: "Boston, USA",
  profession: "Teacher",
  photo_url: ""
});

CREATE (gm1:Person {
  id: "gm-001",
  name: "Mary Smith",
  gender: "Female",
  is_alive: false,
  birth_date: "1932-07-22",
  death_date: "2015-12-10",
  current_location: "Boston, USA",
  profession: "Nurse",
  photo_url: ""
});

// ============================================
// Generation 2: Grandparents (Maternal - Mom side)
// ============================================
CREATE (gp2:Person {
  id: "gp-002",
  name: "Charles Johnson",
  gender: "Male",
  is_alive: false,
  birth_date: "1928-09-05",
  death_date: "2005-04-15",
  current_location: "Chicago, USA",
  profession: "Accountant",
  photo_url: ""
});

CREATE (gm2:Person {
  id: "gm-002",
  name: "Dorothy Johnson",
  gender: "Female",
  is_alive: false,
  birth_date: "1930-12-18",
  death_date: "2018-07-25",
  current_location: "Chicago, USA",
  profession: "Librarian",
  photo_url: ""
});

// ============================================
// Generation 3: Parents
// ============================================
CREATE (dad:Person {
  id: "dad-001",
  name: "James Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "1955-11-08",
  death_date: null,
  current_location: "New York, USA",
  profession: "Engineer",
  photo_url: ""
});

CREATE (mom:Person {
  id: "mom-001",
  name: "Susan Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "1958-04-12",
  death_date: null,
  current_location: "New York, USA",
  profession: "Doctor",
  photo_url: ""
});

// ============================================
// Generation 3: Dad side Uncle/Aunt (Paternal)
// ============================================
CREATE (uncle1:Person {
  id: "uncle-001",
  name: "Michael Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "1958-02-20",
  death_date: null,
  current_location: "Los Angeles, USA",
  profession: "Architect",
  photo_url: ""
});

CREATE (aunt1:Person {
  id: "aunt-001",
  name: "Patricia Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "1960-08-14",
  death_date: null,
  current_location: "Los Angeles, USA",
  profession: "Artist",
  photo_url: ""
});

CREATE (aunt2:Person {
  id: "aunt-002",
  name: "Linda Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "1962-06-25",
  death_date: null,
  current_location: "Denver, USA",
  profession: "Teacher",
  photo_url: ""
});

CREATE (uncle2:Person {
  id: "uncle-002",
  name: "Richard Brown",
  gender: "Male",
  is_alive: true,
  birth_date: "1960-01-30",
  death_date: null,
  current_location: "Denver, USA",
  profession: "Contractor",
  photo_url: ""
});

// ============================================
// Generation 3: Mom side Uncle/Aunt (Maternal)
// ============================================
CREATE (uncle3:Person {
  id: "uncle-003",
  name: "Thomas Johnson",
  gender: "Male",
  is_alive: true,
  birth_date: "1955-09-14",
  death_date: null,
  current_location: "Houston, USA",
  profession: "Lawyer",
  photo_url: ""
});

CREATE (aunt3:Person {
  id: "aunt-003",
  name: "Jennifer Johnson",
  gender: "Female",
  is_alive: true,
  birth_date: "1957-11-22",
  death_date: null,
  current_location: "Houston, USA",
  profession: "Real Estate Agent",
  photo_url: ""
});

CREATE (aunt4:Person {
  id: "aunt-004",
  name: "Barbara Johnson",
  gender: "Female",
  is_alive: true,
  birth_date: "1962-03-08",
  death_date: null,
  current_location: "Miami, USA",
  profession: "Chef",
  photo_url: ""
});

CREATE (uncle4:Person {
  id: "uncle-004",
  name: "George Martinez",
  gender: "Male",
  is_alive: true,
  birth_date: "1959-07-19",
  death_date: null,
  current_location: "Miami, USA",
  profession: "Restaurant Owner",
  photo_url: ""
});

// ============================================
// Generation 4: Me and Siblings
// ============================================
CREATE (me:Person {
  id: "me-001",
  name: "Alex Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "1985-09-25",
  death_date: null,
  current_location: "San Francisco, USA",
  profession: "Software Developer",
  photo_url: ""
});

CREATE (spouse:Person {
  id: "spouse-001",
  name: "Sarah Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "1987-07-10",
  death_date: null,
  current_location: "San Francisco, USA",
  profession: "Designer",
  photo_url: ""
});

CREATE (sibling1:Person {
  id: "sibling-001",
  name: "Emily Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "1988-03-17",
  death_date: null,
  current_location: "Boston, USA",
  profession: "Marketing Manager",
  photo_url: ""
});

CREATE (sibling2:Person {
  id: "sibling-002",
  name: "Daniel Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "1990-12-05",
  death_date: null,
  current_location: "Austin, USA",
  profession: "Musician",
  photo_url: ""
});

// ============================================
// Generation 4: Dad side Cousins (from Uncle Michael)
// ============================================
CREATE (cousin1:Person {
  id: "cousin-001",
  name: "David Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "1986-05-30",
  death_date: null,
  current_location: "Seattle, USA",
  profession: "Data Scientist",
  photo_url: ""
});

CREATE (cousin2:Person {
  id: "cousin-002",
  name: "Jessica Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "1989-08-15",
  death_date: null,
  current_location: "Portland, USA",
  profession: "Veterinarian",
  photo_url: ""
});

// ============================================
// Generation 4: Dad side Cousins (from Aunt Linda)
// ============================================
CREATE (cousin3:Person {
  id: "cousin-003",
  name: "Ryan Brown",
  gender: "Male",
  is_alive: true,
  birth_date: "1987-02-28",
  death_date: null,
  current_location: "Denver, USA",
  profession: "Pilot",
  photo_url: ""
});

CREATE (cousin4:Person {
  id: "cousin-004",
  name: "Ashley Brown",
  gender: "Female",
  is_alive: true,
  birth_date: "1991-10-12",
  death_date: null,
  current_location: "Phoenix, USA",
  profession: "Nurse",
  photo_url: ""
});

// ============================================
// Generation 4: Mom side Cousins (from Uncle Thomas)
// ============================================
CREATE (cousin5:Person {
  id: "cousin-005",
  name: "Matthew Johnson",
  gender: "Male",
  is_alive: true,
  birth_date: "1984-04-20",
  death_date: null,
  current_location: "Houston, USA",
  profession: "Investment Banker",
  photo_url: ""
});

CREATE (cousin6:Person {
  id: "cousin-006",
  name: "Sophia Johnson",
  gender: "Female",
  is_alive: true,
  birth_date: "1988-07-14",
  death_date: null,
  current_location: "Dallas, USA",
  profession: "Architect",
  photo_url: ""
});

// ============================================
// Generation 4: Mom side Cousins (from Aunt Barbara)
// ============================================
CREATE (cousin7:Person {
  id: "cousin-007",
  name: "Carlos Martinez",
  gender: "Male",
  is_alive: true,
  birth_date: "1990-01-05",
  death_date: null,
  current_location: "Miami, USA",
  profession: "Marine Biologist",
  photo_url: ""
});

CREATE (cousin8:Person {
  id: "cousin-008",
  name: "Isabella Martinez",
  gender: "Female",
  is_alive: true,
  birth_date: "1993-09-18",
  death_date: null,
  current_location: "Orlando, USA",
  profession: "Event Planner",
  photo_url: ""
});

// ============================================
// Generation 5: My Children
// ============================================
CREATE (child1:Person {
  id: "child-001",
  name: "Oliver Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "2015-02-14",
  death_date: null,
  current_location: "San Francisco, USA",
  profession: "Student",
  photo_url: ""
});

CREATE (child2:Person {
  id: "child-002",
  name: "Emma Smith",
  gender: "Female",
  is_alive: true,
  birth_date: "2018-08-22",
  death_date: null,
  current_location: "San Francisco, USA",
  profession: "Student",
  photo_url: ""
});

// ============================================
// Generation 5: Cousin David s Children
// ============================================
CREATE (child3:Person {
  id: "child-003",
  name: "Ethan Smith",
  gender: "Male",
  is_alive: true,
  birth_date: "2016-06-10",
  death_date: null,
  current_location: "Seattle, USA",
  profession: "Student",
  photo_url: ""
});

// ============================================
// Generation 5: Cousin Matthew s Children
// ============================================
CREATE (child4:Person {
  id: "child-004",
  name: "Lily Johnson",
  gender: "Female",
  is_alive: true,
  birth_date: "2014-11-30",
  death_date: null,
  current_location: "Houston, USA",
  profession: "Student",
  photo_url: ""
});

CREATE (child5:Person {
  id: "child-005",
  name: "Noah Johnson",
  gender: "Male",
  is_alive: true,
  birth_date: "2017-03-25",
  death_date: null,
  current_location: "Houston, USA",
  profession: "Student",
  photo_url: ""
});

// ============================================
// Create Relationships
// ============================================

// === Great Grandparents Marriages ===
MATCH (ggp:Person {id: "ggp-001"}), (ggm:Person {id: "ggm-001"})
CREATE (ggp)-[:SPOUSE {start_date: "1925-06-10"}]->(ggm);

MATCH (ggp:Person {id: "ggp-002"}), (ggm:Person {id: "ggm-002"})
CREATE (ggp)-[:SPOUSE {start_date: "1922-04-15"}]->(ggm);

// === Great Grandparents -> Grandparents ===
// Paternal
MATCH (ggp:Person {id: "ggp-001"}), (gp:Person {id: "gp-001"})
CREATE (ggp)-[:PARENT_CHILD]->(gp);
MATCH (ggm:Person {id: "ggm-001"}), (gp:Person {id: "gp-001"})
CREATE (ggm)-[:PARENT_CHILD]->(gp);

// Maternal
MATCH (ggp:Person {id: "ggp-002"}), (gp:Person {id: "gp-002"})
CREATE (ggp)-[:PARENT_CHILD]->(gp);
MATCH (ggm:Person {id: "ggm-002"}), (gp:Person {id: "gp-002"})
CREATE (ggm)-[:PARENT_CHILD]->(gp);

// === Grandparents Marriages ===
MATCH (gp:Person {id: "gp-001"}), (gm:Person {id: "gm-001"})
CREATE (gp)-[:SPOUSE {start_date: "1952-06-15"}]->(gm);

MATCH (gp:Person {id: "gp-002"}), (gm:Person {id: "gm-002"})
CREATE (gp)-[:SPOUSE {start_date: "1950-09-20"}]->(gm);

// === Grandparents -> Parents & Uncles/Aunts ===
// Paternal side (gp-001 & gm-001)
MATCH (gp:Person {id: "gp-001"}), (p:Person {id: "dad-001"})
CREATE (gp)-[:PARENT_CHILD]->(p);
MATCH (gm:Person {id: "gm-001"}), (p:Person {id: "dad-001"})
CREATE (gm)-[:PARENT_CHILD]->(p);

MATCH (gp:Person {id: "gp-001"}), (p:Person {id: "uncle-001"})
CREATE (gp)-[:PARENT_CHILD]->(p);
MATCH (gm:Person {id: "gm-001"}), (p:Person {id: "uncle-001"})
CREATE (gm)-[:PARENT_CHILD]->(p);

MATCH (gp:Person {id: "gp-001"}), (p:Person {id: "aunt-002"})
CREATE (gp)-[:PARENT_CHILD]->(p);
MATCH (gm:Person {id: "gm-001"}), (p:Person {id: "aunt-002"})
CREATE (gm)-[:PARENT_CHILD]->(p);

// Maternal side (gp-002 & gm-002)
MATCH (gp:Person {id: "gp-002"}), (p:Person {id: "mom-001"})
CREATE (gp)-[:PARENT_CHILD]->(p);
MATCH (gm:Person {id: "gm-002"}), (p:Person {id: "mom-001"})
CREATE (gm)-[:PARENT_CHILD]->(p);

MATCH (gp:Person {id: "gp-002"}), (p:Person {id: "uncle-003"})
CREATE (gp)-[:PARENT_CHILD]->(p);
MATCH (gm:Person {id: "gm-002"}), (p:Person {id: "uncle-003"})
CREATE (gm)-[:PARENT_CHILD]->(p);

MATCH (gp:Person {id: "gp-002"}), (p:Person {id: "aunt-004"})
CREATE (gp)-[:PARENT_CHILD]->(p);
MATCH (gm:Person {id: "gm-002"}), (p:Person {id: "aunt-004"})
CREATE (gm)-[:PARENT_CHILD]->(p);

// === Parents Marriage ===
MATCH (dad:Person {id: "dad-001"}), (mom:Person {id: "mom-001"})
CREATE (dad)-[:SPOUSE {start_date: "1980-09-20"}]->(mom);

// === Uncle/Aunt Marriages ===
MATCH (u:Person {id: "uncle-001"}), (a:Person {id: "aunt-001"})
CREATE (u)-[:SPOUSE {start_date: "1985-04-12"}]->(a);

MATCH (a:Person {id: "aunt-002"}), (u:Person {id: "uncle-002"})
CREATE (a)-[:SPOUSE {start_date: "1984-08-20"}]->(u);

MATCH (u:Person {id: "uncle-003"}), (a:Person {id: "aunt-003"})
CREATE (u)-[:SPOUSE {start_date: "1982-05-15"}]->(a);

MATCH (a:Person {id: "aunt-004"}), (u:Person {id: "uncle-004"})
CREATE (a)-[:SPOUSE {start_date: "1986-11-08"}]->(u);

// === Parents -> Me and Siblings ===
MATCH (dad:Person {id: "dad-001"}), (me:Person {id: "me-001"})
CREATE (dad)-[:PARENT_CHILD]->(me);
MATCH (mom:Person {id: "mom-001"}), (me:Person {id: "me-001"})
CREATE (mom)-[:PARENT_CHILD]->(me);

MATCH (dad:Person {id: "dad-001"}), (s:Person {id: "sibling-001"})
CREATE (dad)-[:PARENT_CHILD]->(s);
MATCH (mom:Person {id: "mom-001"}), (s:Person {id: "sibling-001"})
CREATE (mom)-[:PARENT_CHILD]->(s);

MATCH (dad:Person {id: "dad-001"}), (s:Person {id: "sibling-002"})
CREATE (dad)-[:PARENT_CHILD]->(s);
MATCH (mom:Person {id: "mom-001"}), (s:Person {id: "sibling-002"})
CREATE (mom)-[:PARENT_CHILD]->(s);

// === Uncle/Aunt -> Cousins (Dad side) ===
MATCH (u:Person {id: "uncle-001"}), (c:Person {id: "cousin-001"})
CREATE (u)-[:PARENT_CHILD]->(c);
MATCH (a:Person {id: "aunt-001"}), (c:Person {id: "cousin-001"})
CREATE (a)-[:PARENT_CHILD]->(c);

MATCH (u:Person {id: "uncle-001"}), (c:Person {id: "cousin-002"})
CREATE (u)-[:PARENT_CHILD]->(c);
MATCH (a:Person {id: "aunt-001"}), (c:Person {id: "cousin-002"})
CREATE (a)-[:PARENT_CHILD]->(c);

MATCH (a:Person {id: "aunt-002"}), (c:Person {id: "cousin-003"})
CREATE (a)-[:PARENT_CHILD]->(c);
MATCH (u:Person {id: "uncle-002"}), (c:Person {id: "cousin-003"})
CREATE (u)-[:PARENT_CHILD]->(c);

MATCH (a:Person {id: "aunt-002"}), (c:Person {id: "cousin-004"})
CREATE (a)-[:PARENT_CHILD]->(c);
MATCH (u:Person {id: "uncle-002"}), (c:Person {id: "cousin-004"})
CREATE (u)-[:PARENT_CHILD]->(c);

// === Uncle/Aunt -> Cousins (Mom side) ===
MATCH (u:Person {id: "uncle-003"}), (c:Person {id: "cousin-005"})
CREATE (u)-[:PARENT_CHILD]->(c);
MATCH (a:Person {id: "aunt-003"}), (c:Person {id: "cousin-005"})
CREATE (a)-[:PARENT_CHILD]->(c);

MATCH (u:Person {id: "uncle-003"}), (c:Person {id: "cousin-006"})
CREATE (u)-[:PARENT_CHILD]->(c);
MATCH (a:Person {id: "aunt-003"}), (c:Person {id: "cousin-006"})
CREATE (a)-[:PARENT_CHILD]->(c);

MATCH (a:Person {id: "aunt-004"}), (c:Person {id: "cousin-007"})
CREATE (a)-[:PARENT_CHILD]->(c);
MATCH (u:Person {id: "uncle-004"}), (c:Person {id: "cousin-007"})
CREATE (u)-[:PARENT_CHILD]->(c);

MATCH (a:Person {id: "aunt-004"}), (c:Person {id: "cousin-008"})
CREATE (a)-[:PARENT_CHILD]->(c);
MATCH (u:Person {id: "uncle-004"}), (c:Person {id: "cousin-008"})
CREATE (u)-[:PARENT_CHILD]->(c);

// === Me and Spouse ===
MATCH (me:Person {id: "me-001"}), (spouse:Person {id: "spouse-001"})
CREATE (me)-[:SPOUSE {start_date: "2012-06-15"}]->(spouse);

// === Me/Spouse -> Children ===
MATCH (me:Person {id: "me-001"}), (child:Person {id: "child-001"})
CREATE (me)-[:PARENT_CHILD]->(child);
MATCH (spouse:Person {id: "spouse-001"}), (child:Person {id: "child-001"})
CREATE (spouse)-[:PARENT_CHILD]->(child);

MATCH (me:Person {id: "me-001"}), (child:Person {id: "child-002"})
CREATE (me)-[:PARENT_CHILD]->(child);
MATCH (spouse:Person {id: "spouse-001"}), (child:Person {id: "child-002"})
CREATE (spouse)-[:PARENT_CHILD]->(child);

// === Cousin David -> Child ===
MATCH (c:Person {id: "cousin-001"}), (child:Person {id: "child-003"})
CREATE (c)-[:PARENT_CHILD]->(child);

// === Cousin Matthew -> Children ===
MATCH (c:Person {id: "cousin-005"}), (child:Person {id: "child-004"})
CREATE (c)-[:PARENT_CHILD]->(child);
MATCH (c:Person {id: "cousin-005"}), (child:Person {id: "child-005"})
CREATE (c)-[:PARENT_CHILD]->(child);

// === Sibling Relationships ===
MATCH (a:Person {id: "me-001"}), (b:Person {id: "sibling-001"})
CREATE (a)-[:SIBLING]->(b);
MATCH (a:Person {id: "me-001"}), (b:Person {id: "sibling-002"})
CREATE (a)-[:SIBLING]->(b);
MATCH (a:Person {id: "sibling-001"}), (b:Person {id: "sibling-002"})
CREATE (a)-[:SIBLING]->(b);

MATCH (a:Person {id: "dad-001"}), (b:Person {id: "uncle-001"})
CREATE (a)-[:SIBLING]->(b);
MATCH (a:Person {id: "dad-001"}), (b:Person {id: "aunt-002"})
CREATE (a)-[:SIBLING]->(b);
MATCH (a:Person {id: "uncle-001"}), (b:Person {id: "aunt-002"})
CREATE (a)-[:SIBLING]->(b);

MATCH (a:Person {id: "mom-001"}), (b:Person {id: "uncle-003"})
CREATE (a)-[:SIBLING]->(b);
MATCH (a:Person {id: "mom-001"}), (b:Person {id: "aunt-004"})
CREATE (a)-[:SIBLING]->(b);
MATCH (a:Person {id: "uncle-003"}), (b:Person {id: "aunt-004"})
CREATE (a)-[:SIBLING]->(b);

// Return summary
MATCH (n:Person) RETURN count(n) as total_persons;
'

# Check if cypher-shell is available (Docker)
if command -v cypher-shell &> /dev/null; then
    echo "Using cypher-shell..."
    echo "$CYPHER_SCRIPT" | cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD"
else
    # Use Docker to run cypher-shell
    echo "Using Docker to run cypher-shell..."
    echo "$CYPHER_SCRIPT" | docker exec -i family_tree_neo4j cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "SUCCESS: Sample data has been inserted."
    echo ""
    echo "Family Tree Structure:"
    echo "====================="
    echo ""
    echo "Generation 1: Great Grandparents"
    echo "  - William & Elizabeth Smith (Paternal)"
    echo "  - Henry & Margaret Johnson (Maternal)"
    echo ""
    echo "Generation 2: Grandparents"
    echo "  - Robert & Mary Smith (Dad side)"
    echo "  - Charles & Dorothy Johnson (Mom side)"
    echo ""
    echo "Generation 3: Parents & Uncles/Aunts"
    echo "  - James & Susan Smith (Parents)"
    echo "  - Michael & Patricia Smith (Dad side uncle/aunt)"
    echo "  - Linda & Richard Brown (Dad side aunt/uncle)"
    echo "  - Thomas & Jennifer Johnson (Mom side uncle/aunt)"
    echo "  - Barbara & George Martinez (Mom side aunt/uncle)"
    echo ""
    echo "Generation 4: Me, Siblings & Cousins"
    echo "  - Alex & Sarah Smith (me + spouse)"
    echo "  - Emily Smith, Daniel Smith (siblings)"
    echo "  - David, Jessica Smith (Uncle Michael kids)"
    echo "  - Ryan, Ashley Brown (Aunt Linda kids)"
    echo "  - Matthew, Sophia Johnson (Uncle Thomas kids)"
    echo "  - Carlos, Isabella Martinez (Aunt Barbara kids)"
    echo ""
    echo "Generation 5: Children"
    echo "  - Oliver, Emma Smith (my kids)"
    echo "  - Ethan Smith (David kid)"
    echo "  - Lily, Noah Johnson (Matthew kids)"
    echo ""
    echo "Total: 35 persons"
else
    echo ""
    echo "ERROR: Failed to insert data. Check connection settings."
    exit 1
fi
