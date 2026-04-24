import { NextRequest, NextResponse } from 'next/server';
import { db, supabaseAdmin } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type');
    const year = searchParams.get('year');

    const currentYear = new Date().getFullYear().toString();
    const selectedYear = year || currentYear;

    // Base data queries
    const [
      vendors,
      payments,
      employees,
      w9SubmissionsRes,
      vaultDocumentsRes
    ] = await Promise.all([
      db.vendors.findMany({ companyId: dbUser.companyId }),
      db.payments.findMany({ companyId: dbUser.companyId }),
      db.employees.findMany({ companyId: dbUser.companyId }),
      supabaseAdmin.from('w9_submissions').select('*').eq('company_id', dbUser.companyId),
      supabaseAdmin.from('vault_documents').select('*').eq('company_id', dbUser.companyId)
    ]);

    // Filter payments by year if provided
    const yearStart = new Date(`${selectedYear}-01-01`).toISOString();
    const yearEnd = new Date(`${parseInt(selectedYear) + 1}-01-01`).toISOString();
    const filteredPayments = payments.filter(p => {
      const paymentDate = new Date(p.paymentDate).toISOString();
      return paymentDate >= yearStart && paymentDate < yearEnd;
    });

    const w9Submissions = w9SubmissionsRes.data || [];
    const vaultDocuments = vaultDocumentsRes.data || [];

    // Generate reports based on type
    switch (reportType) {
      case 'vendor-1099':
        const vendor1099Data = vendors.map((vendor: any) => {
          const vendorPayments = payments.filter((p: any) => p.vendorId === vendor.vendorId);
          const totalAmount = vendorPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          const hasW9 = w9Submissions.some((s: any) => s.vendorId === vendor.vendorId);
          
          return {
            vendorId: vendor.vendorId,
            legalName: vendor.legalName,
            email: vendor.email,
            phone: vendor.phone,
            entityType: vendor.entityType,
            totalPaid: totalAmount,
            paymentCount: vendorPayments.length,
            lastPaymentDate: vendorPayments.length > 0 ? vendorPayments[vendorPayments.length - 1].paymentDate : null,
            w9Status: hasW9 ? 'Complete' : 'Missing',
            needs1099: totalAmount >= 600 // 1099 threshold
          };
        }).filter((v: { needs1099: boolean }) => v.needs1099);

        return NextResponse.json({
          type: 'vendor-1099',
          year: selectedYear,
          data: vendor1099Data,
          summary: {
            totalVendors: vendor1099Data.length,
            totalAmount: vendor1099Data.reduce((sum: number, v: { totalPaid: number }) => sum + v.totalPaid, 0),
            w9Complete: vendor1099Data.filter((v: { w9Status: string }) => v.w9Status === 'Complete').length,
            w9Missing: vendor1099Data.filter((v: { w9Status: string }) => v.w9Status === 'Missing').length
          }
        });

      case 'payment-summary':
        const year = typeof selectedYear === 'string' ? parseInt(selectedYear, 10) : selectedYear;
        const monthlyPayments = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthPayments = payments.filter((p: any) => {
            const paymentMonth = new Date(p.paymentDate).getMonth() + 1;
            return paymentMonth === month;
          });
          
          return {
            month: month,
            monthName: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' }),
            totalAmount: monthPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
            paymentCount: monthPayments.length,
            vendorCount: new Set(monthPayments.map(p => p.vendorId)).size
          };
        });

        return NextResponse.json({
          type: 'payment-summary',
          year: selectedYear,
          data: monthlyPayments,
          summary: {
            totalAmount: payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
            totalPayments: payments.length,
            totalVendors: new Set(payments.map(p => p.vendorId)).size,
            averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length : 0
          }
        });

      case 'w9-compliance':
        const w9ComplianceData = vendors.map((vendor: any) => {
          const submission = w9Submissions.find((s: any) => s.vendorId === vendor.vendorId);
          return {
            vendorId: vendor.vendorId,
            legalName: vendor.legalName,
            email: vendor.email,
            w9Status: submission ? submission.approvalStatus : 'NOT_SUBMITTED',
            submittedDate: submission?.submittedAt,
            reviewedDate: submission?.reviewedAt,
            taxIdType: submission?.taxIdType,
            entityType: submission?.entityType
          };
        });

        return NextResponse.json({
          type: 'w9-compliance',
          year: selectedYear,
          data: w9ComplianceData,
          summary: {
            totalVendors: w9ComplianceData.length,
            submitted: w9ComplianceData.filter(v => v.w9Status !== 'NOT_SUBMITTED').length,
            approved: w9ComplianceData.filter(v => v.w9Status === 'APPROVED').length,
            pending: w9ComplianceData.filter(v => v.w9Status === 'PENDING').length,
            rejected: w9ComplianceData.filter(v => v.w9Status === 'REJECTED').length,
            notSubmitted: w9ComplianceData.filter(v => v.w9Status === 'NOT_SUBMITTED').length
          }
        });

      case 'employee-summary':
        const employeeSummary = employees.map((emp: any) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role,
          department: emp.department,
          hireDate: emp.hireDate,
          salary: emp.grossPay,
          yearsOfService: emp.hireDate ? Math.floor((new Date().getTime() - new Date(emp.hireDate).getTime()) / (365 * 24 * 60 * 60 * 1000)) : 0
        }));

        return NextResponse.json({
          type: 'employee-summary',
          year: selectedYear,
          data: employeeSummary,
          summary: {
            totalEmployees: employees.length,
            departments: [...new Set(employees.map((e: any) => e.department))].length,
            totalPayroll: employees.reduce((sum: number, e: any) => sum + Number(e.grossPay || 0), 0),
            averageSalary: employees.length > 0 ? employees.reduce((sum: number, e: any) => sum + Number(e.grossPay || 0), 0) / employees.length : 0
          }
        });

      case 'document-inventory':
        const documentStats = vaultDocuments.reduce((acc: any, doc: any) => {
          const category = doc.category;
          if (!acc[category]) acc[category] = { count: 0, documents: [] };
          acc[category].count++;
          acc[category].documents.push(doc);
          return acc;
        }, {} as Record<string, { count: number; documents: any[] }>);

        return NextResponse.json({
          type: 'document-inventory',
          year: selectedYear,
          data: Object.entries(documentStats).map(([category, stats]: [string, any]) => ({
            category,
            count: stats.count,
            documents: stats.documents
          })),
          summary: {
            totalDocuments: vaultDocuments.length,
            categories: Object.keys(documentStats).length
          }
        });

      default:
        // Return all available report types
        return NextResponse.json({
          availableReports: [
            { type: 'vendor-1099', name: 'Vendor 1099 Report', description: 'Vendors who may receive 1099 forms' },
            { type: 'payment-summary', name: 'Payment Summary', description: 'Monthly payment breakdown' },
            { type: 'w9-compliance', name: 'W-9 Compliance', description: 'W-9 form submission status' },
            { type: 'employee-summary', name: 'Employee Summary', description: 'Employee information and payroll' },
            { type: 'document-inventory', name: 'Document Inventory', description: 'Vault document statistics' }
          ]
        });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
