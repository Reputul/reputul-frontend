import React, { useState, useRef } from 'react';

const WorkflowNode = ({ 
  node, 
  isSelected, 
  isPreviewMode, 
  validationErrors = [],
  onMouseDown, 
  onUpdate, 
  onDelete, 
  onConnectionStart,
  onConnectionEnd,
  onNodeClick,
  isDragTarget,
  isConnectionSource
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nodeRef = useRef(null);

  const hasErrors = validationErrors.length > 0;

  const getNodeConfig = () => {
    const configs = {
      trigger: {
        icon: '🎯',
        color: 'bg-emerald-500',
        borderColor: 'border-emerald-500',
        textColor: 'text-white',
        name: 'Trigger'
      },
      delay: {
        icon: '⏰',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500',
        textColor: 'text-white',
        name: 'Delay'
      },
      email: {
        icon: '📧',
        color: 'bg-blue-500',
        borderColor: 'border-blue-500',
        textColor: 'text-white',
        name: 'Email'
      },
      sms: {
        icon: '📱',
        color: 'bg-purple-500',
        borderColor: 'border-purple-500',
        textColor: 'text-white',
        name: 'SMS'
      },
      condition: {
        icon: '❓',
        color: 'bg-orange-500',
        borderColor: 'border-orange-500',
        textColor: 'text-white',
        name: 'Condition'
      },
      webhook: {
        icon: '🔗',
        color: 'bg-slate-500',
        borderColor: 'border-slate-500',
        textColor: 'text-white',
        name: 'Webhook'
      }
    };

    return configs[node.type] || configs.delay;
  };

  const config = getNodeConfig();

  const getNodeDescription = () => {
    switch (node.type) {
      case 'trigger':
        return node.data.triggerType?.replace(/_/g, ' ') || 'Service Complete';
      case 'delay':
        return `Wait ${node.data.duration || 24} ${node.data.unit || 'hours'}`;
      case 'email':
        return node.data.subject || 'Send Review Request';
      case 'sms':
        return 'Send SMS message';
      case 'condition':
        return `If ${node.data.type?.replace(/_/g, ' ') || 'no response'} after ${node.data.duration || 3} ${node.data.unit || 'days'}`;
      case 'webhook':
        return node.data.url ? 'HTTP request configured' : 'Configure webhook URL';
      default:
        return 'Configure node';
    }
  };

  const handleNodeClick = (e) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onNodeClick?.(node.id);
    }
  };

  const handleMouseDown = (e) => {
    if (isPreviewMode) return;
    onMouseDown?.(e);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (node.id.startsWith('trigger-')) return;
    
    if (showDeleteConfirm) {
      onDelete?.();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleOutputMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isPreviewMode) {
      onConnectionStart?.(node.id, e);
    }
  };

  const handleInputMouseUp = (e) => {
    e.stopPropagation();
    if (!isPreviewMode && !node.id.startsWith('trigger-')) {
      onConnectionEnd?.(node.id, e);
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute select-none transition-all duration-200 ${
        isSelected ? 'z-30' : isHovered ? 'z-20' : 'z-10'
      } ${isPreviewMode ? 'cursor-default' : 'cursor-move'}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `scale(${isSelected ? 1.05 : 1})`
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDeleteConfirm(false);
      }}
      onClick={handleNodeClick}
    >
      {/* Input Connection Point - Top Center */}
      {!node.id.startsWith('trigger-') && !isPreviewMode && (
        <div
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 cursor-pointer transition-all z-40 ${
            isDragTarget 
              ? 'bg-green-500 border-green-600 shadow-lg animate-pulse' 
              : 'bg-white border-gray-400 hover:border-blue-500'
          }`}
          onMouseUp={handleInputMouseUp}
          onMouseEnter={(e) => {
            e.stopPropagation();
            // Add visual feedback when hovering during drag
          }}
        >
          <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
            isDragTarget ? 'bg-white' : 'bg-gray-400'
          }`} />
        </div>
      )}

      {/* Main Node Container */}
      <div
        className={`
          relative w-56 min-h-20 rounded-xl shadow-lg border-2 transition-all duration-200
          ${config.color} ${config.textColor}
          ${isSelected ? `${config.borderColor} shadow-xl ring-2 ring-blue-300` : 'border-transparent'}
          ${hasErrors ? 'ring-2 ring-red-400' : ''}
          ${isHovered && !isPreviewMode ? 'shadow-xl' : ''}
          ${isDragTarget ? 'ring-2 ring-green-400' : ''}
          ${isConnectionSource ? 'ring-2 ring-blue-400' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-xl flex-shrink-0">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {node.data.label || config.name}
              </div>
              <div className="text-xs opacity-90 truncate">
                {getNodeDescription()}
              </div>
            </div>
          </div>
          
          {/* Node Actions */}
          {!isPreviewMode && isHovered && (
            <div className="flex items-center space-x-1 ml-2">
              {/* Delete Button */}
              {!node.id.startsWith('trigger-') && (
                <button
                  className={`p-1.5 rounded transition-colors ${
                    showDeleteConfirm 
                      ? 'bg-red-500 text-white' 
                      : 'hover:bg-red-500/20'
                  }`}
                  title={showDeleteConfirm ? "Click again to confirm" : "Delete node"}
                  onClick={handleDelete}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error Indicator */}
        {hasErrors && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            !
          </div>
        )}
      </div>

      {/* Output Connection Point - Bottom Center */}
      {!isPreviewMode && (
        <div
          className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 cursor-pointer transition-all z-40 ${
            isConnectionSource
              ? 'bg-blue-500 border-blue-600 shadow-lg'
              : 'bg-white border-gray-400 hover:border-blue-500'
          }`}
          onMouseDown={handleOutputMouseDown}
        >
          <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
            isConnectionSource ? 'bg-white' : 'bg-gray-400'
          }`} />
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -inset-2 border-2 border-blue-400 border-dashed rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

export default WorkflowNode;