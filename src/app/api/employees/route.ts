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
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const employees = await prisma.employee.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(status && { status: status as any }),
        ...(department && { department }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
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
    const employee = await prisma.employee.create({
      data: {
        ...body,
        companyId: dbUser.companyId,
        fullName: `${body.firstName} ${body.lastName}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: dbUser.id,
        entityType: 'EMPLOYEE',
        entityId: employee.id,
        newValues: body,
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
