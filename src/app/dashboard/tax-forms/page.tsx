'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type TaxForm = {
  id: string;
  type: string;
  year: number;
  status: string;
  recipientType: string;
  recipientId: string;
  totalAmount: number;
  federalWithheld: number;
  isCorrection: boolean;
  createdAt: string;
};

export default function TaxFormsPage() {
  const [forms, setForms] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/tax-forms', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setForms(data);
    setLoading(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      GENERATED: 'bg-blue-100 text-blue-800',
      REVIEW_PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      SUBMITTED: 'bg-indigo-100 text-indigo-800',
      ACCEPTED: 'bg-green-200 text-green-900',
      REJECTED: 'bg-red-100 text-red-800',
      CORRECTED: 'bg-orange-100 text-orange-800',
      VOID: 'bg-gray-200 text-gray-600',
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="text-gray-400 hover:text-gray-600">&larr; Dashboard</a>
              <h1 className="text-xl font-bold text-gray-900">Tax Forms</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tax forms found.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {forms.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{f.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{f.year}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{f.recipientType}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formatCurrency(Number(f.totalAmount))}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{f.isCorrection ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
