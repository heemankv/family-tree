package handlers

import (
	"encoding/csv"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/heemankverma/family_tree/backend/internal/models"
)

// UploadHandler handles CSV upload for bulk data ingestion
type UploadHandler struct {
	adminToken string
}

// NewUploadHandler creates a new upload handler
func NewUploadHandler(adminToken string) *UploadHandler {
	return &UploadHandler{adminToken: adminToken}
}

// UploadCSV handles POST /api/upload
func (h *UploadHandler) UploadCSV(c *gin.Context) {
	// Verify admin token
	authHeader := c.GetHeader("Authorization")
	expectedToken := "Bearer " + h.adminToken
	if authHeader != expectedToken {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "UNAUTHORIZED",
				Message: "Invalid or missing admin token",
			},
		})
		return
	}

	// Get the uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "FILE_REQUIRED",
				Message: "CSV file is required",
				Details: map[string]string{"error": err.Error()},
			},
		})
		return
	}
	defer file.Close()

	// Validate file type
	if header.Header.Get("Content-Type") != "text/csv" &&
		header.Header.Get("Content-Type") != "application/vnd.ms-excel" {
		// Check file extension as fallback
		if len(header.Filename) < 4 || header.Filename[len(header.Filename)-4:] != ".csv" {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error: models.ErrorDetail{
					Code:    "INVALID_FILE_TYPE",
					Message: "Only CSV files are allowed",
				},
			})
			return
		}
	}

	// Parse CSV
	reader := csv.NewReader(file)

	// Read header row
	headers, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: models.ErrorDetail{
				Code:    "CSV_PARSE_ERROR",
				Message: "Failed to read CSV headers",
				Details: map[string]string{"error": err.Error()},
			},
		})
		return
	}

	// Validate required columns
	requiredColumns := []string{"id", "name", "gender", "birth_date"}
	columnIndex := make(map[string]int)
	for i, h := range headers {
		columnIndex[h] = i
	}

	for _, col := range requiredColumns {
		if _, exists := columnIndex[col]; !exists {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error: models.ErrorDetail{
					Code:    "MISSING_COLUMN",
					Message: "Required column missing: " + col,
					Details: map[string]interface{}{
						"required_columns": requiredColumns,
						"found_columns":    headers,
					},
				},
			})
			return
		}
	}

	// Parse rows
	var records []map[string]string
	rowNum := 1
	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error: models.ErrorDetail{
					Code:    "CSV_PARSE_ERROR",
					Message: "Failed to parse CSV row",
					Details: map[string]interface{}{
						"row":   rowNum,
						"error": err.Error(),
					},
				},
			})
			return
		}

		record := make(map[string]string)
		for i, value := range row {
			if i < len(headers) {
				record[headers[i]] = value
			}
		}
		records = append(records, record)
		rowNum++
	}

	// In a real implementation, this would batch MERGE commands to Neo4j
	// For now, return success with parsed data summary
	c.JSON(http.StatusOK, gin.H{
		"message":      "CSV parsed successfully",
		"rows_parsed":  len(records),
		"columns":      headers,
		"preview":      records[:min(5, len(records))],
		"note":         "In production, this would create/update Person nodes in Neo4j",
		"mock_mode":    true,
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
