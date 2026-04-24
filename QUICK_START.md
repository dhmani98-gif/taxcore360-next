# TaxCore360 Next.js - Quick Start

## Status: **LIVE** on http://localhost:3000

## Step 1: Create Your Account

1. **Open:** http://localhost:3000
2. **Click:** "Sign In" 
3. **Sign Up:** Create new account with email/password
4. **Check Email:** Confirm email (check spam folder)

## Step 2: Link Account to Database

After signing up, you need to create a user record:

1. **Get your User ID:**
   - Go to https://supabase.com/dashboard/project/xcnkegvtqwtaodvogbij/auth
   - Find your email in the Users table
   - Copy the `id` (starts with `auth_`)

2. **Run this SQL** (in Supabase SQL Editor):
   ```sql
   INSERT INTO "users" (
     "id", "email", "name", "role", "supabaseUid", "companyId",
     "createdAt", "updatedAt"
   ) VALUES (
     gen_random_uuid(),
     'your-email@example.com',
     'Your Name',
     'ADMIN',
     'paste-your-auth-id-here',
     'cm_default_01',
     NOW(),
     NOW()
   );
   ```

## Step 3: Add Sample Data (Optional)

Run the sample data script:
```sql
-- Run in Supabase SQL Editor
-- File: scripts/seed-data.sql
```

## Step 4: Explore the Application

### Main Features:
- **Dashboard:** Real-time stats and upcoming deadlines
- **Employees:** Manage workforce and payroll
- **1099 Vendors:** Track contractors and W-9s
- **Payments:** Record and categorize payments
- **Tax Forms:** Generate 1099s and W-2s

### API Endpoints:
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment

## Step 5: Test the Workflow

1. **Add Employee:** Go to `/dashboard/employees`
2. **Add Vendor:** Go to `/dashboard/vendors`  
3. **Record Payment:** Go to `/dashboard/payments`
4. **Generate Tax Form:** Go to `/dashboard/tax-forms`

## Next Steps

### For Production:
1. **Deploy to Railway:** Follow `DEPLOYMENT.md`
2. **Configure Custom Domain:** In Railway settings
3. **Set Up Email:** Configure Resend for notifications
4. **Enable SMS:** Add Twilio credentials

### For Development:
1. **Add Features:** Extend API routes
2. **UI Components:** Copy from old project
3. **IRS Integration:** Add FIRE API for e-filing
4. **Reports:** Build advanced reporting

## Support

- **Database:** https://supabase.com/dashboard/project/xcnkegvtqwtaodvogbij
- **Code Location:** `C:\Users\AlShaheen\AppData\Local\Programs\Windsurf\taxcore360-next`
- **Documentation:** Check `DEPLOYMENT.md` for production setup

## Architecture

```
Frontend: Next.js 15 + TypeScript + Tailwind
Backend: Next.js API Routes
Database: Supabase PostgreSQL
ORM: Prisma 7
Auth: Supabase Auth
Deployment: Railway (recommended)
```

**Your TaxCore360 Next.js application is ready!**
