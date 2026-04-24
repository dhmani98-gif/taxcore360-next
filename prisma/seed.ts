import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Supabase admin client for creating auth users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Check if we already have data
  const existingCompanies = await prisma.company.count();
  if (existingCompanies > 0) {
    console.log('⚠️  Database already has data. Skipping seed.');
    return;
  }

  // Create sample company
  console.log('🏢 Creating sample company...');
  const company = await prisma.company.create({
    data: {
      id: 'cm_default_01',
      ein: '12-3456789',
      legalName: 'TaxCore360 Demo Company',
      dbaName: 'Demo Corp',
      address: '123 Business Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      phone: '(555) 123-4567',
      email: 'admin@taxcore360.com',
    },
  });
  console.log(`✅ Created company: ${company.legalName}\n`);

  // Create Supabase auth user
  console.log('👤 Creating admin user in Supabase Auth...');
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@taxcore360.com',
    password: 'admin123456',
    email_confirm: true,
    user_metadata: {
      name: 'System Administrator',
    },
  });

  if (authError) {
    console.log('⚠️  Could not create Supabase auth user:', authError.message);
    console.log('   User might already exist or Supabase credentials missing.\n');
  } else {
    console.log(`✅ Created Supabase auth user: ${authUser.user?.email}\n`);
  }

  // Create admin user in database
  console.log('👤 Creating admin user in database...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@taxcore360.com',
      name: 'System Administrator',
      role: 'ADMIN',
      supabaseUid: authUser?.user?.id || 'manual-admin-uid',
      companyId: company.id,
      emailNotifications: true,
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}\n`);

  // Create sample employees
  console.log('👥 Creating sample employees...');
  const employees = await prisma.employee.createMany({
    data: [
      {
        id: 'emp_001',
        ssn: '123456789',
        ssnHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        firstName: 'John',
        lastName: 'Smith',
        fullName: 'John Smith',
        department: 'Engineering',
        jobTitle: 'Software Engineer',
        grossPay: 75000.00,
        status: 'ACTIVE',
        companyId: company.id,
      },
      {
        id: 'emp_002',
        ssn: '987654321',
        ssnHash: '01ba4719c80b6fe911b091a7c05124b77eee9bb7c8236a2384a0b6a7f0d1c1b',
        firstName: 'Sarah',
        lastName: 'Johnson',
        fullName: 'Sarah Johnson',
        department: 'Marketing',
        jobTitle: 'Marketing Manager',
        grossPay: 65000.00,
        status: 'ACTIVE',
        companyId: company.id,
      },
      {
        id: 'emp_003',
        ssn: '456789123',
        ssnHash: '3c9909afec25354d551dae21590bb0e8693f00293b302e439aff6a2b336c02a',
        firstName: 'Mike',
        lastName: 'Davis',
        fullName: 'Mike Davis',
        department: 'Sales',
        jobTitle: 'Sales Representative',
        grossPay: 55000.00,
        status: 'ACTIVE',
        companyId: company.id,
      },
    ],
  });
  console.log(`✅ Created ${employees.count} employees\n`);

  // Create sample vendors
  console.log('🏪 Creating sample vendors...');
  const vendors = await prisma.vendor.createMany({
    data: [
      {
        id: 'vend_001',
        vendorId: 'V001',
        taxId: '123456789',
        taxIdHash: 'b9a1a96b1b4644ff83fd6d373131513c89f6576e2a55515d0921de9ac8946d9',
        taxIdType: 'EIN',
        tinVerified: true,
        legalName: 'ABC Consulting LLC',
        entityType: 'LLC_SINGLE_MEMBER',
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        companyId: company.id,
      },
      {
        id: 'vend_002',
        vendorId: 'V002',
        taxId: '987654321',
        taxIdHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        taxIdType: 'EIN',
        tinVerified: false,
        legalName: 'XYZ Design Studio',
        entityType: 'INDIVIDUAL',
        address: '456 Oak Ave',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        companyId: company.id,
      },
      {
        id: 'vend_003',
        vendorId: 'V003',
        taxId: '451237896',
        taxIdHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        taxIdType: 'EIN',
        tinVerified: true,
        legalName: 'Tech Solutions Inc',
        entityType: 'C_CORPORATION',
        address: '789 Pine Rd',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        companyId: company.id,
      },
    ],
  });
  console.log(`✅ Created ${vendors.count} vendors\n`);

  // Create sample payments
  console.log('💰 Creating sample payments...');
  const payments = await prisma.payment.createMany({
    data: [
      {
        id: 'pay_001',
        amount: 1500.00,
        paymentDate: new Date('2026-01-15'),
        invoiceNumber: 'INV-001',
        description: 'Website development services',
        is1099Reportable: true,
        box7Nec: 1500.00,
        paymentMethod: 'CHECK',
        vendorId: 'vend_001',
        companyId: company.id,
      },
      {
        id: 'pay_002',
        amount: 800.00,
        paymentDate: new Date('2026-02-20'),
        invoiceNumber: 'INV-002',
        description: 'Logo design project',
        is1099Reportable: true,
        box7Nec: 800.00,
        paymentMethod: 'ACH',
        vendorId: 'vend_002',
        companyId: company.id,
      },
      {
        id: 'pay_003',
        amount: 2200.00,
        paymentDate: new Date('2026-03-10'),
        invoiceNumber: 'INV-003',
        description: 'Software consulting',
        is1099Reportable: true,
        box7Nec: 2200.00,
        paymentMethod: 'WIRE',
        vendorId: 'vend_003',
        companyId: company.id,
      },
      {
        id: 'pay_004',
        amount: 750.00,
        paymentDate: new Date('2026-04-05'),
        invoiceNumber: 'INV-004',
        description: 'Monthly retainer',
        is1099Reportable: true,
        box7Nec: 750.00,
        paymentMethod: 'CHECK',
        vendorId: 'vend_001',
        companyId: company.id,
      },
    ],
  });
  console.log(`✅ Created ${payments.count} payments\n`);

  // Create sample tax forms
  console.log('📝 Creating sample tax forms...');
  const taxForms = await prisma.taxForm.createMany({
    data: [
      {
        id: 'form_001',
        type: 'NEC1099',
        year: 2026,
        status: 'DRAFT',
        recipientType: 'VENDOR',
        recipientId: 'vend_001',
        totalAmount: 1500.00,
        federalWithheld: 0.00,
        companyId: company.id,
      },
      {
        id: 'form_002',
        type: 'NEC1099',
        year: 2026,
        status: 'DRAFT',
        recipientType: 'VENDOR',
        recipientId: 'vend_002',
        totalAmount: 800.00,
        federalWithheld: 0.00,
        companyId: company.id,
      },
      {
        id: 'form_003',
        type: 'NEC1099',
        year: 2026,
        status: 'DRAFT',
        recipientType: 'VENDOR',
        recipientId: 'vend_003',
        totalAmount: 2200.00,
        federalWithheld: 0.00,
        companyId: company.id,
      },
    ],
  });
  console.log(`✅ Created ${taxForms.count} tax forms\n`);

  // Create subscription plan
  console.log('📦 Creating subscription plan...');
  const plan = await prisma.subscriptionPlan.create({
    data: {
      id: 'plan_professional',
      name: 'Professional',
      priceCents: 9900, // $99.00 in cents
      interval: 'MONTHLY',
      isActive: true,
      isPopular: true,
      features: JSON.stringify([
        'Unlimited 1099s',
        'Unlimited W-2s',
        'W-9 Intake Portal',
        'TIN Verification',
        'Priority Support',
        '10 Users',
        '100 Employees',
        '100 Vendors',
      ]),
    },
  });
  console.log(`✅ Created subscription plan: ${plan.name}\n`);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: admin@taxcore360.com');
  console.log('   Password: admin123456');
  console.log('\n⚠️  IMPORTANT: Change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
