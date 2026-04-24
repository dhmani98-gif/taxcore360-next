'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileBarChart, Users, DollarSign, FileText, Calendar, TrendingUp, Building2 } from 'lucide-react';

interface ReportCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface ReportData {
  employeeCount: number;
  paidMonths: number;
  employeeStatement: {
    name: string;
    totalWages: number;
    federalTax: number;
    stateTax: number;
  };
  w2Transmittal: {
    totalEmployees: number;
    totalWages: number;
    totalFederalTax: number;
  };
  form1099Compliance: {
    totalVendors: number;
    totalPayments: number;
    compliantVendors: number;
  };
  taxReconciliation: {
    totalPayroll: number;
    totalWithholding: number;
    variance: number;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableReports, setAvailableReports] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    documentType: 'ALL',
    employee: ''
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error('Failed to fetch reports');
        
        const data = await res.json();
        setAvailableReports(data.availableReports || []);
        
        const reportCards: ReportCard[] = data.availableReports?.map((report: any) => ({
          id: report.type,
          name: report.name,
          description: report.description,
          icon: getReportIcon(report.type),
          category: getReportCategory(report.type)
        })) || [];
        
        setReports(reportCards);
      } catch (err) {
        setError('Failed to load reports');
        console.error('Error fetching reports:', err);
      }
    };

    fetchReports();
  }, []);

  const getReportIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'vendor-1099': <Building2 className="w-6 h-6" />,
      'payment-summary': <DollarSign className="w-6 h-6" />,
      'w9-compliance': <FileText className="w-6 h-6" />,
      'employee-summary': <Users className="w-6 h-6" />,
      'document-inventory': <FileBarChart className="w-6 h-6" />
    };
    return icons[type] || <FileText className="w-6 h-6" />;
  };

  const getReportCategory = (type: string) => {
    const categories: Record<string, string> = {
      'vendor-1099': 'Tax Forms',
      'payment-summary': 'Payroll',
      'w9-compliance': 'Compliance',
      'employee-summary': 'Workforce',
      'document-inventory': 'Documents'
    };
    return categories[type] || 'General';
  };

  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [selectedReport]);

  const fetchReportData = async (reportType: string) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`/api/reports?type=${reportType}&year=${filters.year}`);
      if (!res.ok) throw new Error('Failed to fetch report data');
      
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      setError('Failed to load report data');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const handleBackToReports = () => {
    setSelectedReport(null);
    setReportData(null);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Workforce': 'bg-blue-500/20 text-blue-400',
      'Payroll': 'bg-green-500/20 text-green-400',
      'Tax Forms': 'bg-purple-500/20 text-purple-400',
      'Compliance': 'bg-orange-500/20 text-orange-400'
    };
    
    return colors[category as keyof typeof colors] || 'bg-slate-500/20 text-slate-400';
  };

  // If a specific report is selected
  if (selectedReport && reportData) {
    const report = reports.find(r => r.id === selectedReport);
    
    return (
      <DashboardLayout 
        title={report?.name || 'Report'}
        description={report?.description || ''}
      >
        {/* Report Header */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToReports}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FileBarChart className="w-4 h-4" />
              <span>Back To Reports</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <label className="text-slate-300 text-sm">Document Type:</label>
                <select
                  value={filters.documentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Types</option>
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                  <option value="CSV">CSV</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-slate-300 text-sm">Year:</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-slate-300 text-sm">Employee:</label>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Employees</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                </select>
              </div>
              
              <button
                onClick={handlePrintDocument}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-xl border border-slate-700 p-8">
          {selectedReport === 'employee-count' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Employee Count Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Employees</h3>
                  <p className="text-3xl font-bold text-blue-600">{reportData.employeeCount}</p>
                  <p className="text-blue-700 text-sm mt-2">Active workforce</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Departments</h3>
                  <p className="text-3xl font-bold text-green-600">8</p>
                  <p className="text-green-700 text-sm mt-2">Active departments</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">New Hires</h3>
                  <p className="text-3xl font-bold text-purple-600">12</p>
                  <p className="text-purple-700 text-sm mt-2">This quarter</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Department Breakdown</h3>
                <div className="space-y-3">
                  {['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'].map((dept, index) => (
                    <div key={dept} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{dept}</span>
                      <span className="text-slate-600">{Math.floor(Math.random() * 30 + 5)} employees</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'paid-months' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Paid Months Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Paid Months</h3>
                  <p className="text-3xl font-bold text-green-600">{reportData.paidMonths}</p>
                  <p className="text-green-700 text-sm mt-2">Months processed</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Average Monthly</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(729167)}</p>
                  <p className="text-blue-700 text-sm mt-2">Payroll amount</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Breakdown</h3>
                <div className="space-y-3">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                    <div key={month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{month} 2024</span>
                      <div className="text-right">
                        <span className="text-slate-900 font-medium">{formatCurrency(Math.floor(Math.random() * 100000 + 600000))}</span>
                        <span className="text-green-600 text-sm ml-2">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'employee-statement' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Employee Statement</h2>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{reportData.employeeStatement.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Total Wages</h4>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.employeeStatement.totalWages)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Federal Tax</h4>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.employeeStatement.federalTax)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">State Tax</h4>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.employeeStatement.stateTax)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Earnings</h3>
                <div className="space-y-3">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                    <div key={month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{month} 2024</span>
                      <span className="text-slate-900 font-medium">{formatCurrency(reportData.employeeStatement.totalWages / 12)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'w2-transmittal' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">W-2 Transmittal Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Employees</h3>
                  <p className="text-3xl font-bold text-blue-600">{reportData.w2Transmittal.totalEmployees}</p>
                  <p className="text-blue-700 text-sm mt-2">W-2 forms issued</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Total Wages</h3>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(reportData.w2Transmittal.totalWages)}</p>
                  <p className="text-green-700 text-sm mt-2">Annual wages</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Federal Tax</h3>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(reportData.w2Transmittal.totalFederalTax)}</p>
                  <p className="text-purple-700 text-sm mt-2">Total withheld</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Form W-2 Summary</h3>
                <div className="bg-slate-50 rounded-lg p-6">
                  <p className="text-slate-700 mb-4">This report summarizes all W-2 forms for submission to the SSA. All {reportData.w2Transmittal.totalEmployees} employee W-2 forms have been processed and are ready for electronic filing.</p>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Ready to File</span>
                    <span className="text-slate-600 text-sm">Generated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === '1099-compliance' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">1099 Compliance Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Vendors</h3>
                  <p className="text-3xl font-bold text-blue-600">{reportData.form1099Compliance.totalVendors}</p>
                  <p className="text-blue-700 text-sm mt-2">In system</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Total Payments</h3>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(reportData.form1099Compliance.totalPayments)}</p>
                  <p className="text-green-700 text-sm mt-2">Year to date</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Compliant Vendors</h3>
                  <p className="text-3xl font-bold text-purple-600">{reportData.form1099Compliance.compliantVendors}</p>
                  <p className="text-purple-700 text-sm mt-2">{Math.round((reportData.form1099Compliance.compliantVendors / reportData.form1099Compliance.totalVendors) * 100)}% compliance</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-900">W-9 Forms Collected</span>
                    <span className="text-green-600">89%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium text-yellow-900">TIN Verification</span>
                    <span className="text-yellow-600">76%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-900">Forms Ready</span>
                    <span className="text-blue-600">67%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'tax-reconciliation' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Tax Reconciliation Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Payroll</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(reportData.taxReconciliation.totalPayroll)}</p>
                  <p className="text-blue-700 text-sm mt-2">Year to date</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Total Withholding</h3>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(reportData.taxReconciliation.totalWithholding)}</p>
                  <p className="text-green-700 text-sm mt-2">All taxes</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Variance</h3>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(reportData.taxReconciliation.variance)}</p>
                  <p className="text-purple-700 text-sm mt-2">Under/over</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tax Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Federal Income Tax</span>
                    <span className="text-slate-900">{formatCurrency(reportData.taxReconciliation.totalWithholding * 0.7)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Social Security Tax</span>
                    <span className="text-slate-900">{formatCurrency(reportData.taxReconciliation.totalWithholding * 0.2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Medicare Tax</span>
                    <span className="text-slate-900">{formatCurrency(reportData.taxReconciliation.totalWithholding * 0.1)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Main reports grid view
  return (
    <DashboardLayout 
      title="Reports"
      description="Generate and view various tax and payroll reports"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:bg-slate-700 transition-colors cursor-pointer"
            onClick={() => handleOpenReport(report.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(report.category)}`}>
                {report.icon}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(report.category)}`}>
                {report.category}
              </span>
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">{report.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{report.description}</p>
            
            <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
              <FileBarChart className="w-4 h-4" />
              <span className="text-sm font-medium">Open Report Page</span>
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
