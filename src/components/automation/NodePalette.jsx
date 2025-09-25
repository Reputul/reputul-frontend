import React, { useState } from 'react';

const NodePalette = ({ onAddNode, searchTerm = '', connectionMode, onSetConnectionMode }) => {
  const [draggedNodeType, setDraggedNodeType] = useState(null);

  const nodeTypes = [
    {
      type: 'delay',
      icon: '⏰',
      label: 'Delay',
      description: 'Wait for a specified time',
      color: 'bg-amber-500',
      category: 'timing'
    },
    {
      type: 'email',
      icon: '📧',
      label: 'Email',
      description: 'Send an email message',
      color: 'bg-blue-500',
      category: 'communication'
    },
    {
      type: 'sms',
      icon: '📱',
      label: 'SMS',
      description: 'Send an SMS message',
      color: 'bg-purple-500',
      category: 'communication'
    },
    {
      type: 'condition',
      icon: '❓',
      label: 'Condition',
      description: 'Check if condition is met',
      color: 'bg-orange-500',
      category: 'logic'
    },
    {
      type: 'webhook',
      icon: '🔗',
      label: 'Webhook',
      description: 'Send HTTP request',
      color: 'bg-slate-500',
      category: 'integration'
    }
  ];

  // Filter nodes based on search term
  const filteredNodeTypes = nodeTypes.filter(nodeType => 
    nodeType.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nodeType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nodeType.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category for better organization
  const groupedNodes = filteredNodeTypes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {});

  const handleDragStart = (e, nodeType) => {
    setDraggedNodeType(nodeType);
    e.dataTransfer.setData('nodeType', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedNodeType(null);
  };

  const handleClick = (nodeType) => {
    if (connectionMode) {
      // If in connection mode, don't add nodes - show message
      return;
    }
    // Add node at default position when clicked
    onAddNode(nodeType, { x: 300, y: 200 });
  };

  const categoryLabels = {
    timing: 'Timing',
    communication: 'Communication', 
    logic: 'Logic & Conditions',
    integration: 'Integrations'
  };

  const categoryIcons = {
    timing: '⏱️',
    communication: '💬',
    logic: '🧠',
    integration: '🔌'
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-1">Node Palette</h3>
        <p className="text-sm text-gray-600">
          {connectionMode ? 'Connecting nodes...' : 'Drag or click to add nodes'}
        </p>
      </div>

      {/* Connection Mode Banner */}
      {connectionMode && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-700 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Connection mode active
            </div>
            <button
              onClick={() => onSetConnectionMode?.(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Click a target node to complete the connection
          </div>
        </div>
      )}

      {/* Node Types */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm && filteredNodeTypes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm">No nodes found for "{searchTerm}"</div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(groupedNodes).map(([category, nodes]) => (
              <div key={category}>
                <div className="flex items-center mb-3">
                  <span className="text-lg mr-2">{categoryIcons[category]}</span>
                  <h4 className="font-medium text-gray-800 text-sm">
                    {categoryLabels[category]}
                  </h4>
                </div>
                <div className="space-y-2">
                  {nodes.map((nodeType) => (
                    <div
                      key={nodeType.type}
                      draggable={!connectionMode}
                      onDragStart={(e) => handleDragStart(e, nodeType.type)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleClick(nodeType.type)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all duration-200 group
                        ${connectionMode 
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                          : draggedNodeType === nodeType.type 
                            ? 'opacity-50 border-blue-400' 
                            : 'border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${nodeType.color} flex items-center justify-center text-white shadow-sm`}>
                          <span className="text-lg">{nodeType.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {nodeType.label}
                          </div>
                          <div className="text-xs text-gray-600">
                            {nodeType.description}
                          </div>
                        </div>
                        {!connectionMode && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Templates - Only show when not in connection mode */}
      {!connectionMode && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Workflows
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                onAddNode('delay', { x: 300, y: 200 });
                setTimeout(() => onAddNode('email', { x: 300, y: 320 }), 100);
              }}
              className="w-full text-left p-3 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <div className="font-medium mb-1">⏰ → 📧 Delay + Email</div>
              <div className="text-blue-600">Wait 24 hours, then send review request</div>
            </button>
            <button
              onClick={() => {
                onAddNode('email', { x: 300, y: 200 });
                setTimeout(() => onAddNode('condition', { x: 300, y: 320 }), 100);
                setTimeout(() => onAddNode('sms', { x: 300, y: 440 }), 200);
              }}
              className="w-full text-left p-3 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <div className="font-medium mb-1">📧 → ❓ → 📱 Follow-up Flow</div>
              <div className="text-green-600">Email, check response, SMS follow-up</div>
            </button>
            <button
              onClick={() => {
                onAddNode('delay', { x: 200, y: 200 });
                setTimeout(() => onAddNode('email', { x: 200, y: 320 }), 100);
                setTimeout(() => onAddNode('delay', { x: 400, y: 320 }), 150);
                setTimeout(() => onAddNode('sms', { x: 400, y: 440 }), 200);
              }}
              className="w-full text-left p-3 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <div className="font-medium mb-1">🔄 Multi-Channel Campaign</div>
              <div className="text-purple-600">Email and SMS with smart timing</div>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          {connectionMode ? (
            <div className="text-blue-700 font-medium">
              Click on a target node to complete the connection
            </div>
          ) : (
            <>
              <div>• Drag nodes to canvas or click to add</div>
              <div>• Connect nodes by dragging between dots</div>
              <div>• Use quick workflows to get started fast</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodePalette;