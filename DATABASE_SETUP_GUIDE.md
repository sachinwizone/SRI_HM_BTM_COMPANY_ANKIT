# Database Connection Issue - Solutions

## Problem
The remote PostgreSQL database (103.122.85.61:9095) is not accessible, causing login failures.

## Solution 1: Install PostgreSQL Locally

### Step 1: Download & Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for 'postgres' user

### Step 2: Create Database
After installation, open Command Prompt or PowerShell and run:
```powershell
# Login to PostgreSQL
psql -U postgres

# Create database (in psql prompt)
CREATE DATABASE creditflow;
\q
```

### Step 3: Update .env file
Update the DATABASE_URL in your .env file:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/creditflow
```

### Step 4: Initialize Database
```powershell
cd "c:\Users\sachi\Desktop\ankit misra project"
npm run db:push
```

### Step 5: Create Admin User
Run this script to create admin user:
```powershell
npx tsx create-admin.js
```

---

## Solution 2: Use Online PostgreSQL (Quick Setup)

Use a free cloud PostgreSQL service:

### Option A: Neon.tech (Recommended)
1. Go to: https://neon.tech
2. Sign up for free
3. Create new project
4. Copy connection string
5. Update DATABASE_URL in .env

### Option B: Supabase
1. Go to: https://supabase.com
2. Create free account
3. Create new project
4. Get connection string from Settings > Database
5. Update DATABASE_URL in .env

---

## Solution 3: Contact Original Database Admin

The original database (103.122.85.61:9095) may require:
- VPN connection
- Firewall whitelist
- Network access permission

Contact the database administrator to enable access.

---

## Quick Fix - Create Admin Script

I'll create a script to set up admin user once database is accessible.
