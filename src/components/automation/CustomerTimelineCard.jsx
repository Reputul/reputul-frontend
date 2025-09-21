import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const CustomerTimelineCard = ({ customer, userToken }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (customer?.id && userToken) {
      fetchTimeline();
    }
  }, [customer?.id, userToken]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildUrl(`/api/automation/customers/${customer.id}/timeline`),
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setTimeline(response.data.events || []);
    } catch (error) {
      console.error('Error fetching customer timeline:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventConfig = (eventType, status) => {
    const configs = {
      'SERVICE_COMPLETED': {
        icon: '✅',
        title: 'Service Completed',
        color: 'text-green-400',
        bgColor: 'bg-green-400/20'
      },
      'REVIEW_REQUEST_SCHEDULED': {
        icon: '⏰',
        title: 'Review Request Scheduled',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/20'
      },
      'REVIEW_REQUEST_SENT': {
        icon: '📧',
        title: 'Review Request Sent',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/20'
      },
      'CUSTOMER_RESPONDED': {
        icon: '⭐',
        title: 'Customer Responded',
        color: 'text-green-400',
        bgColor: 'bg-green-400/20'
      },
      'FOLLOW_UP_SENT': {
        icon: '🔄',
        title: 'Follow-up Sent',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/20'
      },
      'AUTOMATION_SKIPPED': {
        icon: '⏭️',
        title: 'Automation Skipped',
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/20'
      },
      'REQUEST_FAILED': {
        icon: '❌',
        title: 'Request Failed',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20'
      }
    };

    return configs[eventType] || {
      icon: '📝',
      title: eventType.replace(/_/g, ' '),
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/20'
    };
  };

  const formatEventTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 60000) return 'Just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    if (diffMs < 604800000) return `${Math.floor(diffMs / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-pulse bg-gray-300 rounded w-32 h-6"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="animate-pulse bg-gray-300 rounded-full w-8 h-8"></div>
              <div className="animate-pulse bg-gray-300 rounded w-48 h-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Automation Timeline</h3>
        <div className="text-center py-8">
          <div className="text-blue-300 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-white font-semibold mb-1">No Automation History</h4>
          <p className="text-blue-200 text-sm">Automation events for this customer will appear here</p>
        </div>
      </div>
    );
  }

  const visibleEvents = expanded ? timeline : timeline.slice(0, 5);
  const hasMore = timeline.length > 5;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Automation Timeline</h3>
        <div className="flex items-center space-x-2">
          <span className="text-blue-200 text-sm">{timeline.length} events</span>
          <button
            onClick={fetchTimeline}
            className="text-blue-400 hover:text-white transition-colors"
            title="Refresh timeline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {visibleEvents.map((event, index) => {
          const config = getEventConfig(event.eventType, event.status);
          const isLast = index === visibleEvents.length - 1;
          
          return (
            <div key={event.id || index} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-0.5 h-8 bg-white/20"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Event icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}>
                  <span className="text-sm">{config.icon}</span>
                </div>
                
                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${config.color}`}>{config.title}</h4>
                    <span className="text-blue-300 text-xs">{formatEventTime(event.timestamp)}</span>
                  </div>
                  
                  {event.description && (
                    <p className="text-blue-200 text-sm mt-1">{event.description}</p>
                  )}
                  
                  {event.metadata && (
                    <div className="mt-2 text-xs text-blue-300">
                      {event.metadata.workflowName && (
                        <span>Workflow: {event.metadata.workflowName}</span>
                      )}
                      {event.metadata.deliveryMethod && (
                        <span className="ml-3">via {event.metadata.deliveryMethod}</span>
                      )}
                    </div>
                  )}
                  
                  {event.errorMessage && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-xs">
                      {event.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 hover:text-white text-sm font-medium transition-colors"
            >
              {expanded ? 'Show Less' : `Show ${timeline.length - 5} More Events`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTimelineCard;