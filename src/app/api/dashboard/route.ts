import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUid: user.id },
      include: { company: true },
    });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const companyId = dbUser.companyId;

    const [
      employeeCount,
      vendorCount,
      taxFormCount,
      pendingForms,
      totalPayments,
      upcomingDeadlines,
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.vendor.count({ where: { companyId } }),
      prisma.taxForm.count({ where: { companyId } }),
      prisma.taxForm.count({ where: { companyId, status: { in: ['DRAFT', 'REVIEW_PENDING'] } } }),
      prisma.payment.aggregate({
        where: { companyId },
        _sum: { amount: true, box7Nec: true },
      }),
      prisma.taxDeadline.findMany({
        where: { dueDate: { gte: new Date() } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      employeeCount,
      vendorCount,
      taxFormCount,
      pendingForms,
      totalPayments: totalPayments._sum.amount ?? 0,
      total1099Nec: totalPayments._sum.box7Nec ?? 0,
      upcomingDeadlines,
      company: dbUser.company,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
