'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText, Download, Calendar, User, Building2, DollarSign, AlertCircle } from 'lucide-react';

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
  localTax: number;
  retirementPlan: number;
  status: 'DRAFT' | 'GENERATED' | 'SUBMITTED' | 'ACCEPTED';
  generatedAt?: string;
}

export default function W2FormsPage() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [w2Forms, setW2Forms] = useState<W2Form[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const years = ['2024', '2023', '2022', '2021'];
  const employees = [
    { id: 'ALL', name: 'All Employees' },
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Williams' },
    { id: '5', name: 'David Brown' }
  ];

  // Mock data
  useEffect(() => {
    const mockW2Forms: W2Form[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'John Doe',
        taxYear: 2024,
        wages: 85000,
        federalTax: 12750,
        socialSecurityWages: 85000,
        socialSecurityTax: 5270,
        medicareWages: 85000,
        medicareTax: 1232.50,
        stateWages: 85000,
        stateTax: 4250,
        localTax: 0,
        retirementPlan: 2000,
        status: 'GENERATED',
        generatedAt: '2024-01-15'
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Jane Smith',
        taxYear: 2024,
        wages: 75000,
        federalTax: 11250,
        socialSecurityWages: 75000,
        socialSecurityTax: 4650,
        medicareWages: 75000,
        medicareTax: 1087.50,
        stateWages: 75000,
        stateTax: 3750,
        localTax: 0,
        retirementPlan: 1500,
        status: 'GENERATED',
        generatedAt: '2024-01-15'
      },
      {
        id: '3',
        employeeId: '3',
        employeeName: 'Mike Johnson',
        taxYear: 2024,
        wages: 65000,
        federalTax: 9750,
        socialSecurityWages: 65000,
        socialSecurityTax: 4030,
        medicareWages: 65000,
        medicareTax: 942.50,
        stateWages: 65000,
        stateTax: 3250,
        localTax: 0,
        retirementPlan: 1000,
        status: 'DRAFT'
      }
    ];
    setW2Forms(mockW2Forms);
  }, []);

  const filteredForms = w2Forms.filter(form => {
    const yearMatch = form.taxYear.toString() === selectedYear;
    const employeeMatch = selectedEmployee === 'ALL' || form.employeeId === selectedEmployee;
    return yearMatch && employeeMatch;
  });

  const handleGeneratePDF = async (formId: string) => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would generate and download PDF
    console.log(`Generating PDF for W-2 form ${formId}`);
    
    setIsGenerating(false);
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    
    // Simulate generating all forms
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setW2Forms(prev => prev.map(form => ({
      ...form,
      status: 'GENERATED' as const,
      generatedAt: new Date().toISOString().split('T')[0]
    })));
    
    setIsGenerating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-slate-500/20 text-slate-400', icon: <FileText className="w-3 h-3" /> },
      GENERATED: { color: 'bg-blue-500/20 text-blue-400', icon: <FileText className="w-3 h-3" /> },
      SUBMITTED: { color: 'bg-yellow-500/20 text-yellow-400', icon: <AlertCircle className="w-3 h-3" /> },
      ACCEPTED: { color: 'bg-green-500/20 text-green-400', icon: <AlertCircle className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  return (
    <DashboardLayout 
      title="W-2 Forms"
      description="Generate and manage employee W-2 tax forms"
    >
      {/* Controls */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 font-medium">Tax Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 font-medium">Employee:</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate All W-2s'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* W-2 Form Display */}
      {filteredForms.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-700 p-8 mb-6">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Form W-2</h2>
            <p className="text-slate-600">Wage and Tax Statement</p>
            <p className="text-slate-500 text-sm">Copy A - For Social Security Administration</p>
            <div className="mt-2 text-slate-600 text-sm">
              Tax Year: {selectedYear}
            </div>
          </div>

          {/* Employee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Employee Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-slate-600">First Name:</span>
                  <span className="font-medium">{filteredForms[0].employeeName.split(' ')[0]}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">Last Name:</span>
                  <span className="font-medium">{filteredForms[0].employeeName.split(' ')[1]}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">Address:</span>
                  <span className="font-medium">123 Main St</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">City/State/ZIP:</span>
                  <span className="font-medium">New York, NY 10001</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Employer Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-slate-600">Name:</span>
                  <span className="font-medium">Acme Corporation</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">Address:</span>
                  <span className="font-medium">456 Business Ave</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">City/State/ZIP:</span>
                  <span className="font-medium">New York, NY 10002</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">EIN:</span>
                  <span className="font-medium">12-3456789</span>
                </div>
              </div>
            </div>
          </div>

          {/* W-2 Boxes Grid */}
          <div className="border-2 border-slate-300 rounded-lg p-6">
            <div className="grid grid-cols-4 gap-4 text-sm">
              {/* Box 1 - Wages */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 1</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">Wages, tips, other compensation</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].wages)}</div>
              </div>

              {/* Box 2 - Federal Tax */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 2</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">Federal income tax withheld</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].federalTax)}</div>
              </div>

              {/* Box 3 - SS Wages */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 3</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">Social security wages</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].socialSecurityWages)}</div>
              </div>

              {/* Box 4 - SS Tax */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 4</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">Social security tax withheld</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].socialSecurityTax)}</div>
              </div>

              {/* Box 5 - Medicare Wages */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 5</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">Medicare wages and tips</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].medicareWages)}</div>
              </div>

              {/* Box 6 - Medicare Tax */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 6</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">Medicare tax withheld</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].medicareTax)}</div>
              </div>

              {/* Box 16 - State Wages */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 16</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">State wages, tips, etc.</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].stateWages)}</div>
              </div>

              {/* Box 17 - State Tax */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-center mb-1">
                  <span className="font-bold text-slate-900">Box 17</span>
                </div>
                <div className="text-center text-slate-600 text-xs mb-1">State income tax</div>
                <div className="text-center font-bold text-lg">{formatCurrency(filteredForms[0].stateTax)}</div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p className="font-semibold mb-1">Data Generated Automatically</p>
                <p>This W-2 form has been automatically generated from payroll data. All calculations are based on the employee's annual earnings and tax withholdings.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tax Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Wages</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Federal Tax</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">SS Tax</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Medicare</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{form.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{form.taxYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(form.wages)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(form.federalTax)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(form.socialSecurityTax)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-300">{formatCurrency(form.medicareTax)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(form.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{form.generatedAt || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleGeneratePDF(form.id)}
                      disabled={isGenerating || form.status === 'DRAFT'}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
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
