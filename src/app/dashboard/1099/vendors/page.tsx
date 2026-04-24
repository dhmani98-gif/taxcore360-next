'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Search, Filter, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import AddVendorModal from '@/components/vendors/AddVendorModal';

interface Vendor {
  id: string;
  vendorId: string;
  legalName: string;
  address: string;
  email: string | null;
  phone: string | null;
  taxIdType: 'EIN' | 'SSN' | 'ITIN';
  state: string;
  zip: string | null;
  entityType: string;
  tinVerified: boolean;
  w9Requested: boolean;
  w9Received: boolean;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tinCheckMessage, setTinCheckMessage] = useState('');
  const [w9RequestMessage, setW9RequestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void loadVendors();
  }, []);

  const loadVendors = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const res = await fetch('/api/vendors', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load vendors');
      }
      const data = await res.json();

      const mapped: Vendor[] = (data ?? []).map((v: any) => ({
        id: v.id,
        vendorId: v.vendorId,
        legalName: v.legalName,
        address: v.address,
        email: v.email,
        phone: v.phone,
        taxIdType: v.taxIdType,
        state: v.state,
        zip: v.zipCode ?? null,
        entityType: v.entityType,
        tinVerified: Boolean(v.tinVerified),
        w9Requested: Boolean(v.w9Requested),
        w9Received: Boolean(v.w9Received),
      }));

      setVendors(mapped);
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter vendors
  useEffect(() => {
    if (searchTerm) {
      const filtered = vendors.filter(vendor =>
        vendor.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  }, [vendors, searchTerm]);

  const handleValidateVendor = async (vendorId: string) => {
    setTinCheckMessage('Validating vendor TIN...');

    try {
      const res = await fetch('/api/vendors/verify-tin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'TIN validation failed');

      setTinCheckMessage('TIN validation completed');
      await loadVendors();
    } catch (e: any) {
      setTinCheckMessage(e?.message || 'TIN validation failed');
    } finally {
      setTimeout(() => setTinCheckMessage(''), 3000);
    }
  };

  const handleRequestW9 = async (vendorId: string) => {
    setW9RequestMessage('Requesting W-9...');

    try {
      const res = await fetch('/api/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vendorId,
          w9Requested: true,
          w9RequestedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to request W-9');

      setW9RequestMessage('W-9 request recorded');
      await loadVendors();
    } catch (e: any) {
      setW9RequestMessage(e?.message || 'Failed to request W-9');
    } finally {
      setTimeout(() => setW9RequestMessage(''), 3000);
    }
  };

  const handleAddVendor = async (newVendor: any) => {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: newVendor.vendorId,
          legalName: newVendor.legalName,
          email: newVendor.email,
          phone: newVendor.phone ?? null,
          taxIdType: newVendor.taxIdType,
          taxId: newVendor.taxId,
          entityType: newVendor.entityType,
          state: newVendor.state,
          zipCode: newVendor.zipCode,
          address: newVendor.address,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create vendor');

      setShowAddModal(false);
      await loadVendors();
    } catch (e: any) {
      setTinCheckMessage(e?.message || 'Failed to create vendor');
      setTimeout(() => setTinCheckMessage(''), 3000);
    }
  };

  const getTinStatusBadge = (status: string) => {
    const statusConfig = {
      Verified: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      Invalid: { color: 'bg-red-500/20 text-red-400', icon: <XCircle className="w-3 h-3" /> },
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

  const getW9StatusBadge = (vendor: Vendor) => {
    const status = vendor.w9Received ? 'Signed' : vendor.w9Requested ? 'Sent' : 'Not Requested';

    const statusConfig = {
      Signed: { color: 'bg-green-500/20 text-green-400' },
      Sent: { color: 'bg-blue-500/20 text-blue-400' },
      'Not Requested': { color: 'bg-slate-500/20 text-slate-400' },
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusConfig[status as keyof typeof statusConfig]
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout 
      title="1099 Vendors"
      description="Vendor registry and W-9 management"
    >
      {/* Messages */}
      {tinCheckMessage && (
        <div className="bg-blue-500/20 border border-blue-500/30 text-blue-200 p-4 rounded-lg mb-6">
          {tinCheckMessage}
        </div>
      )}

      {loadError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-lg mb-6">
          {loadError}
        </div>
      )}
      
      {w9RequestMessage && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-200 p-4 rounded-lg mb-6">
          {w9RequestMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Vendor Registry</h3>
            <p className="text-slate-400 text-sm">
              The vendor sheet is the master record for all 1099 compliance tracking
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-slate-400 text-sm">{filteredVendors.length} vendors</span>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vendor ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tax ID Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tax ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ZIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Entity Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">1099 Rule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">TIN Match</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">W-9 Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-300" colSpan={15}>
                    Loading vendors...
                  </td>
                </tr>
              )}

              {!isLoading && filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.vendorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vendor.legalName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.email ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.phone ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.taxIdType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">•••••••••</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.zip ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{vendor.entityType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                      Track for 1099
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTinStatusBadge(vendor.tinVerified ? 'Verified' : 'Pending')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getW9StatusBadge(vendor)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleValidateVendor(vendor.id)}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Validate</span>
                      </button>

                      {!vendor.w9Requested && (
                        <button
                          onClick={() => handleRequestW9(vendor.id)}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Request W-9</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <AddVendorModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddVendor}
        />
      )}
    </DashboardLayout>
  );
}
