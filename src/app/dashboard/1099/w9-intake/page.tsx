'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Link, Plus, FileText, CheckCircle, Clock, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface W9Record {
  id: string;
  token?: string;
  vendorId?: string;
  vendorName: string;
  email: string;
  status: 'SENT' | 'VIEWED' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
  sentDate: string;
  completedDate?: string;
  taxId?: string;
  entityName?: string;
  signature?: string;
  date?: string;
}

interface PendingApproval {
  id: string;
  vendorId?: string;
  vendorName: string;
  submittedDate: string;
  taxId: string;
  entityName: string;
  signature: string;
  date: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function W9IntakePage() {
  const [w9Records, setW9Records] = useState<W9Record[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invitesRes, submissionsRes, vendorsRes] = await Promise.all([
          fetch('/api/w9-invites'),
          fetch('/api/w9-submissions'),
          fetch('/api/vendors')
        ]);

        if (!invitesRes.ok || !submissionsRes.ok || !vendorsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [invites, submissions, vendorsData] = await Promise.all([
          invitesRes.json(),
          submissionsRes.json(),
          vendorsRes.json()
        ]);

        setVendors(vendorsData);

        // Combine invites and submissions for display
        const w9Records: W9Record[] = invites.map((invite: any) => {
          const submission = invite.submissions?.[0];
          return {
            id: invite.id,
            token: invite.token,
            vendorId: invite.vendor?.vendorId || '',
            vendorName: invite.vendor?.legalName || invite.vendorEmail || 'Unknown Vendor',
            email: invite.vendor?.email || invite.vendorEmail || '',
            status: invite.status,
            sentDate: invite.createdAt?.split('T')[0] || '',
            completedDate: invite.completedAt?.split('T')[0] || submission?.submittedAt?.split('T')[0] || undefined,
            taxId: submission?.taxId || '',
            entityName: submission?.legalName || '',
            signature: submission?.signatureName || '',
            date: submission?.signatureDate?.split('T')[0] || ''
          };
        });

        setW9Records(w9Records);

        // Filter pending submissions
        const pending = submissions.filter((s: any) => s.approvalStatus === 'PENDING').map((s: any) => ({
          id: s.id,
          vendorId: s.vendor?.vendorId || '',
          vendorName: s.vendor?.legalName || s.legalName || 'Unknown Vendor',
          submittedDate: s.submittedAt?.split('T')[0] || '',
          taxId: s.taxId,
          entityName: s.entityType,
          signature: s.signatureName || '',
          date: s.signatureDate?.split('T')[0] || '',
          approvalStatus: s.approvalStatus
        }));

        setPendingApprovals(pending);
      } catch (err) {
        setError('Failed to load W-9 data');
        console.error('Error fetching W-9 data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateIntakeLink = async () => {
    if (!selectedVendor) {
      setLinkMessage('Please select a vendor first');
      return;
    }

    setLinkMessage('Generating intake link...');
    
    try {
      const res = await fetch('/api/w9-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: selectedVendor })
      });

      if (!res.ok) throw new Error('Failed to create invite');

      const invite = await res.json();
      const link = `https://taxcore360.app/w9/${invite.token}`;
      setGeneratedLink(link);
      setLinkMessage('Intake link generated successfully!');
      
      // Refresh data
      window.location.reload();
    } catch (err) {
      setLinkMessage('Failed to generate link');
      console.error('Error generating link:', err);
    }
    
    setTimeout(() => setLinkMessage(''), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkMessage('Link copied to clipboard!');
    setTimeout(() => setLinkMessage(''), 2000);
  };

  const handleManualEntry = () => {
    setLinkMessage('Opening manual W-9 entry form...');
    // In real implementation, this would open a modal or navigate to manual entry page
    setTimeout(() => setLinkMessage(''), 2000);
  };

  const handleApproveW9 = async (approvalId: string) => {
    try {
      const res = await fetch('/api/w9-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvalId, approvalStatus: 'APPROVED' })
      });

      if (!res.ok) throw new Error('Failed to approve');

      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      setLinkMessage('W-9 approved successfully!');
      setTimeout(() => setLinkMessage(''), 2000);
    } catch (err) {
      setLinkMessage('Failed to approve W-9');
      console.error('Error approving:', err);
    }
  };

  const handleRejectW9 = async (approvalId: string) => {
    try {
      const res = await fetch('/api/w9-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvalId, approvalStatus: 'REJECTED' })
      });

      if (!res.ok) throw new Error('Failed to reject');

      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      setLinkMessage('W-9 rejected');
      setTimeout(() => setLinkMessage(''), 2000);
    } catch (err) {
      setLinkMessage('Failed to reject W-9');
      console.error('Error rejecting:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SENT: { color: 'bg-blue-500/20 text-blue-400', icon: <FileText className="w-3 h-3" /> },
      VIEWED: { color: 'bg-yellow-500/20 text-yellow-400', icon: <Clock className="w-3 h-3" /> },
      COMPLETED: { color: 'bg-purple-500/20 text-purple-400', icon: <FileText className="w-3 h-3" /> },
      APPROVED: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      REJECTED: { color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-500/20 text-gray-400'}`}>
        {config?.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const totalIntakeRecords = w9Records.length;
  const w9Onboarded = w9Records.filter(r => r.status === 'APPROVED').length;
  const tinReady = w9Records.filter(r => r.taxId).length;

  return (
    <DashboardLayout 
      title="W-9 Intake"
      description="Collect and manage W-9 forms from vendors"
    >
      {/* Loading/Error */}
      {loading && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <p className="text-slate-400 text-center">Loading W-9 data...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Link Generation Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Generate Intake Link</h3>
            <p className="text-slate-400 text-sm">
              Create a secure link for vendors to submit their W-9 information
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 text-sm">Vendor:</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.vendorId} value={vendor.vendorId}>{vendor.legalName}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleGenerateIntakeLink}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Link className="w-4 h-4" />
              <span>Generate Intake Link</span>
            </button>
            
            <button
              onClick={handleManualEntry}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>
        
        {/* Generated Link */}
        {generatedLink && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-300 text-sm mb-1">Generated Link:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-300 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => window.open(generatedLink, '_blank')}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Link Message */}
        {linkMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            linkMessage.includes('successfully') || linkMessage.includes('copied')
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {linkMessage}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Intake Records</p>
              <p className="text-2xl font-bold text-white">{totalIntakeRecords}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">W-9 Onboarded</p>
              <p className="text-2xl font-bold text-white">{w9Onboarded}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">TIN Ready</p>
              <p className="text-2xl font-bold text-white">{tinReady}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* W-9 Records Table */}
      {!loading && !error && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-white font-semibold">W-9 Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Sent Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Completed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tax ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Entity Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Signature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {w9Records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-slate-400">
                      No W-9 records found
                    </td>
                  </tr>
                ) : (
                  w9Records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.sentDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.completedDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.taxId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.entityName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.signature || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.date || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      {!loading && !error && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-white font-semibold">Pending Approvals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Submitted Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tax ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Entity Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Signature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {pendingApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-slate-400">
                      No pending approvals
                    </td>
                  </tr>
                ) : (
                  pendingApprovals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{approval.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{approval.submittedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{approval.taxId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{approval.entityName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{approval.signature}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{approval.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveW9(approval.id)}
                            className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectW9(approval.id)}
                            className="flex items-center space-x-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
