package database

import (
	"github.com/heemankverma/family_tree/backend/internal/config"
	"github.com/heemankverma/family_tree/backend/internal/models"
)

// Repository defines the interface for database operations
type Repository interface {
	// GetTreeData returns nodes and links for tree visualization
	GetTreeData(centerNodeID string, depth int) (*models.TreeResponse, error)

	// GetPersonByID returns a person by their ID
	GetPersonByID(id string) (*models.Person, error)

	// GetImmediateFamily returns the immediate family of a person
	GetImmediateFamily(id string) (*models.ImmediateFamily, error)

	// ExecuteQuery executes a raw Cypher query (read-only)
	ExecuteQuery(query string) (*models.QueryResponse, error)

	// GetAllPersons returns all persons in the database
	GetAllPersons() ([]models.Person, error)

	// Close closes the database connection
	Close() error
}

// NewRepository creates a new Neo4j repository
func NewRepository(cfg *config.Config) (Repository, error) {
	return NewNeo4jRepository(cfg)
}
