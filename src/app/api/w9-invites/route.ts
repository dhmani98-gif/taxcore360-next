import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function generateToken() {
  return `w9-${crypto.randomBytes(16).toString('hex')}`;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const invites = await (prisma as any).w9Invite.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(status && { status: status as any }),
      },
      include: {
        vendor: { select: { vendorId: true, legalName: true, email: true } },
        submissions: {
          select: {
            id: true,
            approvalStatus: true,
            submittedAt: true,
            legalName: true,
            email: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch W-9 invites' }, { status: 500 });
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
    const { vendorId, vendorEmail } = body;

    if (!vendorId && !vendorEmail) {
      return NextResponse.json({ error: 'Either vendorId or vendorEmail is required' }, { status: 400 });
    }

    const token = generateToken();
    const now = new Date();

    const invite = await (prisma as any).w9Invite.create({
      data: {
        token,
        status: 'SENT',
        vendorEmail: vendorEmail ?? null,
        companyId: dbUser.companyId,
        vendorId: vendorId ?? null,
        viewedAt: null,
        completedAt: null,
      },
      include: {
        vendor: { select: { vendorId: true, legalName: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: dbUser.id,
        entityType: 'VENDOR',
        entityId: invite.id,
        newValues: { token, vendorId, vendorEmail },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create W-9 invite' }, { status: 500 });
  }
}
