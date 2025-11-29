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
import { Link } from '@/types';

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

function buildRelationshipMaps(selectedPersonId: string | null, links: Link[]): RelationshipMaps {
  const parentIds = new Set<string>();
  const childIds = new Set<string>();

  if (!selectedPersonId || !links) {
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
  parentIds: Set<string>,
  childIds: Set<string>
): boolean {
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
  parentIds: Set<string>,
  childIds: Set<string>
): Edge {
  const highlighted = isEdgeHighlighted(edge, selectedPersonId, parentIds, childIds);

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
  const setSelectedPerson = useAppStore((state) => state.setSelectedPerson);
  const isLoading = useAppStore((state) => state.isLoading);

  // Custom hooks
  useKeyboardZoomControls();
  useFitViewOnLoad(storeNodes.length);

  // Calculate layout (only recalculates on data changes)
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => layoutFamilyTree(storeNodes, links, ME_PERSON_ID, null),
    [storeNodes, links]
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
    () => buildRelationshipMaps(selectedPersonId, links),
    [selectedPersonId, links]
  );

  // Update selection state
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'coupleNode') {
          const data = node.data as { person1: { id: string }; person2: { id: string } };
          const isSelected = selectedPersonId === data.person1.id || selectedPersonId === data.person2.id;
          return {
            ...node,
            data: { ...node.data, isSelected, selectedPersonId },
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
  }, [selectedPersonId, setNodes]);

  // Update edge highlighting
  useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        updateEdgeHighlighting(edge, selectedPersonId, parentIds, childIds)
      )
    );
  }, [selectedPersonId, parentIds, childIds, setEdges]);

  // Event handlers
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      if (node.type === 'coupleNode') {
        const target = event.target as HTMLElement;
        const personElement = target.closest('[data-person-id]');

        if (personElement) {
          const personId = personElement.getAttribute('data-person-id');
          if (personId) {
            setSelectedPerson(personId);
            return;
          }
        }

        const data = node.data as { person1: { id: string } };
        setSelectedPerson(data.person1.id);
      } else {
        setSelectedPerson(node.id);
      }
    },
    [setSelectedPerson]
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
        nodesDraggable={false}
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
