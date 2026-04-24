# Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account
- Supabase project (already created)

## Step 1: Push to GitHub

```bash
cd C:\Users\AlShaheen\AppData\Local\Programs\Windsurf\taxcore360-next

git init
git add .
git commit -m "Initial TaxCore360 Next.js migration"

# Create new repository on GitHub
git remote add origin https://github.com/yourusername/taxcore360-next.git
git push -u origin main
```

## Step 2: Deploy to Railway

1. **Login to Railway:** https://railway.app
2. **New Project:** Click "Deploy from GitHub repo"
3. **Select:** taxcore360-next repository
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xcnkegvtqwtaodvogbij.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbmtlZ3Z0cXd0YW9kdm9nYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTA4MzEsImV4cCI6MjA5MjM4NjgzMX0.qhO6O9aZfUkFltLt-ZuQDiRPA43f7-iDO6GJRpwbWCA
   DATABASE_URL=postgresql://postgres.xcnkegvtqwtaodvogbij:%2baz5R*rc%25g4%23%3f-J@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   NEXTAUTH_URL=https://your-app-name.railway.app
   NEXTAUTH_SECRET=your-production-secret-here
   ```

5. **Build Settings:**
   - Build Command: `npm run build`
   - Start Command: `npm run start`

6. **Deploy:** Click "Deploy Now"

## Step 3: Configure Supabase

1. **Update Site URL:** https://supabase.com/dashboard/project/xcnkegvtqwtaodvogbij/auth
   - Site URL: `https://your-app-name.railway.app`
   - Redirect URLs: Add Railway URL

2. **Enable Email Auth:** Already configured

## Step 4: Test Production

1. **Access:** https://your-app-name.railway.app
2. **Test:** Sign up and login
3. **Verify:** Dashboard loads with data

## Troubleshooting

### Build Issues
- Check Railway logs
- Verify environment variables
- Ensure Node.js version compatibility

### Database Connection
- Verify DATABASE_URL format
- Check Supabase pooler settings
- Test connection string locally

### Auth Issues
- Verify Supabase site URL
- Check redirect URLs
- Test email confirmation

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Auth working
- [ ] Dashboard loads data
- [ ] API endpoints responding
- [ ] SSL certificate active
- [ ] Custom domain (optional)
