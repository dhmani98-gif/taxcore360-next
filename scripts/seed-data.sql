-- Sample data for testing
-- Run in Supabase SQL Editor after creating user

-- Sample Employees
INSERT INTO "employees" (
  "id", "firstName", "lastName", "fullName", "ssn", "ssnHash", 
  "department", "jobTitle", "grossPay", "status", "companyId", "createdAt", "updatedAt"
) VALUES 
('emp_001', 'John', 'Smith', 'John Smith', '123456789', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Engineering', 'Software Engineer', 75000.00, 'ACTIVE', 'cm_default_01', NOW(), NOW()),
('emp_002', 'Sarah', 'Johnson', 'Sarah Johnson', '987654321', '01ba4719c80b6fe911b091a7c05124b77eee9bb7c8236a2384a0b6a7f0d1c1b', 'Marketing', 'Marketing Manager', 65000.00, 'ACTIVE', 'cm_default_01', NOW(), NOW()),
('emp_003', 'Mike', 'Davis', 'Mike Davis', '456789123', '3c9909afec25354d551dae21590bb0e8693f00293b302e439aff6a2b336c02a', 'Sales', 'Sales Representative', 55000.00, 'ACTIVE', 'cm_default_01', NOW(), NOW());

-- Sample Vendors
INSERT INTO "vendors" (
  "id", "vendorId", "taxId", "taxIdHash", "taxIdType", "tinVerified", 
  "legalName", "entityType", "address", "city", "state", "zipCode",
  "companyId", "createdAt", "updatedAt"
) VALUES 
('vend_001', 'V001', '12-3456789', 'b9a1a96b1b4644ff83fd6d373131513c89f6576e2a55515d0921de9ac8946d9', 'EIN', true, 
 'ABC Consulting LLC', 'LLC_SINGLE_MEMBER', '123 Main St', 'Houston', 'TX', '77001', 'cm_default_01', NOW(), NOW()),
('vend_002', 'V002', '98-7654321', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'EIN', false,
 'XYZ Design Studio', 'INDIVIDUAL', '456 Oak Ave', 'Dallas', 'TX', '75201', 'cm_default_01', NOW(), NOW()),
('vend_003', 'V003', '45-1237896', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'EIN', true,
 'Tech Solutions Inc', 'C_CORPORATION', '789 Pine Rd', 'Austin', 'TX', '78701', 'cm_default_01', NOW(), NOW());

-- Sample Payments
INSERT INTO "payments" (
  "id", "amount", "paymentDate", "invoiceNumber", "description", 
  "is1099Reportable", "box7Nec", "paymentMethod", 
  "vendorId", "companyId", "createdAt", "updatedAt"
) VALUES 
('pay_001', 1500.00, '2026-01-15', 'INV-001', 'Website development services', true, 1500.00, 'CHECK', 'vend_001', 'cm_default_01', NOW(), NOW()),
('pay_002', 800.00, '2026-02-20', 'INV-002', 'Logo design project', true, 800.00, 'ACH', 'vend_002', 'cm_default_01', NOW(), NOW()),
('pay_003', 2200.00, '2026-03-10', 'INV-003', 'Software consulting', true, 2200.00, 'WIRE', 'vend_003', 'cm_default_01', NOW(), NOW()),
('pay_004', 750.00, '2026-04-05', 'INV-004', 'Monthly retainer', true, 750.00, 'CHECK', 'vend_001', 'cm_default_01', NOW(), NOW());

-- Sample Tax Forms
INSERT INTO "tax_forms" (
  "id", "type", "year", "status", "recipientType", "recipientId",
  "totalAmount", "federalWithheld", "companyId", "createdAt", "updatedAt"
) VALUES 
('form_001', 'NEC1099', 2026, 'DRAFT', 'VENDOR', 'vend_001', 1500.00, 0.00, 'cm_default_01', NOW(), NOW()),
('form_002', 'NEC1099', 2026, 'DRAFT', 'VENDOR', 'vend_002', 800.00, 0.00, 'cm_default_01', NOW(), NOW()),
('form_003', 'NEC1099', 2026, 'DRAFT', 'VENDOR', 'vend_003', 2200.00, 0.00, 'cm_default_01', NOW(), NOW());
