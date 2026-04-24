'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileText, Download, ExternalLink, PenTool, CheckCircle, AlertCircle } from 'lucide-react';

interface Form1099Data {
  recipientName: string;
  recipientTin: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  nonemployeeCompensation: number;
  federalIncomeTaxWithheld: number;
}

export default function Form1099Page() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [formData, setFormData] = useState<Form1099Data>({
    recipientName: '',
    recipientTin: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    nonemployeeCompensation: 0,
    federalIncomeTaxWithheld: 0
  });
  
  const [signature, setSignature] = useState({
    signerName: '',
    signerTitle: '',
    signerDate: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [message, setMessage] = useState('');

  const years = ['2024', '2023', '2022', '2021'];
  const recipients = [
    { id: 'V001', name: 'Tech Solutions Inc' },
    { id: 'V002', name: 'Marketing Pro Agency' },
    { id: 'V003', name: 'John Smith Consulting' },
    { id: 'V004', name: 'Design Studio LLC' },
    { id: 'V005', name: 'Office Supplies Co' }
  ];

  // Mock data for selected recipient
  useEffect(() => {
    if (selectedRecipient) {
      const recipient = recipients.find(r => r.id === selectedRecipient);
      if (recipient) {
        setFormData({
          recipientName: recipient.name,
          recipientTin: '12-3456789',
          address: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          nonemployeeCompensation: 12500,
          federalIncomeTaxWithheld: 3000
        });
      }
    }
  }, [selectedRecipient]);

  const handleGenerateOfficialPDF = async () => {
    setIsGenerating(true);
    setMessage('Generating official 1099-NEC PDF...');
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setMessage('Official 1099-NEC PDF generated successfully!');
    setIsGenerating(false);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePrint1099 = () => {
    window.print();
  };

  const handleApplySignature = async () => {
    if (!signature.signerName || !signature.signerTitle || !signature.signerDate) {
      setMessage('Please complete all signature fields');
      return;
    }

    setIsSigning(true);
    setMessage('Applying digital signature...');
    
    // Simulate signature application
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMessage('Digital signature applied successfully!');
    setIsSigning(false);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <DashboardLayout 
      title="1099 Form Generation"
      description="Generate and sign 1099-NEC forms for vendors"
    >
      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
            : 'bg-blue-500/20 border border-blue-500/30 text-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* Controls */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 font-medium">Reporting Year:</label>
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
              <label className="text-slate-300 font-medium">Select Recipient:</label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select vendor</option>
                {recipients.map(recipient => (
                  <option key={recipient.id} value={recipient.id}>{recipient.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint1099}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Print 1099-NEC</span>
            </button>
            
            <button
              onClick={handleGenerateOfficialPDF}
              disabled={isGenerating || !selectedRecipient}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Official PDF'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span>Official PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1099-NEC Form */}
      {selectedRecipient && (
        <div className="bg-white rounded-xl border border-slate-700 p-8 mb-6">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Form 1099-NEC</h2>
            <p className="text-slate-600">Nonemployee Compensation</p>
            <p className="text-slate-500 text-sm">Copy B - For Recipient</p>
            <div className="mt-2 text-slate-600 text-sm">
              For the year {selectedYear}
            </div>
          </div>

          {/* Payer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Payer Information</h3>
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
                  <span className="w-32 text-slate-600">TIN:</span>
                  <span className="font-medium">12-3456789</span>
                </div>
              </div>
            </div>
            
            {/* Recipient Information */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Recipient Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-slate-600">Name:</span>
                  <span className="font-medium">{formData.recipientName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">Address:</span>
                  <span className="font-medium">{formData.address}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">City/State/ZIP:</span>
                  <span className="font-medium">{formData.city}, {formData.state} {formData.zip}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">TIN:</span>
                  <span className="font-medium">{formData.recipientTin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1099-NEC Boxes */}
          <div className="border-2 border-slate-300 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-3 gap-4">
              {/* Box 1 - Nonemployee Compensation */}
              <div className="text-center">
                <div className="border-2 border-slate-400 rounded p-4">
                  <div className="font-bold text-slate-900 mb-2">Box 1</div>
                  <div className="text-xs text-slate-600 mb-2">Nonemployee compensation</div>
                  <div className="text-xl font-bold">{formatCurrency(formData.nonemployeeCompensation)}</div>
                </div>
              </div>

              {/* Box 4 - Federal Income Tax Withheld */}
              <div className="text-center">
                <div className="border-2 border-slate-400 rounded p-4">
                  <div className="font-bold text-slate-900 mb-2">Box 4</div>
                  <div className="text-xs text-slate-600 mb-2">Federal income tax withheld</div>
                  <div className="text-xl font-bold">{formatCurrency(formData.federalIncomeTaxWithheld)}</div>
                </div>
              </div>

              {/* Box 7 - Payer's TIN */}
              <div className="text-center">
                <div className="border-2 border-slate-400 rounded p-4">
                  <div className="font-bold text-slate-900 mb-2">Box 7</div>
                  <div className="text-xs text-slate-600 mb-2">Payer's TIN</div>
                  <div className="text-xl font-bold">12-3456789</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p className="font-semibold mb-1">Form Information</p>
                <p>This 1099-NEC form reports nonemployee compensation of {formatCurrency(formData.nonemployeeCompensation)} paid to {formData.recipientName} for the tax year {selectedYear}.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Authority */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-white font-semibold mb-4">Digital Signature Authority</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Signer Name
            </label>
            <input
              type="text"
              value={signature.signerName}
              onChange={(e) => setSignature(prev => ({ ...prev, signerName: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter signer name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Signer Title
            </label>
            <input
              type="text"
              value={signature.signerTitle}
              onChange={(e) => setSignature(prev => ({ ...prev, signerTitle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter signer title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={signature.signerDate}
              onChange={(e) => setSignature(prev => ({ ...prev, signerDate: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            Apply digital signature to validate this 1099-NEC form
          </div>
          
          <button
            onClick={handleApplySignature}
            disabled={isSigning}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PenTool className={`w-4 h-4 ${isSigning ? 'animate-pulse' : ''}`} />
            <span>{isSigning ? 'Signing...' : 'Apply Signature'}</span>
          </button>
        </div>
        
        {/* Signature Status */}
        {signature.signerName && signature.signerTitle && signature.signerDate && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="text-green-200 text-sm">
                <p className="font-semibold">Digital Signature Applied</p>
                <p>Signed by {signature.signerName}, {signature.signerTitle} on {signature.signerDate}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
