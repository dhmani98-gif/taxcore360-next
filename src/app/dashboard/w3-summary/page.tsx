'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText, Download, Calendar, Users, Building2, DollarSign, AlertCircle, Printer, CheckCircle } from 'lucide-react';

interface W3Summary {
  taxYear: number;
  totalEmployees: number;
  totalWages: number;
  totalFederalTax: number;
  totalSocialSecurityWages: number;
  totalSocialSecurityTax: number;
  totalMedicareWages: number;
  totalMedicareTax: number;
  totalStateWages: number;
  totalStateTax: number;
  establishmentNumber: string;
  ein: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: 'DRAFT' | 'GENERATED' | 'SUBMITTED' | 'ACCEPTED';
  generatedAt?: string;
  submittedAt?: string;
}

interface W2Form {
  id: string;
  employeeId: string;
  employeeName: string;
  taxYear: number;
  wages: number;
  federalTax: number;
  socialSecurityWages: number;
  socialSecurityTax: number;
  medicareWages: number;
  medicareTax: number;
  stateWages: number;
  stateTax: number;
  status: string;
}

export default function W3SummaryPage() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [w3Summary, setW3Summary] = useState<W3Summary | null>(null);
  const [w2Forms, setW2Forms] = useState<W2Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const years = ['2024', '2023', '2022', '2021'];

  useEffect(() => {
    fetchW3Summary();
  }, [selectedYear]);

  const fetchW3Summary = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`/api/w3-summary?year=${selectedYear}`);
      if (!res.ok) throw new Error('Failed to fetch W-3 summary');
      
      const data = await res.json();
      setW3Summary(data.summary);
      setW2Forms(data.w2Forms || []);
    } catch (err) {
      setError('Failed to load W-3 summary data');
      console.error('Error fetching W-3 summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateW3Summary = async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      const res = await fetch('/api/w3-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxYear: parseInt(selectedYear) })
      });
      
      if (!res.ok) throw new Error('Failed to generate W-3 summary');
      
      const data = await res.json();
      setW3Summary(data);
    } catch (err) {
      setError('Failed to generate W-3 summary');
      console.error('Error generating W-3 summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    try {
      setIsExporting(true);
      
      const res = await fetch('/api/w3-summary/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxYear: parseInt(selectedYear) })
      });
      
      if (!res.ok) throw new Error('Failed to export PDF');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `W3_Transmittal_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export PDF');
      console.error('Error exporting PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatSSN = (val: string) => {
    if (!val) return '';
    return `***-**-${val.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      GENERATED: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GENERATED':
      case 'SUBMITTED':
        return <AlertCircle className="w-4 h-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="W-3 Transmittal Summary" description="Generate and manage W-3 transmittal forms">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading W-3 summary...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="W-3 Transmittal Summary" description="Generate and manage W-3 transmittal forms">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={generateW3Summary}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate W-3'}
            </button>
            
            {w3Summary && (
              <>
                <button
                  onClick={exportPDF}
                  disabled={isExporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {w3Summary ? (
        <>
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{w3Summary.companyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">EIN</label>
                <p className="mt-1 text-sm text-gray-900">{formatSSN(w3Summary.ein)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Establishment Number</label>
                <p className="mt-1 text-sm text-gray-900">{w3Summary.establishmentNumber || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {w3Summary.companyAddress}<br />
                  {w3Summary.companyCity}, {w3Summary.companyState} {w3Summary.companyZip}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <p className="mt-1 text-sm text-gray-900">{w3Summary.contactPerson}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <p className="mt-1 text-sm text-gray-900">
                  {w3Summary.contactPhone}<br />
                  {w3Summary.contactEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Totals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                W-3 Transmittal Summary - {selectedYear}
              </h2>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(w3Summary.status)}`}>
                {getStatusIcon(w3Summary.status)}
                {w3Summary.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total Employees</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{w3Summary.totalEmployees}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Total Wages</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(w3Summary.totalWages)}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Federal Tax</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(w3Summary.totalFederalTax)}</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Social Security Tax</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(w3Summary.totalSocialSecurityTax)}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Detailed Tax Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Social Security Wages:</span>
                    <span className="text-sm font-medium">{formatCurrency(w3Summary.totalSocialSecurityWages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Social Security Tax:</span>
                    <span className="text-sm font-medium">{formatCurrency(w3Summary.totalSocialSecurityTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Medicare Wages:</span>
                    <span className="text-sm font-medium">{formatCurrency(w3Summary.totalMedicareWages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Medicare Tax:</span>
                    <span className="text-sm font-medium">{formatCurrency(w3Summary.totalMedicareTax)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">State Wages:</span>
                    <span className="text-sm font-medium">{formatCurrency(w3Summary.totalStateWages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">State Tax:</span>
                    <span className="text-sm font-medium">{formatCurrency(w3Summary.totalStateTax)}</span>
                  </div>
                  {w3Summary.generatedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Generated:</span>
                      <span className="text-sm font-medium">{new Date(w3Summary.generatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {w3Summary.submittedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Submitted:</span>
                      <span className="text-sm font-medium">{new Date(w3Summary.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* W-2 Forms List */}
          {w2Forms.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Included W-2 Forms</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wages</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Federal Tax</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SS Tax</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicare Tax</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {w2Forms.map((w2) => (
                      <tr key={w2.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{w2.employeeName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(w2.wages)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(w2.federalTax)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(w2.socialSecurityTax)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(w2.medicareTax)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(w2.status)}`}>
                            {w2.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No W-3 Summary Generated</h3>
          <p className="text-gray-500 mb-6">Generate a W-3 transmittal summary for {selectedYear} to view aggregated W-2 data.</p>
          <button
            onClick={generateW3Summary}
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <FileText className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate W-3 Summary'}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
