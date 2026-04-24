'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DollarSign, Calendar, Users, CheckCircle, Clock, AlertCircle, Play, RefreshCw } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employee: string;
  department: string;
  period: string;
  gross: number;
  fedWH: number;
  ssTax: number;
  medicare: number;
  stateTax: number;
  pretax: number;
  netPay: number;
  method: 'Cash' | 'Bank Transfer' | 'Check';
  payDate: string;
  status: 'Paid' | 'Pending';
}

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Check'>('Bank Transfer');
  const [payDate, setPayDate] = useState('2024-01-31');
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidEmployeeCount, setPaidEmployeeCount] = useState(0);

  const months = [
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
  ];

  // Mock data
  useEffect(() => {
    const mockPayroll: PayrollRecord[] = [
      {
        id: '1',
        employee: 'John Doe',
        department: 'Engineering',
        period: 'January 2024',
        gross: 7083.33,
        fedWH: 1062.50,
        ssTax: 439.17,
        medicare: 102.71,
        stateTax: 425.00,
        pretax: 0,
        netPay: 5053.95,
        method: 'Bank Transfer',
        payDate: '2024-01-31',
        status: 'Paid'
      },
      {
        id: '2',
        employee: 'Jane Smith',
        department: 'Sales',
        period: 'January 2024',
        gross: 6250.00,
        fedWH: 937.50,
        ssTax: 387.50,
        medicare: 90.63,
        stateTax: 375.00,
        pretax: 0,
        netPay: 4459.37,
        method: 'Bank Transfer',
        payDate: '2024-01-31',
        status: 'Paid'
      },
      {
        id: '3',
        employee: 'Mike Johnson',
        department: 'Marketing',
        period: 'January 2024',
        gross: 5416.67,
        fedWH: 812.50,
        ssTax: 335.83,
        medicare: 78.54,
        stateTax: 325.00,
        pretax: 0,
        netPay: 3864.80,
        method: 'Check',
        payDate: '2024-01-31',
        status: 'Pending'
      },
      {
        id: '4',
        employee: 'Sarah Williams',
        department: 'Engineering',
        period: 'January 2024',
        gross: 7500.00,
        fedWH: 1125.00,
        ssTax: 465.00,
        medicare: 108.75,
        stateTax: 450.00,
        pretax: 0,
        netPay: 5351.25,
        method: 'Bank Transfer',
        payDate: '2024-01-31',
        status: 'Paid'
      },
      {
        id: '5',
        employee: 'David Brown',
        department: 'Operations',
        period: 'January 2024',
        gross: 6666.67,
        fedWH: 1000.00,
        ssTax: 413.33,
        medicare: 96.67,
        stateTax: 400.00,
        pretax: 0,
        netPay: 4756.67,
        method: 'Bank Transfer',
        payDate: '2024-01-31',
        status: 'Pending'
      }
    ];
    setPayrollRecords(mockPayroll);
    setPaidEmployeeCount(mockPayroll.filter(emp => emp.status === 'Paid').length);
  }, []);

  const activeEmployees = payrollRecords.length;
  const totalGross = payrollRecords.reduce((sum, record) => sum + record.gross, 0);
  const totalNet = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);

  const handlePayAll = async () => {
    setIsProcessing(true);
    
    // Simulate payroll processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update all pending employees to paid
    setPayrollRecords(prev => prev.map(record => ({
      ...record,
      status: 'Paid',
      method: paymentMethod,
      payDate: payDate
    })));
    
    setPaidEmployeeCount(activeEmployees);
    setIsProcessing(false);
  };

  const handleReRun = async () => {
    setIsProcessing(true);
    
    // Simulate re-running payroll
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset all to pending
    setPayrollRecords(prev => prev.map(record => ({
      ...record,
      status: 'Pending'
    })));
    
    setPaidEmployeeCount(0);
    setIsProcessing(false);
  };

  const handleMethodChange = (recordId: string, newMethod: 'Cash' | 'Bank Transfer' | 'Check') => {
    setPayrollRecords(prev => prev.map(record => 
      record.id === recordId ? { ...record, method: newMethod } : record
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'Paid' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  return (
    <DashboardLayout 
      title="Payroll"
      description="Monthly payroll processing and payment management"
    >
      {/* Month Selection and Controls */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Month Selection */}
          <div className="flex items-center space-x-4">
            <label className="text-slate-300 font-medium">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map(month => {
                const date = new Date(month + '-01');
                const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={month} value={month}>{monthName}</option>
                );
              })}
            </select>
            
            <div className="text-slate-400 text-sm">
              USD · Monthly · Active: {activeEmployees}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 text-sm">Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
              
              <label className="text-slate-300 text-sm">Pay Date:</label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePayAll}
                disabled={isProcessing || paidEmployeeCount === activeEmployees}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Pay All Active</span>
              </button>
              
              <button
                onClick={handleReRun}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-Run Payroll</span>
              </button>
            </div>
            
            {/* Counter */}
            <div className="text-slate-300 text-sm font-medium">
              {paidEmployeeCount}/{activeEmployees}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Gross Pay</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalGross)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Net Pay</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalNet)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Deductions</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalGross - totalNet)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dept</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Gross</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Fed W/H</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">SS 6.2%</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Medicare</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">State Tax</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Pre-tax</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Net Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Pay Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {payrollRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(record.gross)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(record.fedWH)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(record.ssTax)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(record.medicare)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(record.stateTax)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(record.pretax)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-white">{formatCurrency(record.netPay)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={record.method}
                      onChange={(e) => handleMethodChange(record.id, e.target.value as any)}
                      className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{record.payDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
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
