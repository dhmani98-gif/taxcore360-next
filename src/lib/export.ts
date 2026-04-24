import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

/**
 * Export data to Excel (CSV format with proper escaping)
 */
export function exportToExcel(data: ExportData, filename: string): void {
  // Add BOM for UTF-8 support (Arabic/Unicode characters)
  let csvContent = '\uFEFF';
  
  // Add title if provided
  if (data.title) {
    csvContent += data.title + '\n\n';
  }
  
  // Add company info if provided
  if (data.companyInfo) {
    csvContent += `Company: ${data.companyInfo.name}\n`;
    if (data.companyInfo.address) csvContent += `Address: ${data.companyInfo.address}\n`;
    if (data.companyInfo.phone) csvContent += `Phone: ${data.companyInfo.phone}\n`;
    if (data.companyInfo.email) csvContent += `Email: ${data.companyInfo.email}\n`;
    csvContent += '\n';
  }
  
  // Add headers
  csvContent += data.headers.map(h => `"${h}"`).join(',') + '\n';
  
  // Add rows with proper escaping
  data.rows.forEach(row => {
    const escapedRow = row.map(cell => {
      const cellStr = String(cell);
      // Escape quotes by doubling them
      if (cellStr.includes('"') || cellStr.includes(',') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvContent += escapedRow.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to PDF with professional formatting
 */
export function exportToPDF(data: ExportData, filename: string): void {
  const doc = new jsPDF();
  
  // Add logo/header
  doc.setFillColor(59, 130, 246); // Blue color
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add TaxCore360 branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaxCore360', 14, 16);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Tax Compliance Platform', 14, 22);
  
  let startY = 35;
  
  // Add title
  if (data.title) {
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title, 14, startY);
    startY += 10;
  }
  
  // Add company info
  if (data.companyInfo) {
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Company: ${data.companyInfo.name}`, 14, startY);
    startY += 5;
    if (data.companyInfo.address) {
      doc.text(`Address: ${data.companyInfo.address}`, 14, startY);
      startY += 5;
    }
    if (data.companyInfo.phone) {
      doc.text(`Phone: ${data.companyInfo.phone}`, 14, startY);
      startY += 5;
    }
    startY += 5;
  }
  
  // Add generation date
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, startY);
  startY += 10;
  
  // Add table
  (doc as any).autoTable({
    head: [data.headers],
    body: data.rows,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
    },
    margin: { top: 10, right: 14, bottom: 20, left: 14 },
    didDrawPage: (data: any) => {
      // Add footer on each page
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `TaxCore360 - Page ${data.pageNumber}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });
  
  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(date));
}

/**
 * Format SSN (XXX-XX-XXXX)
 */
export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  return ssn;
}

/**
 * Format EIN (XX-XXXXXXX)
 */
export function formatEIN(ein: string): string {
  const cleaned = ein.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  }
  return ein;
}

/**
 * Validate SSN format
 */
export function isValidSSN(ssn: string): boolean {
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.length === 9 && !/^0{3}|^666|9\d{2}/.test(cleaned);
}

/**
 * Validate EIN format
 */
export function isValidEIN(ein: string): boolean {
  const cleaned = ein.replace(/\D/g, '');
  return cleaned.length === 9;
}

/**
 * Export W-2 form data to IRS EFW2 format
 */
export function exportToEFW2(w2Data: any[], filename: string): void {
  // EFW2 format (Electronic Filing With 2 records)
  // RA Record - Submitter Record
  // RW Record - Wage Record
  // RO Record - Establishment Record (optional)
  // RT Record - Total Record
  // RF Record - Final Record
  
  let content = '';
  
  // Generate RA Record (Submitter)
  const raRecord = generateRARecord(w2Data[0]?.company || {});
  content += raRecord + '\n';
  
  // Generate RW Records (Wage records)
  w2Data.forEach((w2, index) => {
    const rwRecord = generateRWRecord(w2, index + 1);
    content += rwRecord + '\n';
  });
  
  // Generate RT Record (Totals)
  const rtRecord = generateRTRecord(w2Data);
  content += rtRecord + '\n';
  
  // Generate RF Record (Final)
  const rfRecord = generateRFRecord(w2Data.length);
  content += rfRecord + '\n';
  
  // Download
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// EFW2 Record Generators
function generateRARecord(company: any): string {
  const year = new Date().getFullYear();
  return [
    'RA',                                      // Record Type
    year.toString().padStart(4, '0'),         // Tax Year
    ' ',                                       // Terminating Business Indicator
    company.ein?.replace(/\D/g, '').padStart(9, '0') || '000000000', // EIN
    ' ',                                       // EIN Extension
    (company.name || '').substring(0, 57).padEnd(57, ' '), // Company Name
    (company.address || '').substring(0, 22).padEnd(22, ' '), // Location Address
    (company.city || '').substring(0, 22).padEnd(22, ' '), // City
    (company.state || '').padEnd(2, ' '),      // State
    (company.zipCode || '').padStart(5, '0'), // ZIP
    ''.padEnd(5, '0'),                        // ZIP Extension
    '          ',                             // Sorting Code
    (company.contact || '').substring(0, 27).padEnd(27, ' '), // Contact Name
    (company.phone || '').replace(/\D/g, '').padStart(15, '0'), // Phone
    (company.email || '').substring(0, 40).padEnd(40, ' '), // Email
    ' '.padEnd(200, ' '),                     // Foreign Entity Indicator + filler
  ].join('');
}

function generateRWRecord(w2: any, sequence: number): string {
  const year = new Date().getFullYear();
  return [
    'RW',                                      // Record Type
    year.toString().padStart(4, '0'),         // Tax Year
    ' ',                                       // Terminating Business Indicator
    '0',                                       // Establishment Number
    w2.employee?.ssn?.replace(/\D/g, '').padStart(9, '0') || '000000000', // SSN
    (w2.employee?.firstName || '').substring(0, 15).padEnd(15, ' '), // First Name
    ' ',                                       // Middle Initial
    (w2.employee?.lastName || '').substring(0, 20).padEnd(20, ' '), // Last Name
    ''.padEnd(4, ' '),                        // Suffix
    (w2.employee?.address || '').substring(0, 22).padEnd(22, ' '), // Location Address
    (w2.employee?.city || '').substring(0, 22).padEnd(22, ' '), // City
    (w2.employee?.state || '').padEnd(2, ' '), // State
    (w2.employee?.zipCode || '').padStart(5, '0'), // ZIP
    ''.padEnd(5, '0'),                        // ZIP Extension
    ' '.padEnd(23, ' '),                      // Foreign State/Province
    ' '.padEnd(15, ' '),                      // Foreign Postal Code
    ' '.padEnd(2, ' '),                       // Foreign Country Code
    formatW2Amount(w2.wages).padStart(11, '0'), // Wages (Box 1)
    formatW2Amount(w2.federalTax).padStart(11, '0'), // Federal Tax (Box 2)
    ''.padStart(11, '0'),                     // SS Wages (Box 3)
    ''.padStart(11, '0'),                     // SS Tax (Box 4)
    ''.padStart(11, '0'),                     // Medicare Wages (Box 5)
    ''.padStart(11, '0'),                     // Medicare Tax (Box 6)
    ''.padStart(11, '0'),                     // SS Tips (Box 7)
    ''.padStart(11, '0'),                     // Allocated Tips (Box 8)
    '     ',                                   // Verification Code
    ''.padStart(11, '0'),                     // Dependent Care (Box 10)
    '   ',                                     // Retirement Plan
    ' ',                                       // Statutory Employee
    ' ',                                       // Third-party Sick Pay
    ''.padStart(11, '0'),                     // Other (Box 14)
    ''.padStart(11, '0'),                     // Nonqualified Plans (Box 11)
    ''.padStart(11, '0'),                     // Deferred Compensation (Box 12a)
    '  ',                                      // Box 12a Code
    ''.padStart(11, '0'),                     // Box 12b
    '  ',                                      // Box 12b Code
    ''.padStart(11, '0'),                     // Box 12c
    '  ',                                      // Box 12c Code
    ''.padStart(11, '0'),                     // Box 12d
    '  ',                                      // Box 12d Code
    '    ',                                    // State Code (Box 15)
    ''.padStart(11, '0'),                     // State Wages (Box 16)
    ''.padStart(11, '0'),                     // State Tax (Box 17)
    ''.padStart(11, '0'),                     // Local Wages (Box 18)
    ''.padStart(11, '0'),                     // Local Tax (Box 19)
    '          ',                             // Locality Name (Box 20)
    sequence.toString().padStart(8, '0'),      // Record Sequence Number
    '            ',                            // Filler
  ].join('');
}

function generateRTRecord(w2Data: any[]): string {
  const year = new Date().getFullYear();
  const totalWages = w2Data.reduce((sum, w2) => sum + (w2.wages || 0), 0);
  const totalFederalTax = w2Data.reduce((sum, w2) => sum + (w2.federalTax || 0), 0);
  
  return [
    'RT',                                      // Record Type
    year.toString().padStart(4, '0'),         // Tax Year
    ' ',                                       // Terminating Business Indicator
    '0',                                       // Establishment Number
    w2Data.length.toString().padStart(7, '0'), // Number of RW Records
    formatW2Amount(totalWages).padStart(15, '0'), // Total Wages
    formatW2Amount(totalFederalTax).padStart(15, '0'), // Total Federal Tax
    ''.padStart(15, '0'),                     // Total SS Wages
    ''.padStart(15, '0'),                     // Total SS Tax
    ''.padStart(15, '0'),                     // Total Medicare Wages
    ''.padStart(15, '0'),                     // Total Medicare Tax
    ''.padStart(15, '0'),                     // Total SS Tips
    ''.padStart(15, '0'),                     // Total Allocated Tips
    ''.padStart(15, '0'),                     // Total Dependent Care
    ''.padStart(15, '0'),                     // Total Deferred Compensation
    ''.padStart(15, '0'),                     // Total Nonqualified Plans
    '          ',                             // Filler
  ].join('');
}

function generateRFRecord(count: number): string {
  return [
    'RF',                                      // Record Type
    ' '.padEnd(5, ' '),                       // Number of RW Records
    count.toString().padStart(7, '0'),        // Total Number of Records
    ' '.padEnd(241, ' '),                     // Filler
  ].join('');
}

function formatW2Amount(amount: number): string {
  // Convert to cents and format as 11 digits
  const cents = Math.round((amount || 0) * 100);
  return cents.toString().padStart(11, '0');
}

export default {
  exportToExcel,
  exportToPDF,
  exportToEFW2,
  formatCurrency,
  formatDate,
  formatSSN,
  formatEIN,
  isValidSSN,
  isValidEIN,
};
