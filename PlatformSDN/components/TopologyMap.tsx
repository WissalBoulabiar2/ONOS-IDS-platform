"use client"

import React, { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { TopologyNode, TopologyEdge } from "@/lib/types"
import { Card } from "@/components/ui/card"

// Dynamic import to avoid SSR issues
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
}

export function TopologyMap({
  nodes,
  edges,
  selectedNode,
  onNodeClick,
}: TopologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current || !cytoscape) return

    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }

    // Convert data to Cytoscape format
    const elements = [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
        },
        classes: [node.type, node.status],
      })),
      ...edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || "",
        },
        classes: [edge.status],
      })),
    ]

    // Initialize Cytoscape
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
              "text-valign": "center",
              "text-halign": "center",
              color: "#fff",
              "font-size": "12px",
              "border-width": "2px",
              "border-color": "#0891b2",
              width: "40px",
              height: "40px",
            },
          },
          {
            selector: "node.switch",
            style: {
              "background-color": "#0891b2",
              shape: "square",
            },
          },
          {
            selector: "node.router",
            style: {
              "background-color": "#06b6d4",
              shape: "diamond",
            },
          },
          {
            selector: "node.host",
            style: {
              "background-color": "#14b8a6",
              shape: "ellipse",
            },
          },
          {
            selector: "node.inactive",
            style: {
              "background-color": "#71717a",
              "border-color": "#71717a",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#52525b",
              "target-arrow-color": "#52525b",
              "target-arrow-shape": "triangle",
              label: "data(label)",
              "font-size": "10px",
              "text-background-color": "#1f2937",
              "text-background-opacity": 0.8,
              "text-background-padding": "2px",
              color: "#d4d4d8",
            },
          },
          {
            selector: "edge.inactive",
            style: {
              "line-color": "#a1a1a1",
              "target-arrow-color": "#a1a1a1",
              "line-style": "dashed",
            },
          },
          {
            selector: "node:selected",
            style: {
              "border-width": "3px",
              "border-color": "#fbbf24",
            },
          },
        ],
        layout: {
          name: "cose",
          directed: false,
          animate: false,
          avoidOverlap: true,
          nodeSpacing: 10,
          gravity: 1,
          cooling: 0.99,
          coolingFactor: 0.99,
          minTemp: 1.0,
        },
      } as any)

      // Handle node click
      cy.on("tap", "node", function (evt: any) {
        const nodeId = this.id()
        if (onNodeClick) {
          onNodeClick(nodeId)
        }
      })

      cyRef.current = cy

      // Cleanup on unmount
      return () => {
        cy.stop()
        cy.destroy()
        cyRef.current = null
      }
    } catch (err) {
      console.error("Cytoscape initialization error:", err)
    }
  }, [nodes, edges, onNodeClick])

  useEffect(() => {
    const cy = cyRef.current

    if (!cy) return

    cy.elements().unselect()

    if (!selectedNode) return

    const activeNode = cy.getElementById(selectedNode)
    if (activeNode.length > 0) {
      activeNode.select()
      cy.center(activeNode)
    }
  }, [selectedNode])

  return (
    <Card className="w-full h-full bg-gray-900 border-gray-700">
      <div
        ref={containerRef}
        className="w-full h-96 bg-gray-950 rounded-lg"
      />
    </Card>
  )
}
