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
  // Only storeNodes, links changes should trigger re-layout
  // selectedPersonId only affects highlighting, not positions
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    return layoutFamilyTree(storeNodes, links, LAYOUT_CENTER_NODE, selectedPersonId);
  }, [storeNodes, links, selectedPersonId]);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Update nodes when layout changes
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

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
