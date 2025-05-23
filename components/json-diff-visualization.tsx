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
import { motion } from "framer-motion"
import { CollapsibleCard } from "./collapsible-card"
import { compareJsonObjects } from "@/lib/json-diff"

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
function DiffRootNode({ data, isConnectable }: any) {
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

function DiffAddedNode({ data, isConnectable }: any) {
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
          badgeText="Added"
          badgeColor="bg-green-100 text-green-800 border-green-200"
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

function DiffRemovedNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <CollapsibleCard
          title={data.label}
          isOpen={true}
          borderColor="border-red-500"
          onToggle={data.onToggle}
          isExpanded={data.isExpanded}
          badgeText="Removed"
          badgeColor="bg-red-100 text-red-800 border-red-200"
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

function DiffChangedNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <CollapsibleCard
          title={data.label}
          isOpen={true}
          borderColor="border-amber-500"
          onToggle={data.onToggle}
          isExpanded={data.isExpanded}
          badgeText="Changed"
          badgeColor="bg-amber-100 text-amber-800 border-amber-200"
        >
          <div className="text-xs space-y-1">
            <div className="bg-red-50 p-1 rounded border border-red-100 line-through">{String(data.oldValue)}</div>
            <div className="bg-green-50 p-1 rounded border border-green-100">{String(data.newValue)}</div>
          </div>
        </CollapsibleCard>
      </div>
    </AnimatedNode>
  )
}

function DiffUnchangedNode({ data, isConnectable }: any) {
  return (
    <AnimatedNode>
      <div className="w-[220px]">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <CollapsibleCard
          title={data.label}
          isOpen={true}
          borderColor="border-slate-300"
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

const nodeTypes = {
  diffRoot: DiffRootNode,
  diffAdded: DiffAddedNode,
  diffRemoved: DiffRemovedNode,
  diffChanged: DiffChangedNode,
  diffUnchanged: DiffUnchangedNode,
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
export default function JsonDiffVisualization({
  baseData,
  compareData,
}: {
  baseData: any
  compareData: any
}) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showUnchanged, setShowUnchanged] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }, [])

  // Process JSON data into nodes and edges
  useEffect(() => {
    if (!baseData || !compareData) return

    try {
      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      let nodeId = 0

      // Add root node
      const rootId = `node-${nodeId++}`
      newNodes.push({
        id: rootId,
        type: "diffRoot",
        position: { x: 0, y: 0 },
        data: {
          value: compareData,
          isExpanded: true,
          onToggle: () => toggleNodeExpansion(rootId),
        },
      })

      // Compare the two JSON objects
      const diff = compareJsonObjects(baseData, compareData)

      // Process diff recursively
      const processDiff = (parentId: string, diffObj: any, path = "", level = 1) => {
        if (!diffObj) return

        Object.entries(diffObj).forEach(([key, value]: [string, any]) => {
          const currentId = `node-${nodeId++}`
          const currentPath = path ? `${path}.${key}` : key
          const isExpanded = expandedNodes[currentId] !== false

          if (value.status === "added") {
            newNodes.push({
              id: currentId,
              type: "diffAdded",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#22c55e" },
            })

            if (isExpanded && typeof value.value === "object" && value.value !== null) {
              // For added objects, create nodes for their properties
              const addedObj = value.value
              const processAddedObject = (parentId: string, obj: any, path: string, level: number) => {
                Object.entries(obj).forEach(([childKey, childValue]: [string, any]) => {
                  const childId = `node-${nodeId++}`
                  const childPath = `${path}.${childKey}`

                  newNodes.push({
                    id: childId,
                    type: "diffAdded",
                    position: { x: 0, y: level * 100 },
                    data: {
                      label: childKey,
                      value: childValue,
                      isExpanded: false,
                    },
                  })

                  newEdges.push({
                    id: `edge-${parentId}-${childId}`,
                    source: parentId,
                    target: childId,
                    animated: false,
                    style: { stroke: "#22c55e" },
                  })

                  if (typeof childValue === "object" && childValue !== null) {
                    processAddedObject(childId, childValue, childPath, level + 1)
                  }
                })
              }

              processAddedObject(currentId, addedObj, currentPath, level + 1)
            }
          } else if (value.status === "removed") {
            newNodes.push({
              id: currentId,
              type: "diffRemoved",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#ef4444" },
            })

            if (isExpanded && typeof value.value === "object" && value.value !== null) {
              // For removed objects, create nodes for their properties
              const removedObj = value.value
              const processRemovedObject = (parentId: string, obj: any, path: string, level: number) => {
                Object.entries(obj).forEach(([childKey, childValue]: [string, any]) => {
                  const childId = `node-${nodeId++}`
                  const childPath = `${path}.${childKey}`

                  newNodes.push({
                    id: childId,
                    type: "diffRemoved",
                    position: { x: 0, y: level * 100 },
                    data: {
                      label: childKey,
                      value: childValue,
                      isExpanded: false,
                    },
                  })

                  newEdges.push({
                    id: `edge-${parentId}-${childId}`,
                    source: parentId,
                    target: childId,
                    animated: false,
                    style: { stroke: "#ef4444" },
                  })

                  if (typeof childValue === "object" && childValue !== null) {
                    processRemovedObject(childId, childValue, childPath, level + 1)
                  }
                })
              }

              processRemovedObject(currentId, removedObj, currentPath, level + 1)
            }
          } else if (value.status === "changed") {
            newNodes.push({
              id: currentId,
              type: "diffChanged",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                oldValue: value.oldValue,
                newValue: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#f59e0b" },
            })
          } else if (value.status === "unchanged" && showUnchanged) {
            newNodes.push({
              id: currentId,
              type: "diffUnchanged",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: false,
              style: { stroke: "#94a3b8" },
            })

            if (isExpanded && typeof value.value === "object" && value.value !== null && value.children) {
              processDiff(currentId, value.children, currentPath, level + 1)
            }
          } else if (value.children) {
            // This is a nested object with changes inside
            const nodeType =
              value.status === "added" ? "diffAdded" : value.status === "removed" ? "diffRemoved" : "diffUnchanged"

            newNodes.push({
              id: currentId,
              type: nodeType,
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value || {},
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
              },
            })

            const edgeColor = value.status === "added" ? "#22c55e" : value.status === "removed" ? "#ef4444" : "#94a3b8"

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: value.status !== "unchanged",
              style: { stroke: edgeColor },
            })

            if (isExpanded) {
              processDiff(currentId, value.children, currentPath, level + 1)
            }
          }
        })
      }

      // Start processing from root
      processDiff(rootId, diff, "")

      // Apply layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes,
        newEdges,
        "TB", // Top to Bottom layout
      )

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      setError(null)
    } catch (err) {
      console.error("Error processing diff data:", err)
      setError("Failed to process comparison data. Please try again.")
    }
  }, [baseData, compareData, expandedNodes, toggleNodeExpansion, showUnchanged])

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
          if (n.type === "diffAdded") return "#22c55e"
          if (n.type === "diffRemoved") return "#ef4444"
          if (n.type === "diffChanged") return "#f59e0b"
          return "#94a3b8"
        }}
        nodeColor={(n) => {
          if (n.type === "diffAdded") return "#dcfce7"
          if (n.type === "diffRemoved") return "#fee2e2"
          if (n.type === "diffChanged") return "#fef3c7"
          return "#f1f5f9"
        }}
      />
      <Controls />
      <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
            className="mr-2"
          />
          Show unchanged nodes
        </label>
      </div>
      {error && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-md shadow-md z-10">
          {error}
        </div>
      )}
    </ReactFlow>
  )
}
