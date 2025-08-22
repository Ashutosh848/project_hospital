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
  Calendar,
  FileText,
  Upload,
  MoreHorizontal,
  CheckSquare,
  Square,
  RefreshCw,
  BarChart3,
  Settings,
  Columns,
  SortAsc,
  SortDesc,
  FilterX,
  Save,
  Share2,
  Printer,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown
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

  // For server-side pagination, we don't filter locally since data is already filtered by the server
  // Local filtering is only used when onPageChange is not provided (client-side pagination)
  const filteredClaims = useMemo(() => {
    if (onPageChange) {
      // Server-side pagination: use claims as-is since they're already filtered by the server
      return claims;
    } else {
      // Client-side pagination: apply local filters
      return claims.filter(claim => {
        const matchesSearch = !filters.search || 
          claim.patient_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          claim.claim_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
          claim.uhid_ip_no?.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesTPA = !filters.tpaName || 
          claim.tpa_name === filters.tpaName;
        
        const matchesInsurance = !filters.parentInsurance || 
          claim.parent_insurance === filters.parentInsurance;
        
        const matchesDateFrom = !filters.dateFrom || 
          new Date(claim.date_of_admission) >= new Date(filters.dateFrom);
        
        const matchesDateTo = !filters.dateTo || 
          new Date(claim.date_of_discharge) <= new Date(filters.dateTo);
        
        const matchesSettlement = !filters.settlementStatus || 
          (filters.settlementStatus === 'settled' && claim.settlement_date) ||
          (filters.settlementStatus === 'pending' && !claim.settlement_date);

        const matchesFileStatus = !filters.fileStatus || 
          claim.physical_file_dispatch === filters.fileStatus;

        return matchesSearch && matchesTPA && matchesInsurance && 
               matchesDateFrom && matchesDateTo && matchesSettlement && matchesFileStatus;
      });
    }
  }, [claims, filters, onPageChange]);

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

  // For server-side pagination, use claims directly; for client-side, paginate locally
  const paginatedClaims = useMemo(() => {
    if (onPageChange) {
      // Server-side pagination: claims are already paginated by the server
      return sortedClaims;
    } else {
      // Client-side pagination: paginate locally
      const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
      return sortedClaims.slice(startIndex, startIndex + itemsPerPage);
    }
  }, [sortedClaims, effectiveCurrentPage, onPageChange]);

  const localTotalPages = Math.ceil(sortedClaims.length / itemsPerPage);
  const effectiveTotalPages = onPageChange ? totalPages : localTotalPages;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setEffectiveCurrentPage(1);
    
    // If using server-side pagination, trigger a new request
    if (onPageChange) {
      // For now, we'll just reset to page 1
      // In a full implementation, you'd want to pass filter parameters to the parent
      onPageChange(1);
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

  const getStatusBadge = (claim: Claim) => {
    if (claim.settlement_date) {
      return <span className="badge badge-success">Settled</span>;
    } else if (claim.physical_file_dispatch === 'dispatched') {
      return <span className="badge badge-warning">In Progress</span>;
    } else {
      return <span className="badge badge-danger">Pending</span>;
    }
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
                className="btn btn-secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {Object.values(filters).some(v => v) && (
                  <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
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

          {/* Column Selector */}
          {showColumnSelector && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
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

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost"
                >
                  <FilterX className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Search</label>
                  <div className="search-input">
                    <Search className="search-input-icon" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Patient name, Claim ID, UHID..."
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">TPA Name</label>
                  <select
                    value={filters.tpaName}
                    onChange={(e) => handleFilterChange('tpaName', e.target.value)}
                    className="form-select"
                  >
                    <option value="">All TPAs</option>
                    {uniqueTpaNames.map(tpa => (
                      <option key={tpa} value={tpa}>{tpa}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Parent Insurance</label>
                  <select
                    value={filters.parentInsurance}
                    onChange={(e) => handleFilterChange('parentInsurance', e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Insurance Companies</option>
                    {uniqueInsuranceCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Settlement Status</label>
                  <select
                    value={filters.settlementStatus}
                    onChange={(e) => handleFilterChange('settlementStatus', e.target.value)}
                    className="form-select"
                  >
                    <option value="">All</option>
                    <option value="settled">Settled</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">File Status</label>
                  <select
                    value={filters.fileStatus}
                    onChange={(e) => handleFilterChange('fileStatus', e.target.value)}
                    className="form-select"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="received">Received</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Amount Range</label>
                  <select
                    value={filters.amountRange}
                    onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                    className="form-select"
                  >
                    <option value="">All</option>
                    <option value="0-50000">₹0 - ₹50,000</option>
                    <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                    <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                    <option value="500000+">₹5,00,000+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

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
              {onPageChange ? (
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