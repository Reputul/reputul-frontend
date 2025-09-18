import React, { useState } from 'react';

const CustomerJourneyOverview = ({ workflows }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Default journey steps if no workflows
  const defaultSteps = [
    { 
      title: 'Service Complete', 
      description: 'Customer service is marked as completed',
      icon: '✅',
      active: true
    },
    { 
      title: '24hr Delay', 
      description: 'Wait for optimal timing to send request',
      icon: '⏰',
      active: false
    },
    { 
      title: 'Review Request', 
      description: 'Email sent asking for review',
      icon: '📧',
      active: false
    },
    { 
      title: 'Follow-up', 
      description: 'Send reminder if no response',
      icon: '🔄',
      active: false
    }
  ];

  const getWorkflowSteps = (workflow) => {
    if (!workflow) return defaultSteps;

    const steps = [
      {
        title: 'Trigger Event',
        description: workflow.triggerType?.replace('_', ' ') || 'Event occurs',
        icon: '🎯',
        active: true
      }
    ];

    // Add delay step if configured
    if (workflow.triggerConfig?.delay_hours || workflow.triggerConfig?.delay_days) {
      const delay = workflow.triggerConfig.delay_hours 
        ? `${workflow.triggerConfig.delay_hours}hr`
        : `${workflow.triggerConfig.delay_days}d`;
      steps.push({
        title: `${delay} Delay`,
        description: 'Wait for optimal timing',
        icon: '⏰',
        active: false
      });
    }

    // Add action steps
    if (workflow.actions?.send_review_request) {
      steps.push({
        title: 'Send Request',
        description: `Send via ${workflow.deliveryMethod || 'EMAIL'}`,
        icon: workflow.deliveryMethod === 'SMS' ? '📱' : '📧',
        active: false
      });
    }

    if (workflow.actions?.follow_up) {
      steps.push({
        title: 'Follow-up',
        description: 'Send reminder if needed',
        icon: '🔄',
        active: false
      });
    }

    return steps;
  };

  const activeWorkflows = workflows.filter(w => w.isActive);
  const steps = selectedWorkflow ? getWorkflowSteps(selectedWorkflow) : defaultSteps;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-xl font-bold text-white mb-4 md:mb-0">Customer Journey</h3>
        
        {activeWorkflows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedWorkflow(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !selectedWorkflow 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white/20 text-blue-200 hover:bg-white/30'
              }`}
            >
              Default Flow
            </button>
            {activeWorkflows.slice(0, 3).map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 truncate max-w-36 ${
                  selectedWorkflow?.id === workflow.id 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white/20 text-blue-200 hover:bg-white/30'
                }`}
                title={workflow.name}
              >
                {workflow.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Journey Visualization */}
      <div className="relative">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-shrink-0">
              {/* Step */}
              <div className="flex flex-col items-center text-center min-w-0 px-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-all duration-300 ${
                  step.active 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg' 
                    : 'bg-white/20 border border-white/30'
                }`}>
                  {step.icon}
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
                <p className="text-blue-200 text-xs leading-tight">{step.description}</p>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 mx-4">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Details */}
      {selectedWorkflow && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">{selectedWorkflow.name}</h4>
            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
              selectedWorkflow.isActive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {selectedWorkflow.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
          <p className="text-blue-200 text-sm">{selectedWorkflow.description}</p>
          <div className="mt-3 text-xs text-blue-300">
            Executions: {selectedWorkflow.executionCount || 0}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeWorkflows.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-xl mt-6">
          <div className="text-blue-300 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-white font-semibold mb-2">No Active Workflows</h4>
          <p className="text-blue-200 text-sm">Your automation workflows will appear here once activated</p>
        </div>
      )}
    </div>
  );
};

export default CustomerJourneyOverview;