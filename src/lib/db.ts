/**
 * Database utility using Supabase Client
 * Replaces Prisma ORM with direct Supabase queries
 */

import { createClient } from '@supabase/supabase-js';

// Types for database entities
export interface Company {
  id: string;
  ein: string;
  legalName: string;
  dbaName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MANAGER' | 'OPERATIONS_MANAGER' | 'ACCOUNTANT' | 'PAYROLL_SPECIALIST' | 'USER' | 'VIEWER';
  supabaseUid: string | null;
  companyId: string;
  mfaEnabled: boolean;
  emailNotifications: boolean;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  ssn: string;
  ssnHash: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  department: string | null;
  jobTitle: string | null;
  hireDate: string | null;
  grossPay: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE' | 'SUSPENDED';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  vendorId: string;
  taxId: string;
  taxIdHash: string;
  taxIdType: 'EIN' | 'SSN' | 'ITIN';
  tinVerified: boolean;
  tinVerifiedAt: string | null;
  tinMatchName: string | null;
  legalName: string;
  dbaName: string | null;
  entityType: string;
  address: string;
  address2: string | null;
  city: string | null;
  state: string;
  zipCode: string | null;
  email: string | null;
  phone: string | null;
  w9Requested: boolean;
  w9RequestedAt: string | null;
  w9Received: boolean;
  w9ReceivedAt: string | null;
  w9FileUrl: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  invoiceNumber: string | null;
  description: string | null;
  is1099Reportable: boolean;
  box7Nec: number;
  paymentMethod: 'CASH' | 'CHECK' | 'ACH' | 'WIRE' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'OTHER';
  vendorId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxForm {
  id: string;
  type: string;
  year: number;
  status: 'DRAFT' | 'GENERATED' | 'REVIEW_PENDING' | 'APPROVED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'CORRECTED' | 'VOID';
  recipientType: 'EMPLOYEE' | 'VENDOR' | 'CONTRACTOR' | 'OTHER';
  recipientId: string;
  totalAmount: number;
  federalWithheld: number;
  pdfUrl: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  channel: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  readAt: string | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  userId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string | null;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  companyId: string;
  createdAt: string;
}

// Admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database helper functions
export const db = {
  // Company operations
  companies: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', where.id)
        .single();
      if (error) throw error;
      return data as Company | null;
    },
    async findFirst(where: { ein?: string; email?: string; legalName?: string }) {
      let query = supabaseAdmin.from('companies').select('*');
      if (where.ein) query = query.eq('ein', where.ein);
      if (where.email) query = query.eq('email', where.email);
      if (where.legalName) query = query.eq('legalName', where.legalName);
      const { data, error } = await query.single();
      if (error) throw error;
      return data as Company | null;
    },
    async create(data: Partial<Company>) {
      const { data: result, error } = await supabaseAdmin
        .from('companies')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Company;
    },
    async update(where: { id: string }, data: Partial<Company>) {
      const { data: result, error } = await supabaseAdmin
        .from('companies')
        .update(data)
        .eq('id', where.id)
        .select()
        .single();
      if (error) throw error;
      return result as Company;
    },
  },

  // Company settings operations
  companySettings: {
    async findFirst(where: { companyId: string }) {
      const { data, error } = await supabaseAdmin
        .from('company_settings')
        .select('*')
        .eq('companyId', where.companyId)
        .single();
      if (error) throw error;
      return data;
    },
    async upsert(data: any) {
      const { data: existing } = await supabaseAdmin
        .from('company_settings')
        .select('id')
        .eq('companyId', data.companyId)
        .single();
      
      if (existing) {
        const { data: result, error } = await supabaseAdmin
          .from('company_settings')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabaseAdmin
          .from('company_settings')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
  },

  // User operations
  users: {
    async findUnique(where: { id?: string; email?: string; supabaseUid?: string }) {
      let query = supabaseAdmin.from('users').select('*');
      if (where.id) query = query.eq('id', where.id);
      if (where.email) query = query.eq('email', where.email);
      if (where.supabaseUid) query = query.eq('supabaseUid', where.supabaseUid);
      const { data, error } = await query.single();
      if (error) throw error;
      return data as User | null;
    },
    async findFirst(where: { email?: string; supabaseUid?: string }) {
      let query = supabaseAdmin.from('users').select('*');
      if (where.email) query = query.eq('email', where.email);
      if (where.supabaseUid) query = query.eq('supabaseUid', where.supabaseUid);
      const { data, error } = await query.single();
      if (error) throw error;
      return data as User | null;
    },
    async findMany(where: { companyId?: string }) {
      let query = supabaseAdmin.from('users').select('*');
      if (where.companyId) query = query.eq('companyId', where.companyId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as User[];
    },
    async create(data: Partial<User>) {
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as User;
    },
    async update(where: { id: string }, data: Partial<User>) {
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .update(data)
        .eq('id', where.id)
        .select()
        .single();
      if (error) throw error;
      return result as User;
    },
    async delete(where: { id: string }) {
      const { error } = await supabaseAdmin.from('users').delete().eq('id', where.id);
      if (error) throw error;
      return true;
    },
    async count(where?: { companyId?: string; read?: boolean }) {
      let query = supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  },

  // Employee operations
  employees: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseAdmin
        .from('employees')
        .select('*')
        .eq('id', where.id)
        .single();
      if (error) throw error;
      return data as Employee | null;
    },
    async findMany(where?: { companyId?: string; status?: string }) {
      let query = supabaseAdmin.from('employees').select('*');
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      if (where?.status) query = query.eq('status', where.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Employee[];
    },
    async create(data: Partial<Employee>) {
      const { data: result, error } = await supabaseAdmin
        .from('employees')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Employee;
    },
    async update(where: { id: string }, data: Partial<Employee>) {
      const { data: result, error } = await supabaseAdmin
        .from('employees')
        .update(data)
        .eq('id', where.id)
        .select()
        .single();
      if (error) throw error;
      return result as Employee;
    },
    async delete(where: { id: string }) {
      const { error } = await supabaseAdmin.from('employees').delete().eq('id', where.id);
      if (error) throw error;
      return true;
    },
    async count(where?: { companyId?: string }) {
      let query = supabaseAdmin.from('employees').select('*', { count: 'exact', head: true });
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  },

  // Vendor operations
  vendors: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('id', where.id)
        .single();
      if (error) throw error;
      return data as Vendor | null;
    },
    async findFirst(where: { id?: string; vendorId?: string; companyId?: string }) {
      let query = supabaseAdmin.from('vendors').select('*');
      if (where.id) query = query.eq('id', where.id);
      if (where.vendorId) query = query.eq('vendorId', where.vendorId);
      if (where.companyId) query = query.eq('companyId', where.companyId);
      const { data, error } = await query.single();
      if (error) throw error;
      return data as Vendor | null;
    },
    async findMany(where?: { companyId?: string; tinVerified?: boolean }) {
      let query = supabaseAdmin.from('vendors').select('*');
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      if (where?.tinVerified !== undefined) query = query.eq('tinVerified', where.tinVerified);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Vendor[];
    },
    async create(data: Partial<Vendor>) {
      const { data: result, error } = await supabaseAdmin
        .from('vendors')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Vendor;
    },
    async update(id: string, data: Partial<Vendor>) {
      const { data: result, error } = await supabaseAdmin
        .from('vendors')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result as Vendor;
    },
    async delete(where: { id: string }) {
      const { error } = await supabaseAdmin.from('vendors').delete().eq('id', where.id);
      if (error) throw error;
      return true;
    },
    async count(where?: { companyId?: string }) {
      let query = supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true });
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    async groupBy(by: string, where?: { companyId?: string }) {
      let query = supabaseAdmin.from('vendors').select(by);
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      const { data, error } = await query;
      if (error) throw error;
      // Group data manually
      const grouped: Record<string, { _count: { id: number } }> = {};
      (data || []).forEach((item: any) => {
        const key = item[by];
        if (!grouped[key]) grouped[key] = { _count: { id: 0 } };
        grouped[key]._count.id++;
      });
      return Object.entries(grouped).map(([key, value]) => ({ [by]: key, ...value }));
    },
  },

  // Payment operations
  payments: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', where.id)
        .single();
      if (error) throw error;
      return data as Payment | null;
    },
    async findMany(where?: { companyId?: string; vendorId?: string }) {
      let query = supabaseAdmin.from('payments').select('*');
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      if (where?.vendorId) query = query.eq('vendorId', where.vendorId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Payment[];
    },
    async create(data: Partial<Payment>) {
      const { data: result, error } = await supabaseAdmin
        .from('payments')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Payment;
    },
    async update(where: { id: string }, data: Partial<Payment>) {
      const { data: result, error } = await supabaseAdmin
        .from('payments')
        .update(data)
        .eq('id', where.id)
        .select()
        .single();
      if (error) throw error;
      return result as Payment;
    },
    async delete(where: { id: string }) {
      const { error } = await supabaseAdmin.from('payments').delete().eq('id', where.id);
      if (error) throw error;
      return true;
    },
  },

  // TaxForm operations
  taxForms: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseAdmin
        .from('tax_forms')
        .select('*')
        .eq('id', where.id)
        .single();
      if (error) throw error;
      return data as TaxForm | null;
    },
    async findMany(where?: { companyId?: string; type?: string; year?: number; status?: string; recipientId?: string }) {
      let query = supabaseAdmin.from('tax_forms').select('*');
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      if (where?.type) query = query.eq('type', where.type);
      if (where?.year) query = query.eq('year', where.year);
      if (where?.status) query = query.eq('status', where.status);
      if (where?.recipientId) query = query.eq('recipientId', where.recipientId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as TaxForm[];
    },
    async create(data: Partial<TaxForm>) {
      const { data: result, error } = await supabaseAdmin
        .from('tax_forms')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as TaxForm;
    },
    async update(where: { id: string }, data: Partial<TaxForm>) {
      const { data: result, error } = await supabaseAdmin
        .from('tax_forms')
        .update(data)
        .eq('id', where.id)
        .select()
        .single();
      if (error) throw error;
      return result as TaxForm;
    },
    async delete(where: { id: string }) {
      const { error } = await supabaseAdmin.from('tax_forms').delete().eq('id', where.id);
      if (error) throw error;
      return true;
    },
    async count(where?: { companyId?: string; status?: string }) {
      let query = supabaseAdmin.from('tax_forms').select('*', { count: 'exact', head: true });
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      if (where?.status) query = query.eq('status', where.status);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  },

  // Notification operations
  notifications: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('id', where.id)
        .single();
      if (error) throw error;
      return data as Notification | null;
    },
    async findMany(where?: { userId?: string; read?: boolean }, options?: { orderBy?: { createdAt: 'asc' | 'desc' }, take?: number }) {
      let query = supabaseAdmin.from('notifications').select('*');
      if (where?.userId) query = query.eq('userId', where.userId);
      if (where?.read !== undefined) query = query.eq('read', where.read);
      if (options?.orderBy?.createdAt) query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      if (options?.take) query = query.limit(options.take);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Notification[];
    },
    async create(data: Partial<Notification>) {
      const { data: result, error } = await supabaseAdmin
        .from('notifications')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Notification;
    },
    async update(where: { id: string }, data: Partial<Notification>) {
      const { data: result, error } = await supabaseAdmin
        .from('notifications')
        .update(data)
        .eq('id', where.id)
        .select()
        .single();
      if (error) throw error;
      return result as Notification;
    },
    async updateMany(where: { userId: string; read?: boolean }, data: Partial<Notification>) {
      let query = supabaseAdmin.from('notifications').update(data);
      if (where.userId) query = query.eq('userId', where.userId);
      if (where.read !== undefined) query = query.eq('read', where.read);
      const { error } = await query;
      if (error) throw error;
      return { count: 1 }; // Approximation
    },
    async delete(where: { id: string }) {
      const { error } = await supabaseAdmin.from('notifications').delete().eq('id', where.id);
      if (error) throw error;
      return true;
    },
    async count(where?: { userId?: string; read?: boolean }) {
      let query = supabaseAdmin.from('notifications').select('*', { count: 'exact', head: true });
      if (where?.userId) query = query.eq('userId', where.userId);
      if (where?.read !== undefined) query = query.eq('read', where.read);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  },

  // AuditLog operations
  auditLogs: {
    async create(data: Partial<AuditLog>) {
      const { data: result, error } = await supabaseAdmin
        .from('audit_logs')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as AuditLog;
    },
    async findMany(where?: { companyId?: string; entityType?: string; entityId?: string }, options?: { orderBy?: { createdAt: 'asc' | 'desc' }, take?: number }) {
      let query = supabaseAdmin.from('audit_logs').select('*');
      if (where?.companyId) query = query.eq('companyId', where.companyId);
      if (where?.entityType) query = query.eq('entityType', where.entityType);
      if (where?.entityId) query = query.eq('entityId', where.entityId);
      if (options?.orderBy?.createdAt) query = query.order('createdAt', { ascending: options.orderBy.createdAt === 'asc' });
      if (options?.take) query = query.limit(options.take);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditLog[];
    },
  },
};

// Helper function to create audit log (replaces createAuditLog from prisma)
export async function createAuditLog(data: {
  action: string;
  userId?: string;
  entityType: string;
  entityId: string;
  companyId: string;
  oldValues?: any;
  newValues?: any;
}) {
  try {
    await db.auditLogs.create({
      action: data.action,
      userId: data.userId || null,
      entityType: data.entityType,
      entityId: data.entityId,
      companyId: data.companyId,
      oldValues: data.oldValues || null,
      newValues: data.newValues || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
