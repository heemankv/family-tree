Project Vision: Family Graph Explorer

1. Executive Summary

The Family Graph Explorer is a modern, web-based application designed to visualize and explore complex family lineages. Unlike traditional genealogy software that feels cluttered or dated, this project aims for a sleek, "Google Maps-like" experience where the user navigates an infinite canvas of connections.

A unique feature of this application is its "Developer First" philosophy. While accessible to non-technical users (like older relatives), it includes hidden power-user tools—specifically a "Siri-style" command bar that allows developers to query the underlying graph database directly using Cypher.

2. Core Objectives

Visual Exploration: Move away from static lists. The primary interface is a dynamic, zoomable graph.

Simplicity & Accessibility: The UI must be usable by older generations. High contrast, clear typography, and an "off-white" paper-like aesthetic.

Contextual Details: Information appears on demand (slide-out sidebar) rather than cluttering the view.

Transparency: Showcase the underlying technology (Neo4j) via a dedicated query interface.

3. Technology Stack

Frontend: React (Next.js Framework), Tailwind CSS, Lucide Icons.

Backend: Go (Golang) with Gin framework.

Database: Neo4j (Local Docker for development, AuraDB for production).

Deployment: Vercel (Frontend), Docker/Cloud Run (Backend).

4. User Personas

The Relative: Wants to find themselves, see who their cousins are, and view photos. They need simple click-and-drag navigation.

The Developer/Curator (You): Wants to manage data via bulk CSV uploads and verify relationships using raw database queries from the UI.

5. Key Features

Infinite Canvas: Drag-to-pan and scroll-to-zoom interface.

Smart Nodes: Minimalist person cards showing only Avatar and Name.

Detail Sidebar: A collapsible left-hand panel for deep-dive information (Bio, Dates, Profession).

Developer Toolbar: A discreet, accessible command palette for running Cypher queries against the live database.





- - more context - - 


Create a React (Next.js) frontend for a "Family Graph Explorer" application using Tailwind CSS. The design should be minimalist, "architectural," and accessible, using an off-white background (#F5F5F5) and clean sans-serif typography (Inter or Geist).

Key UI Components & Layout:

Infinite Canvas (Right Pane - 70% width):

Implement a drag-to-pan and scroll-to-zoom SVG canvas (or customized react-d3-tree).

Nodes: Render people as minimalist circles (rounded-full, shadow-lg) containing just an avatar and name.

Interaction: Clicking a node must smoothly center it in the viewport and trigger the Sidebar to open.

Performance: Visually fade out nodes beyond a certain depth or render a "Scope Boundary" box.

Profile Sidebar (Left Pane - 30% width):

A collapsible panel that slides in when a node is clicked.

Content: Large circular avatar, Name (with "Late" badge if deceased), and a vertical list of attributes (Born, Died, Location, Job) with icons.

Include an "Immediate Family" section for quick navigation to parents/siblings.

Developer "Siri" Toolbar:

Place a multi-colored, circular floating button in the top-right sticky header.

Action: Clicking opens a centered, glass-morphism (backdrop-blur-xl) modal with a glowing input field.

This input allows users to run raw Cypher queries and displays the JSON result in a dark-mode code block.

Technical Constraints:

Use useRef for canvas dragging logic to prevent re-render performance issues.

Implement a centerOnPerson(id) function for programmatic viewport panning.

Ensure the design resembles a clean drafting table or map interface.
