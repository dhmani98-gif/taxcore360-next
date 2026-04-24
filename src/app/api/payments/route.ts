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
    const vendorId = searchParams.get('vendorId');
    const year = searchParams.get('year');

    // Fetch payments for company
    let payments = await db.payments.findMany({ companyId: dbUser.companyId });
    
    // Filter by vendorId if provided
    if (vendorId) {
      payments = payments.filter(p => p.vendorId === vendorId);
    }
    
    // Filter by year if provided
    if (year) {
      const yearStart = new Date(`${year}-01-01`).toISOString();
      const yearEnd = new Date(`${parseInt(year) + 1}-01-01`).toISOString();
      payments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate).toISOString();
        return paymentDate >= yearStart && paymentDate < yearEnd;
      });
    }
    
    // Sort by paymentDate desc
    payments = payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
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
    const payment = await db.payments.create({
      ...body,
      companyId: dbUser.companyId,
      paymentDate: new Date(body.paymentDate).toISOString(),
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await createAuditLog({
      action: 'CREATE',
      userId: dbUser.id,
      entityType: 'PAYMENT',
      entityId: payment.id,
      companyId: dbUser.companyId,
      newValues: body,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Failed to create payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
