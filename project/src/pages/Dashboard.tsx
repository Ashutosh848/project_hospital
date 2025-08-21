import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Award,
  Zap,
  Eye,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import { mockClaims, calculateDashboardStats, getMonthlyChartData, getCompanyChartData } from '../data/mockData';
import { DashboardStats } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTpa, setSelectedTpa] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState('overview');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter claims based on selected filters
  const filteredClaims = useMemo(() => {
    return mockClaims.filter(claim => {
      const matchesDateRange = 
        (!dateRange.start || claim.dateOfAdmission >= dateRange.start) &&
        (!dateRange.end || claim.dateOfDischarge <= dateRange.end);
      
      const matchesCompany = !selectedCompany || claim.parentInsurance === selectedCompany;
      const matchesTpa = !selectedTpa || claim.tpaName === selectedTpa;
      
      return matchesDateRange && matchesCompany && matchesTpa;
    });
  }, [dateRange, selectedCompany, selectedTpa, refreshKey]);

  const stats: DashboardStats = useMemo(() => calculateDashboardStats(filteredClaims), [filteredClaims]);
  const monthlyData = useMemo(() => getMonthlyChartData(filteredClaims), [filteredClaims]);
  const companyData = useMemo(() => getCompanyChartData(filteredClaims), [filteredClaims]);

  const uniqueCompanies = [...new Set(mockClaims.map(c => c.parentInsurance))];
  const uniqueTpas = [...new Set(mockClaims.map(c => c.tpaName))];

  // Enhanced chart data
  const performanceData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return last6Months.map(month => {
      const monthClaims = filteredClaims.filter(c => c.month === month);
      return {
        month,
        claims: monthClaims.length,
        amount: monthClaims.reduce((sum, c) => sum + c.billAmount, 0),
        settled: monthClaims.filter(c => c.settlementDate).length,
        pending: monthClaims.filter(c => !c.settlementDate).length
      };
    });
  }, [filteredClaims]);

  const tpaPerformanceData = useMemo(() => {
    return uniqueTpas.map(tpa => {
      const tpaClaims = filteredClaims.filter(c => c.tpaName === tpa);
      const settled = tpaClaims.filter(c => c.settlementDate).length;
      const total = tpaClaims.length;
      return {
        tpa,
        total,
        settled,
        pending: total - settled,
        settlementRate: total > 0 ? (settled / total) * 100 : 0,
        avgAmount: total > 0 ? tpaClaims.reduce((sum, c) => sum + c.billAmount, 0) / total : 0
      };
    }).sort((a, b) => b.settlementRate - a.settlementRate);
  }, [filteredClaims, uniqueTpas]);

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    color: string;
    isAmount?: boolean;
    trend?: { value: number; isUp: boolean };
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, isAmount = false, trend, subtitle }) => (
    <div className="stats-card group hover:shadow-medium transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="stats-label">{title}</p>
          <p className="stats-value">
            {isAmount ? `₹${value.toLocaleString()}` : value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`stats-trend ${trend.isUp ? 'stats-trend-up' : 'stats-trend-down'}`}>
              {trend.isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(trend.value)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setIsLoading(false);
    }, 1000);
  };

  const handleExportReport = () => {
    // Implement export functionality
    console.log('Exporting dashboard report...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of claims and financial metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={handleExportReport}
            className="btn btn-success"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Insurance Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="form-select"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">TPA</label>
            <select
              value={selectedTpa}
              onChange={(e) => setSelectedTpa(e.target.value)}
              className="form-select"
            >
              <option value="">All TPAs</option>
              {uniqueTpas.map(tpa => (
                <option key={tpa} value={tpa}>{tpa}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bill Amount"
          value={stats.totalBillAmount}
          icon={DollarSign}
          color="bg-gradient-primary"
          isAmount
          trend={{ value: 12.5, isUp: true }}
          subtitle="All claims combined"
        />
        <StatCard
          title="Total Approved Amount"
          value={stats.totalApprovedAmount}
          icon={Target}
          color="bg-gradient-success"
          isAmount
          trend={{ value: 8.3, isUp: true }}
          subtitle="Approved by insurance"
        />
        <StatCard
          title="Total TDS"
          value={stats.totalTds}
          icon={Award}
          color="bg-gradient-warning"
          isAmount
          trend={{ value: 2.1, isUp: false }}
          subtitle="Tax deducted at source"
        />
        <StatCard
          title="Total Rejections"
          value={stats.totalRejections}
          icon={AlertTriangle}
          color="bg-gradient-danger"
          trend={{ value: 5.2, isUp: false }}
          subtitle="Claims rejected"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Consumables"
          value={stats.totalConsumables}
          icon={Zap}
          color="bg-purple-500"
          isAmount
          trend={{ value: 1.8, isUp: true }}
          subtitle="Consumable deductions"
        />
        <StatCard
          title="Total Paid by Patients"
          value={stats.totalPaidByPatients}
          icon={Users}
          color="bg-indigo-500"
          isAmount
          trend={{ value: 3.4, isUp: true }}
          subtitle="Patient contributions"
        />
        <StatCard
          title="Settlement Rate"
          value={Math.round((filteredClaims.filter(c => c.settlementDate).length / filteredClaims.length) * 100)}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Percentage of settled claims"
        />
        <StatCard
          title="Average Processing Time"
          value={Math.round(filteredClaims.reduce((sum, c) => {
            if (c.settlementDate) {
              const admission = new Date(c.dateOfAdmission);
              const settlement = new Date(c.settlementDate);
              return sum + (settlement.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24);
            }
            return sum;
          }, 0) / filteredClaims.filter(c => c.settlementDate).length)}
          icon={Clock}
          color="bg-blue-500"
          subtitle="Days to settlement"
        />
      </div>

      {/* Chart Navigation */}
      <div className="flex items-center justify-center space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
        <button
          onClick={() => setSelectedChart('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'overview'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setSelectedChart('trends')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'trends'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUpIcon className="w-4 h-4 inline mr-2" />
          Trends
        </button>
        <button
          onClick={() => setSelectedChart('performance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'performance'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ActivityIcon className="w-4 h-4 inline mr-2" />
          Performance
        </button>
        <button
          onClick={() => setSelectedChart('distribution')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'distribution'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PieChartIcon className="w-4 h-4 inline mr-2" />
          Distribution
        </button>
      </div>

      {/* Charts */}
      {selectedChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Claims Chart */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Claims Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`₹${parseInt(value).toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area type="monotone" dataKey="value" fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Company-wise Claims Chart */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Claims by Insurance Company</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedChart === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">6-Month Performance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="claims" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="settled" stackId="1" stroke="#10b981" fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* TPA Performance */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">TPA Performance Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tpaPerformanceData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tpa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="settlementRate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedChart === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Claims Status Distribution */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Claims Settlement Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Settled on Software', value: filteredClaims.filter(c => c.claimSettledOnSoftware).length },
                  { name: 'Manual Settlement', value: filteredClaims.filter(c => !c.claimSettledOnSoftware).length },
                  { name: 'Receipt Verified', value: filteredClaims.filter(c => c.receiptAmountVerification).length },
                  { name: 'Receipt Pending', value: filteredClaims.filter(c => !c.receiptAmountVerification).length }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* File Dispatch Status */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">File Dispatch Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: filteredClaims.filter(c => c.physicalFileDispatch === 'pending').length },
                    { name: 'Dispatched', value: filteredClaims.filter(c => c.physicalFileDispatch === 'dispatched').length },
                    { name: 'Received', value: filteredClaims.filter(c => c.physicalFileDispatch === 'received').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#EF4444" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedChart === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amount Distribution */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Amount Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { range: '₹0-50K', count: filteredClaims.filter(c => c.billAmount <= 50000).length },
                  { range: '₹50K-1L', count: filteredClaims.filter(c => c.billAmount > 50000 && c.billAmount <= 100000).length },
                  { range: '₹1L-5L', count: filteredClaims.filter(c => c.billAmount > 100000 && c.billAmount <= 500000).length },
                  { range: '₹5L+', count: filteredClaims.filter(c => c.billAmount > 500000).length }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Processing Time Distribution */}
          <div className="chart-container">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Time Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { metric: 'Admission to Discharge', value: 7 },
                { metric: 'Discharge to Upload', value: 3 },
                { metric: 'Upload to Query', value: 5 },
                { metric: 'Query to Reply', value: 2 },
                { metric: 'Reply to Settlement', value: 8 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar name="Days" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Claims Summary */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Claims Summary</h3>
            <button className="btn btn-primary">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Claim ID</th>
                  <th className="table-header-cell">Patient</th>
                  <th className="table-header-cell">Bill Amount</th>
                  <th className="table-header-cell">Approved Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredClaims.slice(0, 5).map((claim) => (
                  <tr key={claim.id} className="table-row">
                    <td className="table-cell font-medium text-blue-600">
                      {claim.claimId}
                    </td>
                    <td className="table-cell">{claim.patientName}</td>
                    <td className="table-cell">₹{claim.billAmount.toLocaleString()}</td>
                    <td className="table-cell">₹{claim.approvedAmount.toLocaleString()}</td>
                    <td className="table-cell">
                      {claim.settlementDate ? (
                        <span className="badge badge-success">Settled</span>
                      ) : claim.physicalFileDispatch === 'dispatched' ? (
                        <span className="badge badge-warning">In Progress</span>
                      ) : (
                        <span className="badge badge-danger">Pending</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {new Date(claim.dateOfAdmission).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};