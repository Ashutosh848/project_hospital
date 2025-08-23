import React, { useState, useMemo } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Filter,
  Search,
  FileText,
  Columns,
  SortAsc,
  SortDesc,
  FilterX
} from 'lucide-react';
import { Claim } from '../../types';
import { exportToCSV } from '../../utils/csvExport';

interface ClaimTableProps {
  claims: Claim[];
  onEdit: (claim: Claim) => void;
  onDelete: (id: string) => void;
  onView: (claim: Claim) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ClaimTable: React.FC<ClaimTableProps> = ({ 
  claims, 
  onEdit, 
  onDelete, 
  onView,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchTerm = '',
  onSearchChange
}) => {
  // Use props for pagination if provided, otherwise use local state
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const effectiveCurrentPage = onPageChange ? currentPage : localCurrentPage;
  const setEffectiveCurrentPage = onPageChange ? onPageChange : setLocalCurrentPage;
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Claim;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    tpaName: '',
    parentInsurance: '',
    dateFrom: '',
    dateTo: '',
    settlementStatus: '',
    amountRange: '',
    fileStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'month', 'date_of_admission', 'date_of_discharge', 'tpa_name', 'claim_id', 
    'patient_name', 'bill_amount', 'approved_amount', 'files', 'actions'
  ]));

  const itemsPerPage = 20;

  // Get unique values for dropdowns
  const uniqueTpaNames = [...new Set(claims.map(claim => claim.tpa_name))].sort();
  const uniqueInsuranceCompanies = [...new Set(claims.map(claim => claim.parent_insurance))].sort();

  // Column definitions
  const columns = [
    { key: 'select', label: '', width: 'w-12', sortable: false },
    { key: 'month', label: 'Month', width: 'w-24', sortable: true },
    { key: 'date_of_admission', label: 'Admission Date', width: 'w-32', sortable: true },
    { key: 'date_of_discharge', label: 'Discharge Date', width: 'w-32', sortable: true },
    { key: 'tpa_name', label: 'TPA Name', width: 'w-40', sortable: true },
    { key: 'parent_insurance', label: 'Parent Insurance', width: 'w-40', sortable: true },
    { key: 'claim_id', label: 'Claim ID', width: 'w-32', sortable: true },
    { key: 'uhid_ip_no', label: 'UHID/IP No', width: 'w-32', sortable: true },
    { key: 'patient_name', label: 'Patient Name', width: 'w-40', sortable: true },
    { key: 'bill_amount', label: 'Bill Amount', width: 'w-32', sortable: true },
    { key: 'approved_amount', label: 'Approved Amount', width: 'w-36', sortable: true },
    { key: 'mou_discount', label: 'MOU Discount', width: 'w-32', sortable: true },
    { key: 'co_pay', label: 'Co-pay', width: 'w-24', sortable: true },
    { key: 'consumable_deduction', label: 'Consumable Deduction', width: 'w-40', sortable: true },
    { key: 'hospital_discount', label: 'Hospital Discount', width: 'w-36', sortable: true },
    { key: 'paid_by_patient', label: 'Paid by Patient', width: 'w-32', sortable: true },
    { key: 'hospital_discount_authority', label: 'Hospital Discount Authority', width: 'w-44', sortable: true },
    { key: 'other_deductions', label: 'Other Deductions', width: 'w-36', sortable: true },
    { key: 'physical_file_dispatch', label: 'File Status', width: 'w-32', sortable: true },
    { key: 'date_of_upload_dispatch', label: 'Upload/Dispatch Date', width: 'w-40', sortable: true },
    { key: 'query_reply_date', label: 'Query Reply Date', width: 'w-36', sortable: true },
    { key: 'settlement_date', label: 'Settlement Date', width: 'w-36', sortable: true },
    { key: 'tds', label: 'TDS', width: 'w-24', sortable: true },
    { key: 'amount_settled_in_ac', label: 'Amount Settled in A/C', width: 'w-44', sortable: true },
    { key: 'total_settled_amount', label: 'Total Settled Amount', width: 'w-40', sortable: true },
    { key: 'difference_amount', label: 'Difference (Approved vs Settled)', width: 'w-48', sortable: true },
    { key: 'reason_less_settlement', label: 'Reason for Less Settlement', width: 'w-44', sortable: true },
    { key: 'claim_settled_software', label: 'Claim Settled on Software', width: 'w-44', sortable: true },
    { key: 'receipt_verified_bank', label: 'Receipt Amount Verification', width: 'w-48', sortable: true },
    { key: 'files', label: 'Files', width: 'w-32', sortable: false },
    { key: 'actions', label: 'Actions', width: 'w-24', sortable: false }
  ];

  // Apply local filters to claims (both server-side and client-side pagination)
  const filteredClaims = useMemo(() => {
    console.log('Filtering claims:', { claims: claims.length, filters, searchTerm, onPageChange });
    return claims.filter(claim => {
      // For server-side pagination, skip search filtering since it's handled by the server
      const currentSearchTerm = onPageChange ? '' : (onSearchChange ? searchTerm || '' : filters.search);
      const matchesSearch = !currentSearchTerm || 
        (claim.patient_name && claim.patient_name.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
        (claim.claim_id && claim.claim_id.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
        (claim.uhid_ip_no && claim.uhid_ip_no.toLowerCase().includes(currentSearchTerm.toLowerCase()));
      
      const matchesTPA = !filters.tpaName || 
        claim.tpa_name === filters.tpaName;
      
      const matchesInsurance = !filters.parentInsurance || 
        claim.parent_insurance === filters.parentInsurance;
      
      const matchesDateFrom = !filters.dateFrom || 
        (claim.date_of_admission && new Date(claim.date_of_admission) >= new Date(filters.dateFrom));
      
      const matchesDateTo = !filters.dateTo || 
        (claim.date_of_discharge && new Date(claim.date_of_discharge) <= new Date(filters.dateTo));
      
      const matchesSettlement = !filters.settlementStatus || 
        (filters.settlementStatus === 'settled' && claim.settlement_date && claim.settlement_date.trim() !== '') ||
        (filters.settlementStatus === 'pending' && (!claim.settlement_date || claim.settlement_date.trim() === ''));

      const matchesFileStatus = !filters.fileStatus || 
        claim.physical_file_dispatch === filters.fileStatus;

      const matchesAmountRange = !filters.amountRange || (() => {
        const amount = claim.approved_amount || 0;
        switch (filters.amountRange) {
          case '0-50000':
            return amount >= 0 && amount <= 50000;
          case '50000-100000':
            return amount > 50000 && amount <= 100000;
          case '100000-500000':
            return amount > 100000 && amount <= 500000;
          case '500000+':
            return amount > 500000;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesTPA && matchesInsurance && 
             matchesDateFrom && matchesDateTo && matchesSettlement && matchesFileStatus && matchesAmountRange;
    });
  }, [claims, filters, onPageChange, onSearchChange, searchTerm]);

  // Sort filtered claims
  const sortedClaims = useMemo(() => {
    if (!sortConfig) return filteredClaims;

    return [...filteredClaims].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredClaims, sortConfig]);

  // Determine if we should use server-side or client-side pagination
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');
  const useServerPagination = onPageChange && !hasActiveFilters;
  
  // For server-side pagination, use claims directly; for client-side, paginate locally
  const paginatedClaims = useMemo(() => {
    if (useServerPagination) {
      // Server-side pagination: claims are already paginated by the server
      return sortedClaims;
    } else {
      // Client-side pagination: paginate locally
      const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
      return sortedClaims.slice(startIndex, startIndex + itemsPerPage);
    }
  }, [sortedClaims, effectiveCurrentPage, itemsPerPage, useServerPagination]);

  const localTotalPages = Math.ceil(sortedClaims.length / itemsPerPage);
  const effectiveTotalPages = useServerPagination ? totalPages : localTotalPages;

  const handleFilterChange = (key: string, value: string) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setEffectiveCurrentPage(1);
    
    // If using server-side pagination, trigger a new request
    if (onPageChange) {
      // For now, we'll just reset to page 1
      // In a full implementation, you'd want to pass filter parameters to the parent
      onPageChange(1);
    }
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    console.log(`Search changed: ${value}`);
    if (onSearchChange) {
      // Server-side search: use the parent's search handler
      onSearchChange(value);
    } else {
      // Client-side search: use local filters
      handleFilterChange('search', value);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tpaName: '',
      parentInsurance: '',
      dateFrom: '',
      dateTo: '',
      settlementStatus: '',
      amountRange: '',
      fileStatus: ''
    });
    setEffectiveCurrentPage(1);
    
    // Also clear server-side search if available
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key: key as keyof Claim,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key: key as keyof Claim, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedClaims.length === paginatedClaims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(paginatedClaims.map(claim => claim.id));
    }
  };

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaims(prev => 
      prev.includes(claimId) 
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for claims:`, selectedClaims);
    // Implement bulk actions
  };

  const handleExportCSV = () => {
    exportToCSV(filteredClaims, 'claims-export.csv');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };



  const getFileStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="badge badge-success">Received</span>;
      case 'dispatched':
        return <span className="badge badge-warning">Dispatched</span>;
      case 'pending':
        return <span className="badge badge-danger">Pending</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? 
      <span className="badge badge-success">Verified</span> : 
      <span className="badge badge-warning">Pending</span>;
  };

  const getFileBadge = (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) {
      return <span className="badge badge-gray">No File</span>;
    }
    
    const fileNameDisplay = fileName ? fileName.split('/').pop() || 'File' : 'File';
    return (
      <div className="flex items-center gap-1">
        <span className="badge badge-blue">{fileNameDisplay}</span>
        <button
          onClick={() => window.open(fileUrl, '_blank')}
          className="text-blue-600 hover:text-blue-900 transition-colors"
          title="Download File"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const renderFilesColumn = (claim: Claim) => {
    const files = [];
    
    if (claim.approval_letter) {
      files.push({
        name: 'Approval Letter',
        url: typeof claim.approval_letter === 'string' ? claim.approval_letter : null,
        type: 'approval_letter'
      });
    }
    
    if (claim.physical_file_upload) {
      files.push({
        name: 'POD Upload',
        url: typeof claim.physical_file_upload === 'string' ? claim.physical_file_upload : null,
        type: 'physical_file_upload'
      });
    }
    
    if (claim.query_on_claim) {
      files.push({
        name: 'Query on Claim',
        url: typeof claim.query_on_claim === 'string' ? claim.query_on_claim : null,
        type: 'query_on_claim'
      });
    }
    
    if (files.length === 0) {
      return <span className="text-gray-400 text-sm">No files</span>;
    }
    
    return (
      <div className="space-y-1">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-1">
            {getFileBadge(file.url, file.name)}
          </div>
        ))}
      </div>
    );
  };



  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8"></div>
            <span className="ml-3 text-gray-600">Loading claims...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <div className="card relative overflow-visible">
        {/* Header with actions */}
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Claims Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {paginatedClaims.length} of {filteredClaims.length} claims
                {selectedClaims.length > 0 && ` • ${selectedClaims.length} selected`}
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Bulk Actions */}
              {selectedClaims.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="btn btn-secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="btn btn-danger"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="btn btn-secondary"
              >
                <Columns className="w-4 h-4 mr-2" />
                Columns
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showFilters
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500 shadow-sm hover:shadow-md'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
                {(hasActiveFilters || (onSearchChange && searchTerm && searchTerm.trim() !== '')) && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {Object.values(filters).filter(v => v && v !== '').length + (onSearchChange && searchTerm && searchTerm.trim() !== '' ? 1 : 0)}
                  </span>
                )}
              </button>
              
              <button
                onClick={handleExportCSV}
                className="btn btn-success"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Column Selector Section */}
        {showColumnSelector && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Columns</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.filter(col => col.key !== 'select' && col.key !== 'actions').map(column => (
                <label key={column.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column.key)}
                    onChange={(e) => {
                      const newVisible = new Set(visibleColumns);
                      if (e.target.checked) {
                        newVisible.add(column.key);
                      } else {
                        newVisible.delete(column.key);
                      }
                      setVisibleColumns(newVisible);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Enterprise-Level Filters Section */}
        {showFilters && (
          <div className="w-full bg-white border-b border-gray-200 relative z-10 filter-section">
            {/* Filter Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <Filter className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                    <p className="text-sm text-gray-600">Refine your search with precision filters</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <FilterX className="w-4 h-4 mr-2" />
                    Clear All
                  </button>
                  <div className="text-sm text-gray-500">
                    {Object.values(filters).filter(v => v && v !== '').length + (onSearchChange && searchTerm && searchTerm.trim() !== '' ? 1 : 0)} active
                  </div>
                </div>
              </div>
              
              {/* Active Filter Pills */}
              {(hasActiveFilters || (onSearchChange && searchTerm && searchTerm.trim() !== '')) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {onSearchChange && searchTerm && searchTerm.trim() !== '' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => onSearchChange('')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.search && !onSearchChange && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Search: "{filters.search}"
                      <button
                        onClick={() => handleFilterChange('search', '')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.tpaName && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      TPA: {filters.tpaName}
                      <button
                        onClick={() => handleFilterChange('tpaName', '')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.parentInsurance && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      Insurance: {filters.parentInsurance}
                      <button
                        onClick={() => handleFilterChange('parentInsurance', '')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.settlementStatus && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      Status: {filters.settlementStatus === 'settled' ? 'Settled' : 'Pending'}
                      <button
                        onClick={() => handleFilterChange('settlementStatus', '')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.fileStatus && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                      File: {filters.fileStatus}
                      <button
                        onClick={() => handleFilterChange('fileStatus', '')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.amountRange && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                      Amount: {filters.amountRange === '0-50000' ? '₹0 - ₹50K' : 
                               filters.amountRange === '50000-100000' ? '₹50K - ₹1L' :
                               filters.amountRange === '100000-500000' ? '₹1L - ₹5L' : '₹5L+'}
                      <button
                        onClick={() => handleFilterChange('amountRange', '')}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-teal-600 hover:text-teal-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                      Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                      <button
                        onClick={() => {
                          handleFilterChange('dateFrom', '');
                          handleFilterChange('dateTo', '');
                        }}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-rose-600 hover:text-rose-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filter Controls */}
            <div className="p-6">
              {/* Primary Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Global Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={onSearchChange ? searchTerm || '' : filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by patient name, claim ID, UHID, or any keyword..."
                    className="block w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
                  />
                  {(onSearchChange ? searchTerm : filters.search) && (
                    <button
                      onClick={() => onSearchChange ? onSearchChange('') : handleFilterChange('search', '')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FilterX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 filter-grid" style={{ position: 'relative', zIndex: 1 }}>
                {/* TPA Name Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">TPA Provider</label>
                  <select
                    value={filters.tpaName}
                    onChange={(e) => handleFilterChange('tpaName', e.target.value)}
                    className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-400"
                    style={{ position: 'relative', zIndex: 9999 }}
                  >
                    <option value="">All TPA Providers</option>
                    {uniqueTpaNames.map(tpa => (
                      <option key={tpa} value={tpa}>{tpa}</option>
                    ))}
                  </select>
                  {filters.tpaName && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      ✓ {uniqueTpaNames.length > 0 ? `1 of ${uniqueTpaNames.length} selected` : 'Selected'}
                    </div>
                  )}
                </div>

                {/* Parent Insurance Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Insurance Company</label>
                  <select
                    value={filters.parentInsurance}
                    onChange={(e) => handleFilterChange('parentInsurance', e.target.value)}
                    className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-400"
                    style={{ position: 'relative', zIndex: 9999 }}
                  >
                    <option value="">All Insurance Companies</option>
                    {uniqueInsuranceCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                  {filters.parentInsurance && (
                    <div className="mt-1 text-xs text-purple-600 font-medium">
                      ✓ {uniqueInsuranceCompanies.length > 0 ? `1 of ${uniqueInsuranceCompanies.length} selected` : 'Selected'}
                    </div>
                  )}
                </div>

                {/* Settlement Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Settlement Status</label>
                  <select
                    value={filters.settlementStatus}
                    onChange={(e) => handleFilterChange('settlementStatus', e.target.value)}
                    className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-400"
                    style={{ position: 'relative', zIndex: 9999 }}
                  >
                    <option value="">All Statuses</option>
                    <option value="settled">✅ Settled</option>
                    <option value="pending">⏳ Pending</option>
                  </select>
                  {filters.settlementStatus && (
                    <div className="mt-1 text-xs text-orange-600 font-medium">
                      ✓ {filters.settlementStatus === 'settled' ? 'Settled claims only' : 'Pending claims only'}
                    </div>
                  )}
                </div>

                {/* File Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Document Status</label>
                  <select
                    value={filters.fileStatus}
                    onChange={(e) => handleFilterChange('fileStatus', e.target.value)}
                    className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-400"
                    style={{ position: 'relative', zIndex: 9999 }}
                  >
                    <option value="">All Document Statuses</option>
                    <option value="pending">📋 Pending</option>
                    <option value="dispatched">📤 Dispatched</option>
                    <option value="received">📥 Received</option>
                    <option value="not_required">🚫 Not Required</option>
                  </select>
                  {filters.fileStatus && (
                    <div className="mt-1 text-xs text-indigo-600 font-medium">
                      ✓ {filters.fileStatus.charAt(0).toUpperCase() + filters.fileStatus.slice(1)} documents
                    </div>
                  )}
                </div>

                {/* Amount Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Claim Amount Range</label>
                  <select
                    value={filters.amountRange}
                    onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                    className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-400"
                    style={{ position: 'relative', zIndex: 9999 }}
                  >
                    <option value="">All Amount Ranges</option>
                    <option value="0-50000">💰 ₹0 - ₹50,000</option>
                    <option value="50000-100000">💰💰 ₹50,000 - ₹1,00,000</option>
                    <option value="100000-500000">💰💰💰 ₹1,00,000 - ₹5,00,000</option>
                    <option value="500000+">💎 ₹5,00,000+</option>
                  </select>
                  {filters.amountRange && (
                    <div className="mt-1 text-xs text-teal-600 font-medium">
                      ✓ {filters.amountRange === '0-50000' ? 'Small claims' : 
                         filters.amountRange === '50000-100000' ? 'Medium claims' :
                         filters.amountRange === '100000-500000' ? 'Large claims' : 'Premium claims'}
                    </div>
                  )}
                </div>

                {/* Date Range - From */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Date From</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {filters.dateFrom && (
                    <div className="mt-1 text-xs text-rose-600 font-medium">
                      ✓ From {new Date(filters.dateFrom).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Date Range - To */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Date To</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {filters.dateTo && (
                    <div className="mt-1 text-xs text-rose-600 font-medium">
                      ✓ Until {new Date(filters.dateTo).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Filter Presets */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Quick Filters</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleFilterChange('settlementStatus', 'pending');
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    }}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  >
                    ⏳ Pending Claims
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('settlementStatus', 'settled');
                      const lastWeek = new Date();
                      lastWeek.setDate(lastWeek.getDate() - 7);
                      handleFilterChange('dateFrom', lastWeek.toISOString().split('T')[0]);
                      handleFilterChange('dateTo', new Date().toISOString().split('T')[0]);
                    }}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  >
                    📅 Recently Settled
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('amountRange', '500000+');
                      handleFilterChange('settlementStatus', '');
                    }}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  >
                    💎 High Value Claims
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('fileStatus', 'pending');
                      handleFilterChange('settlementStatus', 'pending');
                    }}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  >
                    🚨 Requires Action
                  </button>
                  <button
                    onClick={() => {
                      const thisMonth = new Date();
                      const firstDay = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
                      handleFilterChange('dateFrom', firstDay.toISOString().split('T')[0]);
                      handleFilterChange('dateTo', thisMonth.toISOString().split('T')[0]);
                    }}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    📊 This Month
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                {visibleColumns.has('select') && (
                  <th className="table-header-cell w-12">
                    <input
                      type="checkbox"
                      checked={selectedClaims.length === paginatedClaims.length && paginatedClaims.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                
                {columns.filter(col => visibleColumns.has(col.key) && col.key !== 'select').map(column => (
                  <th 
                    key={column.key}
                    className={`table-header-cell ${column.width} ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? 
                          <SortAsc className="w-4 h-4" /> : 
                          <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-body">
              {paginatedClaims.map((claim) => (
                <tr key={claim.id} className="table-row">
                  {visibleColumns.has('select') && (
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedClaims.includes(claim.id)}
                        onChange={() => handleSelectClaim(claim.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {visibleColumns.has('month') && (
                    <td className="table-cell">{claim.month}</td>
                  )}
                  
                  {visibleColumns.has('date_of_admission') && (
                    <td className="table-cell">{formatDate(claim.date_of_admission)}</td>
                  )}
                  
                  {visibleColumns.has('date_of_discharge') && (
                    <td className="table-cell">{formatDate(claim.date_of_discharge)}</td>
                  )}
                  
                  {visibleColumns.has('tpa_name') && (
                    <td className="table-cell">{claim.tpa_name}</td>
                  )}
                  
                  {visibleColumns.has('parent_insurance') && (
                    <td className="table-cell">{claim.parent_insurance}</td>
                  )}
                  
                  {visibleColumns.has('claim_id') && (
                    <td className="table-cell font-medium text-blue-600">{claim.claim_id}</td>
                  )}
                  
                  {visibleColumns.has('uhid_ip_no') && (
                    <td className="table-cell">{claim.uhid_ip_no}</td>
                  )}
                  
                  {visibleColumns.has('patient_name') && (
                    <td className="table-cell font-medium">{claim.patient_name}</td>
                  )}
                  
                  {visibleColumns.has('bill_amount') && (
                    <td className="table-cell">{formatCurrency(claim.bill_amount || 0)}</td>
                  )}
                  
                  {visibleColumns.has('approved_amount') && (
                    <td className="table-cell">{formatCurrency(claim.approved_amount || 0)}</td>
                  )}
                  
                  {visibleColumns.has('mou_discount') && (
                    <td className="table-cell">{formatCurrency(claim.mou_discount || 0)}</td>
                  )}
                  
                  {visibleColumns.has('co_pay') && (
                    <td className="table-cell">{formatCurrency(claim.co_pay || 0)}</td>
                  )}
                  
                  {visibleColumns.has('consumable_deduction') && (
                    <td className="table-cell">{formatCurrency(claim.consumable_deduction || 0)}</td>
                  )}
                  
                  {visibleColumns.has('hospital_discount') && (
                    <td className="table-cell">{formatCurrency(claim.hospital_discount || 0)}</td>
                  )}
                  
                  {visibleColumns.has('paid_by_patient') && (
                    <td className="table-cell">{formatCurrency(claim.paid_by_patient || 0)}</td>
                  )}
                  
                  {visibleColumns.has('hospital_discount_authority') && (
                    <td className="table-cell">{claim.hospital_discount_authority}</td>
                  )}
                  
                  {visibleColumns.has('other_deductions') && (
                    <td className="table-cell">{formatCurrency(claim.other_deductions || 0)}</td>
                  )}
                  
                  {visibleColumns.has('physical_file_dispatch') && (
                    <td className="table-cell">{getFileStatusBadge(claim.physical_file_dispatch)}</td>
                  )}
                  
                  {visibleColumns.has('query_reply_date') && (
                    <td className="table-cell">{formatDate(claim.query_reply_date)}</td>
                  )}
                  
                  {visibleColumns.has('settlement_date') && (
                    <td className="table-cell">{formatDate(claim.settlement_date)}</td>
                  )}
                  
                  {visibleColumns.has('tds') && (
                    <td className="table-cell">{formatCurrency(claim.tds || 0)}</td>
                  )}
                  
                  {visibleColumns.has('amount_settled_in_ac') && (
                    <td className="table-cell">{formatCurrency(claim.amount_settled_in_ac || 0)}</td>
                  )}
                  
                  {visibleColumns.has('total_settled_amount') && (
                    <td className="table-cell">{formatCurrency(claim.total_settled_amount || 0)}</td>
                  )}
                  
                  {visibleColumns.has('difference_amount') && (
                    <td className="table-cell">{formatCurrency(claim.difference_amount || 0)}</td>
                  )}
                  
                  {visibleColumns.has('reason_less_settlement') && (
                    <td className="table-cell">{claim.reason_less_settlement || 'N/A'}</td>
                  )}
                  
                  {visibleColumns.has('claim_settled_software') && (
                    <td className="table-cell">{getVerificationBadge(claim.claim_settled_software)}</td>
                  )}
                  
                  {visibleColumns.has('receipt_verified_bank') && (
                    <td className="table-cell">{getVerificationBadge(claim.receipt_verified_bank)}</td>
                  )}
                  
                  {visibleColumns.has('files') && (
                    <td className="table-cell">{renderFilesColumn(claim)}</td>
                  )}
                  
                  {visibleColumns.has('actions') && (
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(claim)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(claim)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit Claim"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(claim.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedClaims.length === 0 && (
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <h3 className="empty-state-title">No claims found</h3>
            <p className="empty-state-description">
              {filteredClaims.length === 0 && claims.length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating a new claim.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {effectiveTotalPages > 1 && (
          <div className="pagination">
            <div className="text-sm text-gray-700">
              {useServerPagination ? (
                // Server-side pagination: show current page info
                `Showing ${paginatedClaims.length} claims on page ${effectiveCurrentPage} of ${effectiveTotalPages}`
              ) : (
                // Client-side pagination: we have all the data
                `Showing ${((effectiveCurrentPage - 1) * itemsPerPage) + 1} to ${Math.min(effectiveCurrentPage * itemsPerPage, filteredClaims.length)} of ${filteredClaims.length} results`
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEffectiveCurrentPage(Math.max(effectiveCurrentPage - 1, 1))}
                disabled={effectiveCurrentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, effectiveTotalPages) }, (_, i) => {
                  let pageNum;
                  if (effectiveTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (effectiveCurrentPage <= 3) {
                    pageNum = i + 1;
                  } else if (effectiveCurrentPage >= effectiveTotalPages - 2) {
                    pageNum = effectiveTotalPages - 4 + i;
                  } else {
                    pageNum = effectiveCurrentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setEffectiveCurrentPage(pageNum)}
                      className={`pagination-page ${
                        effectiveCurrentPage === pageNum
                          ? 'pagination-page-active'
                          : 'pagination-page-inactive'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setEffectiveCurrentPage(Math.min(effectiveCurrentPage + 1, effectiveTotalPages))}
                disabled={effectiveCurrentPage === effectiveTotalPages}
                className="pagination-button"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};