"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import type { TopologyEdge, TopologyNode } from "@/lib/types"
import type { TopologyLayoutMode } from "@/services/api"
import type { Core as CytoscapeCore } from "cytoscape"

type CytoscapeFactory = typeof import("cytoscape")

let cytoscape: CytoscapeFactory | null = null

interface TopologyMapProps {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  selectedNode?: string | null
  selectedEdge?: string | null
  onNodeClick?: (nodeId: string | null) => void
  onEdgeClick?: (edgeId: string | null) => void
  onEdgeHover?: (edgeId: string | null) => void
  onMapBackgroundClick?: () => void
  layout?: TopologyLayoutMode
  showEdgeLabels?: boolean
  highlightedNodeIds?: string[]
  highlightedEdgeIds?: string[]
}

function getLayoutConfig(layout: TopologyLayoutMode) {
  switch (layout) {
    case "breadthfirst":
      return {
        name: "breadthfirst",
        directed: false,
        padding: 32,
        spacingFactor: 1.15,
        animate: false,
      }
    case "circle":
      return {
        name: "circle",
        padding: 44,
        spacingFactor: 1.08,
        animate: false,
      }
    case "cose":
    default:
      return {
        name: "cose",
        directed: false,
        animate: false,
        avoidOverlap: true,
        nodeSpacing: 16,
        gravity: 1,
        coolingFactor: 0.99,
        minTemp: 1,
      }
  }
}

function buildFocusCollection(
  cy: CytoscapeCore,
  nodeIds: string[],
  edgeIds: string[]
) {
  let collection = cy.collection()

  nodeIds.forEach((nodeId) => {
    collection = collection.union(cy.getElementById(nodeId))
  })

  edgeIds.forEach((edgeId) => {
    collection = collection.union(cy.getElementById(edgeId))
  })

  return collection
}

export function TopologyMap({
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  onNodeClick,
  onEdgeClick,
  onEdgeHover,
  onMapBackgroundClick,
  layout = "cose",
  showEdgeLabels = true,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
}: TopologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<CytoscapeCore | null>(null)
  const [cyReady, setCyReady] = useState(Boolean(cytoscape))

  const highlightedNodeSet = useMemo(() => new Set(highlightedNodeIds), [highlightedNodeIds])
  const highlightedEdgeSet = useMemo(() => new Set(highlightedEdgeIds), [highlightedEdgeIds])

  useEffect(() => {
    let cancelled = false

    async function ensureCytoscape() {
      if (cytoscape) {
        setCyReady(true)
        return
      }

      const cytoscapeModule = await import("cytoscape")
      cytoscape = (cytoscapeModule.default ?? cytoscapeModule) as unknown as CytoscapeFactory

      if (!cancelled) {
        setCyReady(true)
      }
    }

    void ensureCytoscape()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !cyReady || !cytoscape) {
      return
    }

    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }

    const elements = [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          subtitle:
            node.type === "host"
              ? node.location || node.mac || ""
              : node.manufacturer || "",
        },
        classes: [
          node.type,
          node.status,
          highlightedNodeSet.has(node.id) ? "path-highlight" : "",
          selectedNode === node.id ? "selected-focus" : "",
        ]
          .filter(Boolean)
          .join(" "),
      })),
      ...edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: showEdgeLabels ? edge.label || "" : "",
        },
        classes: [
          edge.status,
          edge.kind || "infrastructure",
          edge.loadState || "unknown",
          highlightedEdgeSet.has(edge.id) ? "path-highlight" : "",
          selectedEdge === edge.id ? "edge-selected" : "",
        ]
          .filter(Boolean)
          .join(" "),
      })),
    ]

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0891b2",
            label: "data(label)",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 12,
            "text-wrap": "wrap",
            "text-max-width": 96,
            color: "#e5f3ff",
            "font-size": "11px",
            "font-weight": 600,
            "border-width": "2px",
            "border-color": "#67e8f9",
            width: 42,
            height: 42,
            "overlay-padding": 8,
          },
        },
        {
          selector: "node.switch",
          style: {
            shape: "round-rectangle",
            "background-color": "#0f766e",
            "border-color": "#5eead4",
          },
        },
        {
          selector: "node.router",
          style: {
            shape: "diamond",
            "background-color": "#0369a1",
            "border-color": "#7dd3fc",
          },
        },
        {
          selector: "node.host",
          style: {
            shape: "ellipse",
            width: 34,
            height: 34,
            "background-color": "#155e75",
            "border-color": "#67e8f9",
          },
        },
        {
          selector: "node.inactive",
          style: {
            "background-color": "#3f3f46",
            "border-color": "#71717a",
            opacity: 0.82,
          },
        },
        {
          selector: "node.path-highlight",
          style: {
            "border-width": "4px",
            "border-color": "#f59e0b",
          },
        },
        {
          selector: "node.selected-focus",
          style: {
            "border-width": "5px",
            "border-color": "#fde047",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2.4,
            "line-color": "#64748b",
            "target-arrow-color": "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "9px",
            "text-background-color": "#020617",
            "text-background-opacity": 0.84,
            "text-background-padding": "3px",
            color: "#e2e8f0",
            opacity: 0.94,
          },
        },
        {
          selector: "edge.infrastructure",
          style: {
            width: 2.6,
          },
        },
        {
          selector: "edge.access",
          style: {
            "line-style": "dotted",
            "line-color": "#2dd4bf",
            "target-arrow-color": "#2dd4bf",
            width: 1.9,
          },
        },
        {
          selector: "edge.nominal",
          style: {
            "line-color": "#22c55e",
            "target-arrow-color": "#22c55e",
          },
        },
        {
          selector: "edge.warm",
          style: {
            "line-color": "#f59e0b",
            "target-arrow-color": "#f59e0b",
            width: 3.2,
          },
        },
        {
          selector: "edge.hot",
          style: {
            "line-color": "#ef4444",
            "target-arrow-color": "#ef4444",
            width: 3.8,
          },
        },
        {
          selector: "edge.unknown",
          style: {
            "line-color": "#64748b",
            "target-arrow-color": "#64748b",
          },
        },
        {
          selector: "edge.inactive",
          style: {
            "line-color": "#a1a1aa",
            "target-arrow-color": "#a1a1aa",
            "line-style": "dashed",
            opacity: 0.6,
          },
        },
        {
          selector: "edge.path-highlight",
          style: {
            width: 4.4,
            "line-color": "#facc15",
            "target-arrow-color": "#facc15",
          },
        },
        {
          selector: "edge.edge-selected",
          style: {
            width: 5,
            "line-color": "#38bdf8",
            "target-arrow-color": "#38bdf8",
          },
        },
      ],
      layout: getLayoutConfig(layout),
    } as never)

    cy.on("tap", "node", (event: { target: { id: () => string } }) => {
      onNodeClick?.(event.target.id())
      onEdgeClick?.(null)
    })

    cy.on("tap", "edge", (event: { target: { id: () => string } }) => {
      const edgeId = event.target.id()
      onEdgeClick?.(edgeId)
      onEdgeHover?.(edgeId)
    })

    cy.on("mouseover", "edge", (event: { target: { id: () => string } }) => {
      onEdgeHover?.(event.target.id())
    })

    cy.on("mouseout", "edge", () => {
      onEdgeHover?.(null)
    })

    cy.on("tap", (event: { target: unknown }) => {
      if (event.target === cy) {
        onMapBackgroundClick?.()
        onNodeClick?.(null)
        onEdgeClick?.(null)
        onEdgeHover?.(null)
      }
    })

    cy.fit(undefined, 40)
    cyRef.current = cy

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [
    cyReady,
    edges,
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
  ])

  useEffect(() => {
    const cy = cyRef.current

    if (!cy) {
      return
    }

    cy.elements().unselect()

    if (selectedNode) {
      const activeNode = cy.getElementById(selectedNode)

      if (activeNode.length > 0) {
        activeNode.select()
        cy.animate({
          center: { eles: activeNode },
          fit: { eles: activeNode.closedNeighborhood(), padding: 84 },
          duration: 320,
        })
        return
      }
    }

    if (selectedEdge) {
      const activeEdge = cy.getElementById(selectedEdge)

      if (activeEdge.length > 0) {
        cy.animate({
          fit: { eles: activeEdge.union(activeEdge.connectedNodes()), padding: 96 },
          duration: 320,
        })
        return
      }
    }

    if (highlightedNodeIds.length > 0 || highlightedEdgeIds.length > 0) {
      const focusCollection = buildFocusCollection(cy, highlightedNodeIds, highlightedEdgeIds)

      if (focusCollection.length > 0) {
        cy.animate({
          fit: { eles: focusCollection, padding: 92 },
          duration: 320,
        })
        return
      }
    }

    cy.fit(undefined, 40)
  }, [highlightedEdgeIds, highlightedNodeIds, selectedEdge, selectedNode])

  return (
    <Card className="h-full w-full border-slate-800 bg-slate-950">
      <div
        ref={containerRef}
        className="h-[520px] w-full rounded-lg bg-slate-950"
      />
    </Card>
  )
}
