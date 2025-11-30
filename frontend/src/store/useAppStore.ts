import { create } from 'zustand';
import { Person, Link, CoupleSelection } from '@/types';

interface AppState {
  // Selected person
  selectedPersonId: string | null;
  setSelectedPerson: (id: string | null) => void;

  // Selected couple
  selectedCouple: CoupleSelection | null;
  setSelectedCouple: (couple: CoupleSelection | null) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Graph data
  nodes: Person[];
  links: Link[];
  setGraphData: (nodes: Person[], links: Link[]) => void;

  // Query modal
  queryModalOpen: boolean;
  setQueryModalOpen: (open: boolean) => void;

  // Search modal
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Layout reset trigger
  layoutVersion: number;
  resetLayout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Selected person
  selectedPersonId: null,
  setSelectedPerson: (id) => set({
    selectedPersonId: id,
    selectedCouple: null, // Clear couple selection when person is selected
    sidebarOpen: id !== null,
  }),

  // Selected couple
  selectedCouple: null,
  setSelectedCouple: (couple) => set({
    selectedCouple: couple,
    selectedPersonId: null, // Clear person selection when couple is selected
    sidebarOpen: couple !== null,
  }),

  // Sidebar state
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Graph data
  nodes: [],
  links: [],
  setGraphData: (nodes, links) => set({
    nodes: nodes || [],
    links: links || []
  }),

  // Query modal
  queryModalOpen: false,
  setQueryModalOpen: (open) => set({ queryModalOpen: open }),

  // Search modal
  searchModalOpen: false,
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error
  error: null,
  setError: (error) => set({ error }),

  // Layout reset
  layoutVersion: 0,
  resetLayout: () => set((state) => ({ layoutVersion: state.layoutVersion + 1 })),
}));

// Selector hooks for better performance
export const useSelectedPerson = () => useAppStore((state) => {
  if (!state.selectedPersonId) return null;
  return state.nodes.find((n) => n.id === state.selectedPersonId) || null;
});
