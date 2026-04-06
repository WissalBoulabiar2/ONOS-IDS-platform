'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { TopologyEdge, TopologyNode } from '@/lib/types';
import type { TopologyLayoutMode } from '@/services/api';
import type { Core as CytoscapeCore } from 'cytoscape';

type CytoscapeFactory = typeof import('cytoscape');

let cytoscape: CytoscapeFactory | null = null;

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNode?: string | null;
  selectedEdge?: string | null;
  onNodeClick?: (nodeId: string | null) => void;
  onEdgeClick?: (edgeId: string | null) => void;
  onEdgeHover?: (edgeId: string | null) => void;
  onMapBackgroundClick?: () => void;
  layout?: TopologyLayoutMode;
  showEdgeLabels?: boolean;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
}

// ─── SVG icons encoded as data URIs ──────────────────────────────────────────

function svgUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SWITCH_ICON = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="rgba(255,255,255,0.95)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="7" width="22" height="10" rx="2"/>
    <path d="M5 7V5M8 7V5M12 7V5M16 7V5M19 7V5"/>
    <circle cx="5" cy="19" r="1" fill="rgba(255,255,255,0.8)" stroke="none"/>
    <circle cx="9" cy="19" r="1" fill="rgba(255,255,255,0.8)" stroke="none"/>
    <circle cx="15" cy="19" r="1" fill="rgba(255,255,255,0.8)" stroke="none"/>
    <circle cx="19" cy="19" r="1" fill="rgba(255,255,255,0.8)" stroke="none"/>
  </svg>`
);

const ROUTER_ICON = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="rgba(255,255,255,0.95)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M8 12h8M12 8l4 4-4 4"/>
    <path d="M2 12h2M20 12h2"/>
  </svg>`
);

const HOST_ICON = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="rgba(255,255,255,0.95)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>`
);

// ─── Layout configs ───────────────────────────────────────────────────────────

function getLayoutConfig(layout: TopologyLayoutMode) {
  switch (layout) {
    case 'breadthfirst':
      return { name: 'breadthfirst', directed: false, padding: 32, spacingFactor: 1.15, animate: false };
    case 'circle':
      return { name: 'circle', padding: 44, spacingFactor: 1.08, animate: false };
    case 'cose':
    default:
      return {
        name: 'cose',
        directed: false,
        animate: false,
        avoidOverlap: true,
        nodeSpacing: 20,
        gravity: 1,
        coolingFactor: 0.99,
        minTemp: 1,
      };
  }
}

function buildFocusCollection(cy: CytoscapeCore, nodeIds: string[], edgeIds: string[]) {
  let collection = cy.collection();
  nodeIds.forEach((id) => { collection = collection.union(cy.getElementById(id)); });
  edgeIds.forEach((id) => { collection = collection.union(cy.getElementById(id)); });
  return collection;
}

/**
 * Deduplicate bidirectional edges: ONOS reports A→B and B→A as separate links.
 * We keep only one canonical edge per pair (the one that appears first).
 */
function deduplicateEdges(edges: TopologyEdge[]): TopologyEdge[] {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const fwd = `${edge.source}||${edge.target}`;
    const rev = `${edge.target}||${edge.source}`;
    if (seen.has(fwd) || seen.has(rev)) return false;
    seen.add(fwd);
    return true;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TopologyMap({
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  onNodeClick,
  onEdgeClick,
  onEdgeHover,
  onMapBackgroundClick,
  layout = 'cose',
  showEdgeLabels = true,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
}: TopologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<CytoscapeCore | null>(null);
  const [cyReady, setCyReady] = useState(Boolean(cytoscape));

  const highlightedNodeSet = useMemo(() => new Set(highlightedNodeIds), [highlightedNodeIds]);
  const highlightedEdgeSet = useMemo(() => new Set(highlightedEdgeIds), [highlightedEdgeIds]);

  // Deduplicated edges (one canonical link per device pair)
  const uniqueEdges = useMemo(() => deduplicateEdges(edges), [edges]);

  useEffect(() => {
    let cancelled = false;
    async function ensureCytoscape() {
      if (cytoscape) { setCyReady(true); return; }
      const m = await import('cytoscape');
      cytoscape = (m.default ?? m) as unknown as CytoscapeFactory;
      if (!cancelled) setCyReady(true);
    }
    void ensureCytoscape();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !cyReady || !cytoscape) return;

    if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }

    const elements = [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          subtitle: node.type === 'host' ? node.location || node.mac || '' : node.manufacturer || '',
        },
        classes: [
          node.type,
          node.status,
          highlightedNodeSet.has(node.id) ? 'path-highlight' : '',
          selectedNode === node.id ? 'selected-focus' : '',
        ].filter(Boolean).join(' '),
      })),
      ...uniqueEdges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: showEdgeLabels ? edge.label || '' : '',
        },
        classes: [
          edge.status,
          edge.kind || 'infrastructure',
          edge.loadState || 'unknown',
          highlightedEdgeSet.has(edge.id) ? 'path-highlight' : '',
          selectedEdge === edge.id ? 'edge-selected' : '',
        ].filter(Boolean).join(' '),
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // ── Default node ───────────────────────────────────────────────────
        {
          selector: 'node',
          style: {
            'background-color': '#0891b2',
            'background-image': SWITCH_ICON,
            'background-fit': 'contain',
            'background-image-opacity': 0.9,
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 10,
            'text-wrap': 'wrap',
            'text-max-width': 96,
            color: '#e5f3ff',
            'font-size': '11px',
            'font-weight': 600,
            'border-width': '2px',
            'border-color': '#67e8f9',
            width: 46,
            height: 46,
            'overlay-padding': 8,
          },
        },
        // ── Switch node ────────────────────────────────────────────────────
        {
          selector: 'node.switch',
          style: {
            shape: 'round-rectangle',
            'background-color': '#0f766e',
            'border-color': '#5eead4',
            'background-image': SWITCH_ICON,
            width: 48,
            height: 36,
          },
        },
        // ── Router node ────────────────────────────────────────────────────
        {
          selector: 'node.router',
          style: {
            shape: 'ellipse',
            'background-color': '#0369a1',
            'border-color': '#7dd3fc',
            'background-image': ROUTER_ICON,
            width: 46,
            height: 46,
          },
        },
        // ── Host node ──────────────────────────────────────────────────────
        {
          selector: 'node.host',
          style: {
            shape: 'ellipse',
            width: 34,
            height: 34,
            'background-color': '#155e75',
            'border-color': '#67e8f9',
            'background-image': HOST_ICON,
            'background-fit': 'contain',
          },
        },
        // ── Inactive node ─────────────────────────────────────────────────
        {
          selector: 'node.inactive',
          style: {
            'background-color': '#3f3f46',
            'border-color': '#71717a',
            opacity: 0.75,
          },
        },
        // ── Path-highlight node ────────────────────────────────────────────
        {
          selector: 'node.path-highlight',
          style: { 'border-width': '4px', 'border-color': '#f59e0b' },
        },
        // ── Selected node ─────────────────────────────────────────────────
        {
          selector: 'node.selected-focus',
          style: { 'border-width': '5px', 'border-color': '#fde047' },
        },
        // ── Default edge ───────────────────────────────────────────────────
        {
          selector: 'edge',
          style: {
            width: 2.4,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'none',
            'curve-style': 'straight',
            label: 'data(label)',
            'font-size': '9px',
            'text-background-color': '#020617',
            'text-background-opacity': 0.84,
            'text-background-padding': '3px',
            color: '#e2e8f0',
            opacity: 0.9,
          },
        },
        {
          selector: 'edge.infrastructure',
          style: { width: 2.6 },
        },
        {
          selector: 'edge.access',
          style: {
            'line-style': 'dotted',
            'line-color': '#2dd4bf',
            'target-arrow-color': '#2dd4bf',
            width: 1.9,
          },
        },
        {
          selector: 'edge.nominal',
          style: { 'line-color': '#22c55e', 'target-arrow-color': '#22c55e' },
        },
        {
          selector: 'edge.warm',
          style: { 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b', width: 3.2 },
        },
        {
          selector: 'edge.hot',
          style: { 'line-color': '#ef4444', 'target-arrow-color': '#ef4444', width: 3.8 },
        },
        {
          selector: 'edge.unknown',
          style: { 'line-color': '#64748b', 'target-arrow-color': '#64748b' },
        },
        {
          selector: 'edge.inactive',
          style: {
            'line-color': '#a1a1aa',
            'target-arrow-color': '#a1a1aa',
            'line-style': 'dashed',
            opacity: 0.5,
          },
        },
        {
          selector: 'edge.path-highlight',
          style: { width: 4.4, 'line-color': '#facc15', 'target-arrow-color': '#facc15' },
        },
        {
          selector: 'edge.edge-selected',
          style: { width: 5, 'line-color': '#38bdf8', 'target-arrow-color': '#38bdf8' },
        },
      ],
      layout: getLayoutConfig(layout),
    } as never);

    cy.on('tap', 'node', (event: { target: { id: () => string } }) => {
      onNodeClick?.(event.target.id());
      onEdgeClick?.(null);
    });

    cy.on('tap', 'edge', (event: { target: { id: () => string } }) => {
      const edgeId = event.target.id();
      onEdgeClick?.(edgeId);
      onEdgeHover?.(edgeId);
    });

    cy.on('mouseover', 'edge', (event: { target: { id: () => string } }) => {
      onEdgeHover?.(event.target.id());
    });

    cy.on('mouseout', 'edge', () => {
      onEdgeHover?.(null);
    });

    cy.on('tap', (event: { target: unknown }) => {
      if (event.target === cy) {
        onMapBackgroundClick?.();
        onNodeClick?.(null);
        onEdgeClick?.(null);
        onEdgeHover?.(null);
      }
    });

    cy.fit(undefined, 40);
    cyRef.current = cy;

    return () => { cy.destroy(); cyRef.current = null; };
  }, [
    cyReady,
    uniqueEdges,
    highlightedEdgeSet,
    highlightedNodeSet,
    layout,
    nodes,
    onEdgeClick,
    onEdgeHover,
    onMapBackgroundClick,
    onNodeClick,
    selectedEdge,
    selectedNode,
    showEdgeLabels,
  ]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().unselect();

    if (selectedNode) {
      const el = cy.getElementById(selectedNode);
      if (el.length > 0) {
        el.select();
        cy.animate({ center: { eles: el }, fit: { eles: el.closedNeighborhood(), padding: 84 }, duration: 320 });
        return;
      }
    }

    if (selectedEdge) {
      const el = cy.getElementById(selectedEdge);
      if (el.length > 0) {
        cy.animate({ fit: { eles: el.union(el.connectedNodes()), padding: 96 }, duration: 320 });
        return;
      }
    }

    if (highlightedNodeIds.length > 0 || highlightedEdgeIds.length > 0) {
      const col = buildFocusCollection(cy, highlightedNodeIds, highlightedEdgeIds);
      if (col.length > 0) {
        cy.animate({ fit: { eles: col, padding: 92 }, duration: 320 });
        return;
      }
    }

    cy.fit(undefined, 40);
  }, [highlightedEdgeIds, highlightedNodeIds, selectedEdge, selectedNode]);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <div ref={containerRef} className="h-[520px] w-full" style={{ background: '#0a0f1a' }} />
    </div>
  );
}
