import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await req.json();
    const { email, name, supabaseUid, plan } = body;

    // Get the default company
    const company = await prisma.company.findFirst({
      where: { legalName: 'TaxCore360 Holdings LLC' }
    });

    if (!company) {
      return NextResponse.json({ error: 'Default company not found' }, { status: 404 });
    }

    // Create user record
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        supabaseUid,
        companyId: company.id,
        role: 'USER',
        emailNotifications: true,
        smsNotifications: false,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: newUser.id,
        entityType: 'USER',
        entityId: newUser.id,
        newValues: { email, name, plan },
        companyId: company.id,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
