import { NextRequest, NextResponse } from 'next/server';
import { db, createAuditLog } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function normalizeEntityType(input: string | null | undefined) {
  const raw = (input ?? '').trim().toUpperCase();
  const map: Record<string, string> = {
    INDIVIDUAL: 'INDIVIDUAL',
    'SOLE PROPRIETORSHIP': 'SOLE_PROPRIETORSHIP',
    SOLE_PROPRIETORSHIP: 'SOLE_PROPRIETORSHIP',
    'LLC SINGLE MEMBER': 'LLC_SINGLE_MEMBER',
    LLC_SINGLE_MEMBER: 'LLC_SINGLE_MEMBER',
    'LLC PARTNERSHIP': 'LLC_PARTNERSHIP',
    LLC_PARTNERSHIP: 'LLC_PARTNERSHIP',
    'LLC C CORP': 'LLC_C_CORP',
    LLC_C_CORP: 'LLC_C_CORP',
    'LLC S CORP': 'LLC_S_CORP',
    LLC_S_CORP: 'LLC_S_CORP',
    'C CORPORATION': 'C_CORPORATION',
    C_CORPORATION: 'C_CORPORATION',
    'S CORPORATION': 'S_CORPORATION',
    S_CORPORATION: 'S_CORPORATION',
    PARTNERSHIP: 'PARTNERSHIP',
    TRUST: 'TRUST',
    ESTATE: 'ESTATE',
    NONPROFIT: 'NONPROFIT',
  };

  return (map[raw] ?? 'INDIVIDUAL') as any;
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const tinVerified = searchParams.get('tinVerified');

    let vendors = await db.vendors.findMany({ companyId: dbUser.companyId });
    
    // Filter by tinVerified if provided
    if (tinVerified !== null) {
      vendors = vendors.filter(v => v.tinVerified === (tinVerified === 'true'));
    }
    
    // Sort by createdAt desc
    vendors = vendors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(vendors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const vendor = await db.vendors.create({
      vendorId: String(body.vendorId ?? '').trim(),
      legalName: String(body.legalName ?? '').trim(),
      email: body.email ? String(body.email).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,

      address: String(body.address ?? '').trim(),
      address2: body.address2 ? String(body.address2).trim() : null,
      city: body.city ? String(body.city).trim() : null,
      state: String(body.state ?? '').trim(),
      zipCode: body.zipCode ? String(body.zipCode).trim() : null,

      taxIdType: body.taxIdType,
      taxId: String(body.taxId ?? '').trim(),
      taxIdHash: sha256(String(body.taxId ?? '').trim()),

      entityType: normalizeEntityType(body.entityType),

      w9Requested: Boolean(body.w9Requested ?? false),
      w9RequestedAt: body.w9RequestedAt ? new Date(body.w9RequestedAt).toISOString() : null,
      w9Received: Boolean(body.w9Received ?? false),
      w9ReceivedAt: body.w9ReceivedAt ? new Date(body.w9ReceivedAt).toISOString() : null,
      w9FileUrl: body.w9FileUrl ? String(body.w9FileUrl) : null,
      
      tinVerified: false,
      tinVerifiedAt: null,
      tinMatchName: null,

      companyId: dbUser.companyId,
    });

    await createAuditLog({
      action: 'CREATE',
      userId: dbUser.id,
      entityType: 'VENDOR',
      entityId: vendor.id,
      companyId: dbUser.companyId,
      newValues: body,
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
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
    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ error: 'Vendor id required' }, { status: 400 });

    const vendor = await db.vendors.findFirst({ id, companyId: dbUser.companyId });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const updateData: any = {};
    if (body.w9Requested !== undefined) updateData.w9Requested = body.w9Requested;
    if (body.w9RequestedAt !== undefined) updateData.w9RequestedAt = body.w9RequestedAt ? new Date(body.w9RequestedAt).toISOString() : null;
    if (body.w9Received !== undefined) updateData.w9Received = body.w9Received;
    if (body.w9ReceivedAt !== undefined) updateData.w9ReceivedAt = body.w9ReceivedAt ? new Date(body.w9ReceivedAt).toISOString() : null;
    if (body.w9FileUrl !== undefined) updateData.w9FileUrl = body.w9FileUrl;

    const updated = await db.vendors.update(id, updateData);

    await createAuditLog({
      action: 'UPDATE',
      userId: dbUser.id,
      entityType: 'VENDOR',
      entityId: updated.id,
      companyId: dbUser.companyId,
      newValues: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
