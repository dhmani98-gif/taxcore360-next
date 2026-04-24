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
    const includePlans = searchParams.get('includePlans') === 'true';

    // Get available plans
    const plans = await (prisma as any).subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });

    // Get company's current subscription
    const companySubscription = await (prisma as any).companySubscription.findFirst({
      where: { companyId: dbUser.companyId },
      include: {
        plan: true,
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    // Get company users for user management
    const companyUsers = await prisma.user.findMany({
      where: { companyId: dbUser.companyId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    const response: any = {
      companySubscription,
      companyUsers
    };

    if (includePlans) {
      response.plans = plans;
    }

    return NextResponse.json(response);
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

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { planId, action } = body;

    if (!planId || !action) {
      return NextResponse.json({ error: 'Plan ID and action required' }, { status: 400 });
    }

    // Get the plan
    const plan = await (prisma as any).subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (action === 'subscribe') {
      // Create or update subscription
      const existingSubscription = await (prisma as any).companySubscription.findFirst({
        where: { companyId: dbUser.companyId }
      });

      const subscription = await (prisma as any).companySubscription.upsert({
        where: { companyId: dbUser.companyId },
        create: {
          companyId: dbUser.companyId,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        update: {
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true }
      });

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          userId: dbUser.id,
          entityType: 'COMPANY',
          entityId: subscription.id,
          newValues: { planId: plan.id, planName: plan.name },
          companyId: dbUser.companyId,
        },
      });

      return NextResponse.json(subscription);
    } else if (action === 'cancel') {
      const subscription = await (prisma as any).companySubscription.findFirst({
        where: { companyId: dbUser.companyId }
      });

      if (!subscription) {
        return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
      }

      const updated = await (prisma as any).companySubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: { plan: true }
      });

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          userId: dbUser.id,
          entityType: 'COMPANY',
          entityId: updated.id,
          newValues: { status: 'CANCELLED' },
          companyId: dbUser.companyId,
        },
      });

      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
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

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 });
    }

    // Verify user belongs to same company
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, companyId: dbUser.companyId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found or not in your company' }, { status: 404 });
    }

    if (action === 'add-user') {
      // Add user to subscription
      const subscription = await (prisma as any).companySubscription.findFirst({
        where: { companyId: dbUser.companyId }
      });

      if (!subscription) {
        return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
      }

      await (prisma as any).subscriptionUser.create({
        data: {
          subscriptionId: subscription.id,
          userId: targetUser.id,
        }
      });

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          userId: dbUser.id,
          entityType: 'USER',
          entityId: targetUser.id,
          newValues: { userId: targetUser.id, email: targetUser.email },
          companyId: dbUser.companyId,
        },
      });

      return NextResponse.json({ message: 'User added to subscription successfully' });
    } else if (action === 'remove-user') {
      // Remove user from subscription
      const subscriptionUser = await (prisma as any).subscriptionUser.findFirst({
        where: {
          subscription: { companyId: dbUser.companyId },
          userId: targetUser.id
        }
      });

      if (!subscriptionUser) {
        return NextResponse.json({ error: 'User not found in subscription' }, { status: 404 });
      }

      await (prisma as any).subscriptionUser.delete({
        where: { id: subscriptionUser.id }
      });

      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          userId: dbUser.id,
          entityType: 'USER',
          entityId: targetUser.id,
          oldValues: { userId: targetUser.id, email: targetUser.email },
          companyId: dbUser.companyId,
        },
      });

      return NextResponse.json({ message: 'User removed from subscription successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('User management error:', error);
    return NextResponse.json({ error: 'Failed to manage subscription users' }, { status: 500 });
  }
}
