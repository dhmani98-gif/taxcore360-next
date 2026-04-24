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
    const category = searchParams.get('category');
    const year = searchParams.get('year');

    const documents = await (prisma as any).vaultDocument.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(category && { category: category as any }),
        ...(year && { documentYear: year }),
      },
      include: {
        vendor: {
          select: { vendorId: true, legalName: true, email: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vault documents' }, { status: 500 });
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
    const {
      documentName,
      category,
      documentYear,
      vendorId,
      description,
      fileUrl,
      fileSize,
      fileType,
    } = body;

    if (!documentName || !category || !documentYear || !fileUrl) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const document = await (prisma as any).vaultDocument.create({
      data: {
        documentName,
        category: category as any,
        documentYear,
        vendorId: vendorId ?? null,
        description: description ?? null,
        fileUrl,
        fileSize: fileSize ?? null,
        fileType: fileType ?? null,
        uploadedAt: new Date(),
        companyId: dbUser.companyId,
      },
      include: {
        vendor: {
          select: { vendorId: true, legalName: true, email: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: dbUser.id,
        entityType: 'ATTACHMENT',
        entityId: document.id,
        newValues: { documentName, category, documentYear, vendorId },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vault document' }, { status: 500 });
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
    const { id, documentName, category, documentYear, vendorId, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const document = await (prisma as any).vaultDocument.findFirst({
      where: { id, companyId: dbUser.companyId },
    });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updated = await (prisma as any).vaultDocument.update({
      where: { id },
      data: {
        ...(documentName && { documentName }),
        ...(category && { category: category as any }),
        ...(documentYear && { documentYear }),
        ...(vendorId !== undefined && { vendorId: vendorId ?? null }),
        ...(description !== undefined && { description: description ?? null }),
      },
      include: {
        vendor: {
          select: { vendorId: true, legalName: true, email: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        userId: dbUser.id,
        entityType: 'ATTACHMENT',
        entityId: updated.id,
        newValues: { documentName, category, documentYear, vendorId, description },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vault document' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseUid: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const document = await (prisma as any).vaultDocument.findFirst({
      where: { id, companyId: dbUser.companyId },
    });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await (prisma as any).vaultDocument.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        userId: dbUser.id,
        entityType: 'ATTACHMENT',
        entityId: id,
        oldValues: { documentName: document.documentName },
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vault document' }, { status: 500 });
  }
}
