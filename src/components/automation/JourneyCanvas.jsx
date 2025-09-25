import React, { useRef, useCallback, useState } from "react";
import WorkflowNode from "./WorkflowNode";

const JourneyCanvas = React.forwardRef(
  (
    {
      nodes,
      connections,
      selectedNode,
      isPreviewMode,
      onNodeSelect,
      onNodeUpdate,
      onNodeDelete,
      onNodeMove,
      onConnect,
      onAddNode,
    },
    ref
  ) => {
    const [draggedNode, setDraggedNode] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    // Connection state
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStart, setConnectionStart] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [dragTarget, setDragTarget] = useState(null);

    const canvasRef = useRef(null);

    const handleMouseDown = useCallback(
      (e, nodeId) => {
        if (isPreviewMode || isConnecting) return;

        e.stopPropagation();

        const node = nodes.find((n) => n.id === nodeId);
        const rect = canvasRef.current.getBoundingClientRect();

        setDraggedNode(nodeId);
        setDragOffset({
          x: (e.clientX - rect.left - viewOffset.x) / scale - node.position.x,
          y: (e.clientY - rect.top - viewOffset.y) / scale - node.position.y,
        });

        onNodeSelect(nodeId);
      },
      [nodes, onNodeSelect, isPreviewMode, isConnecting, viewOffset, scale]
    );

    const handleMouseMove = useCallback(
      (e) => {
        // Update mouse position for connection line
        if (isConnecting) {
          const rect = canvasRef.current.getBoundingClientRect();
          setMousePosition({
            x: (e.clientX - rect.left - viewOffset.x) / scale,
            y: (e.clientY - rect.top - viewOffset.y) / scale,
          });

          // Check if hovering over a valid target
          const elementsAtPoint = document.elementsFromPoint(
            e.clientX,
            e.clientY
          );
          const nodeElement = elementsAtPoint.find((el) =>
            el.closest("[data-node-id]")
          );

          if (nodeElement) {
            const nodeId = nodeElement.closest("[data-node-id]").dataset.nodeId;
            const targetNode = nodes.find((n) => n.id === nodeId);

            if (
              targetNode &&
              !targetNode.id.startsWith("trigger-") &&
              targetNode.id !== connectionStart
            ) {
              setDragTarget(nodeId);
            } else {
              setDragTarget(null);
            }
          } else {
            setDragTarget(null);
          }
        }

        // Handle node dragging
        if (draggedNode && !isPreviewMode) {
          const rect = canvasRef.current.getBoundingClientRect();
          const newPosition = {
            x: (e.clientX - rect.left - viewOffset.x) / scale - dragOffset.x,
            y: (e.clientY - rect.top - viewOffset.y) / scale - dragOffset.y,
          };

          onNodeMove(draggedNode, newPosition);
        }

        // Handle canvas panning
        if (isPanning) {
          const deltaX = e.clientX - panStart.x;
          const deltaY = e.clientY - panStart.y;

          setViewOffset((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));

          setPanStart({ x: e.clientX, y: e.clientY });
        }
      },
      [
        draggedNode,
        dragOffset,
        onNodeMove,
        isPanning,
        panStart,
        isPreviewMode,
        viewOffset,
        isConnecting,
        connectionStart,
        nodes,
        scale,
      ]
    );

    const handleMouseUp = useCallback(() => {
      if (isConnecting) {
        if (dragTarget && connectionStart) {
          onConnect(connectionStart, dragTarget);
        }
        setIsConnecting(false);
        setConnectionStart(null);
        setDragTarget(null);
      }

      setDraggedNode(null);
      setIsPanning(false);
    }, [isConnecting, dragTarget, connectionStart, onConnect]);

    const handleCanvasMouseDown = useCallback(
      (e) => {
        // Check if we're clicking on empty canvas (not on nodes or connection points)
        const isClickingOnNode =
          e.target.closest("[data-node-id]") ||
          e.target.closest(".workflow-node") ||
          e.target.closest("button") ||
          e.target.closest("input") ||
          e.target.closest("select");

        if (!isClickingOnNode && !isConnecting) {
          // Start panning
          onNodeSelect(null);
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
        } else if (isConnecting) {
          // Cancel connection if clicking on empty canvas
          setIsConnecting(false);
          setConnectionStart(null);
          setDragTarget(null);
        }
      },
      [onNodeSelect, isConnecting]
    );

    const handleCanvasDoubleClick = useCallback(
      (e) => {
        if (isPreviewMode || isConnecting) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
          x: (e.clientX - rect.left - viewOffset.x) / scale,
          y: (e.clientY - rect.top - viewOffset.y) / scale,
        };

        onAddNode("delay", position);
      },
      [onAddNode, viewOffset, isPreviewMode, isConnecting, scale]
    );

    const handleConnectionStart = useCallback(
      (nodeId, e) => {
        if (isPreviewMode) return;

        setIsConnecting(true);
        setConnectionStart(nodeId);

        const rect = canvasRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - viewOffset.x) / scale,
          y: (e.clientY - rect.top - viewOffset.y) / scale,
        });
      },
      [isPreviewMode, viewOffset, scale]
    );

    const handleConnectionEnd = useCallback(
      (nodeId) => {
        if (isConnecting && connectionStart && nodeId !== connectionStart) {
          onConnect(connectionStart, nodeId);
        }
        setIsConnecting(false);
        setConnectionStart(null);
        setDragTarget(null);
      },
      [isConnecting, connectionStart, onConnect]
    );

    // Add zoom functionality
    const handleWheel = useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get mouse position relative to canvas for zoom center point
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // More refined zoom calculation - like Figma/Sketch
        let zoomFactor;
        if (Math.abs(e.deltaY) > 100) {
          // Large scroll movement (trackpad fast scroll)
          zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        } else {
          // Normal scroll movement - much more granular
          zoomFactor = e.deltaY > 0 ? 0.97 : 1.03;
        }

        // Modifier keys for different zoom speeds
        if (e.metaKey || e.ctrlKey) {
          // Cmd/Ctrl + scroll = faster zoom
          zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        } else if (e.shiftKey) {
          // Shift + scroll = slower, precise zoom
          zoomFactor = e.deltaY > 0 ? 0.99 : 1.01;
        }

        const newScale = Math.max(0.25, Math.min(4, scale * zoomFactor));

        // Only update if there's actually a change (prevents micro-movements)
        if (Math.abs(newScale - scale) < 0.001) return;

        // Calculate new view offset to zoom toward mouse position
        const scaleChange = newScale / scale;
        const newViewOffset = {
          x: mouseX - (mouseX - viewOffset.x) * scaleChange,
          y: mouseY - (mouseY - viewOffset.y) * scaleChange,
        };

        setScale(newScale);
        setViewOffset(newViewOffset);
      },
      [scale, viewOffset]
    );

    // Add event listeners
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use passive: false to ensure preventDefault works for wheel
      const wheelOptions = { passive: false };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("wheel", handleWheel, wheelOptions);

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("wheel", handleWheel, wheelOptions);
      };
    }, [handleMouseMove, handleMouseUp, handleWheel]);

    const renderConnection = (connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return null;

      // Connection points: bottom center of source, top center of target
      const sourceX = sourceNode.position.x + 112; // Half of node width (224/2)
      const sourceY = sourceNode.position.y + 80; // Bottom of node
      const targetX = targetNode.position.x + 112;
      const targetY = targetNode.position.y; // Top of node

      // Create curved path
      const midY = sourceY + (targetY - sourceY) / 2;
      const path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`;

      return (
        <g key={connection.id}>
          <path
            d={path}
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="drop-shadow-sm"
          />
        </g>
      );
    };

    const renderActiveConnection = () => {
      if (!isConnecting || !connectionStart) return null;

      const sourceNode = nodes.find((n) => n.id === connectionStart);
      if (!sourceNode) return null;

      const sourceX = sourceNode.position.x + 112;
      const sourceY = sourceNode.position.y + 80;
      const targetX = mousePosition.x;
      const targetY = mousePosition.y;

      const midY = sourceY + (targetY - sourceY) / 2;
      const path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`;

      return (
        <path
          d={path}
          stroke="#60A5FA"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      );
    };

    return (
      <div
        ref={canvasRef}
        className={`w-full h-full bg-gray-100 relative overflow-hidden ${
          isConnecting
            ? "cursor-crosshair"
            : isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
        }`}
        onMouseDown={handleCanvasMouseDown}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {/* Background layer for panning */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`,
            width: "200%",
            height: "200%",
            left: "-50%",
            top: "-50%",
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`,
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
          </defs>

          {connections.map(renderConnection)}
          {renderActiveConnection()}
        </svg>

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`,
          }}
        >
          {nodes.map((node) => (
            <div key={node.id} data-node-id={node.id}>
              <WorkflowNode
                node={node}
                isSelected={selectedNode === node.id}
                isPreviewMode={isPreviewMode}
                isDragTarget={dragTarget === node.id}
                isConnectionSource={connectionStart === node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onUpdate={(updates) => onNodeUpdate(node.id, updates)}
                onDelete={() => onNodeDelete(node.id)}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
                onNodeClick={onNodeSelect}
              />
            </div>
          ))}
        </div>

        {/* Grid pattern that scales with zoom */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
          }}
        />

        {/* Instructions */}
        {!isPreviewMode && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600 pointer-events-none select-none">
            {isConnecting ? (
              <div className="text-blue-600 font-medium">
                Drag to connect to another node or click canvas to cancel
              </div>
            ) : (
              <div>
                <div>• Double-click to add a delay node</div>
                <div>• Drag from bottom dot to top dot to connect nodes</div>
                <div>• Mouse wheel to zoom • Shift+wheel for precise zoom</div>
                <div>• Click and drag canvas to pan around</div>
                <div className="text-xs text-gray-500 mt-1">
                  Zoom: {Math.round(scale * 100)}% •{" "}
                  {isPanning ? "Panning..." : "Ready"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

JourneyCanvas.displayName = "JourneyCanvas";
export default JourneyCanvas;
