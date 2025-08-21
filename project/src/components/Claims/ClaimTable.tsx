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
}

export const ClaimTable: React.FC<ClaimTableProps> = ({ 
  claims, 
  onEdit, 
  onDelete, 
  onView,
  isLoading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
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
    'month', 'admissionDate', 'dischargeDate', 'tpaName', 'claimId', 
    'patientName', 'billAmount', 'approvedAmount', 'status', 'actions'
  ]));

  const itemsPerPage = 20;

  // Get unique values for dropdowns
  const uniqueTpaNames = [...new Set(claims.map(claim => claim.tpaName))].sort();
  const uniqueInsuranceCompanies = [...new Set(claims.map(claim => claim.parentInsurance))].sort();

  // Column definitions
  const columns = [
    { key: 'select', label: '', width: 'w-12', sortable: false },
    { key: 'month', label: 'Month', width: 'w-24', sortable: true },
    { key: 'admissionDate', label: 'Admission Date', width: 'w-32', sortable: true },
    { key: 'dischargeDate', label: 'Discharge Date', width: 'w-32', sortable: true },
    { key: 'tpaName', label: 'TPA Name', width: 'w-40', sortable: true },
    { key: 'parentInsurance', label: 'Parent Insurance', width: 'w-40', sortable: true },
    { key: 'claimId', label: 'Claim ID', width: 'w-32', sortable: true },
    { key: 'uhidIpNo', label: 'UHID/IP No', width: 'w-32', sortable: true },
    { key: 'patientName', label: 'Patient Name', width: 'w-40', sortable: true },
    { key: 'billAmount', label: 'Bill Amount', width: 'w-32', sortable: true },
    { key: 'approvedAmount', label: 'Approved Amount', width: 'w-36', sortable: true },
    { key: 'mouDiscount', label: 'MOU Discount', width: 'w-32', sortable: true },
    { key: 'coPay', label: 'Co-pay', width: 'w-24', sortable: true },
    { key: 'consumableDeduction', label: 'Consumable Deduction', width: 'w-40', sortable: true },
    { key: 'hospitalDiscount', label: 'Hospital Discount', width: 'w-36', sortable: true },
    { key: 'paidByPatient', label: 'Paid by Patient', width: 'w-32', sortable: true },
    { key: 'hospitalDiscountAuthority', label: 'Hospital Discount Authority', width: 'w-44', sortable: true },
    { key: 'otherDeductions', label: 'Other Deductions', width: 'w-36', sortable: true },
    { key: 'physicalFileDispatch', label: 'File Status', width: 'w-32', sortable: true },
    { key: 'dateOfUploadDispatch', label: 'Upload/Dispatch Date', width: 'w-40', sortable: true },
    { key: 'queryReplyDate', label: 'Query Reply Date', width: 'w-36', sortable: true },
    { key: 'settlementDate', label: 'Settlement Date', width: 'w-36', sortable: true },
    { key: 'tds', label: 'TDS', width: 'w-24', sortable: true },
    { key: 'amountSettledInAccount', label: 'Amount Settled in A/C', width: 'w-44', sortable: true },
    { key: 'totalSettledAmount', label: 'Total Settled Amount', width: 'w-40', sortable: true },
    { key: 'differenceApprovedSettled', label: 'Difference (Approved vs Settled)', width: 'w-48', sortable: true },
    { key: 'reasonForLessSettlement', label: 'Reason for Less Settlement', width: 'w-44', sortable: true },
    { key: 'claimSettledOnSoftware', label: 'Claim Settled on Software', width: 'w-44', sortable: true },
    { key: 'receiptAmountVerification', label: 'Receipt Amount Verification', width: 'w-48', sortable: true },
    { key: 'actions', label: 'Actions', width: 'w-24', sortable: false }
  ];

  // Filter claims based on current filters
  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch = !filters.search || 
        claim.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        claim.claimId.toLowerCase().includes(filters.search.toLowerCase()) ||
        claim.uhidIpNo.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesTPA = !filters.tpaName || 
        claim.tpaName === filters.tpaName;
      
      const matchesInsurance = !filters.parentInsurance || 
        claim.parentInsurance === filters.parentInsurance;
      
      const matchesDateFrom = !filters.dateFrom || 
        new Date(claim.dateOfAdmission) >= new Date(filters.dateFrom);
      
      const matchesDateTo = !filters.dateTo || 
        new Date(claim.dateOfDischarge) <= new Date(filters.dateTo);
      
      const matchesSettlement = !filters.settlementStatus || 
        (filters.settlementStatus === 'settled' && claim.settlementDate) ||
        (filters.settlementStatus === 'pending' && !claim.settlementDate);

      const matchesFileStatus = !filters.fileStatus || 
        claim.physicalFileDispatch === filters.fileStatus;

      return matchesSearch && matchesTPA && matchesInsurance && 
             matchesDateFrom && matchesDateTo && matchesSettlement && matchesFileStatus;
    });
  }, [claims, filters]);

  // Sort filtered claims
  const sortedClaims = useMemo(() => {
    if (!sortConfig) return filteredClaims;

    return [...filteredClaims].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredClaims, sortConfig]);

  // Paginate sorted claims
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedClaims.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedClaims, currentPage]);

  const totalPages = Math.ceil(sortedClaims.length / itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const handleSort = (key: keyof Claim) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
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
    if (claim.settlementDate) {
      return <span className="badge badge-success">Settled</span>;
    } else if (claim.physicalFileDispatch === 'dispatched') {
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

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredClaims.length;
    const settled = filteredClaims.filter(c => c.settlementDate).length;
    const pending = total - settled;
    const totalAmount = filteredClaims.reduce((sum, c) => sum + c.billAmount, 0);
    const approvedAmount = filteredClaims.reduce((sum, c) => sum + c.approvedAmount, 0);

    return { total, settled, pending, totalAmount, approvedAmount };
  }, [filteredClaims]);

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Claims</p>
              <p className="stats-value">{summaryStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Settled Claims</p>
              <p className="stats-value">{summaryStats.settled}</p>
              <div className="stats-trend stats-trend-up">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{((summaryStats.settled / summaryStats.total) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Pending Claims</p>
              <p className="stats-value">{summaryStats.pending}</p>
              <div className="stats-trend stats-trend-down">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span>{((summaryStats.pending / summaryStats.total) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Amount</p>
              <p className="stats-value">₹{summaryStats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

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
                  
                  {visibleColumns.has('admissionDate') && (
                    <td className="table-cell">{formatDate(claim.dateOfAdmission)}</td>
                  )}
                  
                  {visibleColumns.has('dischargeDate') && (
                    <td className="table-cell">{formatDate(claim.dateOfDischarge)}</td>
                  )}
                  
                  {visibleColumns.has('tpaName') && (
                    <td className="table-cell">{claim.tpaName}</td>
                  )}
                  
                  {visibleColumns.has('parentInsurance') && (
                    <td className="table-cell">{claim.parentInsurance}</td>
                  )}
                  
                  {visibleColumns.has('claimId') && (
                    <td className="table-cell font-medium text-blue-600">{claim.claimId}</td>
                  )}
                  
                  {visibleColumns.has('uhidIpNo') && (
                    <td className="table-cell">{claim.uhidIpNo}</td>
                  )}
                  
                  {visibleColumns.has('patientName') && (
                    <td className="table-cell font-medium">{claim.patientName}</td>
                  )}
                  
                  {visibleColumns.has('billAmount') && (
                    <td className="table-cell">{formatCurrency(claim.billAmount)}</td>
                  )}
                  
                  {visibleColumns.has('approvedAmount') && (
                    <td className="table-cell">{formatCurrency(claim.approvedAmount)}</td>
                  )}
                  
                  {visibleColumns.has('mouDiscount') && (
                    <td className="table-cell">{formatCurrency(claim.mouDiscount)}</td>
                  )}
                  
                  {visibleColumns.has('coPay') && (
                    <td className="table-cell">{formatCurrency(claim.coPay)}</td>
                  )}
                  
                  {visibleColumns.has('consumableDeduction') && (
                    <td className="table-cell">{formatCurrency(claim.consumableDeduction)}</td>
                  )}
                  
                  {visibleColumns.has('hospitalDiscount') && (
                    <td className="table-cell">{formatCurrency(claim.hospitalDiscount)}</td>
                  )}
                  
                  {visibleColumns.has('paidByPatient') && (
                    <td className="table-cell">{formatCurrency(claim.paidByPatient)}</td>
                  )}
                  
                  {visibleColumns.has('hospitalDiscountAuthority') && (
                    <td className="table-cell">{claim.hospitalDiscountAuthority}</td>
                  )}
                  
                  {visibleColumns.has('otherDeductions') && (
                    <td className="table-cell">{formatCurrency(claim.otherDeductions)}</td>
                  )}
                  
                  {visibleColumns.has('physicalFileDispatch') && (
                    <td className="table-cell">{getFileStatusBadge(claim.physicalFileDispatch)}</td>
                  )}
                  
                  {visibleColumns.has('dateOfUploadDispatch') && (
                    <td className="table-cell">{formatDate(claim.dateOfUploadDispatch)}</td>
                  )}
                  
                  {visibleColumns.has('queryReplyDate') && (
                    <td className="table-cell">{formatDate(claim.queryReplyDate)}</td>
                  )}
                  
                  {visibleColumns.has('settlementDate') && (
                    <td className="table-cell">{formatDate(claim.settlementDate)}</td>
                  )}
                  
                  {visibleColumns.has('tds') && (
                    <td className="table-cell">{formatCurrency(claim.tds)}</td>
                  )}
                  
                  {visibleColumns.has('amountSettledInAccount') && (
                    <td className="table-cell">{formatCurrency(claim.amountSettledInAccount)}</td>
                  )}
                  
                  {visibleColumns.has('totalSettledAmount') && (
                    <td className="table-cell">{formatCurrency(claim.totalSettledAmount)}</td>
                  )}
                  
                  {visibleColumns.has('differenceApprovedSettled') && (
                    <td className="table-cell">{formatCurrency(claim.differenceApprovedSettled)}</td>
                  )}
                  
                  {visibleColumns.has('reasonForLessSettlement') && (
                    <td className="table-cell">{claim.reasonForLessSettlement || 'N/A'}</td>
                  )}
                  
                  {visibleColumns.has('claimSettledOnSoftware') && (
                    <td className="table-cell">{getVerificationBadge(claim.claimSettledOnSoftware)}</td>
                  )}
                  
                  {visibleColumns.has('receiptAmountVerification') && (
                    <td className="table-cell">{getVerificationBadge(claim.receiptAmountVerification)}</td>
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
        {totalPages > 1 && (
          <div className="pagination">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredClaims.length)} of {filteredClaims.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`pagination-page ${
                        currentPage === pageNum
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
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