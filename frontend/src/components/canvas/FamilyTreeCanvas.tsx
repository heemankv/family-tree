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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PersonNode } from './PersonNode';
import { CoupleNode } from './CoupleNode';
import { CanvasControls } from './CanvasControls';
import { layoutFamilyTree } from '@/lib/graph-layout';
import { useAppStore } from '@/store/useAppStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Register custom node types
const nodeTypes = {
  personNode: PersonNode,
  coupleNode: CoupleNode,
};

// Fixed center node for consistent layout - never changes
const LAYOUT_CENTER_NODE = 'me-001';

function FamilyTreeCanvasInner() {
  const {
    nodes: storeNodes,
    links,
    selectedPersonId,
    setSelectedPerson,
    isLoading,
  } = useAppStore();

  const isMobile = useIsMobile();
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Keyboard shortcuts for zoom (inside ReactFlowProvider)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // + or = key: Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn({ duration: 200 });
      }

      // - key: Zoom out
      if (e.key === '-') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      }

      // 0 key: Fit view / reset zoom
      if (e.key === '0') {
        e.preventDefault();
        fitView({ duration: 300, padding: 0.2 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, fitView]);

  // Calculate layout - use fixed center node to prevent layout shifts
  // Only storeNodes, links changes should trigger full re-layout
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    return layoutFamilyTree(storeNodes, links, LAYOUT_CENTER_NODE, null);
  }, [storeNodes, links]);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Update nodes when layout changes (only on data load, not selection)
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  // Build parent/child/spouse relationships for edge highlighting
  const { parentIds, childIds } = useMemo(() => {
    if (!selectedPersonId || !links) {
      return { parentIds: new Set<string>(), childIds: new Set<string>() };
    }

    const parentIds = new Set<string>();
    const childIds = new Set<string>();
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

    // Also include spouse's children
    if (spouseId) {
      for (const link of links) {
        if (link.relationship === 'PARENT_CHILD' && link.source === spouseId) {
          childIds.add(link.target);
        }
      }
    }

    return { parentIds, childIds };
  }, [selectedPersonId, links]);

  // Update only selection state without recreating nodes
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'coupleNode') {
          const data = node.data as { person1: { id: string }; person2: { id: string } };
          const isSelected = selectedPersonId === data.person1.id || selectedPersonId === data.person2.id;
          return {
            ...node,
            data: {
              ...node.data,
              isSelected,
              selectedPersonId,
            },
          };
        } else {
          return {
            ...node,
            data: {
              ...node.data,
              isSelected: node.id === selectedPersonId,
            },
          };
        }
      })
    );
  }, [selectedPersonId, setNodes]);

  // Update edge highlighting separately
  useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        let isHighlighted = false;

        if (selectedPersonId) {
          // Only highlight blood relations:
          // 1. Edge where target is the selected person (edge from parent to selected)
          const edgeToSelected = edge.target === selectedPersonId || edge.target.includes(selectedPersonId);
          // 2. Edge where target is a child of selected person
          const edgeToChild = Array.from(childIds).some(
            (cid) => edge.target === cid || edge.target.includes(cid)
          );

          // For edges TO the selected person, only highlight if source is their parent
          if (edgeToSelected) {
            const sourceIsParent = Array.from(parentIds).some(
              (pid) => edge.source === pid || edge.source.includes(pid)
            );
            isHighlighted = sourceIsParent;
          } else if (edgeToChild) {
            // For edges to children, only highlight if source contains the selected person
            const sourceHasSelected = edge.source === selectedPersonId || edge.source.includes(selectedPersonId);
            isHighlighted = sourceHasSelected;
          }
        }

        return {
          ...edge,
          className: isHighlighted ? 'highlighted-edge' : '',
          style: {
            ...edge.style,
            strokeWidth: isHighlighted ? 3 : 2,
          },
        };
      })
    );
  }, [selectedPersonId, parentIds, childIds, setEdges]);

  // Fit view when data loads
  useEffect(() => {
    if (storeNodes.length > 0) {
      setTimeout(() => {
        fitView({ duration: 300, padding: 0.2 });
      }, 100);
    }
  }, [storeNodes.length, fitView]);

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      // For couple nodes, detect which person was clicked
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
        // If no specific person clicked, select person1
        const data = node.data as { person1: { id: string } };
        setSelectedPerson(data.person1.id);
      } else {
        setSelectedPerson(node.id);
      }
    },
    [setSelectedPerson]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    // Deselect on pane click (clicking empty canvas area)
    setSelectedPerson(null);
  }, [setSelectedPerson]);

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
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        // Interaction options
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        // Selection
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
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
