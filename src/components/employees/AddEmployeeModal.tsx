'use client';

import { useState } from 'react';
import { X, User, MapPin, Briefcase, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface EmployeeData {
  employeeId: string;
  firstName: string;
  lastName: string;
  ssn: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  grossPay: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface AddEmployeeModalProps {
  onClose: () => void;
  onSave: (employee: EmployeeData) => void;
}

const departments = [
  'Engineering',
  'Sales', 
  'Marketing',
  'Operations',
  'Finance',
  'Human Resources',
  'Customer Support',
  'Product'
];

const cities = [
  { name: 'New York', state: 'NY' },
  { name: 'Los Angeles', state: 'CA' },
  { name: 'Chicago', state: 'IL' },
  { name: 'Houston', state: 'TX' },
  { name: 'Phoenix', state: 'AZ' },
  { name: 'Philadelphia', state: 'PA' },
  { name: 'San Antonio', state: 'TX' },
  { name: 'San Diego', state: 'CA' },
  { name: 'Dallas', state: 'TX' },
  { name: 'San Jose', state: 'CA' }
];

export default function AddEmployeeModal({ onClose, onSave }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    ssn: '',
    department: '',
    jobTitle: '',
    hireDate: '',
    grossPay: 0,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState({
    ssnFormat: false,
    zipFormat: false
  });

  const handleInputChange = (field: keyof EmployeeData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validate SSN format
    if (field === 'ssn') {
      const ssnValue = value as string;
      const isValid = /^\d{3}-\d{2}-\d{4}$/.test(ssnValue);
      setValidation(prev => ({ ...prev, ssnFormat: isValid }));
    }

    // Validate ZIP format
    if (field === 'zipCode') {
      const zipValue = value as string;
      const isValid = /^\d{5}$/.test(zipValue);
      setValidation(prev => ({ ...prev, zipFormat: isValid }));
    }

    // Auto-fill state when city is selected
    if (field === 'city') {
      const selectedCity = cities.find(city => city.name === value);
      if (selectedCity) {
        setFormData(prev => ({ ...prev, state: selectedCity.state }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.ssn) newErrors.ssn = 'SSN is required';
    if (!validation.ssnFormat) newErrors.ssn = 'Invalid SSN format (XXX-XX-XXXX)';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
    if (!formData.grossPay || formData.grossPay <= 0) newErrors.grossPay = 'Valid gross pay is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!validation.zipFormat) newErrors.zipCode = 'Invalid ZIP format (XXXXX)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate employee ID if not provided
      const employeeData = {
        ...formData,
        employeeId: formData.employeeId || `EMP${String(Date.now()).slice(-3)}`,
        fullName: `${formData.firstName} ${formData.lastName}`
      };
      
      onSave(employeeData);
    }
  };

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
    } else if (numbers.length >= 3) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }
    return numbers;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New Employee</h2>
            <p className="text-slate-400 text-sm mt-1">Create a full employee record for payroll processing</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Basic Information</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SSN
                </label>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', formatSSN(e.target.value))}
                  maxLength={11}
                  className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validation.ssnFormat ? 'border-green-500' : 'border-slate-600'
                  }`}
                  placeholder="000-00-0000"
                />
                {errors.ssn && (
                  <p className="text-red-400 text-xs mt-1">{errors.ssn}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-400 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter job title"
                />
                {errors.jobTitle && (
                  <p className="text-red-400 text-xs mt-1">{errors.jobTitle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.hireDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.hireDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gross Pay (Monthly)
                </label>
                <input
                  type="number"
                  value={formData.grossPay}
                  onChange={(e) => handleInputChange('grossPay', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                {errors.grossPay && (
                  <p className="text-red-400 text-xs mt-1">{errors.grossPay}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Address</span>
              </h3>
              
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-300"
                  placeholder="Auto-filled"
                />
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
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Status</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Validation Box */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-medium text-sm">Validation Box</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">TIN Validation</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    validation.ssnFormat ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {validation.ssnFormat ? 'Format valid' : 'Format invalid'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">ZIP/State check</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    validation.zipFormat ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {validation.zipFormat ? 'Matched' : 'Invalid'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Entity Logic</span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    Track for $600+
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
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
