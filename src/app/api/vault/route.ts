import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createAuditLog } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user info from Supabase
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('companyId')
      .eq('supabaseUid', user.id)
      .single();
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // Query vault documents from Supabase
    let query = supabaseAdmin.from('vault_documents').select('*').eq('company_id', dbUser.companyId);
    if (category) query = query.eq('category', category);
    
    const { data: documents, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json(documents || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vault documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, companyId')
      .eq('supabaseUid', user.id)
      .single();
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

    if (!documentName || !category || !fileUrl) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const { data: document, error } = await supabaseAdmin
      .from('vault_documents')
      .insert({
        document_name: documentName,
        category: category,
        document_year: documentYear,
        vendor_id: vendorId ?? null,
        description: description ?? null,
        file_url: fileUrl,
        file_size: fileSize ?? null,
        file_type: fileType ?? null,
        company_id: dbUser.companyId,
      })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      action: 'CREATE',
      userId: dbUser.id,
      entityType: 'ATTACHMENT',
      entityId: document.id,
      companyId: dbUser.companyId,
      newValues: { documentName, category, documentYear, vendorId },
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

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, companyId')
      .eq('supabaseUid', user.id)
      .single();
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { id, documentName, category, documentYear, vendorId, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (documentName) updateData.document_name = documentName;
    if (category) updateData.category = category;
    if (documentYear) updateData.document_year = documentYear;
    if (vendorId !== undefined) updateData.vendor_id = vendorId;
    if (description !== undefined) updateData.description = description;

    const { data: updated, error } = await supabaseAdmin
      .from('vault_documents')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', dbUser.companyId)
      .select()
      .single();

    if (error) throw error;

    await createAuditLog({
      action: 'UPDATE',
      userId: dbUser.id,
      entityType: 'ATTACHMENT',
      entityId: updated.id,
      companyId: dbUser.companyId,
      newValues: { documentName, category, documentYear, vendorId, description },
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

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, companyId')
      .eq('supabaseUid', user.id)
      .single();
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const { data: document } = await supabaseAdmin
      .from('vault_documents')
      .select('document_name')
      .eq('id', id)
      .eq('company_id', dbUser.companyId)
      .single();

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await supabaseAdmin.from('vault_documents').delete().eq('id', id);

    await createAuditLog({
      action: 'DELETE',
      userId: dbUser.id,
      entityType: 'ATTACHMENT',
      entityId: id,
      companyId: dbUser.companyId,
      oldValues: { documentName: document.document_name },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vault document' }, { status: 500 });
  }
}
