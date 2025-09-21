import React, { useRef, useCallback, useState } from 'react';
import WorkflowNode from './WorkflowNode';

const JourneyCanvas = React.forwardRef(({
  nodes,
  connections,
  selectedNode,
  isPreviewMode,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onNodeMove,
  onConnect,
  onAddNode
}, ref) => {
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const canvasRef = useRef(null);

  const handleMouseDown = useCallback((e, nodeId) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    const rect = canvasRef.current.getBoundingClientRect();
    
    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y
    });
    
    onNodeSelect(nodeId);
  }, [nodes, onNodeSelect, isPreviewMode]);

  const handleMouseMove = useCallback((e) => {
    if (draggedNode && !isPreviewMode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y
      };
      
      onNodeMove(draggedNode, newPosition);
    }
    
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      setViewOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggedNode, dragOffset, onNodeMove, isPanning, panStart, isPreviewMode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current) {
      onNodeSelect(null);
      
      // Start panning
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [onNodeSelect]);

  const handleCanvasDoubleClick = useCallback((e) => {
    if (isPreviewMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left - viewOffset.x,
      y: e.clientY - rect.top - viewOffset.y
    };
    
    // Default to delay node for double-click
    onAddNode('delay', position);
  }, [onAddNode, viewOffset, isPreviewMode]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(2, scale * delta));
    
    setScale(newScale);
  }, [scale]);

  // Add event listeners
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  const renderConnection = (connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return null;

    const sourceX = sourceNode.position.x + 100; // Node width / 2
    const sourceY = sourceNode.position.y + 25;  // Node height / 2
    const targetX = targetNode.position.x + 100;
    const targetY = targetNode.position.y + 25;

    // Calculate control points for curved connection
    const midX = (sourceX + targetX) / 2;
    const controlOffset = Math.abs(targetY - sourceY) * 0.5;

    const path = `M ${sourceX} ${sourceY} 
                  Q ${midX} ${sourceY + controlOffset} 
                  ${targetX} ${targetY}`;

    return (
      <g key={connection.id}>
        <path
          d={path}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          className="transition-all duration-200 hover:stroke-blue-600"
        />
      </g>
    );
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full bg-gray-100 relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleCanvasDoubleClick}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})` }}
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
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#3B82F6"
            />
          </marker>
        </defs>
        
        {connections.map(renderConnection)}
      </svg>

      <div 
        className="absolute inset-0"
        style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})` }}
      >
        {nodes.map(node => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isPreviewMode={isPreviewMode}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onUpdate={(updates) => onNodeUpdate(node.id, updates)}
            onDelete={() => onNodeDelete(node.id)}
            onConnect={(targetId) => onConnect(node.id, targetId)}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`
        }}
      />

      {/* Instructions */}
      {!isPreviewMode && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600">
          <div>• Double-click to add a delay node</div>
          <div>• Drag nodes to reposition</div>
          <div>• Click nodes to edit properties</div>
          <div>• Scroll to zoom, drag to pan</div>
        </div>
      )}
    </div>
  );
});

JourneyCanvas.displayName = 'JourneyCanvas';
export default JourneyCanvas;