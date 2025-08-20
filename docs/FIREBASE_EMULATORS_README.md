# 🔥 Firebase Emulators Setup

## Overview

Firebase Emulators provide a local development environment that replaces the need for demo mode. You can now test your app with real Firebase services running locally.

## 🚀 Quick Start

### 1. Start Emulators

```bash
# Start all emulators
npm run emulators:start

# Or start specific services
npm run emulators:start:firestore  # Database only
npm run emulators:start:auth       # Authentication only
npm run emulators:start:functions  # Cloud Functions only
npm run emulators:start:storage    # Storage only
```

### 2. Seed with Test Data

```bash
# Populate emulators with test data
npm run emulators:seed
```

### 3. Access Emulator UI

Open [http://localhost:4000](http://localhost:4000) to view:
- Firestore data
- Authentication users
- Function logs
- Storage files

## 📊 Emulator Ports

- **Emulator UI**: http://localhost:4000
- **Firestore**: localhost:8080
- **Auth**: http://localhost:9099
- **Functions**: http://localhost:5001
- **Storage**: http://localhost:9199

## 🔧 Environment Setup

Create `.env.local` with:

```bash
# Enable Firebase emulators
NEXT_PUBLIC_USE_EMULATORS=true

# Your Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
```

## 📝 Test Data

After running `npm run emulators:seed`, you'll have:

**Users:**
- `test@fairfieldcars.com` / `testpass123`
- `driver@fairfieldcars.com` / `driver123`

**Sample Data:**
- Test driver (Gregg)
- Sample booking
- CMS configuration

## 🛠️ Development Workflow

1. **Start emulators**: `npm run emulators:start`
2. **Seed data**: `npm run emulators:seed`
3. **Develop and test** with real Firebase services
4. **Reset data** when needed:
   ```bash
   npm run emulators:export temp/clean-data
   npm run emulators:import temp/clean-data
   ```

## 🎯 Benefits Over Demo Mode

- ✅ **Real Firebase services** - No mocking complexity
- ✅ **Real data persistence** - Data actually gets stored
- ✅ **Real authentication** - Actual user signup/login
- ✅ **Real business logic** - Your services work with real data
- ✅ **Easy debugging** - Real Firebase errors and logs
- ✅ **Cost-free** - No Firebase charges during development

## 🚫 What Was Removed

- ❌ Demo mode components and providers
- ❌ Mock services and MSW setup
- ❌ Complex localStorage management
- ❌ Feature flags for demo mode
- ❌ Demo routes and pages

## 🔍 Troubleshooting

**Emulators won't start:**
- Check if ports are already in use
- Run `./scripts/emulator-setup.sh status` to check status
- Kill processes: `./scripts/emulator-setup.sh stop`

**Can't connect to emulators:**
- Verify `NEXT_PUBLIC_USE_EMULATORS=true` in `.env.local`
- Restart your Next.js dev server
- Check browser console for connection errors

**No test data:**
- Run `npm run emulators:seed` after starting emulators
- Check emulator UI at http://localhost:4000

## 🎉 You're All Set!

Your development environment is now much cleaner and more powerful. Use Firebase emulators for all your development and testing needs!
