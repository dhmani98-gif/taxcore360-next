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
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    let employees = await db.employees.findMany({ companyId: dbUser.companyId });
    
    // Filter by status if provided
    if (status) {
      employees = employees.filter(e => e.status === status);
    }
    
    // Filter by department if provided
    if (department) {
      employees = employees.filter(e => e.department === department);
    }
    
    // Sort by createdAt desc
    employees = employees.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const employee = await db.employees.create({
      ...body,
      companyId: dbUser.companyId,
      fullName: `${body.firstName} ${body.lastName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await createAuditLog({
      action: 'CREATE',
      userId: dbUser.id,
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      companyId: dbUser.companyId,
      newValues: body,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
