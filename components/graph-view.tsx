"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  BookOpen,
  FolderKanban,
  FileText,
  User,
  Layers,
  HelpCircle,
  Maximize,
  Minimize,
  SlidersHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { GraphData, GraphNode } from "@/lib/actions/graph"

interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SimulationLink {
  source: SimulationNode;
  target: SimulationNode;
  type: string;
}

const TYPE_COLORS = {
  category: { light: "#10b981", dark: "#34d399", label: "Category", icon: Layers },
  project: { light: "#8b5cf6", dark: "#a78bfa", label: "Project", icon: FolderKanban },
  person: { light: "#f43f5e", dark: "#fb7185", label: "Person", icon: User },
  note: { light: "#f97316", dark: "#fb923c", label: "Note", icon: FileText },
  resource: { light: "#0ea5e9", dark: "#38bdf8", label: "Resource", icon: BookOpen },
}

export function GraphView({ data }: { data: GraphData }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulation physics parameters
  const kRepulsion = 45000
  const kAttraction = 0.04
  const kGravity = 0.015
  const damping = 0.80

  // React state for UI controls
  const [filters, setFilters] = useState<Record<string, boolean>>({
    category: true,
    project: true,
    person: true,
    note: true,
    resource: true,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredNode, setHoveredNode] = useState<SimulationNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<SimulationNode | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const tooltipRef = useRef<HTMLDivElement>(null)

  // Ref-based coordinate & animation state (to avoid React re-render lag during ticks)
  const stateRef = useRef<{
    nodes: SimulationNode[];
    links: SimulationLink[];
    transform: { x: number; y: number; scale: number };
    draggedNodeIndex: number | null;
    isPanning: boolean;
    panStart: { x: number; y: number };
    mousePos: { x: number; y: number };
    width: number;
    height: number;
    alpha: number; // Simulation cooling parameter
    hoveredNode: SimulationNode | null;
    dragStartPos: { x: number; y: number };
    hasDragged: boolean;
  }>({
    nodes: [],
    links: [],
    transform: { x: 0, y: 0, scale: 1 },
    draggedNodeIndex: null,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    width: 800,
    height: 600,
    alpha: 1.0,
    hoveredNode: null,
    dragStartPos: { x: 0, y: 0 },
    hasDragged: false,
  })

  // Coordinate conversion from Screen to World space
  function screenToWorld(screenX: number, screenY: number) {
    const state = stateRef.current
    return {
      x: (screenX - state.transform.x) / state.transform.scale,
      y: (screenY - state.transform.y) / state.transform.scale,
    }
  }

  // Find node under mouse cursor
  function getNodeAt(clientX: number, clientY: number): SimulationNode | null {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const screenX = clientX - rect.left
    const screenY = clientY - rect.top

    const world = screenToWorld(screenX, screenY)
    const state = stateRef.current

    // Iterate through active nodes
    const activeNodes = state.nodes.filter((n) => filters[n.type])

    for (let i = activeNodes.length - 1; i >= 0; i--) {
      const node = activeNodes[i]
      const dx = node.x - world.x
      const dy = node.y - world.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Allow a small padding buffer for easier clicking
      if (dist <= node.radius + 4) {
        return node
      }
    }
    return null
  }

  // Center the camera on the average node center
  function centerGraph() {
    const state = stateRef.current
    if (state.nodes.length === 0) return

    let sumX = 0
    let sumY = 0
    state.nodes.forEach((n) => {
      sumX += n.x
      sumY += n.y
    })

    const avgX = sumX / state.nodes.length
    const avgY = sumY / state.nodes.length

    state.transform = {
      x: state.width / 2 - avgX,
      y: state.height / 2 - avgY,
      scale: 1,
    }
  }

  // Physics update calculation step
  function runPhysicsTick(
    nodes: SimulationNode[],
    links: SimulationLink[],
    width: number,
    height: number
  ) {
    const alpha = stateRef.current.alpha

    // 1. Repulsive forces (push nodes apart)
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j]
        const dx = n2.x - n1.x
        const dy = n2.y - n1.y
        const distSq = Math.max(400, dx * dx + dy * dy) // Cap at minimum 20px distance square
        const dist = Math.sqrt(distSq)

        // Only apply force within a reasonable proximity bubble
        if (dist < 450) {
          const force = (kRepulsion / distSq) * alpha
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          n1.vx -= fx
          n1.vy -= fy
          n2.vx += fx
          n2.vy += fy
        }

        // Collision prevention force (push overlapping nodes apart based on their size + padding)
        const minDist = n1.radius + n2.radius + 20 // Radius sum + 20px padding bubble
        if (dist < minDist) {
          const overlap = minDist - dist
          const pushForce = (overlap / dist) * 0.48 * alpha
          const pX = dx * pushForce
          const pY = dy * pushForce

          n1.vx -= pX
          n1.vy -= pY
          n2.vx += pX
          n2.vy += pY
        }
      }
    }

    // 2. Attractive forces along links (pull connected nodes together)
    links.forEach((link) => {
      const dx = link.target.x - link.source.x
      const dy = link.target.y - link.source.y
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
      const force = (dist - 130) * kAttraction * alpha // Rest length: 130px (increased for breathing room)

      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      link.source.vx += fx
      link.source.vy += fy
      link.target.vx -= fx
      link.target.vy -= fy
    })

    // 3. Center gravity (pull all nodes towards center to prevent orphans floating away)
    const cx = width / 2
    const cy = height / 2
    nodes.forEach((n) => {
      const dx = cx - n.x
      const dy = cy - n.y
      n.vx += dx * kGravity * alpha
      n.vy += dy * kGravity * alpha

      // Apply velocities with damping
      n.x += n.vx
      n.y += n.vy
      n.vx *= damping
      n.vy *= damping
    })
  }

  // 1. Initialize simulation nodes & links from props
  useEffect(() => {
    const rawNodes = data.nodes
    const rawLinks = data.links

    const width = containerRef.current?.clientWidth || 800
    const height = containerRef.current?.clientHeight || 600
    stateRef.current.width = width
    stateRef.current.height = height

    // Center starting positions
    const nodes: SimulationNode[] = rawNodes.map((n, i) => {
      // Place nodes in a spiral spacing
      const angle = i * 0.5
      const distance = 40 + i * 15
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        radius: n.val * 8 + 8, // node size based on val
      }
    })

    // Map link strings to node reference objects
    const nodeMap = new Map<string, SimulationNode>()
    nodes.forEach((n) => nodeMap.set(n.id, n))

    const links: SimulationLink[] = rawLinks
      .map((l) => {
        const sourceNode = nodeMap.get(l.source)
        const targetNode = nodeMap.get(l.target)
        if (!sourceNode || !targetNode) return null
        return {
          source: sourceNode,
          target: targetNode,
          type: l.type,
        }
      })
      .filter(Boolean) as SimulationLink[]

    stateRef.current.nodes = nodes
    stateRef.current.links = links
    stateRef.current.alpha = 1.0

    // Pre-calculate 180 physics ticks to stabilize before rendering
    for (let i = 0; i < 180; i++) {
      runPhysicsTick(nodes, links, width, height)
    }

    centerGraph()
  }, [data])

  // Imperatively attach non-passive wheel event listener to prevent browser scroll when zooming graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top

      const state = stateRef.current
      const zoomFactor = 1.08
      const direction = e.deltaY < 0 ? 1 : -1
      const newScale = direction > 0 
        ? Math.min(3, state.transform.scale * zoomFactor)
        : Math.max(0.2, state.transform.scale / zoomFactor)

      const world = screenToWorld(screenX, screenY)

      state.transform = {
        x: screenX - world.x * newScale,
        y: screenY - world.y * newScale,
        scale: newScale,
      }
      state.alpha = 0.2 // reheat simulation slightly
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheel)
  }, [mounted])

  // Main rendering and animation loop
  useEffect(() => {
    let animationFrameId: number

    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      stateRef.current.width = container.clientWidth
      stateRef.current.height = container.clientHeight
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setTimeout(handleResize, 50)
    }

    window.addEventListener("resize", handleResize)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    handleResize()

    const render = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      const state = stateRef.current

      if (!canvas || !ctx) return

      // Compute active/filtered nodes and links
      const activeNodes = state.nodes.filter((n) => filters[n.type])
      const activeNodeIds = new Set(activeNodes.map((n) => n.id))
      const activeLinks = state.links.filter(
        (l) => activeNodeIds.has(l.source.id) && activeNodeIds.has(l.target.id)
      )

      // Run real-time physics tick if a node is being dragged or simulation hasn't stabilized
      // (When dragging, we pin the dragged node to the mouse position)
      if (state.draggedNodeIndex !== null) {
        const draggedNode = state.nodes[state.draggedNodeIndex]
        // Transform screen coords to world coords
        const worldMouseX = (state.mousePos.x - state.transform.x) / state.transform.scale
        const worldMouseY = (state.mousePos.y - state.transform.y) / state.transform.scale
        draggedNode.x = worldMouseX
        draggedNode.y = worldMouseY
        draggedNode.vx = 0
        draggedNode.vy = 0
        state.alpha = 0.15 // Keep simulation warm during dragging
      }

      if (state.alpha > 0.005) {
        runPhysicsTick(activeNodes, activeLinks, state.width, state.height)
        state.alpha *= 0.97 // decay / cooling rate
      }

      // Clear Canvas
      ctx.clearRect(0, 0, state.width, state.height)

      ctx.save()
      // Apply pan & zoom transform matrix
      ctx.translate(state.transform.x, state.transform.y)
      ctx.scale(state.transform.scale, state.transform.scale)

      // 1. Draw Links/Edges
      ctx.lineWidth = 1.2
      activeLinks.forEach((link) => {
        const isHoveredLink =
          hoveredNode &&
          (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id)

        ctx.beginPath()
        ctx.moveTo(link.source.x, link.source.y)
        ctx.lineTo(link.target.x, link.target.y)

        if (isHoveredLink) {
          ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"
          ctx.lineWidth = 2
        } else {
          ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
          ctx.lineWidth = 1.2
        }
        ctx.stroke()
      })

      // 2. Draw Nodes
      activeNodes.forEach((node) => {
        const colorCfg = TYPE_COLORS[node.type]
        const color = isDark ? colorCfg.dark : colorCfg.light

        // Check if node is matching search query
        const matchesSearch =
          searchQuery.trim() !== "" &&
          node.label.toLowerCase().includes(searchQuery.toLowerCase())

        const isHovered = hoveredNode && hoveredNode.id === node.id
        const isSelected = selectedNode && selectedNode.id === node.id

        // Node circle draw
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)

        // Draw shadow glow if hovered or highlighted by search
        if (isHovered || matchesSearch) {
          ctx.shadowColor = color
          ctx.shadowBlur = 15
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = isDark ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)"
        ctx.fill()

        ctx.lineWidth = isSelected ? 3.5 : isHovered ? 2.5 : 1.8
        ctx.strokeStyle = color
        ctx.stroke()

        // Clear shadow settings for text/labels
        ctx.shadowBlur = 0

        // Draw abbreviation code inside the node center
        ctx.fillStyle = color
        ctx.font = `bold ${Math.max(10, node.radius - 2)}px Inter, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const typeAbbrev = node.type.charAt(0).toUpperCase()
        ctx.fillText(typeAbbrev, node.x, node.y)

        // Draw node title text label
        // When zoom scale is small, only render labels for hovered/selected nodes
        const showLabel = state.transform.scale > 0.6 || isHovered || isSelected || matchesSearch

        if (showLabel) {
          ctx.fillStyle = isDark
            ? isHovered || isSelected || matchesSearch
              ? "#ffffff"
              : "#a1a1aa"
            : isHovered || isSelected || matchesSearch
              ? "#09090b"
              : "#71717a"
          
          ctx.font = `${isHovered || isSelected || matchesSearch ? "bold" : "normal"} 11px Inter, sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "top"
          ctx.fillText(node.label, node.x, node.y + node.radius + 6)
        }
      })

      ctx.restore()

      // Update floating tooltip position on each frame (using fixed viewport positioning to prevent clipping)
      const tooltip = tooltipRef.current
      if (tooltip && canvas && state.hoveredNode && filters[state.hoveredNode.type]) {
        const rect = canvas.getBoundingClientRect()
        const screenX = state.hoveredNode.x * state.transform.scale + state.transform.x
        const screenY = state.hoveredNode.y * state.transform.scale + state.transform.y
        
        // Convert to absolute viewport-relative coordinates
        const clientX = rect.left + screenX
        const clientY = rect.top + screenY - state.hoveredNode.radius - 8
        
        tooltip.style.left = `${clientX}px`
        tooltip.style.top = `${clientY}px`
        tooltip.style.display = "flex"
      } else if (tooltip) {
        tooltip.style.display = "none"
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      cancelAnimationFrame(animationFrameId)
    }
  }, [filters, isDark, hoveredNode, selectedNode, searchQuery, isFullscreen])



  // Mouse / Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const state = stateRef.current
    state.mousePos = { x: screenX, y: screenY }

    const nodeUnderMouse = getNodeAt(e.clientX, e.clientY)

    if (nodeUnderMouse) {
      // Find its index in the state array
      const idx = state.nodes.findIndex((n) => n.id === nodeUnderMouse.id)
      state.draggedNodeIndex = idx
      state.dragStartPos = { x: e.clientX, y: e.clientY }
      state.hasDragged = false
      setSelectedNode(nodeUnderMouse)
    } else {
      // Start panning
      state.isPanning = true
      state.panStart = {
        x: screenX - state.transform.x,
        y: screenY - state.transform.y,
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const state = stateRef.current
    state.mousePos = { x: screenX, y: screenY }

    // Update hovered node state
    const nodeUnderMouse = getNodeAt(e.clientX, e.clientY)
    state.hoveredNode = nodeUnderMouse
    setHoveredNode(nodeUnderMouse)

    if (state.draggedNodeIndex !== null) {
      // Check dragging distance threshold
      const dx = e.clientX - state.dragStartPos.x
      const dy = e.clientY - state.dragStartPos.y
      if (Math.sqrt(dx * dx + dy * dy) > 4) {
        state.hasDragged = true
      }

      // Node is being dragged, simulation loop handles it via state.mousePos
      canvas.style.cursor = "grabbing"
      state.alpha = 0.2
    } else if (state.isPanning) {
      canvas.style.cursor = "move"
      state.transform = {
        ...state.transform,
        x: screenX - state.panStart.x,
        y: screenY - state.panStart.y,
      }
    } else {
      canvas.style.cursor = nodeUnderMouse ? "pointer" : "default"
    }
  }

  const handleMouseUp = () => {
    const state = stateRef.current

    // If we clicked on a node without dragging it, perform redirect
    if (state.draggedNodeIndex !== null && !state.hasDragged) {
      const clickedNode = state.nodes[state.draggedNodeIndex]
      if (clickedNode && clickedNode.link) {
        if (clickedNode.type === "resource") {
          const rawUrl = clickedNode.link
          const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
          window.open(targetUrl, "_blank")
        } else {
          // Exit fullscreen mode if active before client-side navigation
          if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => {
              console.error("Error exiting fullscreen on navigate:", err)
            })
          }
          router.push(clickedNode.link)
        }
      }
    }

    state.draggedNodeIndex = null
    state.isPanning = false
  }

  const handleMouseLeave = () => {
    const state = stateRef.current
    state.draggedNodeIndex = null
    state.isPanning = false
    state.hoveredNode = null
    setHoveredNode(null)
  }

  // Touch Event Handlers for Mobile Interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const screenX = touch.clientX - rect.left
    const screenY = touch.clientY - rect.top

    const state = stateRef.current
    state.mousePos = { x: screenX, y: screenY }

    const nodeUnderTouch = getNodeAt(touch.clientX, touch.clientY)

    if (nodeUnderTouch) {
      const idx = state.nodes.findIndex((n) => n.id === nodeUnderTouch.id)
      state.draggedNodeIndex = idx
      state.dragStartPos = { x: touch.clientX, y: touch.clientY }
      state.hasDragged = false
      setSelectedNode(nodeUnderTouch)
    } else {
      state.isPanning = true
      state.panStart = {
        x: screenX - state.transform.x,
        y: screenY - state.transform.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const screenX = touch.clientX - rect.left
    const screenY = touch.clientY - rect.top

    const state = stateRef.current
    state.mousePos = { x: screenX, y: screenY }

    if (state.draggedNodeIndex !== null) {
      const dx = touch.clientX - state.dragStartPos.x
      const dy = touch.clientY - state.dragStartPos.y
      if (Math.sqrt(dx * dx + dy * dy) > 4) {
        state.hasDragged = true
      }
      state.alpha = 0.2
    } else if (state.isPanning) {
      state.transform = {
        ...state.transform,
        x: screenX - state.panStart.x,
        y: screenY - state.panStart.y,
      }
    }
  }

  const handleTouchEnd = () => {
    const state = stateRef.current

    if (state.draggedNodeIndex !== null && !state.hasDragged) {
      const clickedNode = state.nodes[state.draggedNodeIndex]
      if (clickedNode) {
        // If it's a touch device and this node is not already the "hoveredNode"
        // (meaning we haven't shown its details yet), show details first!
        if (hoveredNode?.id !== clickedNode.id) {
          state.hoveredNode = clickedNode
          setHoveredNode(clickedNode)
        } else {
          // Second tap acts as redirect!
          if (clickedNode.link) {
            if (clickedNode.type === "resource") {
              const rawUrl = clickedNode.link
              const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
              window.open(targetUrl, "_blank")
            } else {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch((err) => {
                  console.error("Error exiting fullscreen on navigate:", err)
                })
              }
              router.push(clickedNode.link)
            }
          }
        }
      }
    } else if (!state.hasDragged && state.draggedNodeIndex === null) {
      // Tap empty background to hide the details popup
      state.hoveredNode = null
      setHoveredNode(null)
    }

    state.draggedNodeIndex = null
    state.isPanning = false
  }

  const handleTouchCancel = () => {
    const state = stateRef.current
    state.draggedNodeIndex = null
    state.isPanning = false
  }

  // Zoom Button Controls
  const zoom = (direction: "in" | "out") => {
    const state = stateRef.current
    const zoomFactor = 1.2
    const currentScale = state.transform.scale
    const newScale = direction === "in"
      ? Math.min(3, currentScale * zoomFactor)
      : Math.max(0.2, currentScale / zoomFactor)

    // Zoom relative to the center of the viewport
    const cx = state.width / 2
    const cy = state.height / 2
    const world = screenToWorld(cx, cy)

    state.transform = {
      x: cx - world.x * newScale,
      y: cy - world.y * newScale,
      scale: newScale,
    }
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-var(--header-height)-10rem)] min-h-[500px] md:min-h-[600px] overflow-hidden gap-4 p-4 lg:p-6">
      
      {/* 1. Horizontal Filter Bar */}
      <div className="shrink-0 w-full max-w-7xl mx-auto z-10">
        <div className="p-3 border border-border/40 bg-card/30 backdrop-blur-xs rounded-2xl flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <InputGroup className="bg-background/80 backdrop-blur-md shadow-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="Search nodes by title…"
                className="text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </div>
          
          {/* Toggle Group Filters */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:inline">
              Filters:
            </span>
            <TooltipProvider delayDuration={150}>
              <ToggleGroup
                type="multiple"
                value={Object.keys(filters).filter((k) => filters[k])}
                onValueChange={(values) => {
                  stateRef.current.alpha = 0.4 // Reheat simulation
                  const nextFilters = {
                    category: values.includes("category"),
                    project: values.includes("project"),
                    person: values.includes("person"),
                    note: values.includes("note"),
                    resource: values.includes("resource"),
                  }
                  setFilters(nextFilters)
                }}
                variant="outline"
                size="sm"
                spacing={1}
                className="bg-background/40 p-0.5 rounded-lg border gap-1"
              >
                {Object.keys(filters).map((type) => {
                  const colorCfg = TYPE_COLORS[type as keyof typeof TYPE_COLORS]
                  const Icon = colorCfg.icon
                  const color = isDark ? colorCfg.dark : colorCfg.light
                  const isSelected = filters[type]
                  const activeCount = data.nodes.filter((n) => n.type === type).length

                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={type}
                          className={cn(
                            "size-7 p-0 flex items-center justify-center transition-all rounded-md cursor-pointer shrink-0",
                            isSelected
                              ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 hover:text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <Icon className="size-3.5" style={{ color: mounted ? color : colorCfg.light }} />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {colorCfg.label} ({activeCount} nodes)
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </ToggleGroup>
            </TooltipProvider>
            
            <Button
              variant="ghost"
              size="xs"
              className="text-[10px] text-muted-foreground h-7 px-2 hover:bg-muted/50 rounded-md cursor-pointer shrink-0"
              onClick={() => {
                stateRef.current.alpha = 0.4 // Reheat simulation
                const allOn = Object.values(filters).some((v) => !v)
                setFilters({
                  category: allOn,
                  project: allOn,
                  person: allOn,
                  note: allOn,
                  resource: allOn,
                })
              }}
            >
              Toggle All
            </Button>

            {/* View Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 px-2 hover:bg-muted/50 rounded-md cursor-pointer shrink-0 gap-1.5 font-semibold text-xs"
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span className="hidden sm:inline">Options</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2 flex flex-col gap-1 bg-popover/95 backdrop-blur-md shadow-md border z-50">
                <PopoverHeader className="pb-1 border-b">
                  <PopoverTitle className="text-xs font-bold text-foreground">Canvas Settings</PopoverTitle>
                  <PopoverDescription className="text-[10px] text-muted-foreground">Adjust display modes</PopoverDescription>
                </PopoverHeader>
                
                <div className="flex flex-col gap-1 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-8 text-xs font-medium cursor-pointer"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize className="size-3.5 text-muted-foreground" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize className="size-3.5 text-muted-foreground" />
                        <span>Enter Fullscreen</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-8 text-xs font-medium cursor-pointer"
                    onClick={centerGraph}
                  >
                    <Maximize2 className="size-3.5 text-muted-foreground" />
                    <span>Recenter View</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-8 text-xs font-medium cursor-pointer"
                    onClick={() => {
                      const state = stateRef.current
                      state.nodes.forEach((n, i) => {
                        const angle = i * 0.5
                        const distance = 40 + i * 15
                        n.x = state.width / 2 + Math.cos(angle) * distance
                        n.y = state.height / 2 + Math.sin(angle) * distance
                        n.vx = 0
                        n.vy = 0
                      })
                      state.alpha = 1.0 // Reheat
                      centerGraph()
                    }}
                  >
                    <RefreshCw className="size-3.5 text-muted-foreground" />
                    <span>Reset Simulation</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 2. Main Graph Canvas Panel */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded-2xl border bg-muted/30 dark:bg-muted/10 overflow-hidden min-h-[350px] lg:min-h-0 shadow-sm"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="absolute inset-0 block select-none touch-none"
        />



        {/* Floating Controls Overlay */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
          <div className="flex flex-col rounded-lg border bg-background/80 backdrop-blur-md p-1 shadow-sm gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => zoom("in")}
              title="Zoom In"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => zoom("out")}
              title="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={centerGraph}
              title="Center View"
            >
              <Maximize2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => {
                // Re-spiral positions
                const state = stateRef.current
                state.nodes.forEach((n, i) => {
                  const angle = i * 0.5
                  const distance = 40 + i * 15
                  n.x = state.width / 2 + Math.cos(angle) * distance
                  n.y = state.height / 2 + Math.sin(angle) * distance
                  n.vx = 0
                  n.vy = 0
                })
                state.alpha = 1.0 // Reheat simulation to 100%
                centerGraph()
              }}
              title="Recalculate Simulation"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>

        {/* Guide / Instruction Tag */}
        <div className="absolute left-4 bottom-4 z-10 hidden sm:block">
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg border bg-background/80 backdrop-blur-md shadow-sm text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="size-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="start" className="w-72 p-3 bg-popover/90 backdrop-blur-sm shadow-md border pointer-events-none">
              <div className="flex flex-col gap-2 text-xs">
                <h4 className="font-bold text-foreground">Graph Guide & Controls</h4>
                <div className="flex flex-col gap-1.5 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Drag</strong> nodes to reposition them</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Click</strong> a node to navigate to its details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Scroll</strong> with mouse wheel to zoom in/out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Drag background</strong> to pan the camera</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      {/* Dynamic Screen Tooltip / Virtual Hover Card (Fixed Viewport-positioned) */}
      <div
        ref={tooltipRef}
        style={{ display: "none", position: "fixed", transform: "translate(-50%, -100%)" }}
        className="z-50 pointer-events-none bg-popover/90 backdrop-blur-md text-popover-foreground rounded-xl border shadow-lg p-3.5 w-64 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
      >
        {hoveredNode && (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: mounted
                      ? isDark
                        ? TYPE_COLORS[hoveredNode.type].dark
                        : TYPE_COLORS[hoveredNode.type].light
                      : TYPE_COLORS[hoveredNode.type].light,
                  }}
                />
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  {TYPE_COLORS[hoveredNode.type].label}
                </span>
              </div>
              {hoveredNode.link && (
                <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                  Navigable
                </span>
              )}
            </div>
            <h4 className="font-bold text-xs leading-snug text-foreground">
              {hoveredNode.label}
            </h4>
            {hoveredNode.description && (
              <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed mt-0.5">
                {hoveredNode.description}
              </p>
            )}
            {hoveredNode.link && (
              <span className="text-[9px] text-muted-foreground/80 italic mt-1 border-t pt-1 flex items-center justify-between">
                <span>{isTouchDevice ? "Tap again to navigate" : "Click to navigate"}</span>
                <span className="font-mono text-[8px] bg-muted px-1 rounded opacity-75">{isTouchDevice ? "Double Tap" : "Click"}</span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
