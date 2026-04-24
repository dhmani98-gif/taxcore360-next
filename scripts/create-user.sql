-- Create first user and link to company
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xcnkegvtqwtaodvogbij/sql

-- First, create a user in Supabase Auth via the dashboard
-- Then run this to create the user record in our database:

INSERT INTO "users" (
  "id", 
  "email", 
  "name", 
  "role", 
  "supabaseUid", 
  "companyId",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@taxcore360.com',
  'Admin User',
  'ADMIN',
  'YOUR_SUPABASE_USER_ID_HERE', -- Replace with actual auth user ID
  'cm_default_01',
  NOW(),
  NOW()
);

-- To get the supabaseUid, after signing up, run:
-- SELECT id, email FROM auth.users WHERE email = 'admin@taxcore360.com';
