import React from 'react';

const WorkflowMinimap = ({ nodes, connections, selectedNode, onNodeClick }) => {
  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;
  
  // Calculate bounds of all nodes
  const getBounds = () => {
    if (!nodes.length) return { minX: 0, minY: 0, maxX: 200, maxY: 150 };
    
    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x)) - 50;
    const minY = Math.min(...positions.map(p => p.y)) - 50;
    const maxX = Math.max(...positions.map(p => p.x)) + 200;
    const maxY = Math.max(...positions.map(p => p.y)) + 100;
    
    return { minX, minY, maxX, maxY };
  };

  const bounds = getBounds();
  const scaleX = MINIMAP_WIDTH / (bounds.maxX - bounds.minX);
  const scaleY = MINIMAP_HEIGHT / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY, 0.3);

  const getScaledPosition = (position) => ({
    x: (position.x - bounds.minX) * scale,
    y: (position.y - bounds.minY) * scale
  });

  const getNodeColor = (nodeType) => {
    const colors = {
      trigger: '#10B981', // green
      delay: '#F59E0B',   // yellow
      email: '#3B82F6',   // blue
      sms: '#8B5CF6',     // purple
      condition: '#F97316', // orange
      webhook: '#6B7280'  // gray
    };
    return colors[nodeType] || '#6B7280';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-gray-700">Workflow Map</h4>
        <div className="text-xs text-gray-500">{nodes.length} nodes</div>
      </div>
      
      <div className="relative bg-gray-50 rounded border">
        <svg
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          className="overflow-visible"
        >
          {/* Render connections */}
          {connections.map(connection => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const sourcePos = getScaledPosition(sourceNode.position);
            const targetPos = getScaledPosition(targetNode.position);
            
            return (
              <line
                key={connection.id}
                x1={sourcePos.x + 6} // Half node width
                y1={sourcePos.y + 4} // Half node height
                x2={targetPos.x + 6}
                y2={targetPos.y + 4}
                stroke="#D1D5DB"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Render nodes */}
          {nodes.map(node => {
            const position = getScaledPosition(node.position);
            const isSelected = selectedNode === node.id;
            
            return (
              <rect
                key={node.id}
                x={position.x}
                y={position.y}
                width="12"
                height="8"
                rx="2"
                fill={getNodeColor(node.type)}
                stroke={isSelected ? '#3B82F6' : 'transparent'}
                strokeWidth={isSelected ? '2' : '0'}
                className="cursor-pointer hover:opacity-80"
                onClick={() => onNodeClick(node.id)}
              />
            );
          })}
        </svg>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Click nodes to select
      </div>
    </div>
  );
};

export default WorkflowMinimap;