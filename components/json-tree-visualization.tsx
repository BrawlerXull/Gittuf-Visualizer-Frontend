"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
} from "reactflow"
import "reactflow/dist/style.css"
import dagre from "dagre"
import { CollapsibleCard } from "./collapsible-card"
import { motion } from "framer-motion"

// Node dimensions for layout
const NODE_WIDTH = 220
const NODE_HEIGHT = 80

// Animated node wrapper
const AnimatedNode = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  )
}

// Node types
function RootNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <CollapsibleCard
          title="Root"
          isOpen={true}
          borderColor="border-blue-500"
          onToggle={data.onToggle}
          isExpanded={data.isExpanded}
        >
          <div className="text-xs">
            {typeof data.value === "object" && data.value !== null
              ? `Object with ${Object.keys(data.value).length} properties`
              : data.value === null
                ? "null"
                : data.value === undefined
                  ? "undefined"
                  : String(data.value)}
          </div>
        </CollapsibleCard>
      </div>
    </AnimatedNode>
  )
}

function JsonNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <CollapsibleCard
          title={data.label}
          isOpen={true}
          borderColor="border-purple-500"
          onToggle={data.onToggle}
          isExpanded={data.isExpanded}
        >
          <div className="text-xs">
            {typeof data.value === "object" && data.value !== null
              ? `Object with ${Object.keys(data.value).length} properties`
              : data.value === null
                ? "null"
                : data.value === undefined
                  ? "undefined"
                  : String(data.value)}
          </div>
        </CollapsibleCard>
      </div>
    </AnimatedNode>
  )
}

function ArrayNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <CollapsibleCard
          title={data.label}
          isOpen={true}
          borderColor="border-green-500"
          onToggle={data.onToggle}
          isExpanded={data.isExpanded}
        >
          <div className="text-xs">Array with {data.value.length} items</div>
        </CollapsibleCard>
      </div>
    </AnimatedNode>
  )
}

function ValueNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <CollapsibleCard title={data.label} isOpen={true} borderColor="border-amber-500">
          <div className="text-xs break-all">
            {data.value === null ? "null" : data.value === undefined ? "undefined" : String(data.value)}
          </div>
        </CollapsibleCard>
      </div>
    </AnimatedNode>
  )
}

const nodeTypes = {
  jsonNode: JsonNode,
  arrayNode: ArrayNode,
  valueNode: ValueNode,
  rootNode: RootNode,
}

// Layout configuration
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === "LR"
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = node
    const { x, y } = dagreGraph.node(node.id)

    nodeWithPosition.position = {
      x: isHorizontal ? x - NODE_WIDTH / 2 : x - NODE_WIDTH / 2,
      y: isHorizontal ? y - NODE_HEIGHT / 2 : y - NODE_HEIGHT / 2,
    }

    return nodeWithPosition
  })

  return { nodes: layoutedNodes, edges }
}

// Main component
export default function JsonTreeVisualization({ jsonData }: { jsonData: any }) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }, [])

  // Process JSON data into nodes and edges
  useEffect(() => {
    if (!jsonData) return

    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    let nodeId = 0

    // Add root node
    const rootId = `node-${nodeId++}`
    newNodes.push({
      id: rootId,
      type: "rootNode",
      position: { x: 0, y: 0 },
      data: {
        value: jsonData,
        isExpanded: true,
        onToggle: () => toggleNodeExpansion(rootId),
      },
    })

    // Process JSON recursively
    const processJson = (parentId: string, data: any, path = "", level = 1) => {
      if (data === null || data === undefined) {
        return
      }

      if (Array.isArray(data)) {
        // Process array
        data.forEach((item, index) => {
          const currentId = `node-${nodeId++}`
          const currentPath = path ? `${path}[${index}]` : `[${index}]`
          const isExpanded = expandedNodes[currentId] !== false

          if (typeof item === "object" && item !== null) {
            // Object or array inside array
            newNodes.push({
              id: currentId,
              type: Array.isArray(item) ? "arrayNode" : "jsonNode",
              position: { x: 0, y: level * 100 },
              data: {
                label: `[${index}]`,
                value: item,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: Array.isArray(item) ? "#22c55e" : "#a855f7" },
            })

            if (isExpanded) {
              processJson(currentId, item, currentPath, level + 1)
            }
          } else {
            // Primitive value inside array
            newNodes.push({
              id: currentId,
              type: "valueNode",
              position: { x: 0, y: level * 100 },
              data: {
                label: `[${index}]`,
                value: item,
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#f59e0b" },
            })
          }
        })
      } else if (typeof data === "object" && data !== null) {
        // Process object
        Object.entries(data).forEach(([key, value]) => {
          const currentId = `node-${nodeId++}`
          const currentPath = path ? `${path}.${key}` : key
          const isExpanded = expandedNodes[currentId] !== false

          if (typeof value === "object" && value !== null) {
            // Nested object or array
            newNodes.push({
              id: currentId,
              type: Array.isArray(value) ? "arrayNode" : "jsonNode",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: Array.isArray(value) ? "#22c55e" : "#a855f7" },
            })

            if (isExpanded) {
              processJson(currentId, value, currentPath, level + 1)
            }
          } else {
            // Primitive value
            newNodes.push({
              id: currentId,
              type: "valueNode",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value,
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: false,
              style: { stroke: "#f59e0b" },
            })
          }
        })
      }
    }

    // Start processing from root
    processJson(rootId, jsonData)

    // Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges,
      "TB", // Top to Bottom layout
    )

    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [jsonData, expandedNodes, toggleNodeExpansion])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-left"
      minZoom={0.2}
      maxZoom={1.5}
    >
      <Background color="#f1f5f9" gap={16} size={1} />
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.type === "rootNode") return "#4f46e5" // indigo-600
          if (n.type === "jsonNode") return "#7c3aed" // purple-600
          if (n.type === "arrayNode") return "#0891b2" // cyan-600
          return "#d97706" // amber-600
        }}
        nodeColor={(n) => {
          if (n.type === "rootNode") return "#e0e7ff" // indigo-100
          if (n.type === "jsonNode") return "#f3e8ff" // purple-100
          if (n.type === "arrayNode") return "#cffafe" // cyan-100
          return "#fef3c7" // amber-100
        }}
      />
      <Controls />
    </ReactFlow>
  )
}
