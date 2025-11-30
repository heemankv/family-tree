package database

import (
	"context"
	"fmt"
	"time"

	"github.com/heemankverma/family_tree/backend/internal/config"
	"github.com/heemankverma/family_tree/backend/internal/models"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// Neo4jRepository implements Repository interface with real Neo4j database
type Neo4jRepository struct {
	driver   neo4j.DriverWithContext
	database string
}

// NewNeo4jRepository creates a new Neo4j repository
func NewNeo4jRepository(cfg *config.Config) (*Neo4jRepository, error) {
	driver, err := neo4j.NewDriverWithContext(
		cfg.Neo4jURI,
		neo4j.BasicAuth(cfg.Neo4jUsername, cfg.Neo4jPassword, ""),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create Neo4j driver: %w", err)
	}

	// Verify connectivity
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := driver.VerifyConnectivity(ctx); err != nil {
		return nil, fmt.Errorf("failed to connect to Neo4j: %w", err)
	}

	return &Neo4jRepository{
		driver:   driver,
		database: "neo4j",
	}, nil
}

// Close closes the Neo4j driver
func (r *Neo4jRepository) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return r.driver.Close(ctx)
}

// GetTreeData returns nodes and links for the family tree visualization
func (r *Neo4jRepository) GetTreeData(centerNodeID string, depth int) (*models.TreeResponse, error) {
	if depth <= 0 {
		depth = 2
	}
	if depth > 3 {
		depth = 3
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: r.database})
	defer session.Close(ctx)

	// Query to get nodes within depth of center node
	// Returns relationships with source/target as person IDs (not internal Neo4j IDs)
	query := `
		MATCH (center:Person {id: $centerId})
		OPTIONAL MATCH path = (center)-[*1..` + fmt.Sprintf("%d", depth) + `]-(related:Person)
		WITH collect(DISTINCT center) + collect(DISTINCT related) AS allNodes
		UNWIND allNodes AS n
		WITH DISTINCT n
		WITH collect(n) AS nodes
		UNWIND nodes AS n1
		UNWIND nodes AS n2
		OPTIONAL MATCH (n1)-[rel:PARENT_CHILD|SPOUSE|SIBLING]->(n2)
		WHERE rel IS NOT NULL
		WITH nodes, collect(DISTINCT {source: n1.id, target: n2.id, type: type(rel), start_date: rel.start_date, end_date: rel.end_date}) AS rels
		RETURN nodes, rels
	`

	var nodes []models.Person
	var links []models.Link

	result, err := session.Run(ctx, query, map[string]interface{}{
		"centerId": centerNodeID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	if result.Next(ctx) {
		record := result.Record()

		// Process nodes
		if nodesValue, ok := record.Get("nodes"); ok {
			if nodesList, ok := nodesValue.([]interface{}); ok {
				for _, nodeVal := range nodesList {
					if node, ok := nodeVal.(neo4j.Node); ok {
						person := nodeToModel(node)
						nodes = append(nodes, person)
					}
				}
			}
		}

		// Process relationships (now as maps with our custom IDs)
		if relsValue, ok := record.Get("rels"); ok {
			if relsList, ok := relsValue.([]interface{}); ok {
				for _, relVal := range relsList {
					if relMap, ok := relVal.(map[string]interface{}); ok {
						source, _ := relMap["source"].(string)
						target, _ := relMap["target"].(string)
						relType, _ := relMap["type"].(string)

						if source != "" && target != "" && relType != "" {
							link := models.Link{
								Source:       source,
								Target:       target,
								Relationship: relType,
								StartDate:    getStringPtrFromInterface(relMap["start_date"]),
								EndDate:      getStringPtrFromInterface(relMap["end_date"]),
							}
							links = append(links, link)
						}
					}
				}
			}
		}
	}

	if err := result.Err(); err != nil {
		return nil, fmt.Errorf("error processing results: %w", err)
	}

	return &models.TreeResponse{
		Nodes: nodes,
		Links: links,
	}, nil
}

// GetPersonByID returns a person by their ID
func (r *Neo4jRepository) GetPersonByID(id string) (*models.Person, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: r.database})
	defer session.Close(ctx)

	query := `MATCH (p:Person {id: $id}) RETURN p`

	result, err := session.Run(ctx, query, map[string]interface{}{"id": id})
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	if result.Next(ctx) {
		record := result.Record()
		if nodeVal, ok := record.Get("p"); ok {
			if node, ok := nodeVal.(neo4j.Node); ok {
				person := nodeToModel(node)
				return &person, nil
			}
		}
	}

	if err := result.Err(); err != nil {
		return nil, fmt.Errorf("error processing results: %w", err)
	}

	return nil, fmt.Errorf("person with id %s not found", id)
}

// GetImmediateFamily returns the immediate family of a person
func (r *Neo4jRepository) GetImmediateFamily(id string) (*models.ImmediateFamily, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: r.database})
	defer session.Close(ctx)

	query := `
		MATCH (p:Person {id: $id})
		OPTIONAL MATCH (p)-[:SPOUSE]-(spouse:Person)
		OPTIONAL MATCH (p)<-[:PARENT_CHILD]-(parent:Person)
		OPTIONAL MATCH (p)-[:PARENT_CHILD]->(child:Person)
		OPTIONAL MATCH (p)-[:SIBLING]-(sibling:Person)
		RETURN p, spouse, collect(DISTINCT parent) AS parents,
		       collect(DISTINCT child) AS children, collect(DISTINCT sibling) AS siblings
	`

	result, err := session.Run(ctx, query, map[string]interface{}{"id": id})
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	if result.Next(ctx) {
		record := result.Record()

		family := &models.ImmediateFamily{
			Parents:  make([]models.Person, 0),
			Children: make([]models.Person, 0),
			Siblings: make([]models.Person, 0),
		}

		// Get person
		if pVal, ok := record.Get("p"); ok {
			if node, ok := pVal.(neo4j.Node); ok {
				family.Person = nodeToModel(node)
			}
		}

		// Get spouse
		if spouseVal, ok := record.Get("spouse"); ok && spouseVal != nil {
			if node, ok := spouseVal.(neo4j.Node); ok {
				spouse := nodeToModel(node)
				family.Spouse = &spouse
			}
		}

		// Get parents
		if parentsVal, ok := record.Get("parents"); ok {
			if parentsList, ok := parentsVal.([]interface{}); ok {
				for _, pVal := range parentsList {
					if node, ok := pVal.(neo4j.Node); ok {
						family.Parents = append(family.Parents, nodeToModel(node))
					}
				}
			}
		}

		// Get children
		if childrenVal, ok := record.Get("children"); ok {
			if childrenList, ok := childrenVal.([]interface{}); ok {
				for _, cVal := range childrenList {
					if node, ok := cVal.(neo4j.Node); ok {
						family.Children = append(family.Children, nodeToModel(node))
					}
				}
			}
		}

		// Get siblings
		if siblingsVal, ok := record.Get("siblings"); ok {
			if siblingsList, ok := siblingsVal.([]interface{}); ok {
				for _, sVal := range siblingsList {
					if node, ok := sVal.(neo4j.Node); ok {
						family.Siblings = append(family.Siblings, nodeToModel(node))
					}
				}
			}
		}

		return family, nil
	}

	if err := result.Err(); err != nil {
		return nil, fmt.Errorf("error processing results: %w", err)
	}

	return nil, fmt.Errorf("person with id %s not found", id)
}

// ExecuteQuery executes a raw Cypher query (read-only)
func (r *Neo4jRepository) ExecuteQuery(query string) (*models.QueryResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Use read-only session
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{
		DatabaseName: r.database,
		AccessMode:   neo4j.AccessModeRead,
	})
	defer session.Close(ctx)

	result, err := session.Run(ctx, query, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	records, err := result.Collect(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to collect results: %w", err)
	}

	results := make([]interface{}, 0, len(records))
	for _, record := range records {
		row := make(map[string]interface{})
		for _, key := range record.Keys {
			val, _ := record.Get(key)
			row[key] = convertNeo4jValue(val)
		}
		results = append(results, row)
	}

	return &models.QueryResponse{
		Results: results,
		Count:   len(results),
	}, nil
}

// GetAllPersons returns all persons in the database
func (r *Neo4jRepository) GetAllPersons() ([]models.Person, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: r.database})
	defer session.Close(ctx)

	query := `MATCH (p:Person) RETURN p`

	result, err := session.Run(ctx, query, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	var persons []models.Person
	for result.Next(ctx) {
		record := result.Record()
		if pVal, ok := record.Get("p"); ok {
			if node, ok := pVal.(neo4j.Node); ok {
				persons = append(persons, nodeToModel(node))
			}
		}
	}

	if err := result.Err(); err != nil {
		return nil, fmt.Errorf("error processing results: %w", err)
	}

	return persons, nil
}

// nodeToModel converts a Neo4j node to a Person model
func nodeToModel(node neo4j.Node) models.Person {
	props := node.Props

	person := models.Person{
		ID:              getStringProp(props, "id"),
		Name:            getStringProp(props, "name"),
		Aka:             getStringArrayProp(props, "aka"),
		Gender:          getStringProp(props, "gender"),
		IsAlive:         getBoolProp(props, "is_alive"),
		BirthDate:       getDateProp(props, "birth_date"),
		DeathDate:       getDatePropPtr(props, "death_date"),
		CurrentLocation: getStringProp(props, "current_location"),
		Profession:      getStringProp(props, "profession"),
		PhotoURL:        getStringProp(props, "photo_url"),
	}

	return person
}

// relationshipToModel converts a Neo4j relationship to a Link model
func relationshipToModel(rel neo4j.Relationship) models.Link {
	link := models.Link{
		Source:       fmt.Sprintf("%d", rel.StartElementId),
		Target:       fmt.Sprintf("%d", rel.EndElementId),
		Relationship: rel.Type,
		StartDate:    getDatePropPtr(rel.Props, "start_date"),
		EndDate:      getDatePropPtr(rel.Props, "end_date"),
	}
	return link
}

// convertNeo4jValue converts Neo4j values to Go values
func convertNeo4jValue(val interface{}) interface{} {
	switch v := val.(type) {
	case neo4j.Node:
		return nodeToModel(v)
	case neo4j.Relationship:
		return relationshipToModel(v)
	case neo4j.Path:
		return map[string]interface{}{
			"nodes":         v.Nodes,
			"relationships": v.Relationships,
		}
	default:
		return v
	}
}

// Helper functions to extract properties
func getStringProp(props map[string]interface{}, key string) string {
	if val, ok := props[key]; ok {
		if s, ok := val.(string); ok {
			return s
		}
	}
	return ""
}

func getBoolProp(props map[string]interface{}, key string) bool {
	if val, ok := props[key]; ok {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}

func getStringArrayProp(props map[string]interface{}, key string) []string {
	if val, ok := props[key]; ok {
		if arr, ok := val.([]interface{}); ok {
			result := make([]string, 0, len(arr))
			for _, item := range arr {
				if s, ok := item.(string); ok {
					result = append(result, s)
				}
			}
			return result
		}
		// Handle case where it's stored as a single string
		if s, ok := val.(string); ok && s != "" {
			return []string{s}
		}
	}
	return []string{}
}

func getDateProp(props map[string]interface{}, key string) string {
	if val, ok := props[key]; ok {
		switch v := val.(type) {
		case string:
			return v
		case neo4j.Date:
			return v.Time().Format("2006-01-02")
		case time.Time:
			return v.Format("2006-01-02")
		}
	}
	return ""
}

func getDatePropPtr(props map[string]interface{}, key string) *string {
	if val, ok := props[key]; ok && val != nil {
		switch v := val.(type) {
		case string:
			return &v
		case neo4j.Date:
			s := v.Time().Format("2006-01-02")
			return &s
		case time.Time:
			s := v.Format("2006-01-02")
			return &s
		}
	}
	return nil
}

// getStringPtrFromInterface converts an interface{} to *string
func getStringPtrFromInterface(val interface{}) *string {
	if val == nil {
		return nil
	}
	switch v := val.(type) {
	case string:
		return &v
	case neo4j.Date:
		s := v.Time().Format("2006-01-02")
		return &s
	case time.Time:
		s := v.Format("2006-01-02")
		return &s
	}
	return nil
}
