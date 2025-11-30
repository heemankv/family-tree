'use client';

import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  NodeMouseHandler,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PersonNode } from './PersonNode';
import { CoupleNode } from './CoupleNode';
import { CanvasControls } from './CanvasControls';
import { layoutFamilyTree } from '@/lib/graph-layout';
import { useAppStore } from '@/store/useAppStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ME_PERSON_ID } from '@/lib/constants';
import { Link, Person, CoupleSelection } from '@/types';

// Constants
const NODE_TYPES = {
  personNode: PersonNode,
  coupleNode: CoupleNode,
} as const;

const FIT_VIEW_OPTIONS = { padding: 0.2 } as const;
const FIT_VIEW_DURATION = 300;
const ZOOM_DURATION = 200;
const FIT_VIEW_DELAY = 100;

const REACT_FLOW_CONFIG = {
  minZoom: 0.2,
  maxZoom: 2,
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  proOptions: { hideAttribution: true },
} as const;

const EDGE_STYLES = {
  default: { strokeWidth: 2 },
  highlighted: { strokeWidth: 3 },
} as const;

// Types
interface RelationshipMaps {
  parentIds: Set<string>;
  childIds: Set<string>;
}

// Helper functions
function isInputElement(target: HTMLElement): boolean {
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}

function buildRelationshipMaps(
  selectedPersonId: string | null,
  selectedCouple: CoupleSelection | null,
  links: Link[]
): RelationshipMaps {
  const parentIds = new Set<string>();
  const childIds = new Set<string>();

  if (!links) {
    return { parentIds, childIds };
  }

  // Handle couple selection - get parents of both persons and shared children
  if (selectedCouple) {
    const person1Id = selectedCouple.person1.id;
    const person2Id = selectedCouple.person2.id;

    for (const link of links) {
      if (link.relationship === 'PARENT_CHILD') {
        // Parents of either person in the couple
        if (link.target === person1Id || link.target === person2Id) {
          parentIds.add(link.source);
        }
        // Children of either person in the couple
        if (link.source === person1Id || link.source === person2Id) {
          childIds.add(link.target);
        }
      }
    }

    return { parentIds, childIds };
  }

  // Handle individual person selection
  if (!selectedPersonId) {
    return { parentIds, childIds };
  }

  let spouseId: string | null = null;

  for (const link of links) {
    if (link.relationship === 'PARENT_CHILD') {
      if (link.target === selectedPersonId) {
        parentIds.add(link.source);
      }
      if (link.source === selectedPersonId) {
        childIds.add(link.target);
      }
    }
    if (link.relationship === 'SPOUSE') {
      if (link.source === selectedPersonId) spouseId = link.target;
      if (link.target === selectedPersonId) spouseId = link.source;
    }
  }

  // Include spouse's children as well
  if (spouseId) {
    for (const link of links) {
      if (link.relationship === 'PARENT_CHILD' && link.source === spouseId) {
        childIds.add(link.target);
      }
    }
  }

  return { parentIds, childIds };
}

function isEdgeHighlighted(
  edge: Edge,
  selectedPersonId: string | null,
  selectedCouple: CoupleSelection | null,
  parentIds: Set<string>,
  childIds: Set<string>
): boolean {
  // Handle couple selection
  if (selectedCouple) {
    const person1Id = selectedCouple.person1.id;
    const person2Id = selectedCouple.person2.id;

    // Edge goes to either person in the couple (from their parents)
    const edgeToCouple =
      edge.target === person1Id ||
      edge.target === person2Id ||
      edge.target.includes(person1Id) ||
      edge.target.includes(person2Id);

    if (edgeToCouple) {
      // Check if source is a parent of either person
      return Array.from(parentIds).some(
        (pid) => edge.source === pid || edge.source.includes(pid)
      );
    }

    // Edge goes to a child (from the couple)
    const edgeToChild = Array.from(childIds).some(
      (cid) => edge.target === cid || edge.target.includes(cid)
    );

    if (edgeToChild) {
      // Check if source is either person in the couple or a couple node containing them
      return (
        edge.source === person1Id ||
        edge.source === person2Id ||
        edge.source.includes(person1Id) ||
        edge.source.includes(person2Id)
      );
    }

    return false;
  }

  // Handle individual person selection
  if (!selectedPersonId) return false;

  const edgeToSelected = edge.target === selectedPersonId || edge.target.includes(selectedPersonId);
  const edgeToChild = Array.from(childIds).some(
    (cid) => edge.target === cid || edge.target.includes(cid)
  );

  if (edgeToSelected) {
    return Array.from(parentIds).some(
      (pid) => edge.source === pid || edge.source.includes(pid)
    );
  }

  if (edgeToChild) {
    return edge.source === selectedPersonId || edge.source.includes(selectedPersonId);
  }

  return false;
}

function updateEdgeHighlighting(
  edge: Edge,
  selectedPersonId: string | null,
  selectedCouple: CoupleSelection | null,
  parentIds: Set<string>,
  childIds: Set<string>
): Edge {
  const highlighted = isEdgeHighlighted(edge, selectedPersonId, selectedCouple, parentIds, childIds);

  return {
    ...edge,
    className: highlighted ? 'highlighted-edge' : '',
    style: {
      ...edge.style,
      ...(highlighted ? EDGE_STYLES.highlighted : EDGE_STYLES.default),
    },
  };
}

// Custom hooks
function useKeyboardZoomControls() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (isInputElement(target)) return;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          zoomIn({ duration: ZOOM_DURATION });
          break;
        case '-':
          e.preventDefault();
          zoomOut({ duration: ZOOM_DURATION });
          break;
        case '0':
          e.preventDefault();
          fitView({ duration: FIT_VIEW_DURATION, ...FIT_VIEW_OPTIONS });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, fitView]);
}

function useFitViewOnLoad(nodeCount: number) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeCount > 0) {
      const timer = setTimeout(() => {
        fitView({ duration: FIT_VIEW_DURATION, ...FIT_VIEW_OPTIONS });
      }, FIT_VIEW_DELAY);
      return () => clearTimeout(timer);
    }
  }, [nodeCount, fitView]);
}

// Main component
function FamilyTreeCanvasInner() {
  // Store selectors
  const storeNodes = useAppStore((state) => state.nodes);
  const links = useAppStore((state) => state.links);
  const selectedPersonId = useAppStore((state) => state.selectedPersonId);
  const selectedCouple = useAppStore((state) => state.selectedCouple);
  const setSelectedPerson = useAppStore((state) => state.setSelectedPerson);
  const setSelectedCouple = useAppStore((state) => state.setSelectedCouple);
  const isLoading = useAppStore((state) => state.isLoading);
  const layoutVersion = useAppStore((state) => state.layoutVersion);

  // Custom hooks
  useKeyboardZoomControls();
  useFitViewOnLoad(storeNodes.length);

  // Calculate layout (recalculates on data changes or layout reset)
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => layoutFamilyTree(storeNodes, links, ME_PERSON_ID, null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeNodes, links, layoutVersion]
  );

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Sync layout changes
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  // Build relationship maps for edge highlighting
  const { parentIds, childIds } = useMemo(
    () => buildRelationshipMaps(selectedPersonId, selectedCouple, links),
    [selectedPersonId, selectedCouple, links]
  );

  // Update selection state
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'coupleNode') {
          const data = node.data as { person1: { id: string }; person2: { id: string } };
          // Check if this couple card is selected (either as a couple or one person in it)
          const isCoupleSelected = selectedCouple !== null &&
            selectedCouple.person1.id === data.person1.id &&
            selectedCouple.person2.id === data.person2.id;
          const isPersonSelected = selectedPersonId === data.person1.id || selectedPersonId === data.person2.id;
          const isSelected = isCoupleSelected || isPersonSelected;
          return {
            ...node,
            data: { ...node.data, isSelected, selectedPersonId, isCoupleSelected },
            selected: isSelected,
          };
        }
        const isSelected = node.id === selectedPersonId;
        return {
          ...node,
          data: { ...node.data, isSelected },
          selected: isSelected,
        };
      })
    );
  }, [selectedPersonId, selectedCouple, setNodes]);

  // Update edge highlighting
  useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        updateEdgeHighlighting(edge, selectedPersonId, selectedCouple, parentIds, childIds)
      )
    );
  }, [selectedPersonId, selectedCouple, parentIds, childIds, setEdges]);

  // Helper to build couple selection data
  const buildCoupleSelection = useCallback(
    (person1: Person, person2: Person): CoupleSelection => {
      // Find marriage date from links
      let marriageDate: string | undefined;
      const childIds = new Set<string>();
      const person1ParentIds = new Set<string>();
      const person2ParentIds = new Set<string>();

      for (const link of links) {
        if (link.relationship === 'SPOUSE') {
          if (
            (link.source === person1.id && link.target === person2.id) ||
            (link.source === person2.id && link.target === person1.id)
          ) {
            marriageDate = link.start_date;
          }
        }

        // Find children (anyone where either person1 or person2 is a parent)
        if (link.relationship === 'PARENT_CHILD') {
          if (link.source === person1.id || link.source === person2.id) {
            childIds.add(link.target);
          }
          // Find parents of person1
          if (link.target === person1.id) {
            person1ParentIds.add(link.source);
          }
          // Find parents of person2
          if (link.target === person2.id) {
            person2ParentIds.add(link.source);
          }
        }
      }

      const children = storeNodes.filter((n) => childIds.has(n.id));
      const person1Parents = storeNodes.filter((n) => person1ParentIds.has(n.id));
      const person2Parents = storeNodes.filter((n) => person2ParentIds.has(n.id));

      return {
        person1,
        person2,
        marriageDate,
        children,
        person1Parents,
        person2Parents,
      };
    },
    [links, storeNodes]
  );

  // Event handlers
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      if (node.type === 'coupleNode') {
        const target = event.target as HTMLElement;
        const personElement = target.closest('[data-person-id]');

        // If clicked on a specific person inside the couple card
        if (personElement) {
          const personId = personElement.getAttribute('data-person-id');
          if (personId) {
            setSelectedPerson(personId);
            return;
          }
        }

        // Clicked on couple card background - show couple details
        const data = node.data as { person1: Person; person2: Person };
        const coupleData = buildCoupleSelection(data.person1, data.person2);
        setSelectedCouple(coupleData);
      } else {
        setSelectedPerson(node.id);
      }
    },
    [setSelectedPerson, setSelectedCouple, buildCoupleSelection]
  );

  const onPaneClick = useCallback(() => {
    setSelectedPerson(null);
  }, [setSelectedPerson]);

  // Loading state
  if (isLoading && storeNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted">Loading family tree...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && storeNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">No Family Data</h2>
          <p className="text-muted text-sm max-w-sm">
            The family tree is empty. Import your family data to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={REACT_FLOW_CONFIG.minZoom}
        maxZoom={REACT_FLOW_CONFIG.maxZoom}
        defaultViewport={REACT_FLOW_CONFIG.defaultViewport}
        proOptions={REACT_FLOW_CONFIG.proOptions}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="[&>pattern>circle]:fill-[var(--dot-color)]"
        />
        <CanvasControls />
      </ReactFlow>
    </div>
  );
}

export function FamilyTreeCanvas() {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvasInner />
    </ReactFlowProvider>
  );
}
