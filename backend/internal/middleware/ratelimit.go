package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/heemankverma/family_tree/backend/internal/models"
)

// RateLimiter implements a simple in-memory rate limiter
type RateLimiter struct {
	mu             sync.RWMutex
	requests       map[string][]time.Time
	maxRequests    int
	windowDuration time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(maxRequests int, windowSeconds int) *RateLimiter {
	rl := &RateLimiter{
		requests:       make(map[string][]time.Time),
		maxRequests:    maxRequests,
		windowDuration: time.Duration(windowSeconds) * time.Second,
	}

	// Start cleanup goroutine
	go rl.cleanup()

	return rl
}

// cleanup periodically removes old entries
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, times := range rl.requests {
			// Remove old timestamps
			validTimes := make([]time.Time, 0)
			for _, t := range times {
				if now.Sub(t) < rl.windowDuration {
					validTimes = append(validTimes, t)
				}
			}
			if len(validTimes) == 0 {
				delete(rl.requests, ip)
			} else {
				rl.requests[ip] = validTimes
			}
		}
		rl.mu.Unlock()
	}
}

// isAllowed checks if a request from an IP is allowed
func (rl *RateLimiter) isAllowed(ip string) (bool, int) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.windowDuration)

	// Get existing timestamps for this IP
	times, exists := rl.requests[ip]
	if !exists {
		times = make([]time.Time, 0)
	}

	// Filter to only include timestamps within the window
	validTimes := make([]time.Time, 0)
	for _, t := range times {
		if t.After(windowStart) {
			validTimes = append(validTimes, t)
		}
	}

	// Check if limit exceeded
	if len(validTimes) >= rl.maxRequests {
		// Calculate retry after
		oldestInWindow := validTimes[0]
		retryAfter := int(rl.windowDuration.Seconds() - now.Sub(oldestInWindow).Seconds())
		if retryAfter < 1 {
			retryAfter = 1
		}
		return false, retryAfter
	}

	// Add current request
	validTimes = append(validTimes, now)
	rl.requests[ip] = validTimes

	return true, 0
}

// Middleware returns a Gin middleware function for rate limiting
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		allowed, retryAfter := rl.isAllowed(ip)
		if !allowed {
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error: models.ErrorDetail{
					Code:    "RATE_LIMIT_EXCEEDED",
					Message: "Too many requests. Please wait before trying again.",
					Details: map[string]interface{}{
						"retry_after_seconds": retryAfter,
						"limit":               rl.maxRequests,
						"window_seconds":      int(rl.windowDuration.Seconds()),
					},
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
