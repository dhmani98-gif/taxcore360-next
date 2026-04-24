'use client';

import { useState } from 'react';
import { X, Building2, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface VendorData {
  vendorId: string;
  legalName: string;
  email: string;
  phone?: string;
  taxIdType: 'EIN' | 'SSN';
  taxId: string;
  entityType: string;
  state: string;
  zipCode: string;
  address: string;
}

interface AddVendorModalProps {
  onClose: () => void;
  onSave: (vendor: VendorData) => void;
}

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const entityTypes = [
  'Individual',
  'Sole Proprietorship',
  'LLC Single Member',
  'LLC Partnership',
  'LLC C Corp',
  'LLC S Corp',
  'C Corporation',
  'S Corporation',
  'Partnership',
  'Trust',
  'Estate',
  'Nonprofit'
];

export default function AddVendorModal({ onClose, onSave }: AddVendorModalProps) {
  const [formData, setFormData] = useState<VendorData>({
    vendorId: '',
    legalName: '',
    email: '',
    phone: '',
    taxIdType: 'EIN',
    taxId: '',
    entityType: '',
    state: '',
    zipCode: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState({
    tinFormat: false,
    zipFormat: false,
    zipStateMatch: false,
    entityLogic: false
  });

  const handleInputChange = (field: keyof VendorData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validate TIN format
    if (field === 'taxId') {
      const tinValue = value.replace(/\D/g, '');
      const isSSN = formData.taxIdType === 'SSN';
      const isValid = isSSN ? tinValue.length === 9 : /^\d{2}-\d{7}$/.test(value);
      setValidation(prev => ({ ...prev, tinFormat: isValid }));
    }

    // Validate ZIP format
    if (field === 'zipCode') {
      const zipValue = value.replace(/\D/g, '');
      const isValid = zipValue.length === 5;
      setValidation(prev => ({ ...prev, zipFormat: isValid }));
      
      // Check ZIP/State match
      if (isValid && formData.state) {
        // Simplified ZIP to state mapping (in real app, use comprehensive mapping)
        const zipStateMap: Record<string, string> = {
          '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'CA',
          '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY',
          '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX',
          '33': 'FL', '32': 'FL', '34': 'FL',
          '60': 'IL', '61': 'IL', '62': 'IL', '63': 'IL'
        };
        const expectedState = zipStateMap[zipValue.slice(0, 2)] || '';
        const matches = expectedState === formData.state;
        setValidation(prev => ({ ...prev, zipStateMatch: matches }));
      }
    }

    // Entity logic
    if (field === 'entityType') {
      const exemptEntities = ['C Corporation', 'S Corporation', 'Nonprofit'];
      const needs1099 = !exemptEntities.includes(value);
      setValidation(prev => ({ ...prev, entityLogic: needs1099 }));
    }
  };

  const formatTIN = (value: string, type: 'EIN' | 'SSN') => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'SSN') {
      if (numbers.length >= 6) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
      } else if (numbers.length >= 3) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      }
      return numbers;
    } else {
      // EIN format: XX-XXXXXXX
      if (numbers.length >= 2) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`;
      }
      return numbers;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId) newErrors.vendorId = 'Vendor ID is required';
    if (!formData.legalName) newErrors.legalName = 'Legal name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.taxId) newErrors.taxId = 'Tax ID is required';
    if (!validation.tinFormat) newErrors.taxId = 'Invalid Tax ID format';
    if (!formData.entityType) newErrors.entityType = 'Entity type is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!validation.zipFormat) newErrors.zipCode = 'Invalid ZIP format';
    if (!formData.address) newErrors.address = 'Address is required';

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
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New Vendor</h2>
            <p className="text-slate-400 text-sm mt-1">Enter vendor information for 1099 tracking</p>
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
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Vendor Information</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vendor ID
                </label>
                <input
                  type="text"
                  value={formData.vendorId}
                  onChange={(e) => handleInputChange('vendorId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter vendor ID"
                />
                {errors.vendorId && (
                  <p className="text-red-400 text-xs mt-1">{errors.vendorId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Legal Name
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter legal name"
                />
                {errors.legalName && (
                  <p className="text-red-400 text-xs mt-1">{errors.legalName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone ?? ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tax ID Type
                </label>
                <select
                  value={formData.taxIdType}
                  onChange={(e) => handleInputChange('taxIdType', e.target.value as 'EIN' | 'SSN')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EIN">EIN</option>
                  <option value="SSN">SSN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', formatTIN(e.target.value, formData.taxIdType))}
                  maxLength={formData.taxIdType === 'SSN' ? 11 : 10}
                  className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validation.tinFormat ? 'border-green-500' : 'border-slate-600'
                  }`}
                  placeholder={formData.taxIdType === 'SSN' ? '000-00-0000' : '00-0000000'}
                />
                {errors.taxId && (
                  <p className="text-red-400 text-xs mt-1">{errors.taxId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Entity Type
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => handleInputChange('entityType', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select entity type</option>
                  {entityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.entityType && (
                  <p className="text-red-400 text-xs mt-1">{errors.entityType}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Address Information</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-400 text-xs mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validation.zipFormat ? 'border-green-500' : 'border-slate-600'
                  }`}
                  placeholder="00000"
                />
                {errors.zipCode && (
                  <p className="text-red-400 text-xs mt-1">{errors.zipCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter street address"
                />
                {errors.address && (
                  <p className="text-red-400 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* Validation Box */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-medium text-sm">Validation Box</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">TIN Validation</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    validation.tinFormat ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {validation.tinFormat ? 'Format valid' : 'Format invalid'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">ZIP/State check</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    validation.zipStateMatch ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {validation.zipStateMatch ? 'Matched' : 'Check needed'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Entity Logic</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    validation.entityLogic ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {validation.entityLogic ? 'Track for $600+' : 'Likely exempt'}
                  </span>
                </div>
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
              Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
