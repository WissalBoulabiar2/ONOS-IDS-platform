"use client"

import React, { useEffect, useRef } from "react"
import type { TopologyLayoutMode } from "@/services/api"
import { Card } from "@/components/ui/card"
import type { TopologyEdge, TopologyNode } from "@/lib/types"

let cytoscape: any = null

if (typeof window !== "undefined") {
  import("cytoscape").then((mod) => {
    cytoscape = mod.default
  })
}

interface TopologyMapProps {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  selectedNode?: string | null
  onNodeClick?: (nodeId: string) => void
  layout?: TopologyLayoutMode
  showEdgeLabels?: boolean
}

function getLayoutConfig(layout: TopologyLayoutMode) {
  switch (layout) {
    case "breadthfirst":
      return {
        name: "breadthfirst",
        directed: false,
        padding: 30,
        spacingFactor: 1.2,
        animate: false,
      }
    case "circle":
      return {
        name: "circle",
        padding: 40,
        spacingFactor: 1.1,
        animate: false,
      }
    case "cose":
    default:
      return {
        name: "cose",
        directed: false,
        animate: false,
        avoidOverlap: true,
        nodeSpacing: 14,
        gravity: 1,
        coolingFactor: 0.99,
        minTemp: 1.0,
      }
  }
}

export function TopologyMap({
  nodes,
  edges,
  selectedNode,
  onNodeClick,
  layout = "cose",
  showEdgeLabels = true,
}: TopologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current || !cytoscape) return

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
        classes: [node.type, node.status],
      })),
      ...edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: showEdgeLabels ? edge.label || "" : "",
        },
        classes: [edge.status, edge.kind || "infrastructure"],
      })),
    ]

    try {
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
              "text-max-width": 90,
              color: "#e5f3ff",
              "font-size": "11px",
              "font-weight": 600,
              "border-width": "2px",
              "border-color": "#67e8f9",
              width: 42,
              height: 42,
              "overlay-padding": 6,
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
              opacity: 0.8,
            },
          },
          {
            selector: "edge",
            style: {
              width: 2.2,
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
            },
          },
          {
            selector: "edge.infrastructure",
            style: {
              width: 2.4,
            },
          },
          {
            selector: "edge.access",
            style: {
              "line-style": "dotted",
              "line-color": "#2dd4bf",
              "target-arrow-color": "#2dd4bf",
              width: 1.8,
            },
          },
          {
            selector: "edge.inactive",
            style: {
              "line-color": "#a1a1aa",
              "target-arrow-color": "#a1a1aa",
              "line-style": "dashed",
            },
          },
          {
            selector: "node:selected",
            style: {
              "border-width": "4px",
              "border-color": "#fbbf24",
            },
          },
        ],
        layout: getLayoutConfig(layout),
      } as any)

      cy.on("tap", "node", function () {
        const nodeId = this.id()
        onNodeClick?.(nodeId)
      })

      cy.fit(undefined, 40)
      cyRef.current = cy

      return () => {
        cy.stop()
        cy.destroy()
        cyRef.current = null
      }
    } catch (err) {
      console.error("Cytoscape initialization error:", err)
    }
  }, [edges, layout, nodes, onNodeClick, showEdgeLabels])

  useEffect(() => {
    const cy = cyRef.current

    if (!cy) return

    cy.elements().unselect()

    if (!selectedNode) {
      cy.fit(undefined, 40)
      return
    }

    const activeNode = cy.getElementById(selectedNode)
    if (activeNode.length > 0) {
      activeNode.select()
      cy.animate({
        center: { eles: activeNode },
        fit: { eles: activeNode.closedNeighborhood(), padding: 80 },
        duration: 350,
      })
    }
  }, [selectedNode])

  return (
    <Card className="h-full w-full border-slate-800 bg-slate-950">
      <div ref={containerRef} className="h-[460px] w-full rounded-lg bg-slate-950" />
    </Card>
  )
}
