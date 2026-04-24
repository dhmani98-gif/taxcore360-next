import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { verifyTIN, bulkVerifyTINs, maskTIN, getTINStatusBadge } from '@/lib/services/irs-tin';
import { createAuditLog } from '@/lib/prisma';

/**
 * POST /api/vendors/verify-tin
 * Verify a single vendor's TIN
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    // Get vendor with company verification
    const user = await prisma.user.findFirst({
      where: { email: authUser.email },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        companyId: user.companyId
      }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Verify TIN with IRS
    const result = await verifyTIN({
      tin: vendor.taxId,
      name: vendor.legalName,
      type: vendor.taxIdType as 'EIN' | 'SSN'
    });

    // Update vendor record
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        tinVerified: result.match,
        tinVerifiedAt: new Date(),
        tinMatchName: result.match ? vendor.legalName : null
      }
    });

    // Create audit log
    await createAuditLog({
      action: result.match ? 'GENERATE' : 'UPDATE',
      userId: user.id,
      entityType: 'VENDOR',
      entityId: vendorId,
      companyId: user.companyId,
      newValues: {
        tinVerified: result.match,
        tinVerifiedAt: new Date().toISOString(),
        verificationResult: result
      }
    });

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        maskedTIN: maskTIN(vendor.taxId),
        status: getTINStatusBadge(result.match)
      }
    });

  } catch (error) {
    console.error('TIN verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify TIN' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendors/verify-tin/bulk
 * Bulk verify TINs for all unverified vendors
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: authUser.email },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all unverified vendors
    const vendors = await prisma.vendor.findMany({
      where: {
        companyId: user.companyId,
        OR: [
          { tinVerified: { equals: false } },
          { tinVerified: { not: true } }
        ]
      }
    });

    if (vendors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All vendors are already verified',
        results: {
          total: 0,
          matched: 0,
          mismatched: 0,
          errors: 0,
          results: []
        }
      });
    }

    // Bulk verify
    const results = await bulkVerifyTINs(vendors.map((v: { 
      id: string; 
      taxId: string; 
      legalName: string; 
      taxIdType: string 
    }) => ({
      id: v.id,
      taxId: v.taxId,
      legalName: v.legalName,
      taxIdType: v.taxIdType
    })));

    // Create audit log
    await createAuditLog({
      action: 'GENERATE',
      userId: user.id,
      entityType: 'VENDOR',
      entityId: 'bulk',
      companyId: user.companyId,
      newValues: {
        bulkVerification: true,
        totalVendors: vendors.length,
        matched: results.matched,
        mismatched: results.mismatched
      }
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Bulk TIN verification error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk verify TINs' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vendors/verify-tin/status
 * Get TIN verification statistics
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: authUser.email },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get statistics
    const stats = await prisma.vendor.groupBy({
      by: ['tinVerified'],
      where: {
        companyId: user.companyId
      },
      _count: {
        id: true
      }
    });

    const verified = stats.find((s: { tinVerified: boolean | null; _count: { id: number } }) => s.tinVerified === true)?._count.id || 0;
    const unverified = stats.find((s: { tinVerified: boolean | null; _count: { id: number } }) => s.tinVerified === null)?._count.id || 0;
    const mismatched = stats.find((s: { tinVerified: boolean | null; _count: { id: number } }) => s.tinVerified === false)?._count.id || 0;
    const total = verified + unverified + mismatched;

    return NextResponse.json({
      total,
      verified,
      unverified,
      mismatched,
      verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
    });

  } catch (error) {
    console.error('TIN status error:', error);
    return NextResponse.json(
      { error: 'Failed to get TIN status' },
      { status: 500 }
    );
  }
}
