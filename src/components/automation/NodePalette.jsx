import React, { useState } from 'react';

const NodePalette = ({ onAddNode }) => {
  const [draggedNodeType, setDraggedNodeType] = useState(null);

  const nodeTypes = [
    {
      type: 'delay',
      icon: '⏰',
      label: 'Delay',
      description: 'Wait for a specified time',
      color: 'bg-yellow-500'
    },
    {
      type: 'email',
      icon: '📧',
      label: 'Email',
      description: 'Send an email message',
      color: 'bg-blue-500'
    },
    {
      type: 'sms',
      icon: '📱',
      label: 'SMS',
      description: 'Send an SMS message',
      color: 'bg-purple-500'
    },
    {
      type: 'condition',
      icon: '❓',
      label: 'Condition',
      description: 'Check if condition is met',
      color: 'bg-orange-500'
    },
    {
      type: 'webhook',
      icon: '🔗',
      label: 'Webhook',
      description: 'Send HTTP request',
      color: 'bg-gray-500'
    }
  ];

  const handleDragStart = (e, nodeType) => {
    setDraggedNodeType(nodeType);
    e.dataTransfer.setData('nodeType', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedNodeType(null);
  };

  const handleClick = (nodeType) => {
    // Add node at default position when clicked
    onAddNode(nodeType, { x: 300, y: 200 });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-1">Node Palette</h3>
        <p className="text-sm text-gray-600">Drag or click to add nodes</p>
      </div>

      {/* Node Types */}
      <div className="flex-1 p-4 space-y-3">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            draggable
            onDragStart={(e) => handleDragStart(e, nodeType.type)}
            onDragEnd={handleDragEnd}
            onClick={() => handleClick(nodeType.type)}
            className={`
              p-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer
              transition-all duration-200 group
              ${draggedNodeType === nodeType.type ? 'opacity-50' : 'hover:border-gray-400 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg ${nodeType.color} flex items-center justify-center text-white`}>
                <span className="text-sm">{nodeType.icon}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{nodeType.label}</div>
                <div className="text-xs text-gray-600">{nodeType.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Drag nodes to canvas</div>
          <div>• Click to add at center</div>
          <div>• Connect nodes by dragging between connection points</div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 text-sm mb-2">Quick Add</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              onAddNode('delay', { x: 300, y: 200 });
              onAddNode('email', { x: 300, y: 300 });
            }}
            className="w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            ⚡ Delay + Email
          </button>
          <button
            onClick={() => {
              onAddNode('email', { x: 300, y: 200 });
              onAddNode('condition', { x: 300, y: 300 });
              onAddNode('sms', { x: 300, y: 400 });
            }}
            className="w-full text-left p-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
          >
            📧 Email + Follow-up
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePalette;