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

    // Get company users for user management
    const companyUsers = await db.users.findMany({ companyId: dbUser.companyId });

    // Subscriptions feature not implemented with Supabase
    return NextResponse.json({
      companySubscription: null,
      companyUsers,
      plans: []
    });
  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Subscriptions feature not implemented with Supabase
    return NextResponse.json({ error: 'Subscriptions not available' }, { status: 501 });
  } catch (error) {
    console.error('Subscription action error:', error);
    return NextResponse.json({ error: 'Failed to process subscription action' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.users.findUnique({ supabaseUid: user.id });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Subscriptions feature not implemented with Supabase
    return NextResponse.json({ error: 'Subscriptions not available' }, { status: 501 });
  } catch (error) {
    console.error('User management error:', error);
    return NextResponse.json({ error: 'Failed to manage subscription users' }, { status: 500 });
  }
}
