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
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    const taxForms = await prisma.taxForm.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(type && { type: type as any }),
        ...(year && { year: parseInt(year) }),
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: 'desc' },
    });

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

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const taxForm = await prisma.taxForm.create({
      data: {
        ...body,
        companyId: dbUser.companyId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'GENERATE',
        userId: dbUser.id,
        entityType: 'TAX_FORM',
        entityId: taxForm.id,
        newValues: body,
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(taxForm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tax form' }, { status: 500 });
  }
}
