import { TreeResponse, Person, ImmediateFamily, QueryResponse, ApiError } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        if (!response.ok) {
          const error: ApiError = await response.json();
          throw new Error(error.error?.message || 'API request failed');
        }

        return response.json();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');

        // Don't retry on client errors (4xx) - only retry on network/server errors
        if (lastError.message.includes('API request failed')) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries - 1) {
          await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // Get tree data centered on a person
  async getTreeData(centerNodeId?: string, depth: number = 2): Promise<TreeResponse> {
    const params = new URLSearchParams();
    if (centerNodeId) params.append('centerNodeId', centerNodeId);
    params.append('depth', depth.toString());

    return this.fetch<TreeResponse>(`/api/tree?${params.toString()}`);
  }

  // Get a single person by ID
  async getPerson(id: string): Promise<Person> {
    return this.fetch<Person>(`/api/person/${id}`);
  }

  // Get immediate family of a person
  async getPersonFamily(id: string): Promise<ImmediateFamily> {
    return this.fetch<ImmediateFamily>(`/api/person/${id}/family`);
  }

  // Get all persons
  async getAllPersons(): Promise<{ persons: Person[]; count: number }> {
    return this.fetch<{ persons: Person[]; count: number }>('/api/persons');
  }

  // Execute a Cypher query
  async executeQuery(query: string): Promise<QueryResponse> {
    return this.fetch<QueryResponse>('/api/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; mock_mode: boolean }> {
    return this.fetch<{ status: string; mock_mode: boolean }>('/health');
  }
}

// Export singleton instance
export const api = new ApiClient();
