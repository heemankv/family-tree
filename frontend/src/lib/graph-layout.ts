import { Node, Edge } from '@xyflow/react';
import { Person, Link, PersonNodeData, CoupleNodeData } from '@/types';

// Layout constants
const ROW_HEIGHT = 200;
const COUPLE_WIDTH = 280;
const SINGLE_WIDTH = 160;
const COL_GAP = 40;

type LayoutNode = Node<PersonNodeData | CoupleNodeData>;

interface LayoutResult {
  nodes: LayoutNode[];
  edges: Edge[];
}

// Find parent-child relationships
function getParentChildMap(links: Link[]): { parents: Map<string, string[]>; children: Map<string, string[]> } {
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();

  for (const link of links) {
    if (link.relationship === 'PARENT_CHILD') {
      // source is parent, target is child
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

  // Start from center person
  generations.set(centerPersonId, 0);
  const queue: string[] = [centerPersonId];
  const visited = new Set<string>([centerPersonId]);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentGen = generations.get(currentId)!;

    // Parents are one generation up (negative)
    const parentIds = parents.get(currentId) || [];
    for (const parentId of parentIds) {
      if (!visited.has(parentId) && personIds.has(parentId)) {
        visited.add(parentId);
        generations.set(parentId, currentGen - 1);
        queue.push(parentId);
      }
    }

    // Children are one generation down (positive)
    const childIds = children.get(currentId) || [];
    for (const childId of childIds) {
      if (!visited.has(childId) && personIds.has(childId)) {
        visited.add(childId);
        generations.set(childId, currentGen + 1);
        queue.push(childId);
      }
    }

    // Spouse is same generation
    const spouseId = spouseMap.get(currentId);
    if (spouseId && !visited.has(spouseId) && personIds.has(spouseId)) {
      visited.add(spouseId);
      generations.set(spouseId, currentGen);
      queue.push(spouseId);
    }
  }

  // Handle any disconnected persons (shouldn't happen normally)
  for (const person of persons) {
    if (!generations.has(person.id)) {
      generations.set(person.id, 0);
    }
  }

  return generations;
}

// Layout the family tree with couple grouping
// IMPORTANT: Layout positions should NOT depend on selectedPersonId to avoid re-arrangement
export function layoutFamilyTree(
  persons: Person[],
  links: Link[],
  centerPersonId: string,
  selectedPersonId: string | null
): LayoutResult {
  // Handle null, undefined, or empty arrays
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

  // Sort persons within each generation for consistent ordering
  // Sort by ID to ensure stable order regardless of data fetch order
  genGroups.forEach((group) => {
    group.sort((a: Person, b: Person) => a.id.localeCompare(b.id));
  });

  const genNumbers = Array.from(genGroups.keys()).sort((a, b) => a - b);
  const minGen = genNumbers[0] ?? 0;
  const maxGen = genNumbers[genNumbers.length - 1] ?? 0;

  // Track which persons are grouped into couples
  const processedPersons = new Set<string>();
  const nodes: LayoutNode[] = [];
  const nodeIdMap = new Map<string, string>(); // personId -> nodeId

  // Process each generation and create nodes
  for (let gen = minGen; gen <= maxGen; gen++) {
    const personsInGen = genGroups.get(gen) || [];
    let xOffset = 0;
    const y = (gen - minGen) * ROW_HEIGHT;

    for (const person of personsInGen) {
      if (processedPersons.has(person.id)) continue;

      const spouseId = spouseMap.get(person.id);
      const spouse = spouseId ? personMap.get(spouseId) : undefined;
      const spouseGen = spouseId ? generations.get(spouseId) : undefined;
      const spouseInSameGen = spouse && spouseGen === gen;

      if (spouse && spouseInSameGen && !processedPersons.has(spouseId!)) {
        // Create couple node - use sorted IDs for consistent node ID
        const [firstId, secondId] = [person.id, spouse.id].sort();
        const coupleNodeId = `couple-${firstId}-${secondId}`;

        // Determine which person is first based on sorted order
        const [person1, person2] = person.id === firstId ? [person, spouse] : [spouse, person];

        nodes.push({
          id: coupleNodeId,
          type: 'coupleNode',
          position: { x: xOffset, y },
          data: {
            person1,
            person2,
            isSelected: selectedPersonId === person.id || selectedPersonId === spouse.id,
            selectedPersonId,
          },
        });

        nodeIdMap.set(person.id, coupleNodeId);
        nodeIdMap.set(spouse.id, coupleNodeId);
        processedPersons.add(person.id);
        processedPersons.add(spouse.id);
        xOffset += COUPLE_WIDTH + COL_GAP;
      } else {
        // Create single person node
        nodes.push({
          id: person.id,
          type: 'personNode',
          position: { x: xOffset, y },
          data: {
            person,
            isSelected: person.id === selectedPersonId,
          },
        });

        nodeIdMap.set(person.id, person.id);
        processedPersons.add(person.id);
        xOffset += SINGLE_WIDTH + COL_GAP;
      }
    }
  }

  // Center the layout
  if (nodes.length > 0) {
    const allX = nodes.map(n => n.position.x);
    const allY = nodes.map(n => n.position.y);
    const centerX = (Math.min(...allX) + Math.max(...allX)) / 2;
    const centerY = (Math.min(...allY) + Math.max(...allY)) / 2;

    for (const node of nodes) {
      node.position.x -= centerX;
      node.position.y -= centerY;
    }
  }

  // Create edges - only PARENT_CHILD relationships
  // Each child should have exactly ONE edge to their parent(s) node
  const edges: Edge[] = [];
  const addedEdges = new Set<string>();

  // Get highlighted edges info (for visual styling only, not layout)
  const selectedParentIds = new Set(selectedPersonId ? (parents.get(selectedPersonId) || []) : []);
  const selectedChildIds = new Set(selectedPersonId ? (children.get(selectedPersonId) || []) : []);

  // If selected person has a spouse, include their children too
  const selectedSpouseId = selectedPersonId ? spouseMap.get(selectedPersonId) : null;
  if (selectedSpouseId) {
    const spouseChildren = children.get(selectedSpouseId) || [];
    spouseChildren.forEach(id => selectedChildIds.add(id));
  }

  // For each PARENT_CHILD link, create an edge from parent's node to child's node
  for (const link of links) {
    if (link.relationship !== 'PARENT_CHILD') continue;

    const parentNodeId = nodeIdMap.get(link.source);
    const childNodeId = nodeIdMap.get(link.target);

    if (!parentNodeId || !childNodeId) continue;

    // Create unique edge key to avoid duplicates
    // (both parents in a couple map to same node, so we dedupe)
    const edgeKey = `${parentNodeId}->${childNodeId}`;
    if (addedEdges.has(edgeKey)) continue;
    addedEdges.add(edgeKey);

    // Determine if this edge should be highlighted
    const isHighlighted = selectedPersonId !== null && (
      // Edge goes TO the selected person (from their parent)
      link.target === selectedPersonId ||
      // Edge goes FROM the selected person (to their child)
      selectedChildIds.has(link.target)
    );

    edges.push({
      id: `edge-${edgeKey}`,
      source: parentNodeId,
      target: childNodeId,
      type: 'smoothstep',
      className: isHighlighted ? 'highlighted-edge' : '',
      style: {
        strokeWidth: isHighlighted ? 3 : 2,
      },
    });
  }

  return { nodes, edges };
}
