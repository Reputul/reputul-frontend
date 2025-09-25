import React from "react";
import WorkflowCard from "./WorkflowCard";

const WorkflowGrid = ({
  workflows,
  onWorkflowUpdate,
  onSaveAsTemplate,
  onCreateWorkflow,
  userToken,
}) => {
  if (!workflows || workflows.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12">
        <div className="text-center">
          <div className="text-blue-300 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">
            No Automation Workflows
          </h3>
          <p className="text-blue-200 mb-6">
            Get started by creating your first automated workflow
          </p>
          <button
            onClick={onCreateWorkflow}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            Create Workflow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          onWorkflowUpdate={onWorkflowUpdate}
          onSaveAsTemplate={onSaveAsTemplate}
          userToken={userToken}
        />
      ))}
    </div>
  );
};

export default WorkflowGrid;
