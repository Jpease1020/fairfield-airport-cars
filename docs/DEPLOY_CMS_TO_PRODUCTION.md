# 🚀 Deploy Cleaned CMS Data to Production

## Overview
This guide will help you deploy the cleaned CMS data from your local emulator to the production Firebase database.

## Prerequisites

### 1. Firebase Service Account Setup
You need a Firebase service account key to deploy to production:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/fairfield-airport-car-service
2. **Navigate to Project Settings** → **Service Accounts**
3. **Click "Generate New Private Key"**
4. **Download the JSON file** (e.g., `fairfield-airport-car-service-key.json`)
5. **Place it in your project root** (not in version control!)

### 2. Set Environment Variable
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./fairfield-airport-car-service-key.json"
```

## Deployment Options

### Option 1: Automated Script (Recommended)
```bash
# 1. Set up credentials
export GOOGLE_APPLICATION_CREDENTIALS="./fairfield-airport-car-service-key.json"

# 2. Run the deployment script
node scripts/deploy-cms-to-prod.cjs
```

### Option 2: Manual Firebase CLI
```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Export from emulator
firebase emulators:export ./temp/emulator-export

# 4. Import to production (CAREFUL!)
firebase firestore:import ./temp/emulator-export --project fairfield-airport-car-service
```

### Option 3: Firebase Console (Safest)
1. **Go to Firebase Console** → **Firestore Database**
2. **Manually copy each document** from emulator to production
3. **Use the cleaned data** from `temp/cleaned-emulator-cms-data.json`

## What Gets Deployed

### ✅ Cleaned Data Includes:
- **Pricing Configuration**: Real values instead of placeholder text
- **Form Labels**: Professional labels instead of "form name label *"
- **Page Content**: Meaningful descriptions and content
- **Button Text**: Professional button labels
- **All Customer Pages**: Home, About, Contact, Booking, etc.

### 📊 Documents to Deploy:
- `pricing` - Real pricing values (base fare $25, per mile $2.50, etc.)
- `booking` - Clean form labels and professional content
- `booking-form` - Clean fare messages
- `home` - Professional homepage content
- `about` - Professional about page content
- `contact` - Professional contact page content
- `dashboard` - Professional dashboard content
- `login` - Professional login page content
- `privacy` - Professional privacy policy content
- `success` - Clean success page content
- `tracking` - Professional tracking page content
- And all other customer-facing pages...

## Safety Checklist

### Before Deployment:
- [ ] **Backup production data** (if any exists)
- [ ] **Test in staging environment** (if available)
- [ ] **Verify service account permissions**
- [ ] **Review cleaned data** in `temp/cleaned-emulator-cms-data.json`

### After Deployment:
- [ ] **Verify data in Firebase Console**
- [ ] **Test production website**
- [ ] **Check all pages load correctly**
- [ ] **Verify form labels are clean**

## Rollback Plan

If something goes wrong:
1. **Restore from backup** (if you have one)
2. **Revert to previous version** using Git
3. **Manually fix issues** in Firebase Console

## Verification

After deployment, verify:
1. **Homepage loads** with clean content
2. **Booking form** shows professional labels
3. **Fare calculation** works with real pricing
4. **All pages** display clean, professional content

## Files Created

- `scripts/deploy-cms-to-prod.cjs` - Automated deployment script
- `temp/cleaned-emulator-cms-data.json` - Cleaned data ready for production
- `docs/DEPLOY_CMS_TO_PRODUCTION.md` - This guide

## Next Steps

1. **Set up service account credentials**
2. **Run the deployment script**
3. **Verify production website**
4. **Test complete booking flow**
5. **Celebrate! 🎉**

---

**⚠️ Important**: Always test in a staging environment first if possible!
