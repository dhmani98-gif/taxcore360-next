import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // Use direct connection for now
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xcnkegvtqwtaodvogbij:%2baz5R*rc%25g4%23%3f-J@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Manual audit logging helper
 * Use this to create audit logs for operations
 * Note: entityType must be UPPERCASE to match Prisma enum (e.g., 'EMPLOYEE', not 'Employee')
 */
export async function createAuditLog(data: {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'GENERATE' | 'SUBMIT' | 'DOWNLOAD';
  userId?: string;
  entityType: 'EMPLOYEE' | 'VENDOR' | 'PAYMENT' | 'PAYROLL' | 'TAX_FORM' | 'COMPANY' | 'USER' | 'SETTING' | 'ATTACHMENT';
  entityId: string;
  oldValues?: any;
  newValues?: any;
  companyId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        ...data,
        // Ensure proper typing for Prisma
        action: data.action as any,
        entityType: data.entityType as any
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging shouldn't break main operations
    return null;
  }
}
