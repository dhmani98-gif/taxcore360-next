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
    const approvalStatus = searchParams.get('approvalStatus');

    const submissions = await (prisma as any).w9Submission.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(approvalStatus && { approvalStatus: approvalStatus as any }),
      },
      include: {
        invite: {
          select: {
            id: true,
            token: true,
            status: true,
            createdAt: true,
            vendorId: true,
            vendorEmail: true,
          },
        },
        vendor: {
          select: {
            vendorId: true,
            legalName: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch W-9 submissions' }, { status: 500 });
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
    const {
      inviteId,
      legalName,
      email,
      address,
      state,
      taxIdType,
      taxId,
      entityType,
      eSigned,
      signatureName,
      signatureDate,
    } = body;

    if (!inviteId || !legalName || !taxIdType || !taxId || !entityType) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Verify invite exists and belongs to this company
    const invite = await (prisma as any).w9Invite.findFirst({
      where: { id: inviteId, companyId: dbUser.companyId },
    });
    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    const submission = await (prisma as any).w9Submission.create({
      data: {
        approvalStatus: 'PENDING',
        legalName,
        email: email ?? null,
        address: address ?? null,
        state: state ?? null,
        taxIdType,
        taxId,
        entityType,
        eSigned: Boolean(eSigned),
        signatureName: signatureName ?? null,
        signatureDate: signatureDate ? new Date(signatureDate) : null,
        submittedAt: new Date(),
        companyId: dbUser.companyId,
        vendorId: invite.vendorId,
        inviteId,
      },
      include: {
        vendor: { select: { vendorId: true, legalName: true, email: true } },
        invite: { select: { token: true, status: true } },
      },
    });

    // Update invite status
    await (prisma as any).w9Invite.update({
      where: { id: inviteId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: dbUser.id,
        entityType: 'VENDOR',
        entityId: submission.id,
        newValues: { inviteId, legalName, email, taxIdType, entityType },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create W-9 submission' }, { status: 500 });
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
    const { id, approvalStatus, reviewNotes } = body;

    if (!id || !approvalStatus) {
      return NextResponse.json({ error: 'Submission ID and approval status required' }, { status: 400 });
    }

    const submission = await (prisma as any).w9Submission.findFirst({
      where: { id, companyId: dbUser.companyId },
    });
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const updated = await (prisma as any).w9Submission.update({
      where: { id },
      data: {
        approvalStatus,
        reviewNotes: reviewNotes ?? null,
        reviewedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        userId: dbUser.id,
        entityType: 'VENDOR',
        entityId: updated.id,
        newValues: { approvalStatus, reviewNotes },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update W-9 submission' }, { status: 500 });
  }
}
