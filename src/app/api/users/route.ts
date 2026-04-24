import { NextRequest, NextResponse } from 'next/server';
import { db, createAuditLog } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await req.json();
    const { email, name, supabaseUid, plan } = body;

    // Get the default company
    const company = await db.companies.findFirst({ legalName: 'TaxCore360 Holdings LLC' });

    if (!company) {
      return NextResponse.json({ error: 'Default company not found' }, { status: 404 });
    }

    // Create user record
    const newUser = await db.users.create({
      email,
      name,
      supabaseUid,
      companyId: company.id,
      role: 'USER',
      emailNotifications: true,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      userId: newUser.id,
      entityType: 'USER',
      entityId: newUser.id,
      companyId: company.id,
      newValues: { email, name, plan },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
