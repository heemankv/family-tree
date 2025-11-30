package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/heemankverma/family_tree/backend/internal/config"
	"github.com/heemankverma/family_tree/backend/internal/database"
	"github.com/heemankverma/family_tree/backend/internal/handlers"
	"github.com/heemankverma/family_tree/backend/internal/middleware"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Initialize Neo4j repository
	repo, err := database.NewRepository(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to Neo4j: %v", err)
	}
	defer repo.Close()

	log.Printf("Connected to Neo4j at %s", cfg.Neo4jURI)

	// Initialize handlers
	treeHandler := handlers.NewTreeHandler(repo)
	queryHandler := handlers.NewQueryHandler(repo)
	uploadHandler := handlers.NewUploadHandler(cfg.AdminToken)

	// Initialize rate limiter for query endpoint
	rateLimiter := middleware.NewRateLimiter(cfg.RateLimitRequests, cfg.RateLimitWindowSeconds)

	// Setup router
	router := gin.Default()

	// Apply CORS middleware
	if len(cfg.AllowedOrigins) > 0 {
		log.Printf("CORS: Allowing origins: %v", cfg.AllowedOrigins)
		router.Use(middleware.CORSConfigProduction(cfg.AllowedOrigins))
	} else {
		log.Println("CORS: Development mode - allowing all origins")
		router.Use(middleware.CORSConfig())
	}

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Tree endpoints (no rate limiting)
		api.GET("/tree", treeHandler.GetTree)
		api.GET("/persons", treeHandler.GetAllPersons)
		api.GET("/person/:id", treeHandler.GetPerson)
		api.GET("/person/:id/family", treeHandler.GetFamily)

		// Query endpoint (with rate limiting)
		api.POST("/query", rateLimiter.Middleware(), queryHandler.ExecuteQuery)

		// Upload endpoint (admin only, no rate limiting)
		api.POST("/upload", uploadHandler.UploadCSV)
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down server...")
		os.Exit(0)
	}()

	// Start server
	addr := ":" + cfg.Port
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
