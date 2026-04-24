'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Vendor = {
  id: string;
  vendorId: string;
  legalName: string;
  dbaName: string | null;
  entityType: string;
  taxIdType: string;
  tinVerified: boolean;
  state: string;
  w9Received: boolean;
  payments: { id: string; amount: number; paymentDate: string }[];
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/vendors', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="text-gray-400 hover:text-gray-600">&larr; Dashboard</a>
              <h1 className="text-xl font-bold text-gray-900">1099 Vendors</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No vendors found.</p>
            <p className="text-sm text-gray-400 mt-2">Add vendors via the API or database.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Legal Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIN Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">W-9</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendors.map((v) => {
                  const totalPayments = v.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
                  return (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.legalName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.entityType}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v.tinVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {v.tinVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v.w9Received ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {v.w9Received ? 'Received' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.state}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formatCurrency(totalPayments)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
