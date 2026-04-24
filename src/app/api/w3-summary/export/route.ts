import { NextRequest, NextResponse } from 'next/server';
import { db, createAuditLog } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { taxYear } = body;

    if (!taxYear) {
      return NextResponse.json({ error: 'Tax year is required' }, { status: 400 });
    }

    // Get company information
    const company = await db.companies.findUnique({ id: dbUser.companyId });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get employees for the tax year
    const employees = await db.employees.findMany({ companyId: dbUser.companyId });

    // Generate W-3 PDF content (simplified version)
    const pdfContent = generateW3PDF({
      taxYear,
      company,
      employees,
      totalEmployees: employees.length,
      totalWages: employees.reduce((sum: number, emp: any) => sum + Number(emp.grossPay || 0), 0)
    });

    // Create PDF buffer
    const pdfBuffer = Buffer.from(pdfContent, 'utf-8');

    // Log the export action
    await createAuditLog({
      action: 'EXPORT',
      userId: dbUser.id,
      entityType: 'W3_SUMMARY',
      entityId: `w3-${taxYear}`,
      companyId: dbUser.companyId,
      newValues: { taxYear, exportedAt: new Date().toISOString() },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="W3_Transmittal_${taxYear}.pdf"`,
      },
    });
  } catch (error) {
    console.error('W-3 PDF export error:', error);
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 });
  }
}

function generateW3PDF(data: any): string {
  // This is a simplified HTML-to-PDF conversion
  // In production, you would use a proper PDF library like puppeteer or jsPDF
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>W-3 Transmittal ${data.taxYear}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 30px; }
        .summary { margin-bottom: 30px; }
        .employee-list { margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals { font-weight: bold; }
        @media print {
            body { margin: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Form W-3</h1>
        <h2>Transmittal of Wage and Tax Statements</h2>
        <p>For year ${data.taxYear}</p>
    </div>

    <div class="company-info">
        <h3>Employer Information</h3>
        <p><strong>${data.company.legalName}</strong></p>
        <p>${data.company.address || ''}</p>
        <p>${data.company.city || ''}, ${data.company.state || ''} ${data.company.zipCode || ''}</p>
        <p>EIN: ${data.company.ein}</p>
    </div>

    <div class="summary">
        <h3>Summary</h3>
        <table>
            <tr>
                <th>Total Employees</th>
                <th>Total Wages</th>
                <th>Federal Income Tax</th>
                <th>Social Security Tax</th>
                <th>Medicare Tax</th>
            </tr>
            <tr class="totals">
                <td>${data.totalEmployees}</td>
                <td>$${data.totalWages.toFixed(2)}</td>
                <td>$${(data.totalWages * 0.15).toFixed(2)}</td>
                <td>$${(data.totalWages * 0.062).toFixed(2)}</td>
                <td>$${(data.totalWages * 0.0145).toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <div class="employee-list">
        <h3>Employee List</h3>
        <table>
            <tr>
                <th>Employee Name</th>
                <th>Wages</th>
                <th>Federal Tax</th>
                <th>Social Security Tax</th>
                <th>Medicare Tax</th>
            </tr>
            ${data.employees.map((emp: any) => `
                <tr>
                    <td>${emp.firstName} ${emp.lastName}</td>
                    <td>$${Number(emp.grossPay || 0).toFixed(2)}</td>
                    <td>$${(Number(emp.grossPay || 0) * 0.15).toFixed(2)}</td>
                    <td>$${(Number(emp.grossPay || 0) * 0.062).toFixed(2)}</td>
                    <td>$${(Number(emp.grossPay || 0) * 0.0145).toFixed(2)}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div style="margin-top: 50px;">
        <p>_________________________</p>
        <p>Authorized Signature</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
  `;

  return html;
}
