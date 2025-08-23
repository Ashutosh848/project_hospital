import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
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
  Users, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Target,
  Award,
  Zap,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import { claimsService } from '../services/claimsService';
import { DashboardStats, ChartData } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTpa, setSelectedTpa] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalBillAmount: 0,
    totalApprovedAmount: 0,
    totalTds: 0,
    totalRejections: 0,
    totalConsumables: 0,
    totalPaidByPatients: 0
  });
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [companyData, setCompanyData] = useState<ChartData[]>([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [statsData, monthlyDataData, companyDataData] = await Promise.all([
          claimsService.getDashboardStats(),
          claimsService.getMonthwiseData(),
          claimsService.getCompanywiseData()
        ]);
        
        setStats(statsData);
        setMonthlyData(monthlyDataData);
        setCompanyData(companyDataData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [refreshKey]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Mock data for unique companies and TPAs (these would come from API in real implementation)
  const uniqueCompanies = ['Company A', 'Company B', 'Company C'];
  const uniqueTpas = ['TPA A', 'TPA B', 'TPA C'];

  // Enhanced chart data - using mock data for now
  const performanceData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return last6Months.map(month => ({
      month,
      claims: Math.floor(Math.random() * 50) + 10,
      amount: Math.floor(Math.random() * 1000000) + 100000,
      settled: Math.floor(Math.random() * 30) + 5,
      pending: Math.floor(Math.random() * 20) + 5
    }));
  }, []);

  const tpaPerformanceData = useMemo(() => {
    return uniqueTpas.map(tpa => ({
      tpa,
      total: Math.floor(Math.random() * 100) + 20,
      settled: Math.floor(Math.random() * 80) + 10,
      pending: Math.floor(Math.random() * 20) + 5,
      settlementRate: Math.floor(Math.random() * 40) + 60,
      avgAmount: Math.floor(Math.random() * 500000) + 100000
    })).sort((a, b) => b.settlementRate - a.settlementRate);
  }, [uniqueTpas]);

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
          value={85}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Percentage of settled claims"
        />
        <StatCard
          title="Average Processing Time"
          value={12}
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
                  { name: 'Settled on Software', value: 45 },
                  { name: 'Manual Settlement', value: 23 },
                  { name: 'Receipt Verified', value: 38 },
                  { name: 'Receipt Pending', value: 12 }
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
                    { name: 'Pending', value: 15 },
                    { name: 'Dispatched', value: 28 },
                    { name: 'Received', value: 42 }
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
                  { range: '₹0-50K', count: 25 },
                  { range: '₹50K-1L', count: 35 },
                  { range: '₹1L-5L', count: 28 },
                  { range: '₹5L+', count: 12 }
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
                {[
                  { id: '1', claimId: 'CLM20240001', patientName: 'John Doe', billAmount: 150000, approvedAmount: 140000, settlementDate: '2024-01-15', dateOfAdmission: '2024-01-01' },
                  { id: '2', claimId: 'CLM20240002', patientName: 'Jane Smith', billAmount: 250000, approvedAmount: 230000, settlementDate: null, dateOfAdmission: '2024-01-05' },
                  { id: '3', claimId: 'CLM20240003', patientName: 'Bob Johnson', billAmount: 180000, approvedAmount: 170000, settlementDate: '2024-01-20', dateOfAdmission: '2024-01-10' },
                  { id: '4', claimId: 'CLM20240004', patientName: 'Alice Brown', billAmount: 320000, approvedAmount: 300000, settlementDate: null, dateOfAdmission: '2024-01-12' },
                  { id: '5', claimId: 'CLM20240005', patientName: 'Charlie Wilson', billAmount: 95000, approvedAmount: 90000, settlementDate: '2024-01-18', dateOfAdmission: '2024-01-08' }
                ].map((claim) => (
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
                      ) : (
                        <span className="badge badge-warning">In Progress</span>
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