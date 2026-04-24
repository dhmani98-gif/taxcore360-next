'use client';

import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { formatSSN, formatEIN, formatCurrency, isValidSSN, isValidEIN } from '@/lib/export';

interface W2FormData {
  // Employer Information
  employerName: string;
  employerEIN: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  
  // Employee Information
  employeeName: string;
  employeeSSN: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  
  // Wage Information (Boxes 1-14)
  box1_wages: number;           // Wages, tips, other compensation
  box2_federalTax: number;     // Federal income tax withheld
  box3_ssWages: number;        // Social security wages
  box4_ssTax: number;          // Social security tax withheld
  box5_medicareWages: number;  // Medicare wages and tips
  box6_medicareTax: number;    // Medicare tax withheld
  box7_ssTips: number;         // Social security tips
  box8_allocatedTips: number;  // Allocated tips
  box10_dependentCare: number; // Dependent care benefits
  box11_nonqualified: number;   // Nonqualified plans
  
  // Box 12 - Various codes
  box12a_code: string;
  box12a_amount: number;
  box12b_code: string;
  box12b_amount: number;
  box12c_code: string;
  box12c_amount: number;
  box12d_code: string;
  box12d_amount: number;
  
  // Checkboxes
  statutoryEmployee: boolean;
  retirementPlan: boolean;
  thirdPartySickPay: boolean;
  
  // State Information (Boxes 15-20)
  box15_state: string;
  box15_stateId: string;
  box16_stateWages: number;
  box17_stateTax: number;
  box18_localWages: number;
  box19_localTax: number;
  box20_locality: string;
}

const DEFAULT_FORM_DATA: W2FormData = {
  employerName: '',
  employerEIN: '',
  employerAddress: '',
  employerCity: '',
  employerState: '',
  employerZip: '',
  employeeName: '',
  employeeSSN: '',
  employeeAddress: '',
  employeeCity: '',
  employeeState: '',
  employeeZip: '',
  box1_wages: 0,
  box2_federalTax: 0,
  box3_ssWages: 0,
  box4_ssTax: 0,
  box5_medicareWages: 0,
  box6_medicareTax: 0,
  box7_ssTips: 0,
  box8_allocatedTips: 0,
  box10_dependentCare: 0,
  box11_nonqualified: 0,
  box12a_code: '',
  box12a_amount: 0,
  box12b_code: '',
  box12b_amount: 0,
  box12c_code: '',
  box12c_amount: 0,
  box12d_code: '',
  box12d_amount: 0,
  statutoryEmployee: false,
  retirementPlan: false,
  thirdPartySickPay: false,
  box15_state: '',
  box15_stateId: '',
  box16_stateWages: 0,
  box17_stateTax: 0,
  box18_localWages: 0,
  box19_localTax: 0,
  box20_locality: '',
};

export default function W2FormGenerator() {
  const [formData, setFormData] = useState<W2FormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<string[]>([]);
  const [year] = useState(new Date().getFullYear());

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.employerName) newErrors.push('Employer name is required');
    if (!isValidEIN(formData.employerEIN)) newErrors.push('Valid Employer EIN is required');
    if (!formData.employeeName) newErrors.push('Employee name is required');
    if (!isValidSSN(formData.employeeSSN)) newErrors.push('Valid Employee SSN is required');
    if (formData.box1_wages < 0) newErrors.push('Wages cannot be negative');
    if (formData.box2_federalTax < 0) newErrors.push('Federal tax cannot be negative');
    
    // Validate social security wage base limit (2024: $168,600)
    const ssWageLimit = 168600;
    if (formData.box3_ssWages > ssWageLimit) {
      newErrors.push(`Social Security wages cannot exceed $${ssWageLimit.toLocaleString()} for ${year}`);
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;

    try {
      // Create new PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // US Letter size
      const { width, height } = page.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Colors
      const black = rgb(0, 0, 0);
      const darkBlue = rgb(0, 0, 0.6);
      const lightGray = rgb(0.95, 0.95, 0.95);
      
      // Title
      page.drawText(`W-2 Wage and Tax Statement ${year}`, {
        x: 50,
        y: height - 40,
        size: 16,
        font: boldFont,
        color: darkBlue,
      });
      
      page.drawText('Copy A - For Social Security Administration', {
        x: 50,
        y: height - 60,
        size: 10,
        font,
        color: black,
      });
      
      // Employer Information Box
      const drawBox = (x: number, y: number, w: number, h: number, label: string, value: string) => {
        page.drawRectangle({
          x,
          y: y - h,
          width: w,
          height: h,
          borderColor: black,
          borderWidth: 1,
        });
        
        page.drawText(label, {
          x: x + 5,
          y: y - 12,
          size: 7,
          font,
          color: darkBlue,
        });
        
        if (value) {
          page.drawText(value, {
            x: x + 5,
            y: y - 25,
            size: 9,
            font: boldFont,
            color: black,
          });
        }
      };
      
      // Box a - SSN
      drawBox(50, height - 100, 140, 40, 'a Employee SSN', formatSSN(formData.employeeSSN));
      
      // Box b - Employer EIN
      drawBox(200, height - 100, 140, 40, 'b Employer EIN', formatEIN(formData.employerEIN));
      
      // Box c - Employer Info
      drawBox(350, height - 140, 212, 80, 'c Employer name, address, and ZIP', 
        `${formData.employerName}\n${formData.employerAddress}\n${formData.employerCity}, ${formData.employerState} ${formData.employerZip}`);
      
      // Box d - Control Number (optional)
      drawBox(50, height - 150, 140, 40, 'd Control number', '');
      
      // Box e - Employee Name
      drawBox(200, height - 150, 140, 80, 'e Employee name', formData.employeeName);
      
      // Box f - Employee Address
      drawBox(350, height - 230, 212, 90, 'f Employee address, and ZIP',
        `${formData.employeeAddress}\n${formData.employeeCity}, ${formData.employeeState} ${formData.employeeZip}`);
      
      // Wage Boxes (1-6)
      const wageBoxY = height - 280;
      
      // Box 1 - Wages
      drawBox(50, wageBoxY, 180, 50, '1 Wages, tips, other comp.', formatCurrency(formData.box1_wages));
      
      // Box 2 - Federal Tax
      drawBox(240, wageBoxY, 180, 50, '2 Federal income tax withheld', formatCurrency(formData.box2_federalTax));
      
      // Box 3 - SS Wages
      drawBox(430, wageBoxY, 132, 50, '3 Social security wages', formatCurrency(formData.box3_ssWages));
      
      // Box 4 - SS Tax
      drawBox(50, wageBoxY - 60, 180, 50, '4 Social security tax withheld', formatCurrency(formData.box4_ssTax));
      
      // Box 5 - Medicare Wages
      drawBox(240, wageBoxY - 60, 180, 50, '5 Medicare wages and tips', formatCurrency(formData.box5_medicareWages));
      
      // Box 6 - Medicare Tax
      drawBox(430, wageBoxY - 60, 132, 50, '6 Medicare tax withheld', formatCurrency(formData.box6_medicareTax));
      
      // Additional Boxes (7-14)
      const box7Y = wageBoxY - 120;
      
      // Box 7 - SS Tips
      drawBox(50, box7Y, 120, 45, '7 Social security tips', formatCurrency(formData.box7_ssTips));
      
      // Box 8 - Allocated Tips
      drawBox(180, box7Y, 120, 45, '8 Allocated tips', formatCurrency(formData.box8_allocatedTips));
      
      // Box 10 - Dependent Care
      drawBox(310, box7Y, 120, 45, '10 Dependent care benefits', formatCurrency(formData.box10_dependentCare));
      
      // Box 11 - Nonqualified
      drawBox(440, box7Y, 122, 45, '11 Nonqualified plans', formatCurrency(formData.box11_nonqualified));
      
      // Box 12 - Various
      const box12Y = box7Y - 55;
      
      page.drawRectangle({
        x: 50,
        y: box12Y - 90,
        width: 512,
        height: 90,
        borderColor: black,
        borderWidth: 1,
      });
      
      page.drawText('12a', { x: 55, y: box12Y - 12, size: 7, font, color: darkBlue });
      page.drawText(`${formData.box12a_code} ${formData.box12a_amount ? formatCurrency(formData.box12a_amount) : ''}`, 
        { x: 75, y: box12Y - 12, size: 9, font: boldFont, color: black });
      
      page.drawText('12b', { x: 180, y: box12Y - 12, size: 7, font, color: darkBlue });
      page.drawText(`${formData.box12b_code} ${formData.box12b_amount ? formatCurrency(formData.box12b_amount) : ''}`, 
        { x: 200, y: box12Y - 12, size: 9, font: boldFont, color: black });
      
      page.drawText('12c', { x: 305, y: box12Y - 12, size: 7, font, color: darkBlue });
      page.drawText(`${formData.box12c_code} ${formData.box12c_amount ? formatCurrency(formData.box12c_amount) : ''}`, 
        { x: 325, y: box12Y - 12, size: 9, font: boldFont, color: black });
      
      page.drawText('12d', { x: 430, y: box12Y - 12, size: 7, font, color: darkBlue });
      page.drawText(`${formData.box12d_code} ${formData.box12d_amount ? formatCurrency(formData.box12d_amount) : ''}`, 
        { x: 450, y: box12Y - 12, size: 9, font: boldFont, color: black });
      
      // Checkboxes (13)
      const checkboxY = box12Y - 100;
      
      page.drawRectangle({
        x: 50,
        y: checkboxY - 30,
        width: 512,
        height: 30,
        borderColor: black,
        borderWidth: 1,
      });
      
      page.drawText('13', { x: 55, y: checkboxY - 12, size: 8, font, color: darkBlue });
      page.drawText(`Statutory employee: ${formData.statutoryEmployee ? 'X' : ' '}`, 
        { x: 80, y: checkboxY - 12, size: 8, font, color: black });
      page.drawText(`Retirement plan: ${formData.retirementPlan ? 'X' : ' '}`, 
        { x: 200, y: checkboxY - 12, size: 8, font, color: black });
      page.drawText(`Third-party sick pay: ${formData.thirdPartySickPay ? 'X' : ' '}`, 
        { x: 320, y: checkboxY - 12, size: 8, font, color: black });
      
      // State Information (14-20)
      const stateY = checkboxY - 50;
      
      drawBox(50, stateY, 100, 50, '15 State', formData.box15_state);
      drawBox(160, stateY, 130, 50, '15 State ID', formData.box15_stateId);
      drawBox(300, stateY, 120, 50, '16 State wages', formatCurrency(formData.box16_stateWages));
      drawBox(430, stateY, 132, 50, '17 State tax', formatCurrency(formData.box17_stateTax));
      
      drawBox(50, stateY - 60, 120, 50, '18 Local wages', formatCurrency(formData.box18_localWages));
      drawBox(180, stateY - 60, 120, 50, '19 Local tax', formatCurrency(formData.box19_localTax));
      drawBox(310, stateY - 60, 252, 50, '20 Locality name', formData.box20_locality);
      
      // Footer
      page.drawText(`Form W-2 ${year}`, {
        x: 50,
        y: 50,
        size: 10,
        font: boldFont,
        color: darkBlue,
      });
      
      page.drawText('This form is provided for informational purposes only.', {
        x: 150,
        y: 50,
        size: 8,
        font,
        color: black,
      });
      
      // Save
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `W2_${formData.employeeName.replace(/\s+/g, '_')}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrors(['Failed to generate PDF. Please try again.']);
    }
  };

  const updateField = (field: keyof W2FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">W-2 Form Generator</h2>
          <p className="text-gray-500 mt-1">Generate IRS-compliant W-2 forms for employees</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          <span>Generate W-2 PDF</span>
        </button>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employer Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Employer Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
              <input
                type="text"
                value={formData.employerName}
                onChange={(e) => updateField('employerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employer EIN</label>
              <input
                type="text"
                value={formData.employerEIN}
                onChange={(e) => updateField('employerEIN', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XX-XXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">Format: XX-XXXXXXX</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.employerAddress}
                onChange={(e) => updateField('employerAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street Address"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.employerCity}
                  onChange={(e) => updateField('employerCity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.employerState}
                  onChange={(e) => updateField('employerState', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.employerZip}
                  onChange={(e) => updateField('employerZip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Employee Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => updateField('employeeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SSN</label>
              <input
                type="text"
                value={formData.employeeSSN}
                onChange={(e) => updateField('employeeSSN', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XXX-XX-XXXX"
              />
              <p className="text-xs text-gray-500 mt-1">Format: XXX-XX-XXXX</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.employeeAddress}
                onChange={(e) => updateField('employeeAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street Address"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.employeeCity}
                  onChange={(e) => updateField('employeeCity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.employeeState}
                  onChange={(e) => updateField('employeeState', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.employeeZip}
                  onChange={(e) => updateField('employeeZip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wage Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wage Information (Boxes 1-11)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Box 1 - Wages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 1 - Wages</label>
            <input
              type="number"
              step="0.01"
              value={formData.box1_wages}
              onChange={(e) => updateField('box1_wages', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 2 - Federal Tax */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 2 - Federal Tax</label>
            <input
              type="number"
              step="0.01"
              value={formData.box2_federalTax}
              onChange={(e) => updateField('box2_federalTax', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 3 - SS Wages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 3 - SS Wages</label>
            <input
              type="number"
              step="0.01"
              value={formData.box3_ssWages}
              onChange={(e) => updateField('box3_ssWages', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
            <p className="text-xs text-gray-500 mt-1">Limit: $168,600 for {year}</p>
          </div>
          
          {/* Box 4 - SS Tax */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 4 - SS Tax</label>
            <input
              type="number"
              step="0.01"
              value={formData.box4_ssTax}
              onChange={(e) => updateField('box4_ssTax', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 5 - Medicare Wages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 5 - Medicare Wages</label>
            <input
              type="number"
              step="0.01"
              value={formData.box5_medicareWages}
              onChange={(e) => updateField('box5_medicareWages', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 6 - Medicare Tax */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 6 - Medicare Tax</label>
            <input
              type="number"
              step="0.01"
              value={formData.box6_medicareTax}
              onChange={(e) => updateField('box6_medicareTax', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 7 - SS Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 7 - SS Tips</label>
            <input
              type="number"
              step="0.01"
              value={formData.box7_ssTips}
              onChange={(e) => updateField('box7_ssTips', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 8 - Allocated Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 8 - Allocated Tips</label>
            <input
              type="number"
              step="0.01"
              value={formData.box8_allocatedTips}
              onChange={(e) => updateField('box8_allocatedTips', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 10 - Dependent Care */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 10 - Dependent Care</label>
            <input
              type="number"
              step="0.01"
              value={formData.box10_dependentCare}
              onChange={(e) => updateField('box10_dependentCare', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Box 11 - Nonqualified */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Box 11 - Nonqualified</label>
            <input
              type="number"
              step="0.01"
              value={formData.box11_nonqualified}
              onChange={(e) => updateField('box11_nonqualified', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
        </div>
        
        {/* Checkboxes */}
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.statutoryEmployee}
              onChange={(e) => updateField('statutoryEmployee', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Statutory Employee</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.retirementPlan}
              onChange={(e) => updateField('retirementPlan', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Retirement Plan</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.thirdPartySickPay}
              onChange={(e) => updateField('thirdPartySickPay', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Third-party Sick Pay</span>
          </label>
        </div>
      </div>

      {/* State Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">State Information (Boxes 15-20)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              maxLength={2}
              value={formData.box15_state}
              onChange={(e) => updateField('box15_state', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State ID</label>
            <input
              type="text"
              value={formData.box15_stateId}
              onChange={(e) => updateField('box15_stateId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State Wages</label>
            <input
              type="number"
              step="0.01"
              value={formData.box16_stateWages}
              onChange={(e) => updateField('box16_stateWages', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State Tax</label>
            <input
              type="number"
              step="0.01"
              value={formData.box17_stateTax}
              onChange={(e) => updateField('box17_stateTax', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local Wages</label>
            <input
              type="number"
              step="0.01"
              value={formData.box18_localWages}
              onChange={(e) => updateField('box18_localWages', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local Tax</label>
            <input
              type="number"
              step="0.01"
              value={formData.box19_localTax}
              onChange={(e) => updateField('box19_localTax', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Locality Name</label>
          <input
            type="text"
            value={formData.box20_locality}
            onChange={(e) => updateField('box20_locality', e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="City or county name"
          />
        </div>
      </div>

      {/* IRS Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">IRS Compliance Notice</h4>
        <p className="text-sm text-amber-700">
          This form must match IRS requirements exactly. Ensure all information is accurate before filing. 
          For {year}, the Social Security wage base limit is $168,600. Medicare tax has no wage limit. 
          Please verify all data with your payroll records.
        </p>
      </div>
    </div>
  );
}
