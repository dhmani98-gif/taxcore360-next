import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createAuditLog } from '@/lib/db';
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

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('companyId')
      .eq('supabaseUid', user.id)
      .single();
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Query W9 invites from Supabase
    let query = supabaseAdmin.from('w9_invites').select('*').eq('company_id', dbUser.companyId);
    if (status) query = query.eq('status', status);
    
    const { data: invites, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json(invites || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch W-9 invites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, companyId')
      .eq('supabaseUid', user.id)
      .single();
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { vendorId, vendorEmail } = body;

    if (!vendorId && !vendorEmail) {
      return NextResponse.json({ error: 'Either vendorId or vendorEmail is required' }, { status: 400 });
    }

    const token = generateToken();

    const { data: invite, error } = await supabaseAdmin
      .from('w9_invites')
      .insert({
        token,
        status: 'SENT',
        vendor_email: vendorEmail ?? null,
        company_id: dbUser.companyId,
        vendor_id: vendorId ?? null,
        viewed_at: null,
        completed_at: null,
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      action: 'CREATE',
      userId: dbUser.id,
      entityType: 'VENDOR',
      entityId: invite.id,
      companyId: dbUser.companyId,
      newValues: { token, vendorId, vendorEmail },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create W-9 invite' }, { status: 500 });
  }
}
