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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    let taxForms = await db.taxForms.findMany({ companyId: dbUser.companyId });
    
    // Filter by type if provided
    if (type) {
      taxForms = taxForms.filter(tf => tf.type === type);
    }
    
    // Filter by year if provided
    if (year) {
      taxForms = taxForms.filter(tf => tf.year === parseInt(year));
    }
    
    // Filter by status if provided
    if (status) {
      taxForms = taxForms.filter(tf => tf.status === status);
    }
    
    // Sort by createdAt desc
    taxForms = taxForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(taxForms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tax forms' }, { status: 500 });
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
    const taxForm = await db.taxForms.create({
      ...body,
      companyId: dbUser.companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await createAuditLog({
      action: 'GENERATE',
      userId: dbUser.id,
      entityType: 'TAX_FORM',
      entityId: taxForm.id,
      companyId: dbUser.companyId,
      newValues: body,
    });

    return NextResponse.json(taxForm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tax form' }, { status: 500 });
  }
}
