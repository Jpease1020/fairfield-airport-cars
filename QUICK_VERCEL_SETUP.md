# 🚨 QUICK FIX: Vercel Environment Variables Setup

## The Problem
Firebase Admin is not initialized in production because environment variables are missing.

## The Solution (5 minutes)

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fairfield-airport-car-service`
3. Click ⚙️ **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### Step 2: Extract Values from JSON

Open the downloaded JSON file. You'll see:
```json
{
  "project_id": "fairfield-airport-car-service",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@fairfield-airport-car-service.iam.gserviceaccount.com"
}
```

### Step 3: Set in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `fairfield-airport-cars`
3. Go to **Settings** → **Environment Variables**
4. Add these **3 variables**:

#### Variable 1: `FIREBASE_PROJECT_ID`
- **Value**: `fairfield-airport-car-service`
- **Environment**: Production, Preview, Development

#### Variable 2: `FIREBASE_PRIVATE_KEY`
- **Value**: Copy the ENTIRE `private_key` value from JSON (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- **Important**: Keep the `\n` characters - they're needed for newlines
- **Environment**: Production, Preview, Development

#### Variable 3: `FIREBASE_CLIENT_EMAIL`
- **Value**: Copy the `client_email` value from JSON
- **Environment**: Production, Preview, Development

### Step 4: Redeploy

After adding variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment → **Redeploy**
3. Wait for deployment to complete (~2 minutes)

### Step 5: Verify

Run this command:
```bash
curl https://fairfield-airport-cars.vercel.app/api/health/booking-flow | jq '.checks.firebase'
```

Should show: `"status": "pass"`

## ⚠️ Common Mistakes

1. **Private key missing newlines**: Must include `\n` characters
2. **Wrong project ID**: Must match your Firebase project
3. **Variables not set for Production**: Make sure to select "Production" environment
4. **Forgot to redeploy**: Variables only apply to NEW deployments

## ✅ Success Checklist

- [ ] All 3 variables added to Vercel
- [ ] Variables set for Production environment
- [ ] Redeployed after adding variables
- [ ] Health check shows `"firebase": {"status": "pass"}`

