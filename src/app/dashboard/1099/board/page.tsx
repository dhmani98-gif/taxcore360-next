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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
        MUST FILE
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        OK
      </span>
    );
  };

  const getTinStatusBadge = (status: string) => {
    const statusConfig = {
      Verified: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      Invalid: { color: 'bg-red-500/20 text-red-400', icon: <XSquare className="w-3 h-3" /> },
      Pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: <Clock className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
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
      {/* Year Selection and Export */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <label className="text-slate-300 font-medium">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleExportPub1220}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isLoading ? 'Exporting...' : 'Export Pub 1220'}</span>
          </button>
        </div>
      </div>

      {/* Efile Message */}
      {efileMessage && (
        <div className="bg-blue-500/20 border border-blue-500/30 text-blue-200 p-4 rounded-lg mb-6">
          {efileMessage}
        </div>
      )}

      {/* Deadline Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {deadlines.map((deadline, index) => (
          <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{deadline.form}</h3>
                <p className={`text-2xl font-bold ${getDeadlineColor(deadline.days)}`}>
                  {deadline.days} days
                </p>
                <p className="text-slate-400 text-sm">Remaining</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                deadline.type === '1099' ? 'bg-orange-500/20' : 'bg-blue-500/20'
              }`}>
                <FileText className={`w-6 h-6 ${
                  deadline.type === '1099' ? 'text-orange-400' : 'text-blue-400'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Alerts */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Compliance Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-white">{rejectedVendors.length}</p>
            <p className="text-slate-400 text-sm">Invalid TINs</p>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Warning</span>
            </div>
            <p className="text-2xl font-bold text-white">{pendingVendors.length}</p>
            <p className="text-slate-400 text-sm">Pending Review</p>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-white">{mustFileVendors.length - acceptedVendors.length}</p>
            <p className="text-slate-400 text-sm">Processing</p>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Good</span>
            </div>
            <p className="text-2xl font-bold text-white">{acceptedVendors.length}</p>
            <p className="text-slate-400 text-sm">Filed</p>
          </div>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Annual Trend */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">Annual Trend</h3>
          <div className="space-y-3">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
              // Use fixed values for SSR consistency
              const percentage = [42.9, 67.3, 58.1, 79.1, 45.6, 62.8][index];
              const value = [33654, 47892, 41234, 58923, 38456, 51234][index];
              
              return (
                <div key={month} className="flex items-center space-x-3">
                  <span className="text-slate-400 text-sm w-8">{month}</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-300 text-sm w-16 text-right">
                    ${value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1099 Pipeline */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">1099 Pipeline</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">MUST FILE</span>
              <span className="text-red-400 font-medium">{mustFileVendors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Accepted</span>
              <span className="text-green-400 font-medium">{acceptedVendors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Rejected</span>
              <span className="text-red-400 font-medium">{rejectedVendors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Pending</span>
              <span className="text-yellow-400 font-medium">{pendingVendors.length}</span>
            </div>
          </div>
        </div>

        {/* State Distribution */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">State Distribution</h3>
          <div className="space-y-3">
            {['CA', 'NY', 'TX', 'FL', 'IL'].map((state, index) => (
              <div key={state} className="flex items-center space-x-3">
                <span className="text-slate-400 text-sm w-8">{state}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.random() * 80 + 10}%` }}
                  ></div>
                </div>
                <span className="text-slate-300 text-sm w-12 text-right">
                  {Math.floor(Math.random() * 20 + 5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QuickBooks Sync */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">QuickBooks Sync</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                quickbooksStatus.connected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {quickbooksStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Realm</span>
              <span className="text-slate-300">{quickbooksStatus.realm}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vendors</span>
              <span className="text-slate-300">{quickbooksStatus.vendors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Sync</span>
              <span className="text-slate-300">{quickbooksStatus.lastSync}</span>
            </div>
            <div className="flex space-x-2">
              {!quickbooksStatus.connected ? (
                <button
                  onClick={handleQuickbooksConnect}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Link className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              ) : (
                <button
                  onClick={handleQuickbooksSync}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-2">Top Cost Vendor</h3>
          <p className="text-2xl font-bold text-blue-400">Tech Solutions Inc</p>
          <p className="text-slate-300">{formatCurrency(12500)}</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-2">Max Category Spend</h3>
          <p className="text-2xl font-bold text-purple-400">Software Development</p>
          <p className="text-slate-300">{formatCurrency(28500)}</p>
        </div>
      </div>

      {/* Compliance Vendors Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-white font-semibold">Compliance Vendors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendor ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tax ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">TIN Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Lifecycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.vendorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vendor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.entity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.taxId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTinStatusBadge(vendor.tinStatus)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(vendor.totalPaid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vendor.threshold ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {vendor.threshold ? 'Triggered' : 'Below'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${vendor.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-300 text-xs">{vendor.progress}%</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      {100 - vendor.progress}% to go
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getComplianceBadge(vendor.compliance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={vendor.lifecycle}
                      onChange={(e) => {
                        setVendors(prev => prev.map(v => 
                          v.id === vendor.id ? { ...v, lifecycle: e.target.value as any } : v
                        ));
                      }}
                      className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NEW">New</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="PAID">Paid</option>
                      <option value="REPORTED">Reported</option>
                      <option value="FILED">Filed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.lifecycle === 'NEW' && (
                      <button
                        onClick={() => handleApproveVendor(vendor.id)}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>Approve</span>
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
