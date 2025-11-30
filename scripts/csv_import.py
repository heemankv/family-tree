#!/usr/bin/env python3
"""
CSV Import Script for Family Tree
Imports persons and relationships from CSV files into Neo4j
"""

import csv
import os
import sys
from neo4j import GraphDatabase

# Configuration
NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "familytree123")

def get_csv_paths():
    """Get CSV file paths from arguments or use defaults"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "..", "data")

    persons_csv = sys.argv[1] if len(sys.argv) > 1 else os.path.join(data_dir, "example_persons.csv")
    relationships_csv = sys.argv[2] if len(sys.argv) > 2 else os.path.join(data_dir, "example_relationships.csv")

    return persons_csv, relationships_csv

def create_constraints(driver):
    """Create database constraints and indexes"""
    with driver.session() as session:
        session.run("CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE")
        session.run("CREATE INDEX person_name_index IF NOT EXISTS FOR (p:Person) ON (p.name)")
    print("Constraints created.")

def parse_boolean(value):
    """Parse boolean from various string formats"""
    if isinstance(value, bool):
        return value
    if not value:
        return False
    return value.lower() in ('true', 'yes', '1')

def parse_aka(value):
    """Parse aka field into list"""
    if not value or not value.strip():
        return []
    # Split by comma and clean up
    return [x.strip() for x in value.split(',') if x.strip()]

def import_persons(driver, csv_path):
    """Import persons from CSV"""
    persons = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            person = {
                'id': row['id'].strip(),
                'name': row['name'].strip(),
                'aka': parse_aka(row.get('aka', '')),
                'gender': row['gender'].strip(),
                'is_alive': parse_boolean(row.get('is_alive', 'false')),
                'birth_date': row.get('birth_date', '').strip(),
                'death_date': row.get('death_date', '').strip() or None,
                'current_location': row.get('current_location', '').strip(),
                'profession': row.get('profession', '').strip(),
                'photo_url': row.get('photo_url', '').strip() or ''
            }
            persons.append(person)

    # Batch insert all persons
    with driver.session() as session:
        query = """
        UNWIND $persons AS person
        MERGE (p:Person {id: person.id})
        SET p.name = person.name,
            p.aka = person.aka,
            p.gender = person.gender,
            p.is_alive = person.is_alive,
            p.birth_date = person.birth_date,
            p.death_date = person.death_date,
            p.current_location = person.current_location,
            p.profession = person.profession,
            p.photo_url = person.photo_url
        """
        session.run(query, persons=persons)

    print(f"Imported {len(persons)} persons.")
    return len(persons)

def import_relationships(driver, csv_path):
    """Import relationships from CSV"""
    spouse_rels = []
    parent_child_rels = []
    sibling_rels = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rel_type = row['type'].strip()
            rel = {
                'person1_id': row['person1_id'].strip(),
                'person2_id': row['person2_id'].strip(),
                'start_date': row.get('start_date', '').strip() or None
            }

            if rel_type == 'SPOUSE':
                spouse_rels.append(rel)
            elif rel_type == 'PARENT_CHILD':
                parent_child_rels.append(rel)
            elif rel_type == 'SIBLING':
                sibling_rels.append(rel)

    with driver.session() as session:
        # Import SPOUSE relationships
        if spouse_rels:
            query = """
            UNWIND $rels AS rel
            MATCH (a:Person {id: rel.person1_id}), (b:Person {id: rel.person2_id})
            MERGE (a)-[r:SPOUSE]->(b)
            SET r.start_date = rel.start_date
            """
            session.run(query, rels=spouse_rels)
            print(f"Imported {len(spouse_rels)} SPOUSE relationships.")

        # Import PARENT_CHILD relationships
        if parent_child_rels:
            query = """
            UNWIND $rels AS rel
            MATCH (a:Person {id: rel.person1_id}), (b:Person {id: rel.person2_id})
            MERGE (a)-[:PARENT_CHILD]->(b)
            """
            session.run(query, rels=parent_child_rels)
            print(f"Imported {len(parent_child_rels)} PARENT_CHILD relationships.")

        # Import SIBLING relationships
        if sibling_rels:
            query = """
            UNWIND $rels AS rel
            MATCH (a:Person {id: rel.person1_id}), (b:Person {id: rel.person2_id})
            MERGE (a)-[:SIBLING]->(b)
            """
            session.run(query, rels=sibling_rels)
            print(f"Imported {len(sibling_rels)} SIBLING relationships.")

    total = len(spouse_rels) + len(parent_child_rels) + len(sibling_rels)
    return total

def verify_import(driver):
    """Verify the import by counting nodes and relationships"""
    with driver.session() as session:
        persons = session.run("MATCH (n:Person) RETURN count(n) as count").single()["count"]
        rels = session.run("MATCH ()-[r]->() RETURN count(r) as count").single()["count"]

    print(f"\nVerification:")
    print(f"  Total persons: {persons}")
    print(f"  Total relationships: {rels}")
    return persons, rels

def main():
    persons_csv, relationships_csv = get_csv_paths()

    print("=== CSV Import Script for Family Tree ===")
    print(f"Persons CSV: {persons_csv}")
    print(f"Relationships CSV: {relationships_csv}")
    print(f"Neo4j URI: {NEO4J_URI}")
    print()

    # Check files exist
    if not os.path.exists(persons_csv):
        print(f"ERROR: Persons CSV not found: {persons_csv}")
        sys.exit(1)

    if not os.path.exists(relationships_csv):
        print(f"ERROR: Relationships CSV not found: {relationships_csv}")
        sys.exit(1)

    # Connect to Neo4j
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    try:
        # Verify connection
        driver.verify_connectivity()
        print("Connected to Neo4j.\n")

        # Create constraints
        create_constraints(driver)

        # Import data
        import_persons(driver, persons_csv)
        import_relationships(driver, relationships_csv)

        # Verify
        verify_import(driver)

        print("\n=== Import Complete ===")

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    finally:
        driver.close()

if __name__ == "__main__":
    main()
