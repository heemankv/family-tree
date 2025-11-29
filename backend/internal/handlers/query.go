package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/heemankverma/family_tree/backend/internal/database"
	"github.com/heemankverma/family_tree/backend/internal/models"
)

// QueryHandler handles the developer query endpoint
type QueryHandler struct {
	repo database.Repository
}

// NewQueryHandler creates a new query handler
func NewQueryHandler(repo database.Repository) *QueryHandler {
	return &QueryHandler{repo: repo}
}

// ExecuteQuery handles POST /api/query
func (h *QueryHandler) ExecuteQuery(c *gin.Context) {
	var req models.QueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: map[string]string{"error": err.Error()},
			},
		})
		return
	}

	// Validate query is not empty
	query := strings.TrimSpace(req.Query)
	if query == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "EMPTY_QUERY",
				Message: "Query cannot be empty",
			},
		})
		return
	}

	// Security: Block write operations at application level
	queryUpper := strings.ToUpper(query)
	writeKeywords := []string{"CREATE", "DELETE", "MERGE", "SET", "REMOVE", "DROP", "DETACH"}
	for _, keyword := range writeKeywords {
		if strings.Contains(queryUpper, keyword) {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error: models.ErrorDetail{
					Code:    "WRITE_NOT_ALLOWED",
					Message: "Write operations are not allowed. This endpoint is read-only.",
					Details: map[string]string{"blocked_keyword": keyword},
				},
			})
			return
		}
	}

	// Execute the query
	result, err := h.repo.ExecuteQuery(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "QUERY_ERROR",
				Message: "Failed to execute query",
				Details: map[string]string{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusOK, result)
}
