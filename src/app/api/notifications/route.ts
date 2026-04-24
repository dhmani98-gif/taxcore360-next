import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendPasswordResetEmail, sendDeadlineReminderEmail } from '@/lib/services/email';
import { sendUrgentDeadlineSMS } from '@/lib/services/sms';
import { createAuditLog } from '@/lib/prisma';

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: authUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a notification
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: authUser.email },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { type, channel, title, message, data: notificationData } = body;

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type: type || 'EMAIL',
        channel: channel || 'SYSTEM',
        title,
        message,
        data: notificationData || {},
        userId: user.id
      }
    });

    // Send email if requested
    if (type === 'EMAIL' || channel === 'EMAIL') {
      try {
        await sendWelcomeEmail(user.email, user.name || 'User');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      userId: user.id,
      entityType: 'USER',
      entityId: user.id,
      companyId: user.companyId,
      newValues: {
        notificationId: notification.id,
        notificationType: type,
        channel
      }
    });

    return NextResponse.json({ notification }, { status: 201 });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: authUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { notificationId, readAll } = body;

    if (readAll) {
      // Mark all as read
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    // Mark single notification as read
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({ notification });

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: authUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
