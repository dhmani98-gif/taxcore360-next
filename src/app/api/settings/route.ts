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

    // Get company profile
    const company = await prisma.company.findUnique({
      where: { id: dbUser.companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get compliance settings
    const complianceSettings = await (prisma as any).complianceSetting.findFirst({
      where: { companyId: dbUser.companyId }
    });

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

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: 'Section and data required' }, { status: 400 });
    }

    switch (section) {
      case 'company':
        const updatedCompany = await prisma.company.update({
          where: { id: dbUser.companyId },
          data: {
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
            ...(data.fiscalYearEnd && { fiscalYearEnd: data.fiscalYearEnd })
          }
        });

        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            userId: dbUser.id,
            entityType: 'COMPANY',
            entityId: updatedCompany.id,
            newValues: data,
            companyId: dbUser.companyId,
          },
        });

        return NextResponse.json(updatedCompany);

      case 'settings':
        // Update or create company settings
        const settings = await (prisma as any).companySetting.upsert({
          where: { companyId: dbUser.companyId },
          create: {
            companyId: dbUser.companyId,
            emailNotifications: data.emailNotifications ?? true,
            smsNotifications: data.smsNotifications ?? false,
            twoFactorAuth: data.twoFactorAuth ?? false,
            dataRetention: data.dataRetention ?? '7-years',
            autoBackup: data.autoBackup ?? true,
            complianceAlerts: data.complianceAlerts ?? true
          },
          update: {
            ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
            ...(data.smsNotifications !== undefined && { smsNotifications: data.smsNotifications }),
            ...(data.twoFactorAuth !== undefined && { twoFactorAuth: data.twoFactorAuth }),
            ...(data.dataRetention && { dataRetention: data.dataRetention }),
            ...(data.autoBackup !== undefined && { autoBackup: data.autoBackup }),
            ...(data.complianceAlerts !== undefined && { complianceAlerts: data.complianceAlerts })
          }
        });

        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            userId: dbUser.id,
            entityType: 'SETTING',
            entityId: settings.id,
            newValues: data,
            companyId: dbUser.companyId,
          },
        });

        return NextResponse.json(settings);

      case 'compliance':
        // Update or create compliance settings
        const compliance = await (prisma as any).complianceSetting.upsert({
          where: { companyId: dbUser.companyId },
          create: {
            companyId: dbUser.companyId,
            federalTaxId: data.federalTaxId || '',
            stateTaxId: data.stateTaxId || '',
            localTaxId: data.localTaxId || '',
            filingFrequency: data.filingFrequency || 'MONTHLY',
            depositSchedule: data.depositSchedule || 'MONTHLY',
            form941Schedule: data.form941Schedule || 'QUARTERLY',
            form940Schedule: data.form940Schedule || 'ANNUALLY',
            stateUnemploymentRate: data.stateUnemploymentRate || 0,
            maxWageBase: data.maxWageBase || 0,
            additionalMedicareTax: data.additionalMedicareTax || false,
            ficaExemptWages: data.ficaExemptWages || 0,
            retirementPlanDeductions: data.retirementPlanDeductions || 0,
            healthSavingsAccount: data.healthSavingsAccount || false,
            dependentCareBenefits: data.dependentCareBenefits || 0,
            educationalAssistance: data.educationalAssistance || 0
          },
          update: {
            ...(data.federalTaxId !== undefined && { federalTaxId: data.federalTaxId }),
            ...(data.stateTaxId !== undefined && { stateTaxId: data.stateTaxId }),
            ...(data.localTaxId !== undefined && { localTaxId: data.localTaxId }),
            ...(data.filingFrequency && { filingFrequency: data.filingFrequency }),
            ...(data.depositSchedule && { depositSchedule: data.depositSchedule }),
            ...(data.form941Schedule && { form941Schedule: data.form941Schedule }),
            ...(data.form940Schedule && { form940Schedule: data.form940Schedule }),
            ...(data.stateUnemploymentRate !== undefined && { stateUnemploymentRate: data.stateUnemploymentRate }),
            ...(data.maxWageBase !== undefined && { maxWageBase: data.maxWageBase }),
            ...(data.additionalMedicareTax !== undefined && { additionalMedicareTax: data.additionalMedicareTax }),
            ...(data.ficaExemptWages !== undefined && { ficaExemptWages: data.ficaExemptWages }),
            ...(data.retirementPlanDeductions !== undefined && { retirementPlanDeductions: data.retirementPlanDeductions }),
            ...(data.healthSavingsAccount !== undefined && { healthSavingsAccount: data.healthSavingsAccount }),
            ...(data.dependentCareBenefits !== undefined && { dependentCareBenefits: data.dependentCareBenefits }),
            ...(data.educationalAssistance !== undefined && { educationalAssistance: data.educationalAssistance })
          }
        });

        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            userId: dbUser.id,
            entityType: 'COMPANY',
            entityId: compliance.id,
            newValues: data,
            companyId: dbUser.companyId,
          },
        });

        return NextResponse.json(compliance);

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
