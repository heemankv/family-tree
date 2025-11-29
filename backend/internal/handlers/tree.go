package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/heemankverma/family_tree/backend/internal/database"
	"github.com/heemankverma/family_tree/backend/internal/models"
)

// TreeHandler handles tree-related API endpoints
type TreeHandler struct {
	repo database.Repository
}

// NewTreeHandler creates a new tree handler
func NewTreeHandler(repo database.Repository) *TreeHandler {
	return &TreeHandler{repo: repo}
}

// GetTree handles GET /api/tree
// Query params: centerNodeId (optional), depth (optional, default 2, max 3)
func (h *TreeHandler) GetTree(c *gin.Context) {
	centerNodeID := c.Query("centerNodeId")
	depthStr := c.DefaultQuery("depth", "2")

	depth, err := strconv.Atoi(depthStr)
	if err != nil || depth < 1 {
		depth = 2
	}
	if depth > 3 {
		depth = 3
	}

	treeData, err := h.repo.GetTreeData(centerNodeID, depth)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "TREE_FETCH_ERROR",
				Message: "Failed to fetch tree data",
				Details: map[string]string{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusOK, treeData)
}

// GetPerson handles GET /api/person/:id
func (h *TreeHandler) GetPerson(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "INVALID_REQUEST",
				Message: "Person ID is required",
			},
		})
		return
	}

	person, err := h.repo.GetPersonByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "NOT_FOUND",
				Message: "Person not found",
				Details: map[string]string{"id": id},
			},
		})
		return
	}

	c.JSON(http.StatusOK, person)
}

// GetFamily handles GET /api/person/:id/family
func (h *TreeHandler) GetFamily(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "INVALID_REQUEST",
				Message: "Person ID is required",
			},
		})
		return
	}

	family, err := h.repo.GetImmediateFamily(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "NOT_FOUND",
				Message: "Person not found",
				Details: map[string]string{"id": id},
			},
		})
		return
	}

	c.JSON(http.StatusOK, family)
}

// GetAllPersons handles GET /api/persons
func (h *TreeHandler) GetAllPersons(c *gin.Context) {
	persons, err := h.repo.GetAllPersons()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "FETCH_ERROR",
				Message: "Failed to fetch persons",
				Details: map[string]string{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"persons": persons,
		"count":   len(persons),
	})
}
