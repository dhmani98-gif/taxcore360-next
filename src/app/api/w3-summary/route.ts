import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: dbUser.companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get W-2 forms for the selected year
    const w2Forms = await (prisma as any).employee.findMany({
      where: { 
        companyId: dbUser.companyId,
        // Note: This would need to be connected to actual W-2 forms table
        // For now, we'll use mock data structure
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        grossPay: true,
        // Add other relevant fields
      }
    });

    // Calculate W-3 summary totals
    const summary = {
      taxYear: selectedYear,
      totalEmployees: w2Forms.length,
      totalWages: w2Forms.reduce((sum: number, emp: any) => sum + Number(emp.grossPay || 0), 0),
      totalFederalTax: 0, // Would be calculated from actual W-2 data
      totalSocialSecurityWages: w2Forms.reduce((sum: number, emp: any) => sum + Number(emp.grossPay || 0), 0),
      totalSocialSecurityTax: w2Forms.reduce((sum: number, emp: any) => sum + (Number(emp.grossPay || 0) * 0.062), 0),
      totalMedicareWages: w2Forms.reduce((sum: number, emp: any) => sum + Number(emp.grossPay || 0), 0),
      totalMedicareTax: w2Forms.reduce((sum: number, emp: any) => sum + (Number(emp.grossPay || 0) * 0.0145), 0),
      totalStateWages: 0,
      totalStateTax: 0,
      establishmentNumber: '001', // Would come from company settings
      ein: company.ein,
      companyName: company.legalName,
      companyAddress: company.address || '',
      companyCity: company.city || '',
      companyState: company.state || '',
      companyZip: company.zipCode || '',
      contactPerson: 'Payroll Manager', // Would come from company settings
      contactPhone: company.phone || '',
      contactEmail: company.email || '',
      status: 'DRAFT' as const
    };

    // Transform W-2 forms for display
    const transformedW2Forms = w2Forms.map((emp: any) => ({
      id: emp.id,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      taxYear: selectedYear,
      wages: Number(emp.grossPay || 0),
      federalTax: 0, // Would be calculated from actual tax data
      socialSecurityWages: Number(emp.grossPay || 0),
      socialSecurityTax: Number(emp.grossPay || 0) * 0.062,
      medicareWages: Number(emp.grossPay || 0),
      medicareTax: Number(emp.grossPay || 0) * 0.0145,
      stateWages: 0,
      stateTax: 0,
      status: 'GENERATED'
    }));

    return NextResponse.json({
      summary,
      w2Forms: transformedW2Forms
    });
  } catch (error) {
    console.error('W-3 Summary API error:', error);
    return NextResponse.json({ error: 'Failed to fetch W-3 summary' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { taxYear } = body;

    if (!taxYear) {
      return NextResponse.json({ error: 'Tax year is required' }, { status: 400 });
    }

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: dbUser.companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get all employees for the tax year
    const employees = await prisma.employee.findMany({
      where: { companyId: dbUser.companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        grossPay: true
      }
    });

    // Generate W-3 summary
    const summary = {
      taxYear,
      totalEmployees: employees.length,
      totalWages: employees.reduce((sum, emp) => sum + Number(emp.grossPay || 0), 0),
      totalFederalTax: employees.reduce((sum, emp) => sum + (Number(emp.grossPay || 0) * 0.15), 0), // Estimated
      totalSocialSecurityWages: employees.reduce((sum, emp) => sum + Number(emp.grossPay || 0), 0),
      totalSocialSecurityTax: employees.reduce((sum, emp) => sum + (Number(emp.grossPay || 0) * 0.062), 0),
      totalMedicareWages: employees.reduce((sum, emp) => sum + Number(emp.grossPay || 0), 0),
      totalMedicareTax: employees.reduce((sum, emp) => sum + (Number(emp.grossPay || 0) * 0.0145), 0),
      totalStateWages: 0,
      totalStateTax: 0,
      establishmentNumber: '001',
      ein: company.ein,
      companyName: company.legalName,
      companyAddress: company.address || '',
      companyCity: company.city || '',
      companyState: company.state || '',
      companyZip: company.zipCode || '',
      contactPerson: 'Payroll Manager',
      contactPhone: company.phone || '',
      contactEmail: company.email || '',
      status: 'GENERATED' as const,
      generatedAt: new Date().toISOString()
    };

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: dbUser.id,
        entityType: 'W3_SUMMARY' as any,
        entityId: `w3-${taxYear}`,
        newValues: { taxYear, status: 'GENERATED' },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('W-3 Summary generation error:', error);
    return NextResponse.json({ error: 'Failed to generate W-3 summary' }, { status: 500 });
  }
}
