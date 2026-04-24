'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Search, DollarSign, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AddPaymentModal from '@/components/payments/AddPaymentModal';

interface Payment {
  id: string;
  paymentDate: string;
  vendor: {
    id: string;
    vendorId: string;
    legalName: string;
    state: string;
  };
  invoiceNumber: string | null;
  amount: number;
  withholding: number;
  risk: 'Low' | 'Medium' | 'High';
  document: string | null;
}

interface VendorOption {
  id: string;
  vendorId: string;
  legalName: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void loadVendors();
    void loadPayments();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await fetch('/api/vendors', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setVendors(
        (data ?? []).map((v: any) => ({ id: v.id, vendorId: v.vendorId, legalName: v.legalName }))
      );
    } catch {
      // ignore
    }
  };

  const loadPayments = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/payments', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load payments');
      }
      const data = await res.json();

      const mapped: Payment[] = (data ?? []).map((p: any) => ({
        id: p.id,
        paymentDate: p.paymentDate,
        vendor: {
          id: p.vendor?.id,
          vendorId: p.vendor?.vendorId,
          legalName: p.vendor?.legalName,
          state: p.vendor?.state,
        },
        invoiceNumber: p.invoiceNumber ?? null,
        amount: Number(p.amount ?? 0),
        withholding: Number(p.federalWithheld ?? 0),
        risk: p.vendor?.tinVerified ? 'Low' : 'Medium',
        document: (p.attachments?.[0]?.fileName ?? null) as string | null,
      }));

      setPayments(mapped);
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments
  useEffect(() => {
    if (searchTerm) {
      const filtered = payments.filter(payment =>
        payment.vendor.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.invoiceNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [payments, searchTerm]);

  const handleAddPayment = async (newPayment: any) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: newPayment.vendor,
          paymentDate: newPayment.paymentDate,
          invoiceNumber: newPayment.invoiceNumber,
          amount: newPayment.amount,
          box7Nec: newPayment.amount,
          federalWithheld: 0,
          paymentMethod: 'ACH',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create payment');

      setShowAddModal(false);
      await loadPayments();
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to create payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskBadge = (risk: string) => {
    const riskConfig = {
      Low: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      Medium: { color: 'bg-yellow-500/20 text-yellow-400', icon: <AlertTriangle className="w-3 h-3" /> },
      High: { color: 'bg-red-500/20 text-red-400', icon: <XCircle className="w-3 h-3" /> }
    };
    
    const config = riskConfig[risk as keyof typeof riskConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{risk}</span>
      </span>
    );
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalWithholding = filteredPayments.reduce((sum, payment) => sum + payment.withholding, 0);

  return (
    <DashboardLayout 
      title="1099 Payments"
      description="Vendor payment tracking and invoice management"
    >
      {/* Header */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Payments</h3>
            <p className="text-slate-400 text-sm">
              Track all vendor payments for 1099 compliance
            </p>
          </div>

      {loadError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-lg mb-6">
          {loadError}
        </div>
      )}
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">{filteredPayments.length} payments</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Withholding</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalWithholding)}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Net Payments</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount - totalWithholding)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vendor ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Withholding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Quarter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-300" colSpan={11}>
                    Loading payments...
                  </td>
                </tr>
              )}
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{String(payment.paymentDate).slice(0, 10)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{payment.vendor.vendorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{payment.vendor.legalName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{payment.invoiceNumber ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{payment.vendor.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(payment.withholding)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{String(payment.paymentDate).slice(0, 4)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRiskBadge(payment.risk)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                        {payment.document ?? '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <AddPaymentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPayment}
          vendors={vendors}
        />
      )}
    </DashboardLayout>
  );
}
