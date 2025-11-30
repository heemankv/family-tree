import { Node, Edge } from '@xyflow/react';
import { Person, Link, PersonNodeData, CoupleNodeData } from '@/types';

// Layout constants
const ROW_HEIGHT = 300;
const COUPLE_WIDTH = 360;
const SINGLE_WIDTH = 200;
const COL_GAP = 60;

type LayoutNode = Node<PersonNodeData | CoupleNodeData>;

interface LayoutResult {
  nodes: LayoutNode[];
  edges: Edge[];
}

interface NodeInfo {
  id: string;
  persons: Person[];
  width: number;
  x: number;
}

// Find parent-child relationships
function getParentChildMap(links: Link[]): { parents: Map<string, string[]>; children: Map<string, string[]> } {
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();

  for (const link of links) {
    if (link.relationship === 'PARENT_CHILD') {
      if (!children.has(link.source)) children.set(link.source, []);
      children.get(link.source)!.push(link.target);

      if (!parents.has(link.target)) parents.set(link.target, []);
      parents.get(link.target)!.push(link.source);
    }
  }

  return { parents, children };
}

// Find spouse relationships
function getSpouseMap(links: Link[]): Map<string, string> {
  const spouses = new Map<string, string>();

  for (const link of links) {
    if (link.relationship === 'SPOUSE') {
      spouses.set(link.source, link.target);
      spouses.set(link.target, link.source);
    }
  }

  return spouses;
}

// Calculate generation level for each person using BFS from center
function calculateGenerations(
  persons: Person[],
  links: Link[],
  centerPersonId: string
): Map<string, number> {
  const generations = new Map<string, number>();
  const { parents, children } = getParentChildMap(links);
  const spouseMap = getSpouseMap(links);
  const personIds = new Set(persons.map(p => p.id));

  generations.set(centerPersonId, 0);
  const queue: string[] = [centerPersonId];
  const visited = new Set<string>([centerPersonId]);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentGen = generations.get(currentId)!;

    const parentIds = parents.get(currentId) || [];
    for (const parentId of parentIds) {
      if (!visited.has(parentId) && personIds.has(parentId)) {
        visited.add(parentId);
        generations.set(parentId, currentGen - 1);
        queue.push(parentId);
      }
    }

    const childIds = children.get(currentId) || [];
    for (const childId of childIds) {
      if (!visited.has(childId) && personIds.has(childId)) {
        visited.add(childId);
        generations.set(childId, currentGen + 1);
        queue.push(childId);
      }
    }

    const spouseId = spouseMap.get(currentId);
    if (spouseId && !visited.has(spouseId) && personIds.has(spouseId)) {
      visited.add(spouseId);
      generations.set(spouseId, currentGen);
      queue.push(spouseId);
    }
  }

  for (const person of persons) {
    if (!generations.has(person.id)) {
      generations.set(person.id, 0);
    }
  }

  return generations;
}

// Resolve overlapping nodes by pushing them apart
function resolveOverlaps(nodeInfos: NodeInfo[]): void {
  // Sort by x position
  nodeInfos.sort((a, b) => a.x - b.x);

  // Push overlapping nodes apart
  for (let i = 1; i < nodeInfos.length; i++) {
    const prev = nodeInfos[i - 1];
    const curr = nodeInfos[i];
    const minX = prev.x + prev.width / 2 + COL_GAP + curr.width / 2;

    if (curr.x < minX) {
      curr.x = minX;
    }
  }

  // Center the generation around 0
  if (nodeInfos.length > 0) {
    const minX = nodeInfos[0].x - nodeInfos[0].width / 2;
    const maxX = nodeInfos[nodeInfos.length - 1].x + nodeInfos[nodeInfos.length - 1].width / 2;
    const offset = (minX + maxX) / 2;

    for (const node of nodeInfos) {
      node.x -= offset;
    }
  }
}

// Layout the family tree with parent-child alignment
export function layoutFamilyTree(
  persons: Person[],
  links: Link[],
  centerPersonId: string,
  selectedPersonId: string | null
): LayoutResult {
  if (!persons || persons.length === 0) {
    return { nodes: [], edges: [] };
  }

  if (!links) {
    links = [];
  }

  const generations = calculateGenerations(persons, links, centerPersonId);
  const spouseMap = getSpouseMap(links);
  const { parents, children } = getParentChildMap(links);
  const personMap = new Map(persons.map(p => [p.id, p]));

  // Group persons by generation
  const genGroups = new Map<number, Person[]>();
  for (const person of persons) {
    const gen = generations.get(person.id) ?? 0;
    if (!genGroups.has(gen)) genGroups.set(gen, []);
    genGroups.get(gen)!.push(person);
  }

  const genNumbers = Array.from(genGroups.keys()).sort((a, b) => a - b);
  const minGen = genNumbers[0] ?? 0;
  const maxGen = genNumbers[genNumbers.length - 1] ?? 0;

  // Track node positions: personId -> x position
  const personXPositions = new Map<string, number>();
  // Track node info by generation
  const genNodeInfos = new Map<number, NodeInfo[]>();
  // Track which persons are processed
  const processedPersons = new Set<string>();
  // Map personId -> nodeId
  const nodeIdMap = new Map<string, string>();

  // Process generations from oldest (bottom) to youngest (top)
  for (let gen = minGen; gen <= maxGen; gen++) {
    const personsInGen = genGroups.get(gen) || [];
    const nodeInfos: NodeInfo[] = [];

    for (const person of personsInGen) {
      if (processedPersons.has(person.id)) continue;

      const spouseId = spouseMap.get(person.id);
      const spouse = spouseId ? personMap.get(spouseId) : undefined;
      const spouseGen = spouseId ? generations.get(spouseId) : undefined;
      const spouseInSameGen = spouse && spouseGen === gen && !processedPersons.has(spouseId!);

      // Calculate x position based on parents (for couple, use both persons' parents)
      let targetX = 0;
      const relevantPersonIds = spouseInSameGen ? [person.id, spouse!.id] : [person.id];

      // Get all parent positions
      const parentPositions: number[] = [];
      for (const pid of relevantPersonIds) {
        const parentIds = parents.get(pid) || [];
        for (const parentId of parentIds) {
          const parentX = personXPositions.get(parentId);
          if (parentX !== undefined) {
            parentPositions.push(parentX);
          }
        }
      }

      // Get all children positions (for older generations positioning based on where children ended up)
      const childPositions: number[] = [];
      for (const pid of relevantPersonIds) {
        const childIds = children.get(pid) || [];
        for (const childId of childIds) {
          const childX = personXPositions.get(childId);
          if (childX !== undefined) {
            childPositions.push(childX);
          }
        }
      }

      if (parentPositions.length > 0) {
        // Position based on average of parent positions
        targetX = parentPositions.reduce((a, b) => a + b, 0) / parentPositions.length;
      } else if (childPositions.length > 0) {
        // Position based on average of children positions
        targetX = childPositions.reduce((a, b) => a + b, 0) / childPositions.length;
      }

      if (spouseInSameGen) {
        const [firstId, secondId] = [person.id, spouse!.id].sort();
        const nodeId = `couple-${firstId}-${secondId}`;

        nodeInfos.push({
          id: nodeId,
          persons: [person, spouse!],
          width: COUPLE_WIDTH,
          x: targetX,
        });

        nodeIdMap.set(person.id, nodeId);
        nodeIdMap.set(spouse!.id, nodeId);
        processedPersons.add(person.id);
        processedPersons.add(spouse!.id);
      } else {
        nodeInfos.push({
          id: person.id,
          persons: [person],
          width: SINGLE_WIDTH,
          x: targetX,
        });

        nodeIdMap.set(person.id, person.id);
        processedPersons.add(person.id);
      }
    }

    // Resolve overlaps within this generation
    resolveOverlaps(nodeInfos);

    // Record positions for all persons in this generation
    for (const info of nodeInfos) {
      for (const p of info.persons) {
        personXPositions.set(p.id, info.x);
      }
    }

    genNodeInfos.set(gen, nodeInfos);
  }

  // Second pass: adjust parent positions to be centered under their children
  // Process from youngest to oldest
  for (let gen = maxGen - 1; gen >= minGen; gen--) {
    const nodeInfos = genNodeInfos.get(gen) || [];

    for (const info of nodeInfos) {
      // Find all children of persons in this node
      const childXPositions: number[] = [];
      for (const p of info.persons) {
        const childIds = children.get(p.id) || [];
        for (const childId of childIds) {
          const childX = personXPositions.get(childId);
          if (childX !== undefined) {
            childXPositions.push(childX);
          }
        }
      }

      if (childXPositions.length > 0) {
        const avgChildX = childXPositions.reduce((a, b) => a + b, 0) / childXPositions.length;
        info.x = avgChildX;
      }
    }

    // Resolve overlaps again after adjustment
    resolveOverlaps(nodeInfos);

    // Update positions
    for (const info of nodeInfos) {
      for (const p of info.persons) {
        personXPositions.set(p.id, info.x);
      }
    }
  }

  // Create actual nodes
  const nodes: LayoutNode[] = [];

  for (let gen = minGen; gen <= maxGen; gen++) {
    const nodeInfos = genNodeInfos.get(gen) || [];
    const y = (maxGen - gen) * ROW_HEIGHT;

    for (const info of nodeInfos) {
      if (info.persons.length === 2) {
        // Couple node
        const [firstId, secondId] = [info.persons[0].id, info.persons[1].id].sort();
        const [person1, person2] = info.persons[0].id === firstId
          ? [info.persons[0], info.persons[1]]
          : [info.persons[1], info.persons[0]];

        nodes.push({
          id: info.id,
          type: 'coupleNode',
          position: { x: info.x - info.width / 2, y },
          data: {
            person1,
            person2,
            isSelected: selectedPersonId === person1.id || selectedPersonId === person2.id,
            selectedPersonId,
          },
        });
      } else {
        // Single node
        const person = info.persons[0];
        nodes.push({
          id: info.id,
          type: 'personNode',
          position: { x: info.x - info.width / 2, y },
          data: {
            person,
            isSelected: person.id === selectedPersonId,
          },
        });
      }
    }
  }

  // Center the entire layout
  if (nodes.length > 0) {
    const allX = nodes.map(n => n.position.x + (n.type === 'coupleNode' ? COUPLE_WIDTH : SINGLE_WIDTH) / 2);
    const allY = nodes.map(n => n.position.y);
    const centerX = (Math.min(...allX) + Math.max(...allX)) / 2;
    const centerY = (Math.min(...allY) + Math.max(...allY)) / 2;

    for (const node of nodes) {
      node.position.x -= centerX;
      node.position.y -= centerY;
    }
  }

  // Create edges
  const edges: Edge[] = [];
  const addedEdges = new Set<string>();

  const selectedParentIds = new Set(selectedPersonId ? (parents.get(selectedPersonId) || []) : []);
  const selectedChildIds = new Set(selectedPersonId ? (children.get(selectedPersonId) || []) : []);

  const selectedSpouseId = selectedPersonId ? spouseMap.get(selectedPersonId) : null;
  if (selectedSpouseId) {
    const spouseChildren = children.get(selectedSpouseId) || [];
    spouseChildren.forEach(id => selectedChildIds.add(id));
  }

  for (const link of links) {
    if (link.relationship !== 'PARENT_CHILD') continue;

    const parentNodeId = nodeIdMap.get(link.source);
    const childNodeId = nodeIdMap.get(link.target);

    if (!parentNodeId || !childNodeId) continue;

    const edgeKey = `${parentNodeId}->${childNodeId}`;
    if (addedEdges.has(edgeKey)) continue;
    addedEdges.add(edgeKey);

    const isHighlighted = selectedPersonId !== null && (
      link.target === selectedPersonId ||
      selectedParentIds.has(link.source) ||
      selectedChildIds.has(link.target)
    );

    edges.push({
      id: `edge-${edgeKey}`,
      source: parentNodeId,
      target: childNodeId,
      sourceHandle: 'top',     // parent's top handle (going up to children)
      targetHandle: 'bottom',  // child's bottom handle (receiving from parents)
      type: 'simplebezier',
      className: isHighlighted ? 'highlighted-edge' : '',
      zIndex: isHighlighted ? 1000 : 0,
      style: {
        strokeWidth: isHighlighted ? 3 : 2,
      },
    });
  }

  return { nodes, edges };
}
