import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ClaimTable } from '../components/Claims/ClaimTable';
import { ClaimForm } from '../components/Claims/ClaimForm';
import { ClaimDetailsModal } from '../components/Claims/ClaimDetailsModal';
import { Claim } from '../types';
import { mockClaims } from '../data/mockData';
import { useToast } from '../hooks/useToast';

export const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  const { showToast } = useToast();

  useEffect(() => {
    setClaims(mockClaims);
  }, []);

  const handleCreate = () => {
    setFormMode('create');
    setSelectedClaim(null);
    setIsFormOpen(true);
  };

  const handleEdit = (claim: Claim) => {
    setFormMode('edit');
    setSelectedClaim(claim);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      setClaims(prev => prev.filter(claim => claim.id !== id));
      showToast('Claim deleted successfully', 'success');
    }
  };

  const handleView = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (claimData: Partial<Claim>) => {
    if (formMode === 'create') {
      const newClaim: Claim = {
        id: `claim_${Date.now()}`,
        ...claimData as Claim
      };
      setClaims(prev => [newClaim, ...prev]);
      showToast('Claim created successfully', 'success');
    } else if (selectedClaim) {
      const updatedClaim = { ...selectedClaim, ...claimData };
      setClaims(prev => prev.map(claim => 
        claim.id === selectedClaim.id ? updatedClaim : claim
      ));
      showToast('Claim updated successfully', 'success');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-gray-600 mt-1">Manage hospital insurance claims</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Claim</span>
        </button>
      </div>

      <ClaimTable
        claims={claims}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <ClaimForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedClaim}
        title={formMode === 'create' ? 'Create New Claim' : 'Edit Claim'}
      />

      <ClaimDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        claim={selectedClaim}
      />
    </div>
  );
};