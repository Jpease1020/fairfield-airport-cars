# 🚀 Dev Server Management Guide

## **Problem: Caching Issues**

You've experienced issues where changes don't appear on the page due to:
- Multiple dev server processes running simultaneously
- Next.js build cache not clearing
- Browser caching old files
- Fast Refresh cache conflicts

## **Solution: Dev Server Manager**

We've created a smart dev server manager that prevents these issues.

### **🛠️ Available Commands**

```bash
# Start dev server (with cache cleaning)
npm run dev:safe

# Restart dev server (with cache cleaning)
npm run dev:clean

# Check server status
npm run dev:status

# Stop dev server
npm run dev:stop

# Kill all Node.js dev processes
npm run dev:kill-all
```

### **📋 What Each Command Does**

#### **`npm run dev:safe`**
- ✅ Checks for existing dev servers
- ✅ Kills any conflicting processes
- ✅ Clears Next.js build cache (`.next`)
- ✅ Clears node_modules cache
- ✅ Starts fresh dev server
- ✅ Waits for server to be ready

#### **`npm run dev:clean`**
- ✅ Stops current dev server
- ✅ Clears all caches
- ✅ Restarts dev server fresh

#### **`npm run dev:status`**
- ℹ️ Shows if server is running
- ℹ️ Shows server PIDs
- ℹ️ Shows server URL

#### **`npm run dev:stop`**
- 🛑 Stops dev server cleanly
- 🛑 Kills all processes on port 3000

#### **`npm run dev:kill-all`**
- 💀 Kills ALL Node.js dev processes
- 💀 Use when multiple servers are stuck

### **🎯 When to Use Each Command**

| Situation | Command | Why |
|-----------|---------|-----|
| Starting development | `npm run dev:safe` | Ensures clean start |
| Changes not appearing | `npm run dev:clean` | Clears all caches |
| Server seems stuck | `npm run dev:kill-all` | Nuclear option |
| Checking server | `npm run dev:status` | See what's running |

### **🔧 Manual Commands (if needed)**

```bash
# Direct script usage
./scripts/dev-server-manager.sh start
./scripts/dev-server-manager.sh restart
./scripts/dev-server-manager.sh status
./scripts/dev-server-manager.sh stop
./scripts/dev-server-manager.sh clean
./scripts/dev-server-manager.sh kill-all
```

### **🚨 Troubleshooting**

#### **Changes Still Not Appearing?**

1. **Hard refresh browser**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear browser cache**: Developer Tools → Application → Storage → Clear
3. **Disable cache**: Developer Tools → Network → Disable cache
4. **Restart dev server**: `npm run dev:clean`

#### **Multiple Server Processes?**

```bash
# Check what's running
npm run dev:status

# Kill everything
npm run dev:kill-all

# Start fresh
npm run dev:safe
```

#### **Port 3000 Already in Use?**

```bash
# Kill everything on port 3000
npm run dev:kill-all

# Or manually
lsof -ti:3000 | xargs kill -9
```

### **💡 Best Practices**

1. **Always use `npm run dev:safe`** when starting development
2. **Use `npm run dev:clean`** when changes don't appear
3. **Check status first** with `npm run dev:status`
4. **Hard refresh browser** after server restarts
5. **Keep one terminal** for dev server management

### **🔍 What the Script Does**

The dev server manager:

1. **Checks for conflicts** - Finds existing processes
2. **Cleans caches** - Removes `.next` and node_modules cache
3. **Manages processes** - Kills conflicting servers
4. **Starts fresh** - Launches clean dev server
5. **Monitors health** - Waits for server to be ready
6. **Provides feedback** - Shows status and PIDs

### **🎉 Result**

- ✅ No more caching issues
- ✅ Changes always appear
- ✅ No multiple server conflicts
- ✅ Clean development experience
- ✅ Easy troubleshooting

**Use `npm run dev:safe` instead of `npm run dev` for reliable development!** 