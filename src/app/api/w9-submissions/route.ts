import { NextRequest, NextResponse } from 'next/server';
import { db, supabaseAdmin, createAuditLog } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const approvalStatus = searchParams.get('approvalStatus');

    // Query W9 submissions from Supabase
    let query = supabaseAdmin.from('w9_submissions').select('*').eq('company_id', dbUser.companyId);
    if (approvalStatus) query = query.eq('approval_status', approvalStatus);
    
    const { data: submissions, error } = await query.order('submitted_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json(submissions || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch W-9 submissions' }, { status: 500 });
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

    // Verify invite exists
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('w9_invites')
      .select('vendor_id')
      .eq('id', inviteId)
      .eq('company_id', dbUser.companyId)
      .single();
    
    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    const { data: submission, error } = await supabaseAdmin
      .from('w9_submissions')
      .insert({
        approval_status: 'PENDING',
        legal_name: legalName,
        email: email ?? null,
        address: address ?? null,
        state: state ?? null,
        tax_id_type: taxIdType,
        tax_id: taxId,
        entity_type: entityType,
        e_signed: Boolean(eSigned),
        signature_name: signatureName ?? null,
        signature_date: signatureDate ? new Date(signatureDate).toISOString() : null,
        submitted_at: new Date().toISOString(),
        company_id: dbUser.companyId,
        vendor_id: invite.vendor_id,
        invite_id: inviteId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update invite status
    await supabaseAdmin
      .from('w9_invites')
      .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
      .eq('id', inviteId);

    await createAuditLog({
      action: 'CREATE',
      userId: dbUser.id,
      entityType: 'VENDOR',
      entityId: submission.id,
      companyId: dbUser.companyId,
      newValues: { inviteId, legalName, email, taxIdType, entityType },
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

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { id, approvalStatus, reviewNotes } = body;

    if (!id || !approvalStatus) {
      return NextResponse.json({ error: 'Submission ID and approval status required' }, { status: 400 });
    }

    // Check submission exists
    const { data: submission } = await supabaseAdmin
      .from('w9_submissions')
      .select('id')
      .eq('id', id)
      .eq('company_id', dbUser.companyId)
      .single();
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update submission
    const { data: updated, error } = await supabaseAdmin
      .from('w9_submissions')
      .update({
        approval_status: approvalStatus,
        review_notes: reviewNotes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      action: 'UPDATE',
      userId: dbUser.id,
      entityType: 'VENDOR',
      entityId: id,
      companyId: dbUser.companyId,
      newValues: { approvalStatus, reviewNotes },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update W-9 submission' }, { status: 500 });
  }
}
