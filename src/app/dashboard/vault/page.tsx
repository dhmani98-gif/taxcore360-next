'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Upload, FolderOpen, FileText, Download, Search, Eye, Trash2, Calendar } from 'lucide-react';

interface VaultFile {
  id: string;
  vendorId?: string;
  vendorName: string;
  category: 'W_9_FORMS' | 'INVOICES' | 'CONTRACTS' | 'RECEIPTS' | 'TAX_DOCUMENTS' | 'CORRESPONDENCE' | 'COMPLIANCE' | 'OTHER';
  documentName: string;
  documentYear: string;
  uploadedAt: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
}

export default function VaultPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<VaultFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState('ALL');

  const [uploadForm, setUploadForm] = useState({
    targetVendor: '',
    category: '',
    description: '',
    notes: '',
    file: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadMessage, setUploadMessage] = useState('');

  const categories = [
    'ALL', 'W-9 Forms', 'Invoices', 'Contracts', 'Receipts', 'Tax Documents', 
    'Correspondence', 'Compliance', 'Other'
  ];

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [documentsRes, vendorsRes] = await Promise.all([
          fetch('/api/vault'),
          fetch('/api/vendors')
        ]);

        if (!documentsRes.ok || !vendorsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [documents, vendorsData] = await Promise.all([
          documentsRes.json(),
          vendorsRes.json()
        ]);

        setVendors(vendorsData);
        setFiles(documents);
        setFilteredFiles(documents);
      } catch (err) {
        setError('Failed to load vault data');
        console.error('Error fetching vault data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter files
  useEffect(() => {
    let filtered = files;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      const categoryMap: Record<string, string> = {
        'W-9 Forms': 'W_9_FORMS',
        'Invoices': 'INVOICES',
        'Contracts': 'CONTRACTS',
        'Receipts': 'RECEIPTS',
        'Tax Documents': 'TAX_DOCUMENTS',
        'Correspondence': 'CORRESPONDENCE',
        'Compliance': 'COMPLIANCE',
        'Other': 'OTHER'
      };
      filtered = filtered.filter(file => file.category === categoryMap[selectedCategory]);
    }

    // Vendor filter
    if (selectedVendor !== 'ALL') {
      filtered = filtered.filter(file => file.vendorName === selectedVendor);
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedCategory, selectedVendor]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Invalid file type. Please upload PDF, PNG, JPG, or TXT' }));
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setErrors(prev => ({ ...prev, file: 'File size must be less than 50MB' }));
        return;
      }
      
      setUploadForm(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!uploadForm.targetVendor) newErrors.targetVendor = 'Target vendor is required';
    if (!uploadForm.category) newErrors.category = 'Category is required';
    if (!uploadForm.description) newErrors.description = 'Description is required';
    if (!uploadForm.file) newErrors.file = 'File is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const uploadedFile = uploadForm.file;
    if (!uploadedFile) {
      return;
    }

    setUploadMessage('Uploading document...');
    
    try {
      // Create file URL (in real app, upload to storage service)
      const fileUrl = `/vault-docs/${Date.now()}_${uploadedFile.name}`;
      
      // Map category to enum
      const categoryMap: Record<string, string> = {
        'W-9 Forms': 'W_9_FORMS',
        'Invoices': 'INVOICES',
        'Contracts': 'CONTRACTS',
        'Receipts': 'RECEIPTS',
        'Tax Documents': 'TAX_DOCUMENTS',
        'Correspondence': 'CORRESPONDENCE',
        'Compliance': 'COMPLIANCE',
        'Other': 'OTHER'
      };
      
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: uploadedFile.name,
          category: categoryMap[uploadForm.category],
          documentYear: new Date().getFullYear().toString(),
          vendorId: uploadForm.targetVendor || null,
          description: uploadForm.description,
          fileUrl,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type
        })
      });

      if (!res.ok) throw new Error('Failed to upload document');

      const newDocument = await res.json();
      setFiles(prev => [...prev, newDocument]);
      setUploadMessage('Document uploaded successfully!');
      
      // Reset form
      setUploadForm({
        targetVendor: '',
        category: '',
        description: '',
        notes: '',
        file: null
      });
      
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (err) {
      setUploadMessage('Failed to upload document');
      console.error('Upload error:', err);
    }
  };

  const handleViewDocument = (fileId: string) => {
    // In real implementation, this would open the document
    console.log(`Viewing document ${fileId}`);
  };

  const handleDeleteDocument = async (fileId: string) => {
    try {
      const res = await fetch(`/api/vault?id=${fileId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete document');

      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'W_9_FORMS': 'bg-blue-500/20 text-blue-400',
      'INVOICES': 'bg-green-500/20 text-green-400',
      'CONTRACTS': 'bg-purple-500/20 text-purple-400',
      'RECEIPTS': 'bg-orange-500/20 text-orange-400',
      'TAX_DOCUMENTS': 'bg-red-500/20 text-red-400',
      'CORRESPONDENCE': 'bg-yellow-500/20 text-yellow-400',
      'COMPLIANCE': 'bg-indigo-500/20 text-indigo-400',
      'OTHER': 'bg-slate-500/20 text-slate-400'
    };
    
    const displayNames = {
      'W_9_FORMS': 'W-9 Forms',
      'INVOICES': 'Invoices',
      'CONTRACTS': 'Contracts',
      'RECEIPTS': 'Receipts',
      'TAX_DOCUMENTS': 'Tax Documents',
      'CORRESPONDENCE': 'Correspondence',
      'COMPLIANCE': 'Compliance',
      'OTHER': 'Other'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[category as keyof typeof colors] || colors.OTHER
      }`}>
        {displayNames[category as keyof typeof displayNames] || category}
      </span>
    );
  };

  return (
    <DashboardLayout 
      title="Vault"
      description="Secure document storage and management"
    >
      {/* Loading/Error */}
      {loading && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <p className="text-slate-400 text-center">Loading vault data...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">File Upload Form</h3>
        
        <form onSubmit={handleSubmitUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Target Vendor
            </label>
            <select
              value={uploadForm.targetVendor}
              onChange={(e) => setUploadForm(prev => ({ ...prev, targetVendor: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select vendor</option>
            <option value="">No vendor</option>
            {vendors.map(vendor => (
              <option key={vendor.vendorId} value={vendor.vendorId}>{vendor.legalName}</option>
            ))}
            </select>
            {errors.targetVendor && (
              <p className="text-red-400 text-xs mt-1">{errors.targetVendor}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={uploadForm.category}
              onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.filter(c => c !== 'ALL').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description/Notes
            </label>
            <input
              type="text"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              File Attachment
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-300 text-sm mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-slate-500 text-xs">
                  PDF, PNG, JPG, or TXT (max 50MB)
                </p>
              </label>
            </div>
            
            {uploadForm.file && (
              <div className="mt-3 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">{uploadForm.file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {errors.file && (
              <p className="text-red-400 text-xs mt-1">{errors.file}</p>
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upload Document
            </button>
          </div>
        </form>

        {uploadMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            uploadMessage.includes('successfully')
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {uploadMessage}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Vendors</option>
            {vendors.map(vendor => (
              <option key={vendor.vendorId} value={vendor.legalName}>{vendor.legalName}</option>
            ))}
          </select>
        </div>
        
        <div className="text-slate-400 text-sm">
          {filteredFiles.length} documents
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-white font-semibold">Files</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{file.vendorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getCategoryBadge(file.category)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{file.documentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{file.uploadedAt?.split('T')[0] || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{file.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDocument(file.id)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Document</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(file.id)}
                          className="flex items-center space-x-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
