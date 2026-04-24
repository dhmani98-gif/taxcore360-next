'use client';

import { useState, useMemo } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Download, FileText, Calculator, AlertCircle } from 'lucide-react';
import { formatCurrency, formatEIN, formatSSN, exportToEFW2 } from '@/lib/export';

interface W2Record {
  id: string;
  employeeName: string;
  employeeSSN: string;
  box1_wages: number;
  box2_federalTax: number;
  box3_ssWages: number;
  box4_ssTax: number;
  box5_medicareWages: number;
  box6_medicareTax: number;
  box7_ssTips: number;
  box8_allocatedTips: number;
  box10_dependentCare: number;
  box11_nonqualified: number;
  box12a_code?: string;
  box12a_amount?: number;
}

interface W3SummaryData {
  // Employer Information
  employerName: string;
  employerEIN: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  employerContact: string;
  employerPhone: string;
  employerEmail: string;
  
  // Control Information
  establishmentNumber?: string;
  otherEIN?: string;
  
  // W-2 Records
  w2Records: W2Record[];
  
  // Validation
  hhsEmployee?: boolean;
  terminatedBusiness?: boolean;
}

export default function W3SummaryGenerator() {
  const [year] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState<W3SummaryData>({
    employerName: '',
    employerEIN: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    employerContact: '',
    employerPhone: '',
    employerEmail: '',
    w2Records: [],
  });
  
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate totals from all W-2 records
  const totals = useMemo(() => {
    return formData.w2Records.reduce((acc, record) => ({
      box1: acc.box1 + record.box1_wages,
      box2: acc.box2 + record.box2_federalTax,
      box3: acc.box3 + record.box3_ssWages,
      box4: acc.box4 + record.box4_ssTax,
      box5: acc.box5 + record.box5_medicareWages,
      box6: acc.box6 + record.box6_medicareTax,
      box7: acc.box7 + record.box7_ssTips,
      box8: acc.box8 + record.box8_allocatedTips,
      box10: acc.box10 + record.box10_dependentCare,
      box11: acc.box11 + record.box11_nonqualified,
    }), {
      box1: 0, box2: 0, box3: 0, box4: 0, box5: 0,
      box6: 0, box7: 0, box8: 0, box10: 0, box11: 0,
    });
  }, [formData.w2Records]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.employerName) newErrors.push('Employer name is required');
    if (!formData.employerEIN || formData.employerEIN.length < 9) newErrors.push('Valid EIN is required');
    if (formData.w2Records.length === 0) newErrors.push('At least one W-2 record is required');
    
    // Validate totals
    const calculatedSSWages = formData.w2Records.reduce((sum, r) => sum + r.box3_ssWages, 0);
    const calculatedSSTax = formData.w2Records.reduce((sum, r) => sum + r.box4_ssTax, 0);
    
    // SS Tax should be 6.2% of SS Wages (with rounding)
    const expectedSSTax = Math.round(calculatedSSWages * 0.062);
    if (Math.abs(calculatedSSTax - expectedSSTax) > 1) {
      newErrors.push('Social Security tax calculation error: Should be 6.2% of SS wages');
    }
    
    // Medicare Tax should be 1.45% of Medicare Wages
    const calculatedMedicareWages = formData.w2Records.reduce((sum, r) => sum + r.box5_medicareWages, 0);
    const calculatedMedicareTax = formData.w2Records.reduce((sum, r) => sum + r.box6_medicareTax, 0);
    const expectedMedicareTax = Math.round(calculatedMedicareWages * 0.0145);
    if (Math.abs(calculatedMedicareTax - expectedMedicareTax) > 1) {
      newErrors.push('Medicare tax calculation error: Should be 1.45% of Medicare wages');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const black = rgb(0, 0, 0);
      const darkBlue = rgb(0, 0, 0.6);
      
      // Header
      page.drawText(`Form W-3 Transmittal of Wage and Tax Statements ${year}`, {
        x: 50,
        y: height - 40,
        size: 16,
        font: boldFont,
        color: darkBlue,
      });
      
      page.drawText('Department of the Treasury - Internal Revenue Service', {
        x: 50,
        y: height - 60,
        size: 10,
        font,
        color: black,
      });
      
      // Employer Info Box
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
      
      // Box 1 - Number of W-2 forms
      drawBox(50, height - 110, 180, 50, '1 Number of Forms W-2', formData.w2Records.length.toString());
      
      // Box 2 - Establishment Number (optional)
      drawBox(240, height - 110, 150, 50, '2 Establishment number', formData.establishmentNumber || '');
      
      // Box 3 - Employer EIN
      drawBox(400, height - 110, 162, 50, '3 Employer identification number (EIN)', formatEIN(formData.employerEIN));
      
      // Box 4 - Other EIN (optional)
      drawBox(50, height - 170, 180, 50, '4 Other EIN used this year', formData.otherEIN || '');
      
      // Box 5 - Employer Name
      drawBox(240, height - 170, 322, 80, '5 Employer name and address',
        `${formData.employerName}\n${formData.employerAddress}\n${formData.employerCity}, ${formData.employerState} ${formData.employerZip}`);
      
      // Box 6 - Contact Person
      drawBox(50, height - 280, 200, 50, '6 Contact person', formData.employerContact);
      
      // Box 7 - Phone
      drawBox(260, height - 280, 150, 50, '7 Contact telephone number', formData.employerPhone);
      
      // Box 8 - Email
      drawBox(420, height - 280, 142, 50, '8 Contact email address', formData.employerEmail);
      
      // Totals Section (Boxes 9-18)
      const totalsY = height - 350;
      
      // Row 1
      drawBox(50, totalsY, 160, 50, '9 Wages, tips, other comp.', formatCurrency(totals.box1));
      drawBox(220, totalsY, 160, 50, '10 Federal income tax withheld', formatCurrency(totals.box2));
      drawBox(390, totalsY, 172, 50, '11 Social security wages', formatCurrency(totals.box3));
      
      // Row 2
      drawBox(50, totalsY - 60, 160, 50, '12 Social security tax withheld', formatCurrency(totals.box4));
      drawBox(220, totalsY - 60, 160, 50, '13 Medicare wages and tips', formatCurrency(totals.box5));
      drawBox(390, totalsY - 60, 172, 50, '14 Medicare tax withheld', formatCurrency(totals.box6));
      
      // Row 3
      drawBox(50, totalsY - 120, 160, 50, '15 Social security tips', formatCurrency(totals.box7));
      drawBox(220, totalsY - 120, 160, 50, '16 Allocated tips', formatCurrency(totals.box8));
      drawBox(390, totalsY - 120, 172, 50, '17 Dependent care benefits', formatCurrency(totals.box10));
      
      // Row 4
      drawBox(50, totalsY - 180, 160, 50, '18 Nonqualified plans', formatCurrency(totals.box11));
      
      // Checkboxes
      const checkboxY = totalsY - 240;
      
      page.drawRectangle({
        x: 50,
        y: checkboxY - 40,
        width: 512,
        height: 40,
        borderColor: black,
        borderWidth: 1,
      });
      
      page.drawText('19', { x: 55, y: checkboxY - 15, size: 8, font, color: darkBlue });
      page.drawText(`HHS Employee: ${formData.hhsEmployee ? 'X' : ' '}`, 
        { x: 80, y: checkboxY - 15, size: 8, font, color: black });
      page.drawText(`Terminated Business: ${formData.terminatedBusiness ? 'X' : ' '}`, 
        { x: 200, y: checkboxY - 15, size: 8, font, color: black });
      
      // W-2 Summary Table
      const tableY = checkboxY - 80;
      
      page.drawText('W-2 Records Summary:', {
        x: 50,
        y: tableY,
        size: 12,
        font: boldFont,
        color: darkBlue,
      });
      
      let rowY = tableY - 20;
      
      // Table Header
      page.drawRectangle({
        x: 50,
        y: rowY - 15,
        width: 512,
        height: 15,
        borderColor: black,
        borderWidth: 1,
        color: rgb(0.9, 0.9, 0.9),
      });
      
      page.drawText('Employee Name', { x: 55, y: rowY - 10, size: 8, font: boldFont, color: black });
      page.drawText('SSN', { x: 200, y: rowY - 10, size: 8, font: boldFont, color: black });
      page.drawText('Wages', { x: 300, y: rowY - 10, size: 8, font: boldFont, color: black });
      page.drawText('Federal Tax', { x: 380, y: rowY - 10, size: 8, font: boldFont, color: black });
      page.drawText('SS Tax', { x: 460, y: rowY - 10, size: 8, font: boldFont, color: black });
      
      rowY -= 15;
      
      // W-2 Records
      formData.w2Records.slice(0, 15).forEach((record) => {
        page.drawText(record.employeeName.substring(0, 25), { x: 55, y: rowY - 10, size: 7, font, color: black });
        page.drawText(formatSSN(record.employeeSSN), { x: 200, y: rowY - 10, size: 7, font, color: black });
        page.drawText(formatCurrency(record.box1_wages), { x: 300, y: rowY - 10, size: 7, font, color: black });
        page.drawText(formatCurrency(record.box2_federalTax), { x: 380, y: rowY - 10, size: 7, font, color: black });
        page.drawText(formatCurrency(record.box4_ssTax), { x: 460, y: rowY - 10, size: 7, font, color: black });
        rowY -= 12;
      });
      
      if (formData.w2Records.length > 15) {
        page.drawText(`... and ${formData.w2Records.length - 15} more records`, { 
          x: 55, y: rowY - 10, size: 8, font: boldFont, color: black 
        });
      }
      
      // Footer
      page.drawText(`Form W-3 ${year}`, {
        x: 50,
        y: 50,
        size: 10,
        font: boldFont,
        color: darkBlue,
      });
      
      page.drawText('Send this summary with Copy A of all W-2 forms to Social Security Administration.', {
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
      link.download = `W3_Summary_${formData.employerEIN}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating W-3 PDF:', error);
      setErrors(['Failed to generate W-3 PDF. Please try again.']);
    }
  };

  const exportElectronicFiling = () => {
    if (!validateForm()) return;
    
    const efw2Data = formData.w2Records.map(record => ({
      company: {
        name: formData.employerName,
        ein: formData.employerEIN,
        address: formData.employerAddress,
        city: formData.employerCity,
        state: formData.employerState,
        zipCode: formData.employerZip,
        contact: formData.employerContact,
        phone: formData.employerPhone,
        email: formData.employerEmail,
      },
      employee: {
        firstName: record.employeeName.split(' ')[0] || '',
        lastName: record.employeeName.split(' ').slice(1).join(' ') || '',
        ssn: record.employeeSSN,
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      wages: record.box1_wages,
      federalTax: record.box2_federalTax,
    }));
    
    exportToEFW2(efw2Data, `W2_EFW2_${formData.employerEIN}_${year}`);
  };

  const updateField = (field: keyof W3SummaryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">W-3 Summary Generator</h2>
          <p className="text-gray-500 mt-1">Generate IRS-compliant W-3 summary for all W-2 forms</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportElectronicFiling}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Calculator className="w-5 h-5" />
            <span>Export EFW2</span>
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            <span>Generate W-3 PDF</span>
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Validation Errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Employer Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Employer Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
            <input
              type="text"
              value={formData.employerName}
              onChange={(e) => updateField('employerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.employerAddress}
              onChange={(e) => updateField('employerAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={formData.employerContact}
              onChange={(e) => updateField('employerContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.employerPhone}
              onChange={(e) => updateField('employerPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.employerEmail}
              onChange={(e) => updateField('employerEmail', e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Totals Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculated Totals</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 1 - Wages</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box1)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 2 - Federal Tax</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 3 - SS Wages</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box3)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 4 - SS Tax</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box4)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 5 - Medicare</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box5)}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 6 - Medicare Tax</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box6)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 7 - SS Tips</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box7)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 8 - Allocated Tips</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box8)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 10 - Dependent Care</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box10)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Box 11 - Nonqualified</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.box11)}</p>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Number of W-2 Forms:</span> {formData.w2Records.length}
          </p>
        </div>
      </div>

      {/* IRS Compliance Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">IRS Filing Requirements</h4>
        <p className="text-sm text-amber-700 mb-2">
          The W-3 form must be filed with the Social Security Administration along with Copy A of all W-2 forms. 
          Ensure all totals are accurate and match your payroll records.
        </p>
        <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>Social Security tax should be 6.2% of Social Security wages (Box 4 ÷ Box 3)</li>
          <li>Medicare tax should be 1.45% of Medicare wages (Box 6 ÷ Box 5)</li>
          <li>SS wage base limit for {year}: $168,600</li>
          <li>No limit on Medicare wages</li>
          <li>File by January 31st following the tax year</li>
        </ul>
      </div>
    </div>
  );
}
