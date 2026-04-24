'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Building2, Shield, Save, Upload, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';

interface CompanyProfile {
  companyName: string;
  ein: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
}

interface ComplianceSettings {
  taxYear: string;
  filingFrequency: string;
  withholdingRates: {
    federal: number;
    socialSecurity: number;
    medicare: number;
  };
  stateTaxes: {
    state: string;
    rate: number;
  }[];
  deadlineReminders: boolean;
  autoFile: boolean;
}

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState<'profile' | 'compliance'>('profile');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    companyName: '',
    ein: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: ''
  });
  
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>({
    taxYear: '2024',
    filingFrequency: 'monthly',
    withholdingRates: {
      federal: 15.0,
      socialSecurity: 6.2,
      medicare: 1.45
    },
    stateTaxes: [
      { state: 'NY', rate: 6.5 },
      { state: 'CA', rate: 9.3 }
    ],
    deadlineReminders: true,
    autoFile: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        
        const data = await res.json();
        setSettings(data);
        
        // Transform company data
        setCompanyProfile({
          companyName: data.company?.legalName || '',
          ein: data.company?.ein || '',
          address: data.company?.address || '',
          city: data.company?.city || '',
          state: data.company?.state || '',
          zip: data.company?.zipCode || '',
          phone: data.company?.phone || '',
          email: data.company?.email || '',
          website: data.company?.website || ''
        });
        
        // Transform compliance data
        setComplianceSettings({
          taxYear: data.company?.taxYear || '2024',
          filingFrequency: data.compliance?.filingFrequency?.toLowerCase() || 'monthly',
          withholdingRates: {
            federal: 15.0,
            socialSecurity: 6.2,
            medicare: 1.45
          },
          stateTaxes: [
            { state: data.company?.state || 'NY', rate: 6.5 }
          ],
          deadlineReminders: data.settings?.complianceAlerts ?? true,
          autoFile: false
        });
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleProfileChange = (field: keyof CompanyProfile, value: string) => {
    setCompanyProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleComplianceChange = (field: string, value: any) => {
    setComplianceSettings(prev => ({ ...prev, [field]: value }));
  };

  const formatEIN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`;
    }
    return numbers;
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    
    if (!companyProfile.companyName) newErrors.companyName = 'Company name is required';
    if (!companyProfile.ein) newErrors.ein = 'EIN is required';
    if (!/^\d{2}-\d{7}$/.test(companyProfile.ein)) newErrors.ein = 'Invalid EIN format (XX-XXXXXXX)';
    if (!companyProfile.address) newErrors.address = 'Address is required';
    if (!companyProfile.city) newErrors.city = 'City is required';
    if (!companyProfile.state) newErrors.state = 'State is required';
    if (!companyProfile.zip) newErrors.zip = 'ZIP code is required';
    if (!/^\d{5}$/.test(companyProfile.zip)) newErrors.zip = 'Invalid ZIP format';
    if (!companyProfile.email) newErrors.email = 'Email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateProfile()) {
      try {
        setMessage('Saving company profile...');
        
        const res = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'company',
            data: {
              legalName: companyProfile.companyName,
              ein: companyProfile.ein,
              address: companyProfile.address,
              city: companyProfile.city,
              state: companyProfile.state,
              zipCode: companyProfile.zip,
              phone: companyProfile.phone,
              email: companyProfile.email,
              website: companyProfile.website
            }
          })
        });

        if (!res.ok) throw new Error('Failed to save profile');

        setMessage('Company profile saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('Failed to save company profile');
        console.error('Profile save error:', err);
      }
    }
  };

  const handleSaveCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setMessage('Saving compliance settings...');
      
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'compliance',
          data: {
            filingFrequency: complianceSettings.filingFrequency.toUpperCase(),
            deadlineReminders: complianceSettings.deadlineReminders
          }
        })
      });

      if (!res.ok) throw new Error('Failed to save compliance settings');

      setMessage('Compliance settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save compliance settings');
      console.error('Compliance save error:', err);
    }
  };

  const handleAddStateTax = () => {
    setComplianceSettings(prev => ({
      ...prev,
      stateTaxes: [...prev.stateTaxes, { state: '', rate: 0 }]
    }));
  };

  const handleRemoveStateTax = (index: number) => {
    setComplianceSettings(prev => ({
      ...prev,
      stateTaxes: prev.stateTaxes.filter((_, i) => i !== index)
    }));
  };

  const handleStateTaxChange = (index: number, field: 'state' | 'rate', value: string | number) => {
    setComplianceSettings(prev => ({
      ...prev,
      stateTaxes: prev.stateTaxes.map((tax, i) => 
        i === index ? { ...tax, [field]: value } : tax
      )
    }));
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <DashboardLayout 
      title="Settings"
      description="Manage company profile and compliance settings"
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

      {/* Tab Navigation */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-1 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedTab('profile')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'profile'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setSelectedTab('compliance')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'compliance'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Compliance
          </button>
        </div>
      </div>

      {/* Company Profile Tab */}
      {selectedTab === 'profile' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold text-lg">Company Information</h3>
          </div>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyProfile.companyName}
                  onChange={(e) => handleProfileChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  EIN
                </label>
                <input
                  type="text"
                  value={companyProfile.ein}
                  onChange={(e) => handleProfileChange('ein', formatEIN(e.target.value))}
                  maxLength={10}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XX-XXXXXXX"
                />
                {errors.ein && (
                  <p className="text-red-400 text-xs mt-1">{errors.ein}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={companyProfile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
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
                <input
                  type="text"
                  value={companyProfile.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State
                </label>
                <select
                  value={companyProfile.state}
                  onChange={(e) => handleProfileChange('state', e.target.value)}
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
                  value={companyProfile.zip}
                  onChange={(e) => handleProfileChange('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00000"
                />
                {errors.zip && (
                  <p className="text-red-400 text-xs mt-1">{errors.zip}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={companyProfile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={companyProfile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@company.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={companyProfile.website}
                  onChange={(e) => handleProfileChange('website', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compliance Tab */}
      {selectedTab === 'compliance' && (
        <div className="space-y-6">
          {/* Tax Settings */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold text-lg">Tax Settings</h3>
            </div>
            
            <form onSubmit={handleSaveCompliance} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tax Year
                  </label>
                  <select
                    value={complianceSettings.taxYear}
                    onChange={(e) => handleComplianceChange('taxYear', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Filing Frequency
                  </label>
                  <select
                    value={complianceSettings.filingFrequency}
                    onChange={(e) => handleComplianceChange('filingFrequency', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Withholding Rates (%)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Federal
                    </label>
                    <input
                      type="number"
                      value={complianceSettings.withholdingRates.federal}
                      onChange={(e) => handleComplianceChange('withholdingRates', {
                        ...complianceSettings.withholdingRates,
                        federal: parseFloat(e.target.value) || 0
                      })}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Social Security
                    </label>
                    <input
                      type="number"
                      value={complianceSettings.withholdingRates.socialSecurity}
                      onChange={(e) => handleComplianceChange('withholdingRates', {
                        ...complianceSettings.withholdingRates,
                        socialSecurity: parseFloat(e.target.value) || 0
                      })}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Medicare
                    </label>
                    <input
                      type="number"
                      value={complianceSettings.withholdingRates.medicare}
                      onChange={(e) => handleComplianceChange('withholdingRates', {
                        ...complianceSettings.withholdingRates,
                        medicare: parseFloat(e.target.value) || 0
                      })}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">State Taxes</h4>
                  <button
                    type="button"
                    onClick={handleAddStateTax}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add State</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {complianceSettings.stateTaxes.map((tax, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <select
                        value={tax.state}
                        onChange={(e) => handleStateTaxChange(index, 'state', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select state</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        value={tax.rate}
                        onChange={(e) => handleStateTaxChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Rate %"
                        className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveStateTax(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300">Deadline Reminders</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceSettings.deadlineReminders}
                      onChange={(e) => handleComplianceChange('deadlineReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-slate-300">Auto File Taxes</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceSettings.autoFile}
                      onChange={(e) => handleComplianceChange('autoFile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
          
          {/* Compliance Status */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-4">Compliance Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-green-400 font-medium">Company Profile Complete</p>
                    <p className="text-green-300 text-sm">All required information is provided</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-yellow-400 font-medium">State Tax Configuration</p>
                    <p className="text-yellow-300 text-sm">Some states may require additional setup</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-blue-400 font-medium">Tax Rates Updated</p>
                    <p className="text-blue-300 text-sm">Current rates for 2024 tax year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
