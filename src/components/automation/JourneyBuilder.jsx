import React, { useState, useCallback, useRef } from 'react';
import { buildUrl } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import WorkflowNode from './WorkflowNode';
import NodePalette from './NodePalette';
import JourneyCanvas from './JourneyCanvas';
import axios from 'axios';
import NodePropertiesPanel from './NodePropertiesPanel';

const JourneyBuilder = ({ workflow, userToken, onSave, onCancel }) => {
  const [nodes, setNodes] = useState(workflow?.nodes || []);
  const [connections, setConnections] = useState(workflow?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const canvasRef = useRef(null);

  // Initialize with default trigger node if empty
  React.useEffect(() => {
    if (nodes.length === 0) {
      setNodes([{
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          triggerType: 'SERVICE_COMPLETED',
          label: 'Service Complete'
        }
      }]);
    }
  }, []);

  const handleAddNode = useCallback((nodeType, position) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: position || { x: 300, y: 200 },
      data: getDefaultNodeData(nodeType)
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  }, []);

  const handleNodeUpdate = useCallback((nodeId, updates) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    // Don't allow deleting the trigger node
    if (nodeId.startsWith('trigger-')) {
      showToast('Cannot delete the trigger node', 'error');
      return;
    }

    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode, showToast]);

  const handleNodeMove = useCallback((nodeId, newPosition) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId
        ? { ...node, position: newPosition }
        : node
    ));
  }, []);

  const handleConnect = useCallback((sourceId, targetId) => {
    // Prevent duplicate connections
    const existingConnection = connections.find(conn => 
      conn.source === sourceId && conn.target === targetId
    );
    
    if (existingConnection) return;

    const newConnection = {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId
    };

    setConnections(prev => [...prev, newConnection]);
  }, [connections]);

  const validateWorkflow = () => {
    if (nodes.length < 2) {
      return { valid: false, message: 'Workflow must have at least one action node' };
    }

    // Check if all nodes (except trigger) are connected
    const nonTriggerNodes = nodes.filter(node => !node.id.startsWith('trigger-'));
    const connectedNodeIds = new Set([
      ...connections.map(conn => conn.target),
      ...connections.map(conn => conn.source)
    ]);

    const unconnectedNodes = nonTriggerNodes.filter(node => 
      !connectedNodeIds.has(node.id)
    );

    if (unconnectedNodes.length > 0) {
      return { 
        valid: false, 
        message: `${unconnectedNodes.length} node(s) are not connected to the workflow` 
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateWorkflow();
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }

    setSaving(true);
    try {
      const workflowData = {
        name: workflow?.name || 'New Workflow',
        description: workflow?.description || 'Created with Journey Builder',
        nodes: nodes,
        connections: connections,
        isActive: workflow?.isActive || false
      };

      const endpoint = workflow?.id 
        ? `/api/automation/workflows/${workflow.id}`
        : '/api/automation/workflows';
      
      const method = workflow?.id ? 'put' : 'post';
      
      await axios[method](buildUrl(endpoint), workflowData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      showToast('Workflow saved successfully', 'success');
      onSave?.(workflowData);
      
    } catch (error) {
      console.error('Error saving workflow:', error);
      showToast('Failed to save workflow', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultNodeData = (nodeType) => {
    const defaults = {
      delay: {
        duration: 24,
        unit: 'hours',
        label: '24 Hour Delay'
      },
      email: {
        templateId: null,
        subject: 'Review Request',
        label: 'Send Email'
      },
      sms: {
        message: 'Thanks for your business! Please share your experience:',
        label: 'Send SMS'
      },
      condition: {
        type: 'no_response',
        duration: 3,
        unit: 'days',
        label: 'If No Response'
      },
      webhook: {
        url: '',
        method: 'POST',
        label: 'Send Webhook'
      }
    };

    return defaults[nodeType] || { label: nodeType };
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Journey Builder - {workflow?.name || 'New Workflow'}
            </h2>
            <p className="text-sm text-gray-600">
              Drag nodes from the palette to build your automation workflow
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Node Palette */}
        {!isPreviewMode && (
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <NodePalette onAddNode={handleAddNode} />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <JourneyCanvas
            ref={canvasRef}
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            isPreviewMode={isPreviewMode}
            onNodeSelect={setSelectedNode}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onNodeMove={handleNodeMove}
            onConnect={handleConnect}
            onAddNode={handleAddNode}
          />
        </div>

        {/* Properties Panel */}
        {selectedNode && !isPreviewMode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <NodePropertiesPanel
              node={nodes.find(n => n.id === selectedNode)}
              onUpdate={(updates) => handleNodeUpdate(selectedNode, updates)}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {nodes.length} nodes, {connections.length} connections
          </div>
          <div className="flex items-center space-x-4">
            {isPreviewMode ? (
              <span className="text-blue-600 font-medium">Preview Mode - Read Only</span>
            ) : (
              <span>Click nodes to edit properties</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyBuilder;