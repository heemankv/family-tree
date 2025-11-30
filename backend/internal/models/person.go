package models

// Person represents an individual in the family tree
type Person struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	Aka             []string `json:"aka"`
	Gender          string   `json:"gender"`
	IsAlive         bool     `json:"is_alive"`
	BirthDate       string   `json:"birth_date"`
	DeathDate       *string  `json:"death_date"`
	CurrentLocation string   `json:"current_location"`
	Profession      string   `json:"profession"`
	PhotoURL        string   `json:"photo_url"`
}

// Link represents a relationship between two people
type Link struct {
	Source       string  `json:"source"`
	Target       string  `json:"target"`
	Relationship string  `json:"relationship"`
	StartDate    *string `json:"start_date,omitempty"`
	EndDate      *string `json:"end_date,omitempty"`
}

// TreeResponse is the response format for the /api/tree endpoint
type TreeResponse struct {
	Nodes []Person `json:"nodes"`
	Links []Link   `json:"links"`
}

// QueryRequest is the request body for /api/query
type QueryRequest struct {
	Query string `json:"query" binding:"required"`
}

// QueryResponse is the response for /api/query
type QueryResponse struct {
	Results interface{} `json:"results"`
	Count   int         `json:"count"`
}

// ErrorResponse is the standard error response format
type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

// ErrorDetail contains error information
type ErrorDetail struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// ImmediateFamily represents the immediate family of a person
type ImmediateFamily struct {
	Person   Person   `json:"person"`
	Parents  []Person `json:"parents"`
	Spouse   *Person  `json:"spouse,omitempty"`
	Children []Person `json:"children"`
	Siblings []Person `json:"siblings"`
}
