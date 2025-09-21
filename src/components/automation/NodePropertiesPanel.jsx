import React from 'react';

const NodePropertiesPanel = ({ node, onUpdate }) => {
  if (!node) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-2xl mb-2">⚙️</div>
        <p>Select a node to edit its properties</p>
      </div>
    );
  }

  const handleUpdate = (field, value) => {
    onUpdate({ [field]: value });
  };

  const renderTriggerProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Type
        </label>
        <select
          value={node.data.triggerType || 'SERVICE_COMPLETED'}
          onChange={(e) => handleUpdate('triggerType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="SERVICE_COMPLETED">Service Completed</option>
          <option value="CUSTOMER_CREATED">Customer Created</option>
          <option value="MANUAL_TRIGGER">Manual Trigger</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Trigger label"
        />
      </div>
    </div>
  );

  const renderDelayProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Delay description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <input
            type="number"
            min="1"
            max="72"
            value={node.data.duration || 24}
            onChange={(e) => handleUpdate('duration', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            value={node.data.unit || 'hours'}
            onChange={(e) => handleUpdate('unit', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderEmailProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Email action description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Template
        </label>
        <select
          value={node.data.templateId || ''}
          onChange={(e) => handleUpdate('templateId', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select template...</option>
          <option value="1">Review Request - Standard</option>
          <option value="2">Review Request - Premium</option>
          <option value="3">Follow-up Reminder</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject Line
        </label>
        <input
          type="text"
          value={node.data.subject || ''}
          onChange={(e) => handleUpdate('subject', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Email subject"
        />
      </div>
    </div>
  );

  const renderSmsProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="SMS action description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={node.data.message || ''}
          onChange={(e) => handleUpdate('message', e.target.value)}
          rows={4}
          maxLength={160}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="SMS message (160 char limit)"
        />
        <div className="text-xs text-gray-500 mt-1">
          {(node.data.message || '').length}/160 characters
        </div>
      </div>
    </div>
  );

  const renderConditionProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Condition description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition Type
        </label>
        <select
          value={node.data.type || 'no_response'}
          onChange={(e) => handleUpdate('type', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="no_response">No Response</option>
          <option value="negative_response">Negative Response</option>
          <option value="time_elapsed">Time Elapsed</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wait Duration
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={node.data.duration || 3}
            onChange={(e) => handleUpdate('duration', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            value={node.data.unit || 'days'}
            onChange={(e) => handleUpdate('unit', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNodeProperties = () => {
    switch (node.type) {
      case 'trigger':
        return renderTriggerProperties();
      case 'delay':
        return renderDelayProperties();
      case 'email':
        return renderEmailProperties();
      case 'sms':
        return renderSmsProperties();
      case 'condition':
        return renderConditionProperties();
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p>No properties available for this node type</p>
          </div>
        );
    }
  };

  const getNodeTypeIcon = () => {
    const icons = {
      trigger: '🎯',
      delay: '⏰',
      email: '📧',
      sms: '📱',
      condition: '❓',
      webhook: '🔗'
    };
    return icons[node.type] || '⚙️';
  };

  const getNodeTypeName = () => {
    const names = {
      trigger: 'Trigger',
      delay: 'Delay',
      email: 'Email',
      sms: 'SMS',
      condition: 'Condition',
      webhook: 'Webhook'
    };
    return names[node.type] || 'Unknown';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getNodeTypeIcon()}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{getNodeTypeName()} Node</h3>
            <p className="text-sm text-gray-500">Configure node properties</p>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderNodeProperties()}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          <div>Node ID: {node.id}</div>
          <div>Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})</div>
        </div>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;