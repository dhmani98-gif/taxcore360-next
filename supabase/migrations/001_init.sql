-- TaxCore360 Database Schema
-- Generated from Prisma schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- Enums
-- ═══════════════════════════════════════════════════════════

CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTANT', 'PAYROLL_SPECIALIST', 'USER', 'VIEWER');
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', 'SUSPENDED');
CREATE TYPE "TaxIdType" AS ENUM ('EIN', 'SSN', 'ITIN');
CREATE TYPE "EntityType" AS ENUM ('INDIVIDUAL', 'SOLE_PROPRIETORSHIP', 'LLC_SINGLE_MEMBER', 'LLC_PARTNERSHIP', 'LLC_C_CORP', 'LLC_S_CORP', 'C_CORPORATION', 'S_CORPORATION', 'PARTNERSHIP', 'TRUST', 'ESTATE', 'NONPROFIT');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'ACH', 'WIRE', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'OTHER');
CREATE TYPE "FormType" AS ENUM ('W2', 'W3', 'NEC1099', 'MISC1099', 'INT1099', 'DIV1099', 'R1099', 'B1099', 'K1099', 'SA1099', 'FORM940', 'FORM941', 'FORM943', 'FORM944', 'FORM945', 'CT1');
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'GENERATED', 'REVIEW_PENDING', 'APPROVED', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'CORRECTED', 'VOID');
CREATE TYPE "RecipientType" AS ENUM ('EMPLOYEE', 'VENDOR', 'CONTRACTOR', 'OTHER');
CREATE TYPE "CopyType" AS ENUM ('COPY_A', 'COPY_B', 'COPY_C', 'COPY_1', 'COPY_2', 'STATE');
CREATE TYPE "FilingMethod" AS ENUM ('EFILE', 'PAPER', 'THIRD_PARTY');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'GENERATE', 'SUBMIT', 'DOWNLOAD', 'PRINT', 'VOID', 'CORRECT', 'VERIFY', 'APPROVE', 'REJECT');
CREATE TYPE "AuditEntityType" AS ENUM ('EMPLOYEE', 'VENDOR', 'PAYMENT', 'PAYROLL', 'TAX_FORM', 'COMPANY', 'USER', 'SETTING', 'ATTACHMENT');
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'IN_APP', 'PUSH');
CREATE TYPE "NotificationChannel" AS ENUM ('DEADLINE', 'FILING', 'SYSTEM', 'SECURITY', 'PAYMENT', 'REMINDER', 'APPROVAL', 'ERROR');
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- ═══════════════════════════════════════════════════════════
-- Core Models
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "companies" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ein" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "dbaName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "companies_ein_key" UNIQUE ("ein")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OPERATIONS_MANAGER',
    "supabaseUid" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "companyId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_supabaseUid_key" UNIQUE ("supabaseUid")
);

-- ═══════════════════════════════════════════════════════════
-- Employee Management
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "employees" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ssn" TEXT NOT NULL,
    "ssnHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "department" TEXT,
    "jobTitle" TEXT,
    "hireDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "grossPay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "salary" DECIMAL(12,2),
    "hourlyRate" DECIMAL(8,2),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "isExempt" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employees_ssnHash_key" UNIQUE ("ssnHash")
);

CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "payPeriod" TEXT NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,
    "regularHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "regularPay" DECIMAL(12,2) NOT NULL,
    "overtimePay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossPay" DECIMAL(12,2) NOT NULL,
    "federalWithholding" DECIMAL(12,2) NOT NULL,
    "socialSecurity" DECIMAL(12,2) NOT NULL,
    "medicare" DECIMAL(12,2) NOT NULL,
    "stateTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "localTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pretaxDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "posttaxDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(12,2) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════
-- 1099 Vendor Management
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "vendors" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vendorId" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "taxIdHash" TEXT NOT NULL,
    "taxIdType" "TaxIdType" NOT NULL,
    "tinVerified" BOOLEAN NOT NULL DEFAULT false,
    "tinVerifiedAt" TIMESTAMP(3),
    "tinMatchName" TEXT,
    "tinVerificationCode" TEXT,
    "legalName" TEXT NOT NULL,
    "dbaName" TEXT,
    "entityType" "EntityType" NOT NULL,
    "address" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "w9Requested" BOOLEAN NOT NULL DEFAULT false,
    "w9RequestedAt" TIMESTAMP(3),
    "w9Received" BOOLEAN NOT NULL DEFAULT false,
    "w9ReceivedAt" TIMESTAMP(3),
    "w9FileUrl" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vendors_vendorId_key" UNIQUE ("vendorId"),
    CONSTRAINT "vendors_taxIdHash_key" UNIQUE ("taxIdHash")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "description" TEXT,
    "is1099Reportable" BOOLEAN NOT NULL DEFAULT true,
    "box7Nec" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "box1Misc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "box2Misc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "box3Misc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "box6Misc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CHECK',
    "checkNumber" TEXT,
    "vendorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attachments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "ocrText" TEXT,
    "ocrConfidence" DECIMAL(5,2),
    "paymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════
-- Tax Forms
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "tax_forms" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" "FormType" NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientType" "RecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "copyType" "CopyType",
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "federalWithheld" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stateCode" TEXT,
    "stateIdNumber" TEXT,
    "stateWithheld" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "xmlUrl" TEXT,
    "txtUrl" TEXT,
    "filedWith" "FilingMethod",
    "submittedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "isCorrection" BOOLEAN NOT NULL DEFAULT false,
    "correctionSeq" INTEGER NOT NULL DEFAULT 0,
    "originalFormId" TEXT,
    "rejectionCode" TEXT,
    "rejectionReason" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_forms_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════
-- Audit & Compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "action" "AuditAction" NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════
-- Notifications
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tax_deadlines" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "formType" "FormType" NOT NULL,
    "year" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "penaltyAmount" DECIMAL(12,2),
    "isFederal" BOOLEAN NOT NULL DEFAULT true,
    "state" TEXT,
    "reminder30Sent" BOOLEAN NOT NULL DEFAULT false,
    "reminder14Sent" BOOLEAN NOT NULL DEFAULT false,
    "reminder7Sent" BOOLEAN NOT NULL DEFAULT false,
    "reminder1Sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_deadlines_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tax_deadlines_formType_year_state_key" UNIQUE ("formType", "year", "state")
);

-- ═══════════════════════════════════════════════════════════
-- Settings
-- ═══════════════════════════════════════════════════════════

CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "companyId" TEXT NOT NULL,
    "payPeriodType" TEXT NOT NULL DEFAULT 'BIWEEKLY',
    "payDay" INTEGER NOT NULL DEFAULT 5,
    "depositSchedule" TEXT NOT NULL DEFAULT 'MONTHLY',
    "lookbackPeriod" TIMESTAMP(3),
    "necThreshold" DECIMAL(12,2) NOT NULL DEFAULT 600,
    "miscThreshold" DECIMAL(12,2) NOT NULL DEFAULT 600,
    "quickbooksConnected" BOOLEAN NOT NULL DEFAULT false,
    "quickbooksRealmId" TEXT,
    "defaultEmailTemplate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_settings_companyId_key" UNIQUE ("companyId")
);

-- ═══════════════════════════════════════════════════════════
-- Foreign Keys
-- ═══════════════════════════════════════════════════════════

ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tax_forms" ADD CONSTRAINT "tax_forms_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX "employees_companyId_status_idx" ON "employees"("companyId", "status");
CREATE INDEX "payrolls_companyId_payDate_idx" ON "payrolls"("companyId", "payDate");
CREATE INDEX "payrolls_employeeId_payDate_idx" ON "payrolls"("employeeId", "payDate");
CREATE INDEX "vendors_companyId_tinVerified_idx" ON "vendors"("companyId", "tinVerified");
CREATE INDEX "payments_companyId_paymentDate_idx" ON "payments"("companyId", "paymentDate");
CREATE INDEX "payments_vendorId_paymentDate_idx" ON "payments"("vendorId", "paymentDate");
CREATE INDEX "tax_forms_companyId_type_year_idx" ON "tax_forms"("companyId", "type", "year");
CREATE INDEX "tax_forms_companyId_status_idx" ON "tax_forms"("companyId", "status");
CREATE INDEX "tax_forms_recipientId_year_idx" ON "tax_forms"("recipientId", "year");
CREATE INDEX "audit_logs_companyId_createdAt_idx" ON "audit_logs"("companyId", "createdAt");
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");
CREATE INDEX "notifications_userId_read_createdAt_idx" ON "notifications"("userId", "read", "createdAt");
CREATE INDEX "notifications_userId_channel_createdAt_idx" ON "notifications"("userId", "channel", "createdAt");

-- ═══════════════════════════════════════════════════════════
-- Updated-at Triggers
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION "update_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "companies_updated_at" BEFORE UPDATE ON "companies" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "users_updated_at" BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "employees_updated_at" BEFORE UPDATE ON "employees" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "payrolls_updated_at" BEFORE UPDATE ON "payrolls" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "vendors_updated_at" BEFORE UPDATE ON "vendors" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "payments_updated_at" BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "tax_forms_updated_at" BEFORE UPDATE ON "tax_forms" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();
CREATE TRIGGER "company_settings_updated_at" BEFORE UPDATE ON "company_settings" FOR EACH ROW EXECUTE FUNCTION "update_updated_at"();

-- ═══════════════════════════════════════════════════════════
-- RLS Policies (Row Level Security)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payrolls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tax_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tax_deadlines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_settings" ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_role_all" ON "companies" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "users" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "employees" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "payrolls" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "vendors" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "payments" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "attachments" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "tax_forms" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "audit_logs" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "notifications" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "tax_deadlines" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON "company_settings" FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read their company data
CREATE POLICY "users_read_own_company" ON "companies" FOR SELECT USING (auth.role() = 'authenticated' AND id IN (SELECT c.id FROM companies c JOIN users u ON u."companyId" = c.id WHERE u."supabaseUid" = auth.uid()::text));
CREATE POLICY "users_read_own_company_users" ON "users" FOR SELECT USING (auth.role() = 'authenticated' AND "companyId" IN (SELECT u."companyId" FROM users u WHERE u."supabaseUid" = auth.uid()::text));
CREATE POLICY "users_read_own_company_employees" ON "employees" FOR SELECT USING (auth.role() = 'authenticated' AND "companyId" IN (SELECT u."companyId" FROM users u WHERE u."supabaseUid" = auth.uid()::text));
CREATE POLICY "users_read_own_company_vendors" ON "vendors" FOR SELECT USING (auth.role() = 'authenticated' AND "companyId" IN (SELECT u."companyId" FROM users u WHERE u."supabaseUid" = auth.uid()::text));
CREATE POLICY "users_read_own_company_payments" ON "payments" FOR SELECT USING (auth.role() = 'authenticated' AND "companyId" IN (SELECT u."companyId" FROM users u WHERE u."supabaseUid" = auth.uid()::text));
CREATE POLICY "users_read_own_notifications" ON "notifications" FOR SELECT USING (auth.role() = 'authenticated' AND "userId" IN (SELECT u.id FROM users u WHERE u."supabaseUid" = auth.uid()::text));

-- ═══════════════════════════════════════════════════════════
-- Seed: Default Company
-- ═══════════════════════════════════════════════════════════

INSERT INTO "companies" ("id", "ein", "legalName", "dbaName", "address", "city", "state", "zipCode", "phone", "email")
VALUES ('cm_default_01', '12-3456789', 'TaxCore360 Holdings LLC', 'TaxCore360', '123 Tax Ave', 'Houston', 'TX', '77001', '713-555-0100', 'admin@taxcore360.com');

INSERT INTO "company_settings" ("companyId", "payPeriodType", "depositSchedule", "necThreshold", "miscThreshold")
VALUES ('cm_default_01', 'BIWEEKLY', 'MONTHLY', 600.00, 600.00);

-- Tax Deadlines for 2026
INSERT INTO "tax_deadlines" ("formType", "year", "dueDate", "description", "penaltyAmount", "isFederal", "state") VALUES
('NEC1099', 2026, '2026-02-01', '1099-NEC filing deadline', 260.00, true, NULL),
('MISC1099', 2026, '2026-03-01', '1099-MISC filing deadline', 260.00, true, NULL),
('W2', 2026, '2026-02-01', 'W-2 filing deadline', 260.00, true, NULL),
('W3', 2026, '2026-02-01', 'W-3 transmittal deadline', 260.00, true, NULL),
('FORM941', 2026, '2026-04-30', 'Q1 Form 941 deadline', 50.00, true, NULL),
('FORM941', 2026, '2026-07-31', 'Q2 Form 941 deadline', 50.00, true, NULL),
('FORM941', 2026, '2026-10-31', 'Q3 Form 941 deadline', 50.00, true, NULL),
('FORM941', 2026, '2027-01-31', 'Q4 Form 941 deadline', 50.00, true, NULL),
('FORM940', 2026, '2027-01-31', 'Annual Form 940 deadline', 50.00, true, NULL);
