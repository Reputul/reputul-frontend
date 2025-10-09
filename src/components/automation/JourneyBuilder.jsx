import React, { useState, useCallback, useRef, useEffect } from 'react';
import { buildUrl } from '../../config/api';
import { toast } from 'sonner';
import WorkflowNode from './WorkflowNode';
import NodePalette from './NodePalette';
import JourneyCanvas from './JourneyCanvas';
import NodePropertiesPanel from './NodePropertiesPanel';
import axios from 'axios';

const JourneyBuilder = ({ workflow, userToken, onSave, onCancel }) => {
  const [nodes, setNodes] = useState(workflow?.nodes || []);
  const [connections, setConnections] = useState(workflow?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]); // Multi-select
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [connectionMode, setConnectionMode] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // Initialize with default trigger node
  useEffect(() => {
    if (nodes.length === 0) {
      const initialNodes = [{
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          triggerType: 'SERVICE_COMPLETED',
          label: 'Service Complete'
        }
      }];
      setNodes(initialNodes);
      saveToHistory(initialNodes, []);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [nodes, connections, hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'a':
            e.preventDefault();
            setSelectedNodes(nodes.map(n => n.id));
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && !selectedNode.startsWith('trigger-')) {
          handleNodeDelete(selectedNode);
        } else if (selectedNodes.length > 0) {
          handleBulkDelete();
        }
      }
      
      if (e.key === 'Escape') {
        setConnectionMode(null);
        setSelectedNode(null);
        setSelectedNodes([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedNodes, nodes]);

  const saveToHistory = useCallback((newNodes, newConnections) => {
    const newState = { nodes: newNodes, connections: newConnections };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setHistoryIndex(prev => prev - 1);
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(prev => prev + 1);
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  const handleAddNode = useCallback((nodeType, position) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: position || { x: 300, y: 200 },
      data: getDefaultNodeData(nodeType)
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    setSelectedNode(newNode.id);
    setHasUnsavedChanges(true);
    saveToHistory(newNodes, connections);
  }, [nodes, connections, saveToHistory]);

  const handleNodeUpdate = useCallback((nodeId, updates) => {
    const newNodes = nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    );
    setNodes(newNodes);
    setHasUnsavedChanges(true);
    
    // Debounce history saving for rapid updates
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(() => {
      saveToHistory(newNodes, connections);
    }, 1000);
  }, [nodes, connections, saveToHistory]);

  const handleNodeDelete = useCallback((nodeId) => {
    if (nodeId.startsWith('trigger-')) {
      toast.error('Cannot delete the trigger node');
      return;
    }

    const newNodes = nodes.filter(node => node.id !== nodeId);
    const newConnections = connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    );
    
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(null);
    setHasUnsavedChanges(true);
    saveToHistory(newNodes, newConnections);
  }, [nodes, connections, selectedNode, saveToHistory]);

  const handleBulkDelete = useCallback(() => {
    const triggerNodes = selectedNodes.filter(id => id.startsWith('trigger-'));
    if (triggerNodes.length > 0) {
      toast.error('Cannot delete trigger nodes');
      return;
    }

    const newNodes = nodes.filter(node => !selectedNodes.includes(node.id));
    const newConnections = connections.filter(conn => 
      !selectedNodes.includes(conn.source) && !selectedNodes.includes(conn.target)
    );
    
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNodes([]);
    setHasUnsavedChanges(true);
    saveToHistory(newNodes, newConnections);
  }, [nodes, connections, selectedNodes, saveToHistory]);

  const handleConnect = useCallback((sourceId, targetId) => {
    // Prevent self-connection and duplicates
    if (sourceId === targetId) return;
    
    const existingConnection = connections.find(conn => 
      conn.source === sourceId && conn.target === targetId
    );
    
    if (existingConnection) return;

    const newConnection = {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId
    };

    const newConnections = [...connections, newConnection];
    setConnections(newConnections);
    setConnectionMode(null);
    setHasUnsavedChanges(true);
    saveToHistory(nodes, newConnections);
  }, [connections, nodes, saveToHistory]);

  const validateWorkflow = useCallback(() => {
    const errors = [];
    
    if (nodes.length < 2) {
      errors.push({ type: 'structure', message: 'Workflow must have at least one action node' });
    }

    // Check connections
    const nonTriggerNodes = nodes.filter(node => !node.id.startsWith('trigger-'));
    const connectedNodeIds = new Set([
      ...connections.map(conn => conn.target),
      ...connections.map(conn => conn.source)
    ]);

    const unconnectedNodes = nonTriggerNodes.filter(node => 
      !connectedNodeIds.has(node.id)
    );

    if (unconnectedNodes.length > 0) {
      errors.push({
        type: 'connections',
        message: `${unconnectedNodes.length} node(s) are not connected`,
        nodes: unconnectedNodes.map(n => n.id)
      });
    }

    // Validate node configurations
    nodes.forEach(node => {
      if (node.type === 'email' && !node.data.subject) {
        errors.push({
          type: 'configuration',
          message: 'Email node missing subject',
          nodeId: node.id
        });
      }
      if (node.type === 'sms' && !node.data.message) {
        errors.push({
          type: 'configuration',
          message: 'SMS node missing message',
          nodeId: node.id
        });
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [nodes, connections]);

  const handleAutoSave = async () => {
    if (!workflow?.id || !hasUnsavedChanges) return;

    setAutoSaving(true);
    try {
      const workflowData = {
        nodes: nodes,
        connections: connections
      };

      await axios.put(
        buildUrl(`/api/v1/automation/workflows/${workflow.id}/draft`),
        workflowData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateWorkflow()) {
      toast.error('Please fix validation errors before saving');
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
        ? `/api/v1/automation/workflows/${workflow.id}`
        : '/api/v1/automation/workflows';
      
      const method = workflow?.id ? 'put' : 'post';
      
      await axios[method](buildUrl(endpoint), workflowData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      toast.success('Workflow saved successfully');
      setHasUnsavedChanges(false);
      onSave?.(workflowData);
      
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWorkflow = async () => {
    if (!validateWorkflow()) {
      toast.error('Fix validation errors before testing');
      return;
    }

    try {
      const response = await axios.post(
        buildUrl('/api/v1/automation/workflows/test'),
        { nodes, connections },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      toast.success('Test execution started - check executions feed');
    } catch (error) {
      toast.error('Failed to start test');
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

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {workflow?.name || 'New Workflow'}
                {hasUnsavedChanges && <span className="text-orange-500 ml-2">•</span>}
              </h2>
              <p className="text-sm text-gray-500">
                {nodes.length} nodes, {connections.length} connections
                {autoSaving && <span className="text-blue-500 ml-2">Auto-saving...</span>}
              </p>
            </div>

            {/* Validation Status */}
            {validationErrors.length > 0 && (
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* View Controls */}

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
            

            {/* Action Buttons */}
            <button
              onClick={handleTestWorkflow}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Run
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
      <div className="flex-1 flex relative">
        {/* Enhanced Node Palette */}
        {!isPreviewMode && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <NodePalette 
              onAddNode={handleAddNode}
              searchTerm={searchTerm}
              connectionMode={connectionMode}
              onSetConnectionMode={setConnectionMode}
            />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <JourneyCanvas
            ref={canvasRef}
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            selectedNodes={selectedNodes}
            connectionMode={connectionMode}
            isPreviewMode={isPreviewMode}
            validationErrors={validationErrors}
            onNodeSelect={setSelectedNode}
            onNodeMultiSelect={setSelectedNodes}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onNodeMove={(nodeId, position) => {
              const newNodes = nodes.map(node =>
                node.id === nodeId ? { ...node, position } : node
              );
              setNodes(newNodes);
              setHasUnsavedChanges(true);
            }}
            onConnect={handleConnect}
            onAddNode={handleAddNode}
            onConnectionModeChange={setConnectionMode}
          />
        </div>

        {/* Enhanced Properties Panel */}
        {selectedNode && !isPreviewMode && (
          <div className="w-80 bg-white border-l border-gray-200">
            <NodePropertiesPanel
              node={nodes.find(n => n.id === selectedNode)}
              onUpdate={(updates) => handleNodeUpdate(selectedNode, updates)}
              onDelete={() => handleNodeDelete(selectedNode)}
              validationErrors={validationErrors.filter(e => e.nodeId === selectedNode)}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {selectedNodes.length > 0 ? `${selectedNodes.length} nodes selected` : 
               selectedNode ? 'Node selected' : 'Click nodes to edit'}
            </span>
            {connectionMode && (
              <span className="text-blue-600 font-medium">
                Connection mode - click target node
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Ctrl+Z: Undo • Ctrl+S: Save • Del: Delete</span>
            {isPreviewMode && (
              <span className="text-blue-600 font-medium">Preview Mode - Read Only</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyBuilder;