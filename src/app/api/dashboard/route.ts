import { NextResponse } from 'next/server';
import { db, supabaseAdmin } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const companyId = dbUser.companyId;

    // Fetch all data in parallel
    const [
      employees,
      vendors,
      taxForms,
      payments,
      company,
    ] = await Promise.all([
      db.employees.findMany({ companyId }),
      db.vendors.findMany({ companyId }),
      db.taxForms.findMany({ companyId }),
      db.payments.findMany({ companyId }),
      db.companies.findUnique({ id: companyId }),
    ]);

    // Calculate counts and aggregations
    const employeeCount = employees.filter(e => e.status === 'ACTIVE').length;
    const vendorCount = vendors.length;
    const taxFormCount = taxForms.length;
    const pendingForms = taxForms.filter(t => ['DRAFT', 'REVIEW_PENDING'].includes(t.status)).length;
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const total1099Nec = payments.reduce((sum, p) => sum + (p.box7Nec || 0), 0);

    // Fetch upcoming deadlines from Supabase
    const { data: upcomingDeadlines } = await supabaseAdmin
      .from('tax_deadlines')
      .select('*')
      .gte('dueDate', new Date().toISOString())
      .order('dueDate', { ascending: true })
      .limit(5);

    return NextResponse.json({
      employeeCount,
      vendorCount,
      taxFormCount,
      pendingForms,
      totalPayments,
      total1099Nec,
      upcomingDeadlines: upcomingDeadlines || [],
      company,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
