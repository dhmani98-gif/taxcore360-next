import { NextRequest, NextResponse } from 'next/server';
import { db, createAuditLog } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const company = await db.companies.findUnique({ id: dbUser.companyId });

    const settings = await db.companySettings.findFirst({ companyId: dbUser.companyId });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get compliance settings (not implemented in Supabase yet)
    const complianceSettings = null;

    return NextResponse.json({
      company: {
        id: company.id,
        legalName: company.legalName,
        dbaName: company.dbaName,
        ein: company.ein,
        address: company.address,
        city: company.city,
        state: company.state,
        zipCode: company.zipCode,
        phone: company.phone,
        email: company.email
      },
      compliance: complianceSettings || {
        federalTaxId: '',
        stateTaxId: '',
        localTaxId: '',
        filingFrequency: 'MONTHLY',
        depositSchedule: 'MONTHLY',
        form941Schedule: 'QUARTERLY',
        form940Schedule: 'ANNUALLY',
        stateUnemploymentRate: 0,
        maxWageBase: 0,
        additionalMedicareTax: false,
        ficaExemptWages: 0,
        retirementPlanDeductions: 0,
        healthSavingsAccount: false,
        dependentCareBenefits: 0,
        educationalAssistance: 0
      }
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: 'Section and data required' }, { status: 400 });
    }

    switch (section) {
      case 'company':
        const updatedCompany = await db.companies.update(
          { id: dbUser.companyId },
          {
            ...(data.legalName && { legalName: data.legalName }),
            ...(data.dbaName !== undefined && { dbaName: data.dbaName }),
            ...(data.ein && { ein: data.ein }),
            ...(data.address && { address: data.address }),
            ...(data.city && { city: data.city }),
            ...(data.state && { state: data.state }),
            ...(data.zipCode && { zipCode: data.zipCode }),
            ...(data.phone && { phone: data.phone }),
            ...(data.email && { email: data.email }),
            ...(data.website !== undefined && { website: data.website }),
            ...(data.industry && { industry: data.industry }),
            ...(data.taxYear && { taxYear: data.taxYear }),
            ...(data.fiscalYearEnd && { fiscalYearEnd: data.fiscalYearEnd }),
            updatedAt: new Date().toISOString(),
          }
        );

        await createAuditLog({
          action: 'UPDATE',
          userId: dbUser.id,
          entityType: 'COMPANY',
          entityId: updatedCompany.id,
          companyId: dbUser.companyId,
          newValues: data,
        });

        return NextResponse.json(updatedCompany);

      case 'settings':
        // Update or create company settings
        const settings = await db.companySettings.upsert({
          companyId: dbUser.companyId,
          ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
          ...(data.smsNotifications !== undefined && { smsNotifications: data.smsNotifications }),
          ...(data.twoFactorAuth !== undefined && { twoFactorAuth: data.twoFactorAuth }),
          ...(data.dataRetention && { dataRetention: data.dataRetention }),
          ...(data.autoBackup !== undefined && { autoBackup: data.autoBackup }),
          ...(data.complianceAlerts !== undefined && { complianceAlerts: data.complianceAlerts }),
        });

        await createAuditLog({
          action: 'UPDATE',
          userId: dbUser.id,
          entityType: 'SETTING',
          entityId: settings.id,
          companyId: dbUser.companyId,
          newValues: data,
        });

        return NextResponse.json(settings);

      case 'compliance':
        // Compliance settings are stored in company_settings table
        const complianceSettings = await db.companySettings.upsert({
          companyId: dbUser.companyId,
          ...(data.filingFrequency && { depositSchedule: data.filingFrequency }),
          ...(data.depositSchedule && { payPeriodType: data.depositSchedule }),
          ...(data.necThreshold !== undefined && { necThreshold: data.necThreshold }),
          ...(data.miscThreshold !== undefined && { miscThreshold: data.miscThreshold }),
        });

        await createAuditLog({
          action: 'UPDATE',
          userId: dbUser.id,
          entityType: 'SETTING',
          entityId: complianceSettings.id,
          companyId: dbUser.companyId,
          newValues: data,
        });

        return NextResponse.json({ success: true, complianceSettings });

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
