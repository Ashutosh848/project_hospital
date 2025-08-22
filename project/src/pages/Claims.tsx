import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ClaimTable } from '../components/Claims/ClaimTable';
import { ClaimForm } from '../components/Claims/ClaimForm';
import { ClaimDetailsModal } from '../components/Claims/ClaimDetailsModal';
import { Claim } from '../types';
import { claimsService } from '../services/claimsService';
import { useToast } from '../hooks/useToast';

export const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showToast } = useToast();

  const loadClaims = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      const response = await claimsService.getClaims(page, search);
      setClaims(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 20)); // Page size is 20 from Django settings
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load claims:', error);
      showToast('Failed to load claims', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        loadClaims(1, searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      loadClaims(1);
    }
  }, [searchTerm]);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      try {
        await claimsService.deleteClaim(id);
        setClaims(prev => prev.filter(claim => claim.id !== id));
        showToast('Claim deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete claim:', error);
        showToast('Failed to delete claim', 'error');
      }
    }
  };

  const handleView = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailsOpen(true);
  };

  const handleSubmit = async (claimData: Partial<Claim> | FormData) => {
    try {
      if (formMode === 'create') {
        const newClaim = await claimsService.createClaim(claimData as any);
        setClaims(prev => [newClaim, ...prev]);
        showToast('Claim created successfully', 'success');
      } else if (selectedClaim) {
        const updatedClaim = await claimsService.updateClaim(selectedClaim.id, claimData as any);
        setClaims(prev => prev.map(claim => 
          claim.id === selectedClaim.id ? updatedClaim : claim
        ));
        showToast('Claim updated successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Failed to save claim:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      showToast('Failed to save claim', 'error');
    }
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
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={loadClaims}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
        onEdit={handleEdit}
      />
    </div>
  );
};