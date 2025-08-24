import React, { useState, useMemo, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  FileText,
  Columns,
  Filter,
  X
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
  onFilterStateChange?: (hasActiveFilters: boolean) => void;
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
  onSearchChange,
  onFilterStateChange
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
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'month', 'date_of_admission', 'date_of_discharge', 'tpa_name', 'claim_id', 
    'patient_name', 'bill_amount', 'approved_amount', 'settlement_status', 'files', 'actions'
  ]));

  // Filter state
  const [filters, setFilters] = useState({
    patientName: '',
    claimId: '',
    tpaName: '',
    parentInsurance: '',
    settlementStatus: '',
    fileStatus: '',
    admissionDateFrom: '',
    admissionDateTo: '',
    dischargeDateFrom: '',
    dischargeDateTo: ''
  });

  // Applied filters state (what's actually being used for filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    patientName: '',
    claimId: '',
    tpaName: '',
    parentInsurance: '',
    settlementStatus: '',
    fileStatus: '',
    admissionDateFrom: '',
    admissionDateTo: '',
    dischargeDateFrom: '',
    dischargeDateTo: ''
  });

  // Filter input states for text inputs with suggestions
  const [settlementStatusInput, setSettlementStatusInput] = useState('');
  const [fileStatusInput, setFileStatusInput] = useState('');
  const [showSettlementSuggestion, setShowSettlementSuggestion] = useState(false);
  const [showFileStatusSuggestion, setShowFileStatusSuggestion] = useState(false);

  const itemsPerPage = 20;

  // Initialize filter inputs when component mounts
  useEffect(() => {
    setSettlementStatusInput(filters.settlementStatus);
    setFileStatusInput(filters.fileStatus);
  }, []); // Only run once on mount





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
    { key: 'settlement_status', label: 'Settlement Status', width: 'w-32', sortable: true },
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

  // Apply search and filters to claims
  const filteredClaims = useMemo(() => {
    let filtered = claims;

    // Apply search filter
    if (searchTerm && onSearchChange) {
      filtered = filtered.filter(claim => {
        return (
          (claim.patient_name && claim.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (claim.claim_id && claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (claim.uhid_ip_no && claim.uhid_ip_no.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Apply patient name filter
    if (appliedFilters.patientName) {
      filtered = filtered.filter(claim => 
        claim.patient_name && claim.patient_name.toLowerCase().includes(appliedFilters.patientName.toLowerCase())
      );
    }

    // Apply claim ID filter
    if (appliedFilters.claimId) {
      filtered = filtered.filter(claim => 
        claim.claim_id && claim.claim_id.toLowerCase().includes(appliedFilters.claimId.toLowerCase())
      );
    }

    // Apply TPA filter
    if (appliedFilters.tpaName) {
      filtered = filtered.filter(claim => 
        claim.tpa_name && claim.tpa_name.toLowerCase().includes(appliedFilters.tpaName.toLowerCase())
      );
    }

    // Apply insurance filter
    if (appliedFilters.parentInsurance) {
      filtered = filtered.filter(claim => 
        claim.parent_insurance && claim.parent_insurance.toLowerCase().includes(appliedFilters.parentInsurance.toLowerCase())
      );
    }

    // Apply settlement status filter
    if (appliedFilters.settlementStatus) {
      filtered = filtered.filter(claim => {
        if (appliedFilters.settlementStatus === 'settled') {
          return claim.settlement_date && claim.settlement_date.trim() !== '';
        } else if (appliedFilters.settlementStatus === 'pending') {
          return !claim.settlement_date || claim.settlement_date.trim() === '';
        }
            return true;
      });
    }

    // Apply file status filter
    if (appliedFilters.fileStatus) {
      filtered = filtered.filter(claim => claim.physical_file_dispatch === appliedFilters.fileStatus);
    }

    // Apply admission date range filter
    if (appliedFilters.admissionDateFrom || appliedFilters.admissionDateTo) {
      filtered = filtered.filter(claim => {
        if (!claim.date_of_admission) return false;
        
        const admissionDate = new Date(claim.date_of_admission);
        if (isNaN(admissionDate.getTime())) return false;
        
        const fromDate = appliedFilters.admissionDateFrom ? new Date(appliedFilters.admissionDateFrom) : null;
        const toDate = appliedFilters.admissionDateTo ? new Date(appliedFilters.admissionDateTo) : null;
        
        if (fromDate && admissionDate < fromDate) return false;
        if (toDate && admissionDate > toDate) return false;
        
        return true;
      });
    }

    // Apply discharge date range filter
    if (appliedFilters.dischargeDateFrom || appliedFilters.dischargeDateTo) {
      filtered = filtered.filter(claim => {
        if (!claim.date_of_discharge) return false;
        
        const dischargeDate = new Date(claim.date_of_discharge);
        if (isNaN(dischargeDate.getTime())) return false;
        
        const fromDate = appliedFilters.dischargeDateFrom ? new Date(appliedFilters.dischargeDateFrom) : null;
        const toDate = appliedFilters.dischargeDateTo ? new Date(appliedFilters.dischargeDateTo) : null;
        
        if (fromDate && dischargeDate < fromDate) return false;
        if (toDate && dischargeDate > toDate) return false;
        
        return true;
      });
    }

    return filtered;
  }, [claims, searchTerm, onSearchChange, appliedFilters]);

  const hasActiveFilters = Object.values(appliedFilters).some(v => v && v !== '');
  const hasPendingFilters = Object.values(filters).some(v => v && v !== '') && 
    JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  // Notify parent component when filter state changes
  useEffect(() => {
    if (onFilterStateChange) {
      onFilterStateChange(hasActiveFilters);
    }
  }, [hasActiveFilters, onFilterStateChange]);

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
  // Use client-side pagination when filters are applied, otherwise use server-side
  // This ensures that filtered results are properly paginated locally
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
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSettlementStatusChange = (value: string) => {
    setSettlementStatusInput(value);
    setFilters(prev => ({ ...prev, settlementStatus: value }));
    
    // Show suggestion if input doesn't match valid options
    const validOptions = ['settled', 'pending'];
    const normalizedValue = value.toLowerCase().trim();
    setShowSettlementSuggestion(value.length > 0 && !validOptions.includes(normalizedValue));
  };

  const handleFileStatusChange = (value: string) => {
    setFileStatusInput(value);
    setFilters(prev => ({ ...prev, fileStatus: value }));
    
    // Show suggestion if input doesn't match valid options
    const validOptions = ['pending', 'dispatched', 'received', 'not_required'];
    const normalizedValue = value.toLowerCase().trim();
    setShowFileStatusSuggestion(value.length > 0 && !validOptions.includes(normalizedValue));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setEffectiveCurrentPage(1);
  };

  const clearFilters = () => {
    const emptyFilters = {
      patientName: '',
      claimId: '',
      tpaName: '',
      parentInsurance: '',
      settlementStatus: '',
      fileStatus: '',
      admissionDateFrom: '',
      admissionDateTo: '',
      dischargeDateFrom: '',
      dischargeDateTo: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSettlementStatusInput('');
    setFileStatusInput('');
    setShowSettlementSuggestion(false);
    setShowFileStatusSuggestion(false);
    setEffectiveCurrentPage(1);
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
    // Handle empty, null, or invalid date strings
    if (!dateString || dateString.trim() === '' || dateString === 'null' || dateString === 'undefined') {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    
    // Check if the date is valid (not Invalid Date)
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-IN');
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

  const getSettlementStatusBadge = (settlementDate: string) => {
    if (!settlementDate || settlementDate.trim() === '' || settlementDate === 'null' || settlementDate === 'undefined') {
      return <span className="badge badge-warning">Pending</span>;
    }
    
    const date = new Date(settlementDate);
    if (isNaN(date.getTime())) {
      return <span className="badge badge-warning">Pending</span>;
    }
    
    return <span className="badge badge-success">Settled</span>;
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
      <div className="card">
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
                className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {Object.values(filters).filter(v => v && v !== '').length}
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

        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                {hasPendingFilters && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Pending
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {hasPendingFilters && (
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                  >
                    Go
                  </button>
                )}
                {hasActiveFilters && (
              <button
                onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                    <X className="w-4 h-4 mr-1" />
                Clear All
              </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Patient Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                  value={filters.patientName}
                  onChange={(e) => handleFilterChange('patientName', e.target.value)}
                  placeholder="Search by patient name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

              {/* Claim ID Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim ID</label>
                <input
                  type="text"
                  value={filters.claimId}
                  onChange={(e) => handleFilterChange('claimId', e.target.value)}
                  placeholder="Search by claim ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* TPA Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TPA Provider</label>
                <input
                  type="text"
                  value={filters.tpaName}
                  onChange={(e) => handleFilterChange('tpaName', e.target.value)}
                  placeholder="Search by TPA provider..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Insurance Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
                <input
                  type="text"
                  value={filters.parentInsurance}
                  onChange={(e) => handleFilterChange('parentInsurance', e.target.value)}
                  placeholder="Search by insurance company..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Settlement Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Status</label>
                <input
                  type="text"
                  value={settlementStatusInput}
                  onChange={(e) => handleSettlementStatusChange(e.target.value)}
                  placeholder="Enter status (settled or pending)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showSettlementSuggestion && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 font-medium mb-1">Suggested statuses:</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSettlementStatusChange('settled')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        settled
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSettlementStatusChange('pending')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        pending
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* File Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Status</label>
                <input
                  type="text"
                  value={fileStatusInput}
                  onChange={(e) => handleFileStatusChange(e.target.value)}
                  placeholder="Enter file status (pending, dispatched, received, not_required)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showFileStatusSuggestion && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 font-medium mb-1">Suggested file statuses:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleFileStatusChange('pending')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        pending
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileStatusChange('dispatched')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        dispatched
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileStatusChange('received')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        received
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileStatusChange('not_required')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        not_required
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admission Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date From</label>
                <input
                  type="date"
                  value={filters.admissionDateFrom}
                  onChange={(e) => handleFilterChange('admissionDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date To</label>
                <input
                  type="date"
                  value={filters.admissionDateTo}
                  onChange={(e) => handleFilterChange('admissionDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Discharge Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date From</label>
                <input
                  type="date"
                  value={filters.dischargeDateFrom}
                  onChange={(e) => handleFilterChange('dischargeDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date To</label>
                <input
                  type="date"
                  value={filters.dischargeDateTo}
                  onChange={(e) => handleFilterChange('dischargeDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4">
                {appliedFilters.patientName && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    Patient: {appliedFilters.patientName}
                    <button
                      onClick={() => {
                        handleFilterChange('patientName', '');
                        setAppliedFilters(prev => ({ ...prev, patientName: '' }));
                      }}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.claimId && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
                    Claim ID: {appliedFilters.claimId}
                    <button
                      onClick={() => {
                        handleFilterChange('claimId', '');
                        setAppliedFilters(prev => ({ ...prev, claimId: '' }));
                      }}
                      className="ml-1 text-pink-600 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.tpaName && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    TPA: {appliedFilters.tpaName}
                    <button
                      onClick={() => {
                        handleFilterChange('tpaName', '');
                        setAppliedFilters(prev => ({ ...prev, tpaName: '' }));
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.parentInsurance && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Insurance: {appliedFilters.parentInsurance}
                    <button
                      onClick={() => {
                        handleFilterChange('parentInsurance', '');
                        setAppliedFilters(prev => ({ ...prev, parentInsurance: '' }));
                      }}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.settlementStatus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                    Status: {appliedFilters.settlementStatus === 'settled' ? 'Settled' : 'Pending'}
                    <button
                      onClick={() => {
                        handleFilterChange('settlementStatus', '');
                        setAppliedFilters(prev => ({ ...prev, settlementStatus: '' }));
                      }}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.fileStatus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    File: {appliedFilters.fileStatus}
                    <button
                      onClick={() => {
                        handleFilterChange('fileStatus', '');
                        setAppliedFilters(prev => ({ ...prev, fileStatus: '' }));
                      }}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.admissionDateFrom && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                    Admission From: {appliedFilters.admissionDateFrom}
                    <button
                      onClick={() => {
                        handleFilterChange('admissionDateFrom', '');
                        setAppliedFilters(prev => ({ ...prev, admissionDateFrom: '' }));
                      }}
                      className="ml-1 text-teal-600 hover:text-teal-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.admissionDateTo && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                    Admission To: {appliedFilters.admissionDateTo}
                    <button
                      onClick={() => {
                        handleFilterChange('admissionDateTo', '');
                        setAppliedFilters(prev => ({ ...prev, admissionDateTo: '' }));
                      }}
                      className="ml-1 text-teal-600 hover:text-teal-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.dischargeDateFrom && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800">
                    Discharge From: {appliedFilters.dischargeDateFrom}
                    <button
                      onClick={() => {
                        handleFilterChange('dischargeDateFrom', '');
                        setAppliedFilters(prev => ({ ...prev, dischargeDateFrom: '' }));
                      }}
                      className="ml-1 text-cyan-600 hover:text-cyan-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.dischargeDateTo && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800">
                    Discharge To: {appliedFilters.dischargeDateTo}
                    <button
                      onClick={() => {
                        handleFilterChange('dischargeDateTo', '');
                        setAppliedFilters(prev => ({ ...prev, dischargeDateTo: '' }));
                      }}
                      className="ml-1 text-cyan-600 hover:text-cyan-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

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
                      <span className="font-bold text-black">{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? 
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg> : 
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
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
                  
                  {visibleColumns.has('settlement_status') && (
                    <td className="table-cell">{getSettlementStatusBadge(claim.settlement_date)}</td>
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