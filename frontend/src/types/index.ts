// Gender type
export type Gender = 'Male' | 'Female' | 'Other';

// Relationship type
export type RelationshipType = 'PARENT_CHILD' | 'SPOUSE' | 'SIBLING';

// Person represents an individual in the family tree
export interface Person {
  id: string;
  name: string;
  aka: string[];
  gender: Gender;
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
  relationship: RelationshipType;
  start_date?: string;
  end_date?: string;
}

// CoupleSelection for sidebar display
export interface CoupleSelection {
  person1: Person;
  person2: Person;
  marriageDate?: string;
  children: Person[];
  person1Parents: Person[];
  person2Parents: Person[];
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

// React Flow node data - extends Record for compatibility
export interface PersonNodeData extends Record<string, unknown> {
  person: Person;
  isSelected: boolean;
}

// Couple node data - extends Record for compatibility
export interface CoupleNodeData extends Record<string, unknown> {
  person1: Person;
  person2: Person;
  isSelected: boolean;
  selectedPersonId: string | null;
}
