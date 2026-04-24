'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Building2, 
  DollarSign, 
  Users, 
  FileText,
  RefreshCw,
  Link,
  CheckSquare,
  XSquare
} from 'lucide-react';

interface Vendor {
  id: string;
  vendorId: string;
  name: string;
  entity: string;
  taxId: string;
  tinStatus: 'Verified' | 'Invalid' | 'Pending';
  totalPaid: number;
  threshold: boolean;
  progress: number;
  compliance: 'MUST FILE' | 'OK';
  lifecycle: 'NEW' | 'VERIFIED' | 'PAID' | 'REPORTED' | 'FILED';
}

interface Deadline {
  form: string;
  days: number;
  type: '1099' | '941';
}

export default function Board1099Page() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [efileMessage, setEfileMessage] = useState('');
  const [quickbooksStatus, setQuickbooksStatus] = useState({
    connected: true,
    realm: 'US-123456789',
    vendors: 156,
    lastSync: '2 hours ago'
  });
  const [isLoading, setIsLoading] = useState(false);

  const years = ['2024', '2023', '2022', '2021'];

  // Mock data
  useEffect(() => {
    const mockVendors: Vendor[] = [
      {
        id: '1',
        vendorId: 'V001',
        name: 'Tech Solutions Inc',
        entity: 'LLC',
        taxId: '12-3456789',
        tinStatus: 'Verified',
        totalPaid: 12500,
        threshold: true,
        progress: 85,
        compliance: 'MUST FILE',
        lifecycle: 'PAID'
      },
      {
        id: '2',
        vendorId: 'V002',
        name: 'Marketing Pro',
        entity: 'Corporation',
        taxId: '98-7654321',
        tinStatus: 'Verified',
        totalPaid: 8500,
        threshold: true,
        progress: 70,
        compliance: 'MUST FILE',
        lifecycle: 'VERIFIED'
      },
      {
        id: '3',
        vendorId: 'V003',
        name: 'Design Studio',
        entity: 'Individual',
        taxId: '123-45-6789',
        tinStatus: 'Invalid',
        totalPaid: 4500,
        threshold: true,
        progress: 60,
        compliance: 'MUST FILE',
        lifecycle: 'VERIFIED'
      },
      {
        id: '4',
        vendorId: 'V004',
        name: 'Consulting Group',
        entity: 'Partnership',
        taxId: '45-6789012',
        tinStatus: 'Pending',
        totalPaid: 3200,
        threshold: true,
        progress: 45,
        compliance: 'OK',
        lifecycle: 'NEW'
      },
      {
        id: '5',
        vendorId: 'V005',
        name: 'Office Supplies Co',
        entity: 'Corporation',
        taxId: '87-6543210',
        tinStatus: 'Verified',
        totalPaid: 1800,
        threshold: false,
        progress: 30,
        compliance: 'OK',
        lifecycle: 'PAID'
      }
    ];
    setVendors(mockVendors);

    const mockDeadlines: Deadline[] = [
      { form: '1099-NEC', days: 45, type: '1099' },
      { form: '1099-MISC', days: 45, type: '1099' },
      { form: 'Form 941', days: 15, type: '941' }
    ];
    setDeadlines(mockDeadlines);
  }, []);

  const handleExportPub1220 = async () => {
    setIsLoading(true);
    setEfileMessage('Generating Publication 1220 export...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setEfileMessage('Publication 1220 exported successfully!');
    setIsLoading(false);
    
    setTimeout(() => setEfileMessage(''), 3000);
  };

  const handleQuickbooksConnect = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setQuickbooksStatus(prev => ({
      ...prev,
      connected: !prev.connected,
      lastSync: new Date().toLocaleString()
    }));
    
    setIsLoading(false);
  };

  const handleQuickbooksSync = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setQuickbooksStatus(prev => ({
      ...prev,
      lastSync: 'Just now'
    }));
    
    setIsLoading(false);
  };

  const handleApproveVendor = (vendorId: string) => {
    setVendors(prev => prev.map(vendor => 
      vendor.id === vendorId 
        ? { ...vendor, lifecycle: 'VERIFIED' as const, tinStatus: 'Verified' as const }
        : vendor
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDeadlineColor = (days: number) => {
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getComplianceBadge = (status: string) => {
    return status === 'MUST FILE' ? (
      <span className="inline-flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        <span className="text-sm text-[#667085]">Must File</span>
      </span>
    ) : (
      <span className="inline-flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="text-sm text-[#667085]">OK</span>
      </span>
    );
  };

  const getTinStatusBadge = (status: string) => {
    const statusConfig = {
      Verified: { dot: 'bg-emerald-500', text: 'text-[#667085]' },
      Invalid: { dot: 'bg-red-500', text: 'text-[#667085]' },
      Pending: { dot: 'bg-amber-500', text: 'text-[#667085]' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className="inline-flex items-center space-x-1.5">
        <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
        <span className={`text-sm ${config.text}`}>{status}</span>
      </span>
    );
  };

  const mustFileVendors = vendors.filter(v => v.compliance === 'MUST FILE');
  const acceptedVendors = vendors.filter(v => v.lifecycle === 'FILED');
  const rejectedVendors = vendors.filter(v => v.tinStatus === 'Invalid');
  const pendingVendors = vendors.filter(v => v.lifecycle === 'NEW');

  return (
    <DashboardLayout 
      title="1099 Board"
      description="Compliance tracking and vendor management dashboard"
    >
      {/* Year Selection and Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-[#667085] font-medium text-sm">Tax Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {/* Small Circular Sync Icon */}
            <button
              onClick={handleQuickbooksSync}
              disabled={isLoading}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 ml-2"
              title="Sync with QuickBooks"
            >
              <RefreshCw className={`w-4 h-4 text-[#667085] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-[#667085]">Last sync: {quickbooksStatus.lastSync}</span>
            <button
              onClick={handleExportPub1220}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Pub 1220</span>
            </button>
          </div>
        </div>
      </div>

      {/* Efile Message */}
      {efileMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
          {efileMessage}
        </div>
      )}

      {/* Deadline Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {deadlines.map((deadline, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#111827] font-semibold">{deadline.form}</h3>
                <p className={`text-2xl font-bold ${
                  deadline.days <= 7 ? 'text-red-600' : 
                  deadline.days <= 30 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {deadline.days} days
                </p>
                <p className="text-[#667085] text-sm">Remaining</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                deadline.type === '1099' ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                <FileText className={`w-6 h-6 ${
                  deadline.type === '1099' ? 'text-orange-600' : 'text-blue-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-[#111827] font-semibold mb-4">Compliance Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">{rejectedVendors.length}</p>
            <p className="text-[#667085] text-sm">Invalid TINs</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-amber-600 font-medium">Warning</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">{pendingVendors.length}</p>
            <p className="text-[#667085] text-sm">Pending Review</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">{mustFileVendors.length - acceptedVendors.length}</p>
            <p className="text-[#667085] text-sm">Processing</p>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Good</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">{acceptedVendors.length}</p>
            <p className="text-[#667085] text-sm">Filed</p>
          </div>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Annual Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[#111827] font-semibold mb-4">Annual Trend</h3>
          <div className="space-y-3">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
              // Use fixed values for SSR consistency
              const percentage = [42.9, 67.3, 58.1, 79.1, 45.6, 62.8][index];
              const value = [33654, 47892, 41234, 58923, 38456, 51234][index];
              
              return (
                <div key={month} className="flex items-center space-x-3">
                  <span className="text-[#667085] text-sm w-8">{month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-[#101828] h-1.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[#111827] text-sm w-16 text-right font-mono">
                    ${value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1099 Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[#111827] font-semibold mb-4">1099 Pipeline</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">MUST FILE</span>
              <span className="text-red-600 font-medium">{mustFileVendors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Accepted</span>
              <span className="text-emerald-600 font-medium">{acceptedVendors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Rejected</span>
              <span className="text-red-600 font-medium">{rejectedVendors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Pending</span>
              <span className="text-amber-600 font-medium">{pendingVendors.length}</span>
            </div>
          </div>
        </div>

        {/* State Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[#111827] font-semibold mb-4">State Distribution</h3>
          <div className="space-y-3">
            {['CA', 'NY', 'TX', 'FL', 'IL'].map((state, index) => (
              <div key={state} className="flex items-center space-x-3">
                <span className="text-[#667085] text-sm w-8">{state}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-[#101828] h-1.5 rounded-full"
                    style={{ width: `${[65, 45, 80, 35, 55][index]}%` }}
                  ></div>
                </div>
                <span className="text-[#111827] text-sm w-12 text-right">
                  {[18, 12, 22, 9, 15][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QuickBooks Sync */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[#111827] font-semibold mb-4">QuickBooks Sync</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                quickbooksStatus.connected 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {quickbooksStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-sm">Realm</span>
              <span className="text-[#111827] text-sm font-mono">{quickbooksStatus.realm}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-sm">Vendors</span>
              <span className="text-[#111827] text-sm font-semibold">{quickbooksStatus.vendors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-sm">Last Sync</span>
              <span className="text-[#111827] text-sm">{quickbooksStatus.lastSync}</span>
            </div>
            <div className="flex space-x-2">
              {!quickbooksStatus.connected ? (
                <button
                  onClick={handleQuickbooksConnect}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-[#111827] text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Link className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              ) : (
                <button
                  onClick={handleQuickbooksSync}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-[#667085] text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Refined Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[#667085] text-sm font-medium mb-3 uppercase tracking-wide">Top Cost Vendor</h3>
          <p className="text-xl font-bold text-[#111827] mb-2">Tech Solutions Inc</p>
          <p className="text-3xl font-bold text-emerald-600 font-mono">{formatCurrency(12500)}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[#667085] text-sm font-medium mb-3 uppercase tracking-wide">Max Category Spend</h3>
          <p className="text-xl font-bold text-[#111827] mb-2">Software Development</p>
          <p className="text-3xl font-bold text-blue-600 font-mono">{formatCurrency(28500)}</p>
        </div>
      </div>

      {/* Compliance Vendors Table - Refined Design */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-[#111827] font-bold">Compliance Vendors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F4F7F9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Vendor ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Tax ID</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">TIN Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Total Paid</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Progress</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Compliance</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Lifecycle</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor, index) => (
                <tr key={vendor.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#667085]">{vendor.vendorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#111827]">{vendor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#667085]">{vendor.entity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#667085] font-mono">{vendor.taxId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{getTinStatusBadge(vendor.tinStatus)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#111827] font-mono font-semibold">{formatCurrency(vendor.totalPaid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${vendor.threshold ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                      <span className="text-sm text-[#667085]">{vendor.threshold ? 'Must File' : 'Below'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-[#101828] h-1.5 rounded-full"
                          style={{ width: `${vendor.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[#667085] text-xs">{vendor.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{getComplianceBadge(vendor.compliance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-[#667085] border border-gray-200">
                      {vendor.lifecycle}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {vendor.lifecycle === 'NEW' && (
                      <button
                        onClick={() => handleApproveVendor(vendor.id)}
                        className="px-3 py-1.5 bg-gray-100 text-[#667085] text-xs font-medium rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
