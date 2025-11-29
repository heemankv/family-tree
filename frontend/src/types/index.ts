// Person represents an individual in the family tree
export interface Person {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  is_alive: boolean;
  birth_date: string;
  death_date: string | null;
  current_location: string;
  profession: string;
  photo_url: string;
}

// Link represents a relationship between two people
export interface Link {
  source: string;
  target: string;
  relationship: 'PARENT_CHILD' | 'SPOUSE' | 'SIBLING';
  start_date?: string;
  end_date?: string;
}

// TreeResponse from the API
export interface TreeResponse {
  nodes: Person[];
  links: Link[];
}

// ImmediateFamily from the API
export interface ImmediateFamily {
  person: Person;
  parents: Person[];
  spouse: Person | null;
  children: Person[];
  siblings: Person[];
}

// QueryResponse from the API
export interface QueryResponse {
  results: unknown[];
  count: number;
}

// API Error response
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// React Flow node data
export interface PersonNodeData extends Record<string, unknown> {
  person: Person;
  isSelected: boolean;
}

// Couple node data
export interface CoupleNodeData extends Record<string, unknown> {
  person1: Person;
  person2: Person;
  isSelected: boolean;
  selectedPersonId: string | null;
}

// Viewport state
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}
