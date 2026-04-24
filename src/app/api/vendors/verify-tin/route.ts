import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/prisma';

// Local TIN utilities (no external IRS API)
function maskTIN(tin: string): string {
  if (tin.length === 9) {
    return `XX-XXX${tin.slice(-4)}`;
  }
  return 'XXX-XX-XXXX';
}

function getTINStatusBadge(verified: boolean | null): { text: string; color: string } {
  if (verified === true) {
    return { text: 'Verified', color: 'bg-green-100 text-green-800' };
  } else if (verified === false) {
    return { text: 'Mismatch', color: 'bg-red-100 text-red-800' };
  }
  return { text: 'Unverified', color: 'bg-yellow-100 text-yellow-800' };
}

// Mock TIN verification (local only - no external API)
async function verifyTINLocal({ tin, name }: { tin: string; name: string }) {
  // Simple mock: last digit determines result for testing
  const lastDigit = parseInt(tin.slice(-1));
  
  if (lastDigit === 0 || lastDigit === 5) {
    return { success: true, match: true, message: 'TIN appears valid' };
  } else if (lastDigit === 1 || lastDigit === 6) {
    return { success: true, match: false, message: 'TIN format invalid' };
  }
  return { success: true, match: false, message: 'Could not verify TIN' };
}

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

    // Verify TIN (local mock - no external IRS API)
    const result = await verifyTINLocal({
      tin: vendor.taxId,
      name: vendor.legalName
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

    // Bulk verify (local mock - no external API)
    const results = {
      total: vendors.length,
      matched: 0,
      mismatched: 0,
      errors: 0,
      results: [] as Array<{ vendorId: string; result: { success: boolean; match: boolean } }>
    };
    
    for (const vendor of vendors) {
      const result = await verifyTINLocal({
        tin: vendor.taxId,
        name: vendor.legalName
      });
      
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          tinVerified: result.match,
          tinVerifiedAt: new Date(),
          tinMatchName: result.match ? vendor.legalName : null
        }
      });
      
      if (result.match) results.matched++;
      else if (result.success) results.mismatched++;
      else results.errors++;
      
      results.results.push({ vendorId: vendor.id, result });
    }

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
