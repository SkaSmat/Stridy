# 🚀 Edge Functions Deployment Guide

## Overview

This guide explains how to deploy Supabase Edge Functions for secure Strava OAuth integration. Edge Functions run server-side, allowing us to keep the Strava client secret secure (never exposed to the browser).

## ⚠️ Why Edge Functions?

**Security Problem:**
- Strava OAuth requires a `client_secret` to exchange authorization codes for access tokens
- If we put the secret in `.env` with `VITE_` prefix, it gets bundled into the JavaScript and exposed to anyone
- Anyone with the secret can impersonate your application

**Solution:**
- Move the OAuth token exchange to a server-side Edge Function
- Client secret stays on the server (Deno environment)
- Frontend only sends the authorization code
- Edge Function does the exchange and saves tokens to database

## 📂 Edge Functions in This Project

We have 2 Edge Functions:

1. **`strava-exchange`** - Exchanges authorization code for access/refresh tokens
2. **`strava-refresh`** - Automatically refreshes expired access tokens

Location: `/supabase/functions/`

## 🛠️ Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked**
   ```bash
   supabase login
   supabase link --project-ref anujltoavoafclklucdx
   ```

3. **Your Strava API keys ready**
   - Client ID: `195798`
   - Client Secret: `5a38980fa7899bd4075c58945e401d56e960e397`

## 📝 Step 1: Configure Edge Function Secrets

Edge Functions need environment variables to store sensitive data. Set these in your Supabase dashboard:

### Via Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/anujltoavoafclklucdx
2. Navigate to **Edge Functions** → **Configuration** (or **Settings** → **Edge Functions**)
3. Click **Add Secret** and add these:

```
STRAVA_CLIENT_ID = 195798
STRAVA_CLIENT_SECRET = 5a38980fa7899bd4075c58945e401d56e960e397
```

### Via CLI (Alternative)

```bash
supabase secrets set STRAVA_CLIENT_ID=195798
supabase secrets set STRAVA_CLIENT_SECRET=5a38980fa7899bd4075c58945e401d56e960e397
```

## 🚀 Step 2: Deploy Edge Functions

### Deploy Both Functions

```bash
# Deploy strava-exchange function
supabase functions deploy strava-exchange

# Deploy strava-refresh function
supabase functions deploy strava-refresh
```

### Expected Output

```
Deploying Function strava-exchange (project ref: anujltoavoafclklucdx)
Bundled strava-exchange in 420ms
Deployed strava-exchange in 1.2s
Function URL: https://anujltoavoafclklucdx.supabase.co/functions/v1/strava-exchange
✓ Deployed Function strava-exchange

Deploying Function strava-refresh (project ref: anujltoavoafclklucdx)
Bundled strava-refresh in 380ms
Deployed strava-refresh in 1.1s
Function URL: https://anujltoavoafclklucdx.supabase.co/functions/v1/strava-refresh
✓ Deployed Function strava-refresh
```

## ✅ Step 3: Verify Deployment

### Check Functions in Dashboard

1. Go to **Edge Functions** in your Supabase dashboard
2. You should see:
   - `strava-exchange` (Status: Active)
   - `strava-refresh` (Status: Active)

### Test strava-exchange Function

```bash
# Get a test authorization code first (manually go through Strava OAuth)
# Then test the function:

curl -X POST \
  https://anujltoavoafclklucdx.supabase.co/functions/v1/strava-exchange \
  -H "Authorization: Bearer YOUR_SUPABASE_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST_CODE_FROM_STRAVA"}'
```

Expected response (if successful):
```json
{
  "success": true,
  "athlete": {
    "id": 12345,
    "username": "john_doe",
    "firstname": "John",
    "lastname": "Doe",
    "profile": "https://..."
  }
}
```

## 🔒 Step 4: Remove Client Secret from Frontend

**CRITICAL:** Once Edge Functions are deployed, remove the client secret from your local `.env` file:

### Edit `.env`

```bash
# Before (INSECURE):
VITE_STRAVA_CLIENT_ID="195798"
VITE_STRAVA_CLIENT_SECRET="5a38980fa7899bd4075c58945e401d56e960e397" ❌

# After (SECURE):
VITE_STRAVA_CLIENT_ID="195798"
# Client secret removed - now in Edge Function environment ✅
```

### Rebuild Your App

```bash
npm run build
```

The client secret will no longer be in the JavaScript bundle! 🎉

## 📋 Step 5: Update Lovable Environment Variables

If deploying via Lovable, update environment variables there too:

1. Go to Lovable dashboard
2. Settings → Environment Variables
3. **Remove** `VITE_STRAVA_CLIENT_SECRET`
4. Keep only:
   ```
   VITE_SUPABASE_URL=https://anujltoavoafclklucdx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
   VITE_STRAVA_CLIENT_ID=195798
   ```

## 🧪 Step 6: Test Strava Integration

1. Open your app: https://urbanexplorer.lovable.app
2. Go to **Settings**
3. Click **Connect Strava**
4. Authorize on Strava
5. You should be redirected back and see "Compte Strava connecté"

### Debugging

If connection fails, check:

**Browser Console:**
- Look for network errors
- Check if Edge Function URL is correct
- Verify no 401/403 errors (auth issues)

**Supabase Logs:**
1. Go to Dashboard → Edge Functions → Logs
2. Select `strava-exchange` function
3. Look for errors in real-time logs

Common errors:
- `Missing authorization header` → User not logged in
- `Strava API error` → Check if code is valid (codes expire quickly)
- `Missing Strava credentials` → Secrets not configured properly

## 🔄 Step 7: Enable Auto Token Refresh (Optional)

The `strava-refresh` function can be called automatically before Strava API requests to ensure tokens are fresh.

Add to `StravaService.ts`:

```typescript
private async ensureFreshToken(userId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${this.supabaseUrl}/functions/v1/strava-refresh`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  const data = await response.json();
  return data.access_token;
}
```

Then call it before API requests:
```typescript
const freshToken = await this.ensureFreshToken(userId);
const activities = await this.getActivities(freshToken);
```

## 🎯 Summary Checklist

After deployment, verify:

- [ ] Edge Functions deployed successfully
- [ ] Secrets configured in Supabase dashboard
- [ ] `VITE_STRAVA_CLIENT_SECRET` removed from `.env`
- [ ] `VITE_STRAVA_CLIENT_SECRET` removed from Lovable env vars
- [ ] Strava connection works in the app
- [ ] No client secret visible in browser DevTools → Network tab
- [ ] Token exchange goes through Edge Function (not direct to Strava)

## 🚨 Security Verification

### ✅ Secure (After Deployment)

```
Browser Network Tab:
POST https://anujltoavoafclklucdx.supabase.co/functions/v1/strava-exchange
Payload: {"code": "abc123"}
```

### ❌ Insecure (Before Deployment)

```
Browser Network Tab:
POST https://www.strava.com/oauth/token
Payload: {"client_secret": "5a389..."}  ← SECRET EXPOSED!
```

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Strava OAuth Documentation](https://developers.strava.com/docs/authentication/)
- [Deno Deploy Runtime](https://deno.com/deploy/docs)

## 🆘 Troubleshooting

### Edge Function won't deploy

**Error:** `Project not linked`
```bash
supabase link --project-ref anujltoavoafclklucdx
```

**Error:** `Function failed to deploy: Import not found`
```bash
# Check imports in index.ts use Deno-compatible URLs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
```

### Function returns 500 error

Check logs:
```bash
supabase functions logs strava-exchange
```

### Secrets not working

Verify secrets are set:
```bash
supabase secrets list
```

Should show:
```
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

**Questions?** Check the Supabase dashboard logs or contact support.
