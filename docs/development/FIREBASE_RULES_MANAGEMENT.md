# Firebase Rules Management

This document explains how to manage Firebase Firestore rules with local sync capabilities.

## 🔥 Overview

We maintain a local copy of Firebase Firestore rules that stays synchronized with the deployed version. This ensures:

- **Development consistency** - Local and production rules match
- **Testing** - Test rule changes locally before deploying
- **Version control** - Track rule changes in git history
- **Team collaboration** - Everyone works with the same rule set

## 📁 File Structure

```
config/
├── firestore.rules          # Local rules file (source of truth)
├── firestore-backups/       # Automatic backups
│   └── firestore.rules.backup.20240728_143022
└── firestore.rules          # Current rules
```

## 🛠️ Available Commands

### NPM Scripts (Recommended)

```bash
# Deploy local rules to Firebase
npm run firebase:rules:deploy

# Pull rules from Firebase to local
npm run firebase:rules:pull

# Full sync workflow (pull → backup → validate → diff)
npm run firebase:rules:sync

# Validate rules syntax
npm run firebase:rules:validate

# Show diff between local and deployed rules
npm run firebase:rules:diff

# Show current status
npm run firebase:rules:status
```

### Direct Script Usage

```bash
# Same commands, direct script usage
./scripts/firebase-rules-sync.sh deploy
./scripts/firebase-rules-sync.sh pull
./scripts/firebase-rules-sync.sh sync
./scripts/firebase-rules-sync.sh validate
./scripts/firebase-rules-sync.sh diff
./scripts/firebase-rules-sync.sh status
```

## 🔄 Workflow

### 1. Making Rule Changes

```bash
# 1. Edit the local rules file
code config/firestore.rules

# 2. Validate syntax
npm run firebase:rules:validate

# 3. Deploy to Firebase
npm run firebase:rules:deploy
```

### 2. Syncing from Remote

```bash
# If someone else made changes to Firebase rules
npm run firebase:rules:pull
```

### 3. Full Sync (Recommended for New Setup)

```bash
# Pull current rules, create backup, validate, show diff
npm run firebase:rules:sync
```

## 📋 Current Rules

### Collections with Rules

| Collection | Access | Description |
|------------|--------|-------------|
| `cms` | Public read, Auth write | CMS configuration |
| `bookings` | Public create, Auth read/write | Customer bookings |
| `drivers` | Auth read/write | Driver management |
| `payments` | Auth read/write | Payment processing |
| `feedback` | Auth read/write | Customer feedback |
| `users` | Self read/write | User profiles |
| `confluence-comments` | Public read/write | UI feedback system |

### Security Principles

1. **Public booking creation** - Customers can create bookings without auth
2. **Admin-only management** - All admin operations require authentication
3. **User data protection** - Users can only access their own data
4. **CMS flexibility** - Public read access for content, auth for changes

## 🚨 Important Notes

### Before Deploying Rules

1. **Always validate** - Use `npm run firebase:rules:validate`
2. **Test locally** - Use Firebase Emulator for testing
3. **Backup first** - Script creates automatic backups
4. **Check diff** - Use `npm run firebase:rules:diff` to see changes

### Common Issues

1. **Permission denied** - Check if user is authenticated
2. **Collection not found** - Ensure collection exists in Firestore
3. **Rule syntax error** - Use validation command to check syntax

## 🔧 Troubleshooting

### Rules Not Deploying

```bash
# Check Firebase project
firebase projects:list

# Check current project
firebase use

# Switch project if needed
firebase use fairfield-airport-car-service
```

### Validation Errors

```bash
# Check rules syntax
npm run firebase:rules:validate

# View current rules
cat config/firestore.rules
```

### Sync Issues

```bash
# Check status
npm run firebase:rules:status

# Force pull from remote
npm run firebase:rules:pull

# Compare with deployed
npm run firebase:rules:diff
```

## 📚 Best Practices

### 1. Always Use the Sync Script

```bash
# ✅ Good - Use npm scripts
npm run firebase:rules:deploy

# ❌ Bad - Direct Firebase commands
firebase deploy --only firestore:rules
```

### 2. Validate Before Deploying

```bash
# Always validate first
npm run firebase:rules:validate
npm run firebase:rules:deploy
```

### 3. Use Backups

```bash
# Check recent backups
ls -la config/firestore-backups/

# Restore from backup if needed
cp config/firestore-backups/firestore.rules.backup.20240728_143022 config/firestore.rules
```

### 4. Team Collaboration

```bash
# When starting work
npm run firebase:rules:pull

# After making changes
npm run firebase:rules:deploy

# Before committing
npm run firebase:rules:diff
```

## 🔄 Integration with Development

### Pre-commit Hook

Consider adding to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Validate Firebase rules before commit
npm run firebase:rules:validate
```

### CI/CD Integration

Add to your deployment pipeline:

```yaml
# Example GitHub Actions step
- name: Deploy Firebase Rules
  run: |
    npm run firebase:rules:validate
    npm run firebase:rules:deploy
```

## 📖 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firestore Rules Testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

---

**Remember**: Always validate and test rules before deploying to production! 🔒 