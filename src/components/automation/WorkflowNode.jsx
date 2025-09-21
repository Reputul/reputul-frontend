import React, { useState } from 'react';

const WorkflowNode = ({ 
  node, 
  isSelected, 
  isPreviewMode, 
  onMouseDown, 
  onUpdate, 
  onDelete, 
  onConnect 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getNodeConfig = () => {
    const configs = {
      trigger: {
        icon: '🎯',
        color: 'bg-green-500',
        borderColor: 'border-green-500',
        textColor: 'text-white'
      },
      delay: {
        icon: '⏰',
        color: 'bg-yellow-500',
        borderColor: 'border-yellow-500',
        textColor: 'text-white'
      },
      email: {
        icon: '📧',
        color: 'bg-blue-500',
        borderColor: 'border-blue-500',
        textColor: 'text-white'
      },
      sms: {
        icon: '📱',
        color: 'bg-purple-500',
        borderColor: 'border-purple-500',
        textColor: 'text-white'
      },
      condition: {
        icon: '❓',
        color: 'bg-orange-500',
        borderColor: 'border-orange-500',
        textColor: 'text-white'
      },
      webhook: {
        icon: '🔗',
        color: 'bg-gray-500',
        borderColor: 'border-gray-500',
        textColor: 'text-white'
      }
    };

    return configs[node.type] || configs.delay;
  };

  const config = getNodeConfig();

  const getNodeDescription = () => {
    switch (node.type) {
      case 'trigger':
        return node.data.triggerType?.replace(/_/g, ' ') || 'Trigger';
      case 'delay':
        return `${node.data.duration || 24} ${node.data.unit || 'hours'}`;
      case 'email':
        return node.data.subject || 'Send Email';
      case 'sms':
        return 'Send SMS';
      case 'condition':
        return `If ${node.data.type?.replace(/_/g, ' ') || 'condition'} after ${node.data.duration || 3} ${node.data.unit || 'days'}`;
      default:
        return node.type;
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (node.id.startsWith('trigger-')) return; // Can't delete trigger
    onDelete();
  };

  return (
    <div
      className={`absolute select-none transition-all duration-200 ${
        isSelected ? 'z-20' : 'z-10'
      } ${isPreviewMode ? 'cursor-default' : 'cursor-move'}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Node */}
      <div
        className={`
          w-48 min-h-16 rounded-xl shadow-lg border-2 transition-all duration-200
          ${config.color} ${config.textColor}
          ${isSelected ? `${config.borderColor} shadow-xl` : 'border-transparent'}
          ${isHovered && !isPreviewMode ? 'shadow-xl transform scale-105' : ''}
          ${isPreviewMode ? '' : 'hover:shadow-xl'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{config.icon}</span>
            <span className="font-semibold text-sm">
              {node.data.label || node.type.toUpperCase()}
            </span>
          </div>
          
          {!isPreviewMode && !node.id.startsWith('trigger-') && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-1 transition-all"
              title="Delete node"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Description */}
        <div className="px-3 pb-3">
          <div className="text-xs opacity-90 leading-tight">
            {getNodeDescription()}
          </div>
        </div>

        {/* Connection Points */}
        {!isPreviewMode && (
          <>
            {/* Input connection point */}
            {!node.id.startsWith('trigger-') && (
              <div
                className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full cursor-crosshair"
                title="Connect from another node"
              />
            )}
            
            {/* Output connection point */}
            <div
              className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full cursor-crosshair"
              title="Connect to another node"
              onClick={(e) => {
                e.stopPropagation();
                // This would trigger connection mode
                console.log('Connection mode for', node.id);
              }}
            />
          </>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-blue-400 border-dashed rounded-xl pointer-events-none animate-pulse" />
      )}

      {/* Status Indicators */}
      {node.data.hasError && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          !
        </div>
      )}
      
      {node.data.isDisabled && (
        <div className="absolute inset-0 bg-gray-500/50 rounded-xl flex items-center justify-center">
          <span className="text-white font-semibold text-sm">DISABLED</span>
        </div>
      )}
    </div>
  );
};

export default WorkflowNode;