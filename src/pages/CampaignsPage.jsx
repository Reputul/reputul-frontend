import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { buildUrl } from '../config/api';
import CampaignCard from '../components/campaigns/CampaignCard';
import EditCampaignModal from '../components/campaigns/EditCampaignModal';

const CampaignsPage = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildUrl('/api/v1/campaigns/sequences'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCampaign = async (campaignId, isActive) => {
    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${campaignId}/status`),
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Campaign ${!isActive ? 'activated' : 'deactivated'}`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast.error('Failed to update campaign status');
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  const handleSaveCampaign = async (updatedCampaign) => {
    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${updatedCampaign.id}`),
        updatedCampaign,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Campaign updated successfully');
      setShowEditModal(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleDuplicateCampaign = async (campaign) => {
    try {
      const duplicateData = {
        name: `${campaign.name} (Copy)`,
        description: campaign.description,
        isDefault: false,
        steps: campaign.steps
      };
      
      await axios.post(
        buildUrl('/api/v1/campaigns/sequences'),
        duplicateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Campaign duplicated successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Campaigns</h1>
            <p className="text-blue-200">
              Manage your automated review collection campaigns
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
              <div className="text-blue-200 text-sm">Active Campaigns</div>
              <div className="text-white text-2xl font-bold">
                {campaigns.filter(c => c.isActive).length}
              </div>
            </div>
            <button
              onClick={fetchCampaigns}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 border border-white/20"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto">
        {campaigns.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
            <div className="text-blue-300 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">
              No Campaigns Yet
            </h3>
            <p className="text-blue-200 mb-6">
              Contact support to get started with preset campaigns
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onToggle={handleToggleCampaign}
                onEdit={handleEditCampaign}
                onDuplicate={handleDuplicateCampaign}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCampaign}
        />
      )}

      {/* Info Section */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-xl border border-blue-500/20 p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-white font-semibold mb-2">How Campaigns Work</h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                Campaigns automatically send review requests to your customers using proven message sequences. 
                When you create a review request, customers are enrolled in your default campaign. 
                Each step sends at the scheduled time, and customers exit when they leave a review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
