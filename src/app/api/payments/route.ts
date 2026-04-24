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
    const vendorId = searchParams.get('vendorId');
    const year = searchParams.get('year');

    const payments = await prisma.payment.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(vendorId && { vendorId }),
        ...(year && {
          paymentDate: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${parseInt(year) + 1}-01-01`),
          },
        }),
      },
      include: { vendor: true, attachments: true },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
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
    const payment = await prisma.payment.create({
      data: {
        ...body,
        companyId: dbUser.companyId,
        paymentDate: new Date(body.paymentDate),
        ...(body.invoiceDate && { invoiceDate: new Date(body.invoiceDate) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: dbUser.id,
        entityType: 'PAYMENT',
        entityId: payment.id,
        newValues: body,
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
