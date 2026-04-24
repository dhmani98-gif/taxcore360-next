'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, FileText, CheckCircle, AlertCircle, Clock, DollarSign, Users, TrendingUp } from 'lucide-react';

interface FilingDeadline {
  id: string;
  formType: string;
  description: string;
  dueDate: string;
  status: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedAmount?: number;
  recipientsCount?: number;
}

interface FilingStatus {
  formType: string;
  totalRequired: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}

export default function TaxFilingPage() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [deadlines, setDeadlines] = useState<FilingDeadline[]>([]);
  const [filingStatus, setFilingStatus] = useState<FilingStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const years = ['2024', '2023', '2022', '2021'];

  useEffect(() => {
    fetchFilingData();
  }, [selectedYear]);

  const fetchFilingData = async () => {
    try {
      setLoading(true);
      
      // Mock data for filing deadlines
      const mockDeadlines: FilingDeadline[] = [
        {
          id: '1',
          formType: 'Form 941',
          description: 'Quarterly Federal Tax Return',
          dueDate: '2024-04-30',
          status: 'DUE_SOON',
          priority: 'HIGH',
          estimatedAmount: 45230,
          recipientsCount: 25
        },
        {
          id: '2',
          formType: 'Form 940',
          description: 'Annual Federal Unemployment Tax Return',
          dueDate: '2024-01-31',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedAmount: 2100,
          recipientsCount: 1
        },
        {
          id: '3',
          formType: 'Form 1099-NEC',
          description: 'Nonemployee Compensation',
          dueDate: '2024-01-31',
          status: 'COMPLETED',
          priority: 'HIGH',
          estimatedAmount: 125000,
          recipientsCount: 18
        },
        {
          id: '4',
          formType: 'Form 1099-MISC',
          description: 'Miscellaneous Income',
          dueDate: '2024-02-28',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedAmount: 8500,
          recipientsCount: 5
        },
        {
          id: '5',
          formType: 'Form W-2',
          description: 'Wage and Tax Statement',
          dueDate: '2024-01-31',
          status: 'COMPLETED',
          priority: 'HIGH',
          estimatedAmount: 850000,
          recipientsCount: 42
        },
        {
          id: '6',
          formType: 'Form 941',
          description: 'Q2 Quarterly Federal Tax Return',
          dueDate: '2024-07-31',
          status: 'UPCOMING',
          priority: 'HIGH',
          estimatedAmount: 48900,
          recipientsCount: 26
        }
      ];

      const mockFilingStatus: FilingStatus[] = [
        {
          formType: 'Form W-2',
          totalRequired: 42,
          completed: 42,
          inProgress: 0,
          notStarted: 0
        },
        {
          formType: 'Form 1099-NEC',
          totalRequired: 18,
          completed: 18,
          inProgress: 0,
          notStarted: 0
        },
        {
          formType: 'Form 1099-MISC',
          totalRequired: 5,
          completed: 5,
          inProgress: 0,
          notStarted: 0
        },
        {
          formType: 'Form 941',
          totalRequired: 4,
          completed: 1,
          inProgress: 1,
          notStarted: 2
        },
        {
          formType: 'Form 940',
          totalRequired: 1,
          completed: 1,
          inProgress: 0,
          notStarted: 0
        }
      ];

      setDeadlines(mockDeadlines);
      setFilingStatus(mockFilingStatus);
    } catch (error) {
      console.error('Error fetching filing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      UPCOMING: 'bg-blue-100 text-blue-800',
      DUE_SOON: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return map[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'DUE_SOON':
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <DashboardLayout title="Tax Filing" description="Manage tax filing deadlines and compliance">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading filing data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tax Filing" description="Manage tax filing deadlines and compliance">
      {/* Year Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filing Year</h2>
            <p className="text-sm text-gray-600">View deadlines and status for {selectedYear}</p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{deadlines.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {deadlines.filter(d => d.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Soon</p>
              <p className="text-2xl font-bold text-yellow-600">
                {deadlines.filter(d => d.status === 'DUE_SOON').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {deadlines.filter(d => d.status === 'OVERDUE').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filing Deadlines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Filing Deadlines
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deadlines.map((deadline) => {
                const daysUntilDue = getDaysUntilDue(deadline.dueDate);
                return (
                  <tr key={deadline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{deadline.formType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{deadline.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(deadline.dueDate)}</div>
                      {deadline.status !== 'COMPLETED' && (
                        <div className={`text-xs ${
                          daysUntilDue < 0 ? 'text-red-600' : 
                          daysUntilDue <= 7 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days remaining`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deadline.status)}`}>
                        {getStatusIcon(deadline.status)}
                        {deadline.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deadline.estimatedAmount ? formatCurrency(deadline.estimatedAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deadline.recipientsCount || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filing Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Filing Progress
        </h2>
        
        <div className="space-y-4">
          {filingStatus.map((status) => {
            const completionRate = status.totalRequired > 0 ? (status.completed / status.totalRequired) * 100 : 0;
            return (
              <div key={status.formType} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">{status.formType}</h3>
                  <span className="text-sm text-gray-600">
                    {status.completed}/{status.totalRequired} completed
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Completed: {status.completed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">In Progress: {status.inProgress}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Not Started: {status.notStarted}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
