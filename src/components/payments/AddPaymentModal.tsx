'use client';

import { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Camera } from 'lucide-react';

interface PaymentData {
  vendor: string;
  paymentDate: string;
  invoiceNumber: string;
  amount: number;
  paymentState: string;
  invoiceDocument: File | null;
  ocrText: string;
}

interface AddPaymentModalProps {
  onClose: () => void;
  onSave: (payment: PaymentData) => void;
  vendors?: Array<{ id: string; vendorId: string; legalName: string }>;
}

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const vendors = [
  { id: 'V001', name: 'Tech Solutions Inc' },
  { id: 'V002', name: 'Marketing Pro Agency' },
  { id: 'V003', name: 'John Smith Consulting' },
  { id: 'V004', name: 'Design Studio LLC' },
  { id: 'V005', name: 'Office Supplies Co' }
];

export default function AddPaymentModal({ onClose, onSave, vendors: vendorOptions }: AddPaymentModalProps) {
  const [formData, setFormData] = useState<PaymentData>({
    vendor: '',
    paymentDate: '',
    invoiceNumber: '',
    amount: 0,
    paymentState: '',
    invoiceDocument: null,
    ocrText: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const handleInputChange = (field: keyof PaymentData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, invoiceDocument: 'Invalid file type. Please upload PDF, PNG, JPG, or TXT' }));
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({ ...prev, invoiceDocument: 'File size must be less than 10MB' }));
        return;
      }
      
      handleInputChange('invoiceDocument', file);
      setErrors(prev => ({ ...prev, invoiceDocument: '' }));
    }
  };

  const handleOCRScan = async () => {
    if (!formData.invoiceDocument) {
      setScanMessage('Please upload an invoice document first');
      return;
    }

    setIsScanning(true);
    setScanMessage('Scanning document with OCR...');

    // Simulate OCR scanning
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR results
    const mockOCRText = `
Invoice Number: INV-2024-123
Date: 01/15/2024
Amount: $5,250.00
Vendor: Tech Solutions Inc
Description: Software Development Services
Payment Terms: Net 30
    `.trim();

    setFormData(prev => ({ ...prev, ocrText: mockOCRText }));
    setScanMessage('OCR scan completed successfully!');
    setIsScanning(false);

    // Extract invoice number from OCR text (simplified)
    const invoiceMatch = mockOCRText.match(/Invoice Number:\s*(.+)/);
    if (invoiceMatch && !formData.invoiceNumber) {
      setFormData(prev => ({ ...prev, invoiceNumber: invoiceMatch[1].trim() }));
    }

    // Extract amount from OCR text (simplified)
    const amountMatch = mockOCRText.match(/Amount:\s*\$(.+)/);
    if (amountMatch && formData.amount === 0) {
      const amount = parseFloat(amountMatch[1].replace(',', ''));
      setFormData(prev => ({ ...prev, amount }));
    }

    setTimeout(() => setScanMessage(''), 3000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.invoiceNumber) newErrors.invoiceNumber = 'Invoice number is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.paymentState) newErrors.paymentState = 'Payment state is required';
    if (!formData.invoiceDocument) newErrors.invoiceDocument = 'Invoice document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Add Vendor Payment</h2>
            <p className="text-slate-400 text-sm mt-1">Record vendor payment and attach invoice document</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Payment Information</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vendor
                </label>
                <select
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select vendor</option>
                  {(vendorOptions && vendorOptions.length > 0
                    ? vendorOptions.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.legalName} ({vendor.vendorId})
                        </option>
                      ))
                    : vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))
                    )}
                </select>
                {errors.vendor && (
                  <p className="text-red-400 text-xs mt-1">{errors.vendor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.paymentDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.paymentDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter invoice number"
                />
                {errors.invoiceNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.invoiceNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment State
                </label>
                <select
                  value={formData.paymentState}
                  onChange={(e) => handleInputChange('paymentState', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.paymentState && (
                  <p className="text-red-400 text-xs mt-1">{errors.paymentState}</p>
                )}
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Invoice Document</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload Invoice
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="invoice-upload"
                  />
                  <label htmlFor="invoice-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-300 text-sm mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-slate-500 text-xs">
                      PDF, PNG, JPG, or TXT (max 10MB)
                    </p>
                  </label>
                </div>
                
                {formData.invoiceDocument && (
                  <div className="mt-3 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300 text-sm">{formData.invoiceDocument.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('invoiceDocument', null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {errors.invoiceDocument && (
                  <p className="text-red-400 text-xs mt-1">{errors.invoiceDocument}</p>
                )}
              </div>

              {/* OCR Auto-Scan Section */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium text-sm mb-3">OCR Auto-Scan</h4>
                
                <button
                  type="button"
                  onClick={handleOCRScan}
                  disabled={isScanning || !formData.invoiceDocument}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className={`w-4 h-4 ${isScanning ? 'animate-pulse' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Auto-Scan Document'}</span>
                </button>
                
                {scanMessage && (
                  <div className={`mt-3 p-2 rounded text-xs ${
                    scanMessage.includes('successfully') 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {scanMessage}
                  </div>
                )}
              </div>

              {/* OCR Results */}
              {formData.ocrText && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-white font-medium text-sm mb-3">OCR Results</h4>
                  <textarea
                    value={formData.ocrText}
                    onChange={(e) => handleInputChange('ocrText', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                    placeholder="OCR extracted text will appear here..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-blue-200 text-sm">
                <p className="font-semibold mb-1">Message</p>
                <p>Invoice uploaded successfully. OCR scan has extracted key information. Please review and confirm all payment details before saving.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
