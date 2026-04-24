'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  FileBarChart, Users, DollarSign, FileText, Calendar, 
  TrendingUp, Building2, AlertTriangle, CheckCircle, 
  Clock, Download, FileSpreadsheet, Printer, Filter,
  ChevronDown, ChevronUp, Search, Briefcase, Shield,
  Receipt, Wallet, Activity, FileCheck, AlertCircle, Inbox
} from 'lucide-react';
import { exportToExcel, exportToPDF, formatCurrency, formatSSN } from '@/lib/export';

// Report Categories - Restructured per user requirements
const REPORT_CATEGORIES = [
  {
    id: 'tax-compliance',
    name: 'Tax Compliance Reports',
    nameAr: 'تقارير الامتثال الضريبي',
    description: 'Essential IRS compliance reports for tax season',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    reports: [
      { 
        id: 'w2-w3-summary', 
        name: 'W-2/W-3 Filing Summary', 
        description: 'A consolidated overview of all employee earnings and federal tax withholdings.' 
      },
      { 
        id: '1099-nec-overview', 
        name: '1099-NEC Tracking', 
        description: 'Monitor non-employee compensation and identify contractors exceeding the $600 threshold.' 
      },
      { 
        id: 'w9-status', 
        name: 'W-9 Intake Status', 
        description: 'Track pending and completed vendor certifications to ensure your records are IRS-ready.' 
      },
    ]
  },
  {
    id: 'payroll-earnings',
    name: 'Payroll & Earnings',
    nameAr: 'الرواتب والأجور',
    description: 'Detailed payroll processing and employee earnings reports',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    reports: [
      { 
        id: 'payroll-register', 
        name: 'Detailed Payroll Register', 
        description: 'A complete breakdown of gross pay, deductions, and net pay for every pay period.' 
      },
      { 
        id: 'earnings-hours', 
        name: 'Employee Wage & Tax Statement', 
        description: 'View individual earnings summaries, local taxes, and state disability insurance.' 
      },
    ]
  },
  {
    id: 'audit-system',
    name: 'Audit & System Logic',
    nameAr: 'التدقيق والنظام',
    description: 'Automated audits and compliance verification',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    reports: [
      { 
        id: 'discrepancy', 
        name: 'IRS Discrepancy Alert', 
        description: 'An automated audit report to detect missing TINs or incomplete address data before filing.' 
      },
      { 
        id: 'tax-liability', 
        name: 'Annual Tax Liability', 
        description: 'Real-time calculation of your total tax obligations based on current payroll data.' 
      },
    ]
  }
];

// Mock Data for Reports
const MOCK_DATA = {
  w2Summary: {
    totalEmployees: 47,
    totalWages: 2847500.00,
    totalFederalTax: 455600.00,
    totalSSWages: 2847500.00,
    totalSSTax: 176545.00,
    totalMedicareWages: 2847500.00,
    totalMedicareTax: 41288.75,
    employees: [
      { id: 1, name: 'John Smith', ssn: '***-**-1234', wages: 75000.00, federalTax: 12000.00, ssWages: 75000.00, ssTax: 4650.00, medicareWages: 75000.00, medicareTax: 1087.50, status: 'READY' },
      { id: 2, name: 'Sarah Johnson', ssn: '***-**-5678', wages: 82000.00, federalTax: 13120.00, ssWages: 82000.00, ssTax: 5084.00, medicareWages: 82000.00, medicareTax: 1189.00, status: 'READY' },
      { id: 3, name: 'Michael Brown', ssn: '***-**-9012', wages: 68000.00, federalTax: 10880.00, ssWages: 68000.00, ssTax: 4216.00, medicareWages: 68000.00, medicareTax: 986.00, status: 'REVIEW' },
      { id: 4, name: 'Emily Davis', ssn: '***-**-3456', wages: 95000.00, federalTax: 15200.00, ssWages: 95000.00, ssTax: 5890.00, medicareWages: 95000.00, medicareTax: 1377.50, status: 'READY' },
      { id: 5, name: 'David Wilson', ssn: '***-**-7890', wages: 72000.00, federalTax: 11520.00, ssWages: 72000.00, ssTax: 4464.00, medicareWages: 72000.00, medicareTax: 1044.00, status: 'READY' },
    ]
  },
  
  nec1099: {
    totalContractors: 23,
    totalPayments: 184500.00,
    filingRequired: 18,
    contractors: [
      { id: 1, name: 'ABC Consulting LLC', tin: '**-1234567', payments: 15000.00, w9Status: 'COMPLETE', formStatus: 'FILED', lastPayment: '2024-12-15' },
      { id: 2, name: 'Tech Solutions Inc', tin: '**-9876543', payments: 28000.00, w9Status: 'COMPLETE', formStatus: 'READY', lastPayment: '2024-12-10' },
      { id: 3, name: 'Creative Design Co', tin: '**-4567890', payments: 8500.00, w9Status: 'PENDING', formStatus: 'ON_HOLD', lastPayment: '2024-11-28' },
      { id: 4, name: 'Marketing Pros', tin: '**-1112223', payments: 22000.00, w9Status: 'COMPLETE', formStatus: 'FILED', lastPayment: '2024-12-05' },
      { id: 5, name: 'Legal Advisors Group', tin: '**-4445556', payments: 35000.00, w9Status: 'COMPLETE', formStatus: 'READY', lastPayment: '2024-12-12' },
    ]
  },
  
  w9Status: {
    totalVendors: 156,
    completeW9: 142,
    pendingW9: 11,
    expiredW9: 3,
    vendors: [
      { id: 1, name: 'Acme Supplies', type: 'Vendor', tin: '**-1234567', w9Date: '2024-01-15', status: 'VALID', expiration: '2025-01-15' },
      { id: 2, name: 'Global Logistics', type: 'Vendor', tin: '**-9876543', w9Date: '2023-06-20', status: 'EXPIRED', expiration: '2024-06-20' },
      { id: 3, name: 'Tech Hardware Inc', type: 'Vendor', tin: null, w9Date: null, status: 'MISSING', expiration: null },
      { id: 4, name: 'Office Furniture Co', type: 'Vendor', tin: '**-4567890', w9Date: '2024-03-10', status: 'VALID', expiration: '2025-03-10' },
      { id: 5, name: 'Software Solutions', type: 'Vendor', tin: null, w9Date: null, status: 'PENDING', expiration: null },
    ]
  },
  
  payrollRegister: {
    currentPeriod: 'December 2024',
    totalGross: 237291.67,
    totalDeductions: 71287.50,
    totalNet: 166004.17,
    entries: [
      { id: 1, employee: 'John Smith', gross: 6250.00, federal: 1000.00, ss: 387.50, medicare: 90.63, state: 312.50, net: 4459.37 },
      { id: 2, employee: 'Sarah Johnson', gross: 6833.33, federal: 1093.33, ss: 423.67, medicare: 99.08, state: 341.67, net: 4875.58 },
      { id: 3, employee: 'Michael Brown', gross: 5666.67, federal: 906.67, ss: 351.33, medicare: 82.17, state: 283.33, net: 4043.17 },
      { id: 4, employee: 'Emily Davis', gross: 7916.67, federal: 1266.67, ss: 490.83, medicare: 114.79, state: 395.83, net: 5648.55 },
      { id: 5, employee: 'David Wilson', gross: 6000.00, federal: 960.00, ss: 372.00, medicare: 87.00, state: 300.00, net: 4281.00 },
    ]
  },
  
  earningsHours: {
    totalRegularHours: 7520,
    totalOvertimeHours: 320,
    totalEmployees: 47,
    employees: [
      { id: 1, name: 'John Smith', regularHours: 160, overtimeHours: 8, regularRate: 39.06, overtimeRate: 58.59, totalEarnings: 6718.72 },
      { id: 2, name: 'Sarah Johnson', regularHours: 160, overtimeHours: 12, regularRate: 42.71, overtimeRate: 64.07, totalEarnings: 7604.84 },
      { id: 3, name: 'Michael Brown', regularHours: 160, overtimeHours: 0, regularRate: 35.42, overtimeRate: 53.13, totalEarnings: 5666.67 },
      { id: 4, name: 'Emily Davis', regularHours: 160, overtimeHours: 16, regularRate: 49.48, overtimeRate: 74.22, totalEarnings: 9103.52 },
      { id: 5, name: 'David Wilson', regularHours: 160, overtimeHours: 4, regularRate: 37.50, overtimeRate: 56.25, totalEarnings: 6225.00 },
    ]
  },
  
  taxLiability: {
    currentQuarter: 'Q4 2024',
    federalLiability: 113900.00,
    ssLiability: 44128.50,
    medicareLiability: 10321.25,
    stateLiability: 28475.00,
    totalLiability: 196824.75,
    dueDate: '2025-01-31',
    history: [
      { period: 'Q3 2024', federal: 108500.00, ss: 42045.00, medicare: 9835.50, state: 27125.00, total: 187505.50, status: 'PAID' },
      { period: 'Q2 2024', federal: 105200.00, ss: 40768.00, medicare: 9536.00, state: 26300.00, total: 181804.00, status: 'PAID' },
      { period: 'Q1 2024', federal: 102000.00, ss: 39540.00, medicare: 9246.00, state: 25500.00, total: 176286.00, status: 'PAID' },
    ]
  },
  
  discrepancies: {
    totalIssues: 12,
    criticalIssues: 3,
    warnings: 9,
    issues: [
      { id: 1, type: 'CRITICAL', category: 'Missing SSN', description: 'Employee Robert Taylor missing Social Security Number', employee: 'Robert Taylor', action: 'Update Employee Record' },
      { id: 2, type: 'CRITICAL', category: 'Invalid TIN', description: 'Vendor Global Logistics has expired W-9 (TIN verification failed)', vendor: 'Global Logistics', action: 'Request New W-9' },
      { id: 3, type: 'CRITICAL', category: 'Address Missing', description: 'Employee Jennifer White has incomplete address (no ZIP code)', employee: 'Jennifer White', action: 'Update Address' },
      { id: 4, type: 'WARNING', category: 'Tax Mismatch', description: 'Social Security wages exceed federal wages by $1,250 for Mark Johnson', employee: 'Mark Johnson', action: 'Review Payroll' },
      { id: 5, type: 'WARNING', category: 'Duplicate Entry', description: 'Possible duplicate payment to vendor Tech Solutions Inc on 12/15', vendor: 'Tech Solutions Inc', action: 'Verify Payment' },
    ]
  }
};

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [year, setYear] = useState('2024');
  const [quarter, setQuarter] = useState('Q4');
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportExcel = (reportType: string) => {
    let data: any = { headers: [], rows: [], title: '', companyInfo: { name: 'TaxCore360 Client' } };
    
    switch (reportType) {
      case 'w2-w3-summary':
        data = {
          headers: ['Employee', 'SSN', 'Wages (Box 1)', 'Federal Tax (Box 2)', 'SS Wages (Box 3)', 'SS Tax (Box 4)', 'Medicare Wages (Box 5)', 'Medicare Tax (Box 6)', 'Status'],
          rows: MOCK_DATA.w2Summary.employees.map(e => [e.name, e.ssn, e.wages, e.federalTax, e.ssWages, e.ssTax, e.medicareWages, e.medicareTax, e.status]),
          title: 'W-2 / W-3 Summary Report',
          companyInfo: { name: 'TaxCore360 Client' }
        };
        break;
      case '1099-nec-overview':
        data = {
          headers: ['Contractor', 'TIN', 'Total Payments', 'W-9 Status', 'Form Status', 'Last Payment'],
          rows: MOCK_DATA.nec1099.contractors.map(c => [c.name, c.tin, c.payments, c.w9Status, c.formStatus, c.lastPayment]),
          title: '1099-NEC Filing Overview',
          companyInfo: { name: 'TaxCore360 Client' }
        };
        break;
    }
    
    exportToExcel(data, `${reportType}_${year}`);
  };

  const getStatusBadge = (status: string, type: 'w2' | '1099' | 'w9' | 'issue' = 'w2') => {
    const configs: Record<string, Record<string, string>> = {
      w2: {
        READY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
        DRAFT: 'bg-gray-100 text-[#667085] border-gray-200'
      },
      '1099': {
        FILED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        READY: 'bg-blue-100 text-blue-700 border-blue-200',
        ON_HOLD: 'bg-red-100 text-red-700 border-red-200'
      },
      w9: {
        VALID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        EXPIRED: 'bg-red-100 text-red-700 border-red-200',
        MISSING: 'bg-gray-100 text-[#667085] border-gray-200',
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200'
      },
      issue: {
        CRITICAL: 'bg-red-100 text-red-700 border-red-200',
        WARNING: 'bg-amber-100 text-amber-700 border-amber-200'
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${configs[type][status] || 'bg-gray-100 text-[#667085] border-gray-200'}`}>
        {status}
      </span>
    );
  };

  // Empty State Component
  const EmptyState = ({ message = 'No data available for this period' }: { message?: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-[#667085]" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">{message}</h3>
      <p className="text-sm text-[#667085] max-w-sm">
        Try adjusting your filters or selecting a different time period to see data for this report.
      </p>
    </div>
  );

  // Render Report Content
  const renderReportContent = () => {
    if (!selectedReport) return null;

    switch (selectedReport) {
      case 'w2-w3-summary':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Employees</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{MOCK_DATA.w2Summary.totalEmployees}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Wages</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.w2Summary.totalWages)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Federal Tax</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.w2Summary.totalFederalTax)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">SS + Medicare</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.w2Summary.totalSSTax + MOCK_DATA.w2Summary.totalMedicareTax)}</p>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Table Header with Export Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-[#111827]">Employee W-2 Details</h3>
                  <span className="text-sm text-[#667085]">({MOCK_DATA.w2Summary.employees.length} records)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleExportExcel('w2-w3-summary')}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>
                  <button 
                    onClick={() => {/* PDF Export */}}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">SSN</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Wages (Box 1)</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Federal (Box 2)</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">SS Tax (Box 4)</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Medicare (Box 6)</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DATA.w2Summary.employees.map((emp, idx) => (
                      <tr key={emp.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{emp.name}</td>
                        <td className="px-6 py-4 text-sm text-[#667085] font-mono">{emp.ssn}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(emp.wages)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(emp.federalTax)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(emp.ssTax)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(emp.medicareTax)}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(emp.status, 'w2')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IRS Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">IRS Filing Notice</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This summary must match your payroll records exactly. W-3 transmittal is due by January 31, {parseInt(year) + 1}. 
                    Total SS Wages should not exceed $168,600 per employee for {year}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case '1099-nec-overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Contractors</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{MOCK_DATA.nec1099.totalContractors}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Payments</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.nec1099.totalPayments)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Filing Required</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{MOCK_DATA.nec1099.filingRequired}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Missing W-9</p>
                <p className="text-2xl font-bold text-red-600 mt-1">3</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Table Header with Export Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-[#111827]">1099-NEC Contractor List</h3>
                  <span className="text-sm text-[#667085]">({MOCK_DATA.nec1099.contractors.length} records)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleExportExcel('1099-nec-overview')}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>
                  <button 
                    onClick={() => {/* PDF Export */}}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Contractor</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">TIN</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Payments</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">W-9 Status</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Form Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DATA.nec1099.contractors.map((contractor, idx) => (
                      <tr key={contractor.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{contractor.name}</td>
                        <td className="px-6 py-4 text-sm text-[#667085] font-mono">{contractor.tin}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(contractor.payments)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${contractor.w9Status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {contractor.w9Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(contractor.formStatus, '1099')}</td>
                        <td className="px-6 py-4 text-sm text-[#667085]">{contractor.lastPayment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'w9-status':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Vendors</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{MOCK_DATA.w9Status.totalVendors}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Valid W-9</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{MOCK_DATA.w9Status.completeW9}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{MOCK_DATA.w9Status.pendingW9}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Expired/Missing</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{MOCK_DATA.w9Status.expiredW9}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Table Header with Export Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-[#111827]">Vendor W-9 Status</h3>
                  <span className="text-sm text-[#667085]">({MOCK_DATA.w9Status.vendors.length} records)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleExportExcel('w9-status')}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>
                  <button 
                    onClick={() => {/* PDF Export */}}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-[#667085]" />
                  <input 
                    type="text" 
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">TIN</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">W-9 Date</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Expiration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DATA.w9Status.vendors.map((vendor, idx) => (
                      <tr key={vendor.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{vendor.name}</td>
                        <td className="px-6 py-4 text-sm text-[#667085]">{vendor.type}</td>
                        <td className="px-6 py-4 text-sm text-[#667085] font-mono">{vendor.tin || '—'}</td>
                        <td className="px-6 py-4 text-sm text-[#667085]">{vendor.w9Date || '—'}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(vendor.status, 'w9')}</td>
                        <td className="px-6 py-4 text-sm text-[#667085]">{vendor.expiration || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'payroll-register':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Period</p>
                <p className="text-lg font-bold text-[#111827] mt-1">{MOCK_DATA.payrollRegister.currentPeriod}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Gross Pay</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.payrollRegister.totalGross)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Deductions</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(MOCK_DATA.payrollRegister.totalDeductions)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Net Pay</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(MOCK_DATA.payrollRegister.totalNet)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#111827]">Payroll Register Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Employee</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Gross</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Federal</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">SS</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Medicare</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">State</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DATA.payrollRegister.entries.map((entry, idx) => (
                      <tr key={entry.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{entry.employee}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(entry.gross)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(entry.federal)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(entry.ss)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(entry.medicare)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(entry.state)}</td>
                        <td className="px-6 py-4 text-sm text-right text-emerald-700 font-semibold font-mono">{formatCurrency(entry.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'earnings-hours':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Regular Hours</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{MOCK_DATA.earningsHours.totalRegularHours.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Overtime Hours</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{MOCK_DATA.earningsHours.totalOvertimeHours.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Employees</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{MOCK_DATA.earningsHours.totalEmployees}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(MOCK_DATA.payrollRegister.totalGross)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#111827]">Earnings & Hours Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Employee</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Regular Hrs</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Overtime Hrs</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Regular Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">OT Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Total Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DATA.earningsHours.employees.map((emp, idx) => (
                      <tr key={emp.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{emp.name}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827]">{emp.regularHours}</td>
                        <td className="px-6 py-4 text-sm text-right text-amber-600 font-semibold">{emp.overtimeHours || '—'}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(emp.regularRate)}/hr</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{emp.overtimeHours ? formatCurrency(emp.overtimeRate) + '/hr' : '—'}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-semibold font-mono">{formatCurrency(emp.totalEarnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'tax-liability':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Current Quarter</p>
                <p className="text-lg font-bold text-[#111827] mt-1">{MOCK_DATA.taxLiability.currentQuarter}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">Federal Liability</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.taxLiability.federalLiability)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-[#667085] uppercase tracking-wide">SS + Medicare</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">{formatCurrency(MOCK_DATA.taxLiability.ssLiability + MOCK_DATA.taxLiability.medicareLiability)}</p>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm bg-red-50">
                <p className="text-xs text-red-600 uppercase tracking-wide">Total Due</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(MOCK_DATA.taxLiability.totalLiability)}</p>
                <p className="text-xs text-red-600 mt-1">Due: {MOCK_DATA.taxLiability.dueDate}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#111827]">Tax Liability History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Period</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Federal</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">SS</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Medicare</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">State</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-[#111827] uppercase">Total</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-[#111827] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-blue-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{MOCK_DATA.taxLiability.currentQuarter}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(MOCK_DATA.taxLiability.federalLiability)}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(MOCK_DATA.taxLiability.ssLiability)}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(MOCK_DATA.taxLiability.medicareLiability)}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(MOCK_DATA.taxLiability.stateLiability)}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#111827] font-semibold font-mono">{formatCurrency(MOCK_DATA.taxLiability.totalLiability)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">DUE</span>
                      </td>
                    </tr>
                    {MOCK_DATA.taxLiability.history.map((period, idx) => (
                      <tr key={period.period} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{period.period}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-mono">{formatCurrency(period.federal)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(period.ss)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(period.medicare)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#667085] font-mono">{formatCurrency(period.state)}</td>
                        <td className="px-6 py-4 text-sm text-right text-[#111827] font-semibold font-mono">{formatCurrency(period.total)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">PAID</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'discrepancy':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-medium text-red-800">Critical Issues</p>
                </div>
                <p className="text-3xl font-bold text-red-700 mt-2">{MOCK_DATA.discrepancies.criticalIssues}</p>
                <p className="text-xs text-red-600 mt-1">Require immediate action</p>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">Warnings</p>
                </div>
                <p className="text-3xl font-bold text-amber-700 mt-2">{MOCK_DATA.discrepancies.warnings}</p>
                <p className="text-xs text-amber-600 mt-1">Review recommended</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#667085]" />
                  <p className="text-sm font-medium text-[#667085]">Total Issues</p>
                </div>
                <p className="text-3xl font-bold text-[#111827] mt-2">{MOCK_DATA.discrepancies.totalIssues}</p>
                <p className="text-xs text-[#667085] mt-1">Detected by system</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#111827]">Discrepancy Report</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F4F7F9] border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Entity</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#111827] uppercase">Required Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DATA.discrepancies.issues.map((issue, idx) => (
                      <tr key={issue.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/50'} hover:bg-blue-50/30`}>
                        <td className="px-6 py-4">{getStatusBadge(issue.type, 'issue')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#111827]">{issue.category}</td>
                        <td className="px-6 py-4 text-sm text-[#667085]">{issue.description}</td>
                        <td className="px-6 py-4 text-sm text-[#111827]">{issue.employee || issue.vendor}</td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            {issue.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Main Content
  if (selectedReport) {
    const category = REPORT_CATEGORIES.find(c => c.reports.find(r => r.id === selectedReport));
    const report = category?.reports.find(r => r.id === selectedReport);
    
    return (
      <DashboardLayout 
        title={report?.name || 'Report'}
        description={report?.description || ''}
      >
        {/* Professional Report Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex items-center space-x-2 text-[#667085] hover:text-[#111827] transition-colors"
              >
                <FileBarChart className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Reports</span>
              </button>
              <div className="h-4 w-px bg-gray-300" />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${category?.color}`}>
                {category?.name}
              </span>
            </div>
            
            {/* Export Buttons - Prominent */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleExportExcel(selectedReport || '')}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
              <button 
                onClick={() => {/* PDF Export */}}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          
          {/* Company & Report Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              {/* Company Logo Placeholder */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#111827]">{report?.name}</h1>
                <p className="text-sm text-[#667085] mt-0.5">{report?.description}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="inline-flex items-center text-xs text-[#667085]">
                    <Building2 className="w-3 h-3 mr-1" />
                    TaxCore360 Client
                  </span>
                  <span className="inline-flex items-center text-xs text-[#667085]">
                    <Calendar className="w-3 h-3 mr-1" />
                    {year} - {quarter}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-[#667085]">Year:</label>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option>2024</option>
                  <option>2023</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-[#667085]">Quarter:</label>
                <select 
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Q1</option>
                  <option>Q2</option>
                  <option>Q3</option>
                  <option>Q4</option>
                </select>
              </div>
              
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#111827] text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {renderReportContent()}
      </DashboardLayout>
    );
  }

  // Reports Grid
  return (
    <DashboardLayout 
      title="Reports Dashboard"
      description="Comprehensive tax, payroll, and compliance reporting"
    >
      <div className="space-y-10">
        {REPORT_CATEGORIES.map((category) => (
          <section key={category.id} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
            {/* Section Header - Bilingual */}
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2.5 rounded-lg ${category.color}`}>
                {category.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">{category.name}</h2>
                {category.nameAr && (
                  <p className="text-xs text-[#667085] font-medium">{category.nameAr}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-[#667085] mb-5 ml-12">{category.description}</p>
            
            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-xl hover:border-blue-400 hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#667085] group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-semibold text-[#111827] mb-2 group-hover:text-blue-700 transition-colors">{report.name}</h3>
                  <p className="text-sm text-[#667085] leading-relaxed">{report.description}</p>
                  
                  {/* View Report Link */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center">
                      View Report
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ChevronRight component for the grid
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
