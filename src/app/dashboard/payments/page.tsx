'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Payment = {
  id: string;
  amount: number;
  paymentDate: string;
  invoiceNumber: string | null;
  description: string | null;
  paymentMethod: string;
  is1099Reportable: boolean;
  box7Nec: number;
  vendor: { legalName: string; vendorId: string };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/payments', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="text-gray-400 hover:text-gray-600">&larr; Dashboard</a>
              <h1 className="text-xl font-bold text-gray-900">Payments</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">1099-NEC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.vendor?.legalName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formatCurrency(Number(p.amount))}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(Number(p.box7Nec))}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(p.paymentDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.is1099Reportable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.is1099Reportable ? 'Yes' : 'No'}
                      </span>
                    </td>
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
