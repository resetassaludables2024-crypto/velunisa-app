# Deployment Setup Guide - Velunisa Go

## Current Status

✅ **Completed:**
- `/descargar` page created with PWA and APK installation instructions (commit f858b19)
- GitHub Actions workflow created for automatic deployment (commit 4c767c4)
- Code pushed to GitHub master branch

❌ **Remaining:**
- Vercel project linking and deployment
- Domain DNS configuration
- Environment variables setup in Vercel

---

## Option 1: Manual Vercel Deployment (Recommended for quick setup)

### Step 1: Deploy to Vercel using CLI

```bash
cd apps/web
vercel
```

This will:
- Prompt you to sign in or link to existing Vercel project
- Ask which Vercel account/team to use: `resetassaludables2024-crypto`
- Ask to confirm project settings
- Create a `.vercel` directory with project metadata

### Step 2: Configure Environment Variables in Vercel

Go to `https://vercel.com/resetassaludables2024-crypto/velunisa` → Settings → Environment Variables

Add all variables from `apps/web/.env.local`:
- `DATABASE_URL` (Supabase connection)
- `DIRECT_URL` (Supabase direct connection)
- `NEXTAUTH_SECRET` 
- `ANTHROPIC_API_KEY`
- `CLOUDINARY_*` (all Cloudinary variables)
- `RESEND_API_KEY`
- `WHATSAPP_*` (all WhatsApp variables)
- `META_*` (all Meta/Instagram variables)
- `MANYCHAT_API_KEY`
- `NEXT_PUBLIC_APK_URL` (for the APK download button)

### Step 3: Connect Custom Domain

After first deployment:
1. Go to Vercel project → Settings → Domains
2. Add `velunisa.com`
3. Update your domain registrar's DNS settings to point to Vercel

Vercel will provide the DNS records to add.

### Step 4: Test the /descargar Page

Once deployed and domain is configured:
- Visit `https://velunisa.com/descargar`
- Should see PWA installation options and APK download button (if `NEXT_PUBLIC_APK_URL` is set)

---

## Option 2: Automatic GitHub Deployment Setup

If you want automatic deployment on every push to master:

### Step 1: Get Vercel Project IDs

After deploying via CLI (Option 1, Step 1), run:
```bash
cd apps/web
vercel projects list
```

This shows your project ID and organization ID.

### Step 2: Create GitHub Secrets

Go to your GitHub repo: `https://github.com/resetassaludables2024-crypto/velunisa-app`

**Settings** → **Secrets and variables** → **Actions** → New repository secret

Add these 3 secrets:
- **`VERCEL_TOKEN`**: Get from https://vercel.com/account/tokens
  - Create new token with scope "Full Account"
  - Copy and paste here

- **`VERCEL_ORG_ID`**: From `vercel projects list` output (Organization ID)

- **`VERCEL_PROJECT_ID`**: From `vercel projects list` output (Project ID)

### Step 3: Enable Automatic Deployment

Now whenever you push to `master` branch, GitHub Actions will automatically:
1. Run tests/build checks
2. Deploy to Vercel
3. Update the live site

You can see deployment progress in GitHub: **Actions** tab

---

## Checklist

- [ ] Run `vercel` command in apps/web
- [ ] Confirm project linking to `resetassaludables2024-crypto`
- [ ] Set environment variables in Vercel dashboard
- [ ] First deployment completes successfully
- [ ] Update domain registrar DNS settings to point to Vercel
- [ ] Test `/descargar` page is accessible at velunisa.com
- [ ] (Optional) Set up GitHub secrets for automatic deployments
- [ ] Verify GitHub Actions workflow runs on next push

---

## Testing After Deployment

```bash
# Test that /descargar page loads
curl -I https://velunisa.com/descargar

# Should return HTTP 200, not 403
```

---

## Troubleshooting

**DNS still pointing to old server?**
- DNS propagation takes 5-15 minutes after changing registrar settings
- Check with: `nslookup velunisa.com`
- Should resolve to Vercel's IP

**Environment variables not working?**
- Make sure you added them in Vercel dashboard, not just in `.env.local`
- Redeploy after adding variables: `vercel deploy --prod`

**APK download button not showing?**
- Set `NEXT_PUBLIC_APK_URL` environment variable in Vercel
- This URL should point to where you'll host the APK file

---

## APK Hosting (Optional)

To enable the "Descargar APK" button:

1. Generate APK from EAS build (when free tier resets May 1, 2026)
2. Host on a server (e.g., AWS S3, your own server)
3. Set `NEXT_PUBLIC_APK_URL` env variable in Vercel to the download link
4. Redeploy web app

Example:
```
NEXT_PUBLIC_APK_URL=https://cdn.velunisa.com/app/velunisa-go.apk
```

