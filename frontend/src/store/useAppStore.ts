import { create } from 'zustand';
import { Person, Link, Viewport } from '@/types';

interface AppState {
  // Selected person
  selectedPersonId: string | null;
  setSelectedPerson: (id: string | null) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Graph data
  nodes: Person[];
  links: Link[];
  setGraphData: (nodes: Person[], links: Link[]) => void;

  // Query modal
  queryModalOpen: boolean;
  setQueryModalOpen: (open: boolean) => void;
  toggleQueryModal: () => void;

  // Search modal
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  toggleSearchModal: () => void;

  // Viewport state (synced with React Flow)
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Selected person
  selectedPersonId: null,
  setSelectedPerson: (id) => set({
    selectedPersonId: id,
    sidebarOpen: id !== null, // Auto-open sidebar when person selected
  }),

  // Sidebar state
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Graph data
  nodes: [],
  links: [],
  setGraphData: (nodes, links) => set({ nodes, links }),

  // Query modal
  queryModalOpen: false,
  setQueryModalOpen: (open) => set({ queryModalOpen: open }),
  toggleQueryModal: () => set((state) => ({ queryModalOpen: !state.queryModalOpen })),

  // Search modal
  searchModalOpen: false,
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),
  toggleSearchModal: () => set((state) => ({ searchModalOpen: !state.searchModalOpen })),

  // Viewport
  viewport: { x: 0, y: 0, zoom: 1 },
  setViewport: (viewport) => set({ viewport }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Selector hooks for better performance
export const useSelectedPerson = () => useAppStore((state) => {
  if (!state.selectedPersonId) return null;
  return state.nodes.find((n) => n.id === state.selectedPersonId) || null;
});

export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useQueryModalOpen = () => useAppStore((state) => state.queryModalOpen);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
