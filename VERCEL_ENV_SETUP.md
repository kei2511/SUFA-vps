# Environment Variables untuk Production (Vercel)

## Instruksi Setup di Vercel Dashboard:

1. Buka: https://vercel.com/dashboard
2. Pilih project: **mhfa**
3. Klik: **Settings** → **Environment Variables**
4. Tambahkan/Update variables berikut untuk environment **Production**:

```
DATABASE_URL=postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

NEXT_PUBLIC_SUPABASE_URL=https://mqjgejhhtrrcykgeqzho.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Y_X6Dls_AmygBoM4tZK4xQ_s6Sv6reC

BETTER_AUTH_SECRET=zR8k2PzL9fJ4mB7wY2qX8vN1cT5oP3uK

BETTER_AUTH_URL=https://mhfa-six.vercel.app

NEXT_PUBLIC_BETTER_AUTH_URL=https://mhfa-six.vercel.app
```

## ⚠️ CRITICAL FIX:

**Masalah:** `BETTER_AUTH_URL` di production masih pointing ke `localhost:3000`

**Fix:** Update menjadi `https://mhfa-six.vercel.app`

Setelah update environment variables, **Redeploy** project untuk apply changes.

## Cara Redeploy:
1. Di Vercel Dashboard → Deployments
2. Klik menu (3 dots) pada latest deployment
3. Pilih **Redeploy**

Atau commit dummy change dan push:
```bash
git commit --allow-empty -m "redeploy: update env vars"
git push origin main
```
