package config

import (
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the application
type Config struct {
	// Server settings
	Port    string
	GinMode string

	// Neo4j connection
	Neo4jURI      string
	Neo4jUsername string
	Neo4jPassword string

	// Read-only Neo4j credentials (for public query endpoint)
	Neo4jReadOnlyUser     string
	Neo4jReadOnlyPassword string

	// Admin settings
	AdminToken string

	// Rate limiting
	RateLimitRequests      int
	RateLimitWindowSeconds int

	// CORS
	AllowedOrigins []string
}

// Load reads configuration from environment variables
func Load() *Config {
	return &Config{
		Port:    getEnv("PORT", "8080"),
		GinMode: getEnv("GIN_MODE", "debug"),

		Neo4jURI:      getEnv("NEO4J_URI", "bolt://localhost:7687"),
		Neo4jUsername: getEnv("NEO4J_USERNAME", "neo4j"),
		Neo4jPassword: getEnv("NEO4J_PASSWORD", "familytree123"),

		Neo4jReadOnlyUser:     getEnv("NEO4J_READ_ONLY_USER", ""),
		Neo4jReadOnlyPassword: getEnv("NEO4J_READ_ONLY_PASSWORD", ""),

		AdminToken: getEnv("ADMIN_TOKEN", "dev_admin_token_12345"),

		RateLimitRequests:      getEnvInt("RATE_LIMIT_REQUESTS", 5),
		RateLimitWindowSeconds: getEnvInt("RATE_LIMIT_WINDOW_SECONDS", 60),

		AllowedOrigins: getEnvSlice("ALLOWED_ORIGINS", []string{}),
	}
}

// getEnv retrieves an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// getEnvInt retrieves an integer environment variable
func getEnvInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

// getEnvSlice retrieves a comma-separated environment variable as a slice
func getEnvSlice(key string, defaultValue []string) []string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		var result []string
		for _, s := range strings.Split(value, ",") {
			trimmed := strings.TrimSpace(s)
			if trimmed != "" {
				result = append(result, trimmed)
			}
		}
		return result
	}
	return defaultValue
}
